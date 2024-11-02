import Card from '../components/card';
import type { DocumentHead } from '@builder.io/qwik-city';
import { component$ } from '@builder.io/qwik';

export default component$(() => {
	return (
		<>
			<Card
				logo="https://via.placeholder.com/64"
				image="https://via.placeholder.com/300x200"
				title="Sample Title"
				description="This is a sample description for the card."
				buttonText="Click Me"
			/>
		</>
	);
});

export const head: DocumentHead = {
	title: 'Welcome to Qwik',
	meta: [
		{
			name: 'description',
			content: 'Qwik site description',
		},
	],
};
