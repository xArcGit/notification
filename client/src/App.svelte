<script lang="ts">
  import { get, writable } from 'svelte/store';
  import { onMount } from 'svelte';
  import type { AppType } from "../../server/app";
  import { hc, type InferRequestType, type InferResponseType } from 'hono/client';

  // Initialize the RPC client for API calls
  const client = hc<AppType>('http://localhost:3001');
  const postRequest = client.notifications.$post;
  const searchRequest = client.notifications.search.$post;
  const refreshRequest = client.notifications.refresh.$post;

  // Infer request and response types
  type PostRequest = InferRequestType<typeof postRequest>;
  type PostResponse = InferResponseType<typeof postRequest>;
  type SearchRequest = {
    tags: string[];
    limit: number;
    offset: number;
    search: string;
  };
  type SearchResponse = PostResponse[];

  // Reactive Variables
  let data: PostResponse[] = [];
  const loading = writable(false); // Store for loading state
  let error: string | null = null;
  let page = 1; // Current page for pagination
  let searchQuery = '';
  const searching = writable(false); // Store for search state
  let debounceTimer: NodeJS.Timeout | null = null;
  const tags = ['ipu', 'iitm', 'iintm']; // Default tags for search/filter

  // Load selected tags from cookies (if any)
  const selectedTags = writable(getSavedTags() || tags);

  function getSavedTags() {
    if (typeof window !== 'undefined') {
      const savedTags = localStorage.getItem('selectedTags');
      return savedTags ? JSON.parse(savedTags) : tags;
    }
    return tags;
  }

  function saveTags(tags: string[]) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('selectedTags', JSON.stringify(tags));
    }
  }

  // Fetch data based on whether it's a search or not
  async function fetchData(isSearch = false) {
    const $loading = get(loading);
    const $searching = get(searching);

    if ($loading || $searching) return; // Prevent fetching while loading or searching

    loading.set(true);
    error = null;

    try {
      const limit = 10;
      const offset = (page - 1) * limit;
      const requestData = isSearch
        ? { search: searchQuery, tags: get(selectedTags), limit, offset }
        : { tags: get(selectedTags), limit, offset };

      const res = await (isSearch ? searchRequest : postRequest)({
        json: requestData as PostRequest | SearchRequest,
      });

      if (!res.ok) {
        throw new Error(`Failed to fetch data: ${res.statusText}`);
      }

      const result = await res.json();

      if (Array.isArray(result)) {
        data = isSearch ? result : [...data, ...result];
      } else if (result && Array.isArray(result.data)) {
        data = isSearch ? result.data : [...data, ...result.data];
      } else {
        throw new Error('Unexpected response format');
      }

      // Scroll to the top on fresh search
      if (isSearch) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }

    } catch (err) {
      error = err instanceof Error ? err.message : 'Unknown error';
      console.error(error);
    } finally {
      loading.set(false);
    }
  }

  // Handle input search with debounce
  function handleSearchInput() {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      page = 1; // Reset to first page on new search
      data = []; // Clear previous data
      fetchData(true); // Fetch new search results
    }, 500); // 500ms debounce delay
  }

  // Handle tag changes and save to localStorage
  function handleTagChange(tag: string) {
    let newTags = [...get(selectedTags)];

    // Prevent unselecting the last tag
    if (newTags.length === 1 && newTags.includes(tag)) return;

    if (newTags.includes(tag)) {
      newTags = newTags.filter(t => t !== tag);
    } else {
      newTags.push(tag);
    }

    selectedTags.set(newTags);
    saveTags(newTags);
    data = []; // Reset data when tags change
    page = 1;
    fetchData(true); // Refetch with updated tags
  }

  // Function to refresh data
  async function refreshData() {
    loading.set(true);
    try {
      const res = await refreshRequest({
        json: { refresh: true },
      });
      if (!res.ok) {
        throw new Error(`Failed to refresh data: ${res.statusText}`);
      }
      const result = await res.json();
      data = result.data || [];
    } catch (err) {
      error = err instanceof Error ? err.message : 'Unknown error';
      console.error(error);
    } finally {
      loading.set(false);
    }
  }

  // Detect scroll and trigger loading when reaching bottom
  let isFetching = false;

  onMount(() => {
    fetchData();

    // Listen for scroll events
    window.addEventListener('scroll', handleScroll);
  });

  function handleScroll() {
    const scrollPosition = window.scrollY + window.innerHeight;
    const bottomPosition = document.documentElement.scrollHeight;

    // Check if we're at the bottom of the page and if we're not already fetching
    if (scrollPosition >= bottomPosition - 10 && !isFetching) {
      fetchNextPage();
    }
  }

  // Fetch next page
  async function fetchNextPage() {
    if (isFetching) return; // Avoid multiple fetches at once
    isFetching = true;
    page++; // Increment page number
    await fetchData(); // Fetch more data
    isFetching = false;
  }
