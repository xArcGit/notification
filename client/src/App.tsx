import './App.css';
import { useEffect, useState, useRef, useCallback } from 'react';
import type { AppType } from '../../server/app';
import { hc, type InferRequestType, type InferResponseType } from 'hono/client';

export default function App() {
	// Initialize the RPC client for API calls
	const client = hc<AppType>('http://localhost:3001');
	const $post = client.notifications.$post;

	// Infer request and response types
	type PostRequest = InferRequestType<typeof $post>;
	type PostResponse = InferResponseType<typeof $post>;

	// State management
	const [data, setData] = useState<PostResponse[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [page, setPage] = useState(1); // Start at page 1

	// Ref to track the loader element
	const loaderRef = useRef<HTMLDivElement | null>(null);

	// Fetch data function
	const fetchData = useCallback(async () => {
		if (loading) return; // Prevent multiple requests

		setLoading(true);
		setError(null);

		try {
			// Set pagination parameters
			const limit = 10;
			const offset = (page - 1) * limit;

			// Send POST request to fetch notifications
			const res = await $post({
				json: {
					tags: ['ipu'], // Example tag; adjust as needed
					limit,
					offset,
				} as PostRequest,
			});

			if (!res.ok) {
				throw new Error(`Failed to fetch data: ${res.statusText}`);
			}

			const result: PostResponse = await res.json();
			console.log('Fetched data:', result); // Debug log to inspect fetched data

			// Append new data to the existing state
			setData(prevData => [...prevData, ...result]);
		} catch (err) {
			setError(
				`Error fetching data: ${err instanceof Error ? err.message : 'Unknown error'}`,
			);
			console.error('Error fetching data:', err);
		} finally {
			setLoading(false);
		}
	}, [page, $post, loading]);

	// IntersectionObserver to trigger data fetch on scroll
	useEffect(() => {
		const observer = new IntersectionObserver(
			entries => {
				if (entries[0].isIntersecting && !loading) {
					setPage(prevPage => prevPage + 1); // Increment page to fetch the next set
				}
			},
			{ threshold: 1.0 },
		);

		const loaderElement = loaderRef.current;
		if (loaderElement) observer.observe(loaderElement);

		// Cleanup observer on unmount
		return () => {
			if (loaderElement) observer.unobserve(loaderElement);
		};
	}, [loading]);

	// Fetch data on initial mount and when the page state changes
	useEffect(() => {
		fetchData();
	}, [fetchData]);

	// Render the UI
	return (
		<div className="App">
			<h1>Fetched Data</h1>
			{error && <p className="error">{error}</p>}{' '}
			{/* Show error message if any */}
			{loading && <p>Loading...</p>} {/* Loading state indicator */}
			{data.length > 0 ? (
				<pre>{JSON.stringify(data, null, 2)}</pre> // Display fetched data
			) : (
				!loading && <p>No data available</p> // Message when no data is available
			)}
			{/* Loader element to trigger the IntersectionObserver */}
			<div ref={loaderRef} style={{ height: '20px', margin: '10px 0' }} />
		</div>
	);
}
