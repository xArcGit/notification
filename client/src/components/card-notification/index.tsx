import { component$ } from '@builder.io/qwik';

interface CardNotificationProps {
	id: string;
	title: string;
	description: string;
	url?: string;
}

export default component$(
	({ id, title, description, url }: CardNotificationProps) => {
		return (
			<div className="card-notification" id={id}>
				<h2 className="card-notification-title">{title}</h2>
				<p className="card-notification-description">{description}</p>
				{url && (
					<a href={url} class="card-notification-link">
						{url}
					</a>
				)}
			</div>
		);
	},
);