</script>

<main class="app">
  <h1>Fetched Data</h1>

  <div class="search-bar">
    <input
      type="text"
      placeholder="Search..."
      bind:value={searchQuery}
      on:input={handleSearchInput}
    />
  </div>

  <div class="tags-filter">
    {#each tags as tag}
      <button
        class:selected={get(selectedTags).includes(tag)}
        on:click={() => handleTagChange(tag)}
      >
        {tag}
      </button>
    {/each}
  </div>

  {#if error}
    <p class="error">{error}</p>
  {/if}

  {#if $loading && data.length === 0}
    <div class="loading-spinner">Loading...</div>
  {/if}

  <div class="data-grid">
    {#if data.length > 0}
      {#each data as item}
        <div class="data-card">
          <h2><span class="icon">{item.title}</h2>
          <p>{item.description}</p>
          <a class="view-link" href={item.view_link} target="_blank" rel="noopener noreferrer">
            <span class="icon">🔗</span> View
          </a>
        </div>
      {/each}
    {:else if !$loading}
      <p>No data available</p>
    {/if}
  </div>

  <!-- Refresh Button on Top Right -->
  <button
  class="refresh-button"
  on:click={refreshData}
  aria-label="Refresh Data"
>
  <i class="fas fa-sync-alt"></i> <!-- Font Awesome refresh icon -->
</button>

</main>

<style>
/* General Styles */
.app {
  font-family: 'Arial', sans-serif;
  max-width: 1200px; /* Increased width for larger screen real estate */
  margin: 0 auto;
  padding: 30px;
  color: #333;
  position: relative;
  background-color: #fafafa;
}

h1 {
  text-align: center;
  color: #4a4a4a;
  margin-bottom: 30px;
  font-size: 2em;
  font-weight: 600;
}

.error {
  color: #d9534f;
  text-align: center;
  font-size: 1.2em;
  margin: 20px 0;
}

/* Search Bar */
.search-bar {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
  gap: 12px;
}

.search-bar input[type="text"] {
  width: 100%;
  max-width: 600px; /* Increased width of the search bar */
  padding: 12px;
  font-size: 1.1em;
  border: 1px solid #ddd;
  border-radius: 5px;
  outline: none;
  transition: border-color 0.3s ease;
}

.search-bar input[type="text"]:focus {
  border-color: #0073e6;
}

.search-bar input[type="text"]::placeholder {
  color: #888;
}

/* Tags Filter */
.tags-filter {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
  gap: 15px;
}

.tags-filter button {
  padding: 12px 18px;
  font-size: 1.1em;
  border-radius: 5px;
  background-color: #f1f1f1;
  border: 1px solid #ddd;
  cursor: pointer;
  transition: background-color 0.3s, transform 0.2s;
}

.tags-filter button:hover {
  background-color: #f9f9f9;
  transform: translateY(-2px);
}

.tags-filter button.selected {
  background-color: #0073e6;
  color: white;
  transform: translateY(-2px);
}

/* Data Grid */
.data-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); /* Adjust columns */
  gap: 25px;
  margin-bottom: 20px;
}

.data-card {
  background-color: #fff;
  border: 1px solid #ddd;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s, box-shadow 0.3s ease;
  height: auto; /* Allow cards to expand based on content */
  display: flex;
  flex-direction: column;
}

.data-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
}

.data-card h2 {
  font-size: 1.4em;
  margin-bottom: 15px;
  font-weight: 500;
  color: #333;
}

.data-card .icon {
  margin-right: 8px;
}

.data-card p {
  font-size: 1em;
  margin-bottom: 15px;
  color: #555;
}

.data-card .view-link {
  color: #0073e6;
  text-decoration: none;
  font-weight: 600;
}

.data-card .view-link:hover {
  text-decoration: underline;
}

/* Spinner */
.loading-spinner {
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 2em;
  color: #0073e6;
  margin: 40px 0;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Refresh Button */
.refresh-button {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 15px;
  background-color: #0073e6;
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  font-size: 2em;
  transition: background-color 0.3s ease, transform 0.2s;
}

.refresh-button:hover {
  background-color: #005bb5;
  transform: scale(1.1);
}
</style>

