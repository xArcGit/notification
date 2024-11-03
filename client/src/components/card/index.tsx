import { $, component$, useStore, useVisibleTask$ } from '@builder.io/qwik';

interface CardProps {
	logo: string;
	image: string;
	title: string;
	description: string;
	cookie: string;
}

export default component$(
	({ logo, image, title, description, cookie }: CardProps) => {
		// Create a store to manage the install/uninstall and loading state
		const state = useStore({ isInstalled: false, isLoading: true });

		// Function to get the tags from the cookie, ensuring it returns an array
		const getTagsFromCookie = $(() => {
			const tagsString = document.cookie
				.split('; ')
				.find(row => row.startsWith(`${cookie}=`))
				?.split('=')[1];
			try {
				const parsedTags = tagsString
					? JSON.parse(decodeURIComponent(tagsString))
					: [];
				return Array.isArray(parsedTags) ? parsedTags : [];
			} catch {
				return []; // Return an empty array if parsing fails
			}
		});

		// Function to update the cookie with the new tags
		const updateCookieTags = $((tags: string[]) => {
			document.cookie = `${cookie}=${encodeURIComponent(
				JSON.stringify(tags),
			)}; path=/;`;
		});

		// Initialize state on the client side
		useVisibleTask$(async () => {
			const tags = await getTagsFromCookie();
			state.isInstalled = tags.includes(title);
			state.isLoading = false; // Set loading to false once data is loaded
		});

		// Handler to add a tag to the cookie
		const handleInstall = $(async () => {
			const tags = await getTagsFromCookie();
			if (!tags.includes(title)) {
				tags.push(title);
				updateCookieTags(tags);
			}
			state.isInstalled = true;
		});

		// Handler to remove a tag from the cookie
		const handleUninstall = $(async () => {
			let tags = await getTagsFromCookie();
			tags = tags.filter(tag => tag !== title);
			updateCookieTags(tags);
			state.isInstalled = false;
		});

		return (
			<div class="relative max-w-sm mx-auto bg-white border border-gray-300 shadow-lg overflow-hidden">
				<div class="relative">
					<img class="w-full h-48 object-cover" src={image} alt="Card" />
					<img
						class="absolute bottom-2 left-2 w-16 h-16 object-contain"
						src={logo}
						alt="Logo"
					/>
				</div>
				<div class="p-4">
					<h2 class="text-xl font-semibold mb-2">{title}</h2>
					<p class="text-gray-700 mb-4">{description}</p>
					{state.isLoading ? (
						<p>Loading...</p>
					) : state.isInstalled ? (
						<button
							type="button"
							class="bg-red-500 text-white font-semibold py-2 px-4 rounded hover:bg-red-600 transition duration-200"
							onClick$={handleUninstall}
						>
							Uninstall
						</button>
					) : (
						<button
							type="button"
							class="bg-blue-500 text-white font-semibold py-2 px-4 rounded hover:bg-blue-600 transition duration-200"
							onClick$={handleInstall}
						>
							Install
						</button>
					)}
				</div>
			</div>
		);
	},
);
