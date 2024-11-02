import { Hono } from 'hono';
import db from '../config/databases';
import { httpStatus } from '@utils/http-status';
import { logger } from '@utils/logger';
import { restrictRunInterval } from '../middlewares/refresh';
import { sendResponse } from '../utils/response';
import { validateRequest } from '../middlewares/validater';

const route = new Hono();
route.basePath('/api');

route.get('/get', validateRequest, async c => {
	const { tags } = c.req.valid('json');
	try {
		const tagsString = `%${tags.join(',')}%`;
		const queryText = `
			SELECT * FROM notifications
			WHERE tags LIKE ?;
		`;
		const rows = db.query(queryText).all(tagsString);

		return sendResponse(c, httpStatus.OK, rows);
	} catch (error) {
		logger.error('Error fetching notifications:', error);
		return sendResponse(
			c,
			httpStatus.INTERNAL_SERVER_ERROR,
			null,
			'Database error',
		);
	}
});

route.get('/search', validateRequest, async c => {
	const { tags } = c.req.valid('json');
	const { query } = c.req.query();
	try {
		const tagsString = `%${tags.join(',')}%`;
		const searchQuery = `%${query}%`;

		const queryText = `
			SELECT * FROM notifications
			WHERE
				tags LIKE ? AND
				(title LIKE ? OR description LIKE ?);
		`;
		const rows = db.query(queryText).all(tagsString, searchQuery, searchQuery);

		return sendResponse(c, httpStatus.OK, rows);
	} catch (error) {
		logger.error('Error searching notifications:', error);
		return sendResponse(
			c,
			httpStatus.INTERNAL_SERVER_ERROR,
			null,
			'Database error',
		);
	}
});

route.get('/refresh', restrictRunInterval, async c => {
	try {
		// Your refresh logic goes here, e.g., updating data or clearing cache
		return sendResponse(
			c,
			httpStatus.OK,
			null,
			'Refresh completed successfully',
		);
	} catch (error) {
		logger.error('Error in refresh route:', error);
		return sendResponse(
			c,
			httpStatus.INTERNAL_SERVER_ERROR,
			null,
			'Refresh failed',
		);
	}
});

export { route };
