import { useEffect, useState, useCallback } from 'react';
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

	// Fetch data on initial mount
	useEffect(() => {
		fetchData();
	}, [fetchData]);

	// Handle "View More" button click
	const handleViewMore = () => {
		setPage(prevPage => prevPage + 1); // Increment page to fetch the next set
	};

	// Render the UI
	return (
		<div className="App">
			<h1>Fetched Data</h1>
			{error && <p className="error">{error}</p>}{' '}
			{/* Show error message if any */}
			{loading && <p>Loading...</p>} {/* Loading state indicator */}
			{data.length > 0 ? (
				<div>
					{data.map(item => (
						<div key={item.id}>
							<h2>{item.title}</h2> <p>{item.description}</p>{' '}
							<a href={item.view_link}>View</a>{' '}
						</div>
					))}
				</div>
			) : (
				!loading && <p>No data available</p> // Message when no data is available
			)}
			{/* View More button */}
			<div style={{ margin: '20px 0' }}>
				{!loading && data.length > 0 && (
					<button type="button" onClick={handleViewMore}>
						View More
					</button>
				)}
			</div>
		</div>
	);
}
