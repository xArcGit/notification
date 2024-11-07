import app from './app';
import { config } from '@config/app.config';
import { logger } from '@utils/logger';

Bun.serve({
	development: config.runner.env === 'development',
	port: config.runner.port.server,
	fetch: app.fetch,
});

logger.info(
	`Server is running on http://127.0.0.1:${config.runner.port.server}`,
);
