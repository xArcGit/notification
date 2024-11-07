import type React from 'react';

interface SearchProps {
	text: string;
	results: string[];
}

const Search: React.FC<SearchProps> = ({ text, results }) => {
	return (
		<div>
			<p>{text}</p>
			<ul>
				{results.map((result, index) => (
					<li key={index}>{result}</li>
				))}
			</ul>
		</div>
	);
};

export default Search;
