import { logger } from '@utils/logger';

logger.info('Initializing...');

async function initialize() {
	console.log('Initialization complete');
}

initialize().catch(err => {
	console.error('Initialization failed:', err);
	process.exit(1);
});
