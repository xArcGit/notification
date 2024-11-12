<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { writable } from 'svelte/store';
  import { hc, type InferRequestType, type InferResponseType } from 'hono/client';

  // Browser check (no need for SvelteKit-specific import)
  const browser = typeof window !== 'undefined';

  // Initialize the RPC client for API calls
  const client = hc<AppType>('http://localhost:3001');
  const postRequest = client.notifications.$post;
  const searchRequest = client.notifications.search.$post;
  const refreshRequest = client.notifications.refresh.$post;

  // Infer request and response types
  type PostRequest = InferRequestType<typeof postRequest>;
  type PostResponse = InferResponseType<typeof postRequest>;
  type SearchRequest = {
    query: string;
    tags: string[];
    limit: number;
    offset: number;
  };
  type SearchResponse = PostResponse[];

  // Reactive Variables
  let data: PostResponse[] = [];
  let loading = writable(false);
  let error: string | null = null;
  let page = 1;
  let searchQuery = '';
  let searching = writable(false);
  let debounceTimer: NodeJS.Timeout | null = null;
  const tags = ['ipu', 'iitm', 'iintm']; // Default tags for search/filter

  // Load selected tags from cookies (if any)
  let selectedTags = writable(getSavedTags() || tags);

  function getSavedTags() {
    if (browser) {
      const savedTags = localStorage.getItem('selectedTags');
      return savedTags ? JSON.parse(savedTags) : tags;
    }
    return tags;
  }

  function saveTags(tags: string[]) {
    if (browser) {
      localStorage.setItem('selectedTags', JSON.stringify(tags));
    }
  }

  // Function to fetch data (general data and search results)
  async function fetchData(isSearch = false) {
    if ($loading || $searching) return;

    $loading = true;
    error = null;

    try {
      const limit = 10;
      const offset = (page - 1) * limit;
      const requestData = isSearch
        ? { query: searchQuery, tags: $selectedTags, limit, offset }
        : { tags: $selectedTags, limit, offset };

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
        throw new Error(
          'Unexpected response format: Expected an array or object with data array'
        );
      }
    } catch (err) {
      error = err instanceof Error ? err.message : 'Unknown error';
      console.error(error);
    } finally {
      $loading = false;
    }
  }

  // Function to search data with debounce
  function handleSearchInput() {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      page = 1; // Reset to first page on new search
      data = []; // Clear previous data
      fetchData(true); // Fetch new search results
    }, 500); // 500ms debounce delay
  }

  // Function to refresh data
  async function refreshData() {
    $loading = true;
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
      $loading = false;
    }
  }

  // Handle initial load
  onMount(() => {
    fetchData();
  });

  // Handle tag changes and save to localStorage
  function handleTagChange(tag: string) {
    let newTags = [...$selectedTags];
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

  // Handle manual page refresh (on bottom button)
  function handleManualRefresh() {
    page = 1;
    fetchData();
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
        class:selected={$selectedTags.includes(tag)}
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
          <h2><span class="icon">📌</span> {item.title}</h2>
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

  {#if !loading && data.length > 0}
    <div class="view-more-container">
      <button class="view-more-button" on:click={handleManualRefresh}>Refresh</button>
    </div>
  {/if}

  <!-- Refresh Button on Top Right -->
  <div class="refresh-button" on:click={refreshData}>🔄 Refresh</div>
</main>

<style>
  /* General Styles */
  .app {
    font-family: 'Arial', sans-serif;
    max-width: 900px;
    margin: 0 auto;
    padding: 20px;
    color: #333;
  }

  h1 {
    text-align: center;
    color: #4a4a4a;
    margin-bottom: 20px;
  }

  .error {
    color: #d9534f;
    text-align: center;
    font-size: 1.2em;
  }

  /* Search Bar */
  .search-bar {
    display: flex;
    justify-content: center;
    margin-bottom: 20px;
    gap: 12px;
  }

  .search-bar input[type="text"] {
    padding: 12px;
    width: 60%;
    border: 1px solid #ccc;
    border-radius: 25px;
    outline: none;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    transition: 0.3s ease-in-out;
  }

  .tags-filter {
    display: flex;
    justify-content: center;
    gap: 10px;
    margin-bottom: 20px;
  }

  .tags-filter button {
    padding: 8px 15px;
    border-radius: 25px;
    border: 1px solid #ccc;
    cursor: pointer;
    transition: background-color 0.3s;
  }

  .tags-filter button.selected {
    background-color: #0073e6;
    color: white;
  }

  /* Data Grid Layout */
  .data-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    justify-content: space-between;
  }

  /* Card Styles */
  .data-card {
    background: linear-gradient(145deg, #ffffff, #f1f1f1);
    border-radius: 15px;
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
    padding: 20px;
    transition: transform 0.3s, box-shadow 0.3s;
    flex: 1 1 300px;
    overflow: hidden;
  }

  .data-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  }

  h2 {
    font-size: 1.25em;
    color: #333;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .icon {
    font-size: 1.3em;
  }

  p {
    color: #555;
    margin: 10px 0 15px;
  }

  /* Link Styles */
  .view-link {
    color: #0073e6;
    text-decoration: none;
    font-weight: bold;
    display: inline-flex;
    align-items: center;
    gap: 5px;
  }

  .view-link:hover {
    color: #005bb5;
  }

  /* Refresh Button (Top Right) */
  .refresh-button {
    position: absolute;
    top: 20px;
    right: 20px;
    background-color: #0073e6;
    color: white;
    padding: 12px;
    border-radius: 50%;
    cursor: pointer;
    font-size: 1.5em;
    transition: background-color 0.3s;
  }

  .refresh-button:hover {
    background-color: #005bb5;
  }

  /* Loading Spinner */
  .loading-spinner {
    text-align: center;
    font-size: 1.5em;
    color: #0073e6;
  }
</style>
