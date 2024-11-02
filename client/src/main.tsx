import './index.css';

import App from './App.tsx';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

// biome-ignore lint/style/noNonNullAssertion: <explanation>
createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<App />
	</StrictMode>,
);
