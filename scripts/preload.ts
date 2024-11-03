import { logger } from '@utils/logger';

logger.info('Initializing...');

async function initialize() {
	logger.info('Initialization complete');
}

initialize().catch(err => {
	logger.error('Initialization failed:', err);
	process.exit(1);
});
