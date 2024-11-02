function App() {
	return (
		<div className="flex items-center justify-center h-screen bg-gray-100">
			<div className="bg-white shadow-lg rounded-lg p-6 max-w-sm">
				<h2 className="text-2xl font-bold mb-4">Centered Box</h2>
				<p className="text-gray-700">
					This is a simple box centered in the middle of the screen.
				</p>
				<button
					type="button"
					className="mt-4 px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
				>
					Click Me!
				</button>
			</div>
		</div>
	);
}

export default App;
