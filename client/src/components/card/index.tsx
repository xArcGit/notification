import { component$ } from '@builder.io/qwik';

export default component$(
	({
		logo,
		image,
		title,
		description,
		buttonText,
	}: {
		logo: string;
		image: string;
		title: string;
		description: string;
		buttonText: string;
	}) => {
		return (
			<>
				<div class="relative max-w-sm mx-auto bg-white border border-gray-300 shadow-lg overflow-hidden">
					<div class="relative">
						<img class="w-full h-48 object-cover" src={`${image}`} alt="Card" />
						<img
							class="absolute bottom-2 left-2 w-16 h-16 object-contain"
							src={`${logo}`}
							alt="Logo"
						/>
					</div>
					<div class="p-4">
						<h2 class="text-xl font-semibold mb-2">{title}</h2>
						<p class="text-gray-700 mb-4">{description}</p>
						<button
							type="button"
							class="bg-blue-500 text-white font-semibold py-2 px-4 rounded hover:bg-blue-600 transition duration-200"
						>
							{buttonText}
						</button>
					</div>
				</div>
			</>
		);
	},
);
