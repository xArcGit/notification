import type React from 'react';

interface CardProps {
	image: string;
	title: string;
	content: string;
	tag: string;
	view_link: string;
	type: string;
}

const Card: React.FC<CardProps> = ({
	image,
	title,
	content,
	tag,
	view_link,
	type = 'iotification',
}) => {
	return (
		<div className="box is-skeleton">
			<article className="media">
				<div className="media-left is-skeleton">
					<figure className="image is-64x64">
						<img src={image} alt="Placeholder" />
					</figure>
				</div>
				<div className="media-content">
					<div className="content is-skeleton">
						<p>
							<strong>{tag}</strong> <small>{type}</small>
							<small>{content}</small>
							<br />
							{title}
						</p>
					</div>
					<nav className="level is-mobile">
						<div className="level-left is-skeleton">
							<a className="level-item" aria-label="view" href={view_link}>
								<span className="icon is-small">
									<i className="fas fa-heart" />
								</span>
							</a>
						</div>
					</nav>
				</div>
			</article>
		</div>
	);
};

export default Card;
