import {
	validateGetRequest,
	validateRefreshRequest,
} from '../middlewares/validater';

import { Hono } from 'hono';
import db from '../config/databases';
import { httpStatus } from '@utils/http-status';
import { logger } from '@utils/logger';
import { restrictRunInterval } from '../middlewares/refresh';
import { sendResponse } from '../utils/response';
import { updateScheduleNotices } from '../api/ipu';

interface Notification {
	id: number;
	title: string;
	description: string;
	view_link: string;
	download_link: string;
	tags: string;
}

interface FetchNotificationsResult {
	status: number;
	data: Notification[] | null;
	message?: string;
}

// Utility function to fetch notifications from the database with pagination
const fetchNotifications = async (
	queryText: string,
	params: any[],
): Promise<FetchNotificationsResult> => {
	try {
		const statement = db.prepare(queryText);
		const rows = statement.all(...params) as Notification[];
		return { status: httpStatus.OK, data: rows };
	} catch (error) {
		logger.error('Database error:', error);
		return {
			status: httpStatus.INTERNAL_SERVER_ERROR,
			data: null,
			message: 'Database error occurred',
		};
	}
};

const route = new Hono();

// Middleware for parsing request body
// route.use('*', async (c, next) => {
// 	try {
// 		await c.req.parseBody();
// 		await next();
// 	} catch (error) {
// 		logger.error('Error parsing request body:', error);
// 		return sendResponse(
// 			c,
// 			httpStatus.BAD_REQUEST,
// 			null,
// 			'Invalid request body',
// 		);
// 	}
// });

// POST /notifications: Retrieve notifications based on tags with pagination
route.post('/', validateGetRequest, async c => {
	try {
		const { tags, limit, offset } = c.req.valid('json') as {
			tags: string[];
			limit: number;
			offset: number;
		};

		if (!tags || tags.length === 0) {
			return sendResponse(
				c,
				httpStatus.BAD_REQUEST,
				null,
				'tags must be a non-empty array of strings',
			);
		}

		const tagsPattern = `%${tags.join(',')}%`;
		const queryText = `
			SELECT * FROM notifications
			WHERE tags LIKE ?
			LIMIT ? OFFSET ?;
		`;

		const { status, data, message } = await fetchNotifications(queryText, [
			tagsPattern,
			limit,
			offset,
		]);
		return sendResponse(c, status, data, message);
	} catch (error) {
		logger.error('Error processing / request:', error);
		return sendResponse(
			c,
			httpStatus.INTERNAL_SERVER_ERROR,
			null,
			'Internal Server Error',
		);
	}
});

// POST /notifications/search: Search notifications by tags and query with pagination
route.post('/search', validateGetRequest, async c => {
	try {
		const { tags, limit, offset } = c.req.valid('json') as {
			tags: string[];
			limit: number;
			offset: number;
		};
		const searchTerm = c.req.query('query') || ''; // Fetching query parameter

		if (!tags || tags.length === 0) {
			return sendResponse(
				c,
				httpStatus.BAD_REQUEST,
				null,
				'tags must be a non-empty array of strings',
			);
		}

		const tagsPattern = `%${tags.join(',')}%`;
		const searchPattern = `%${searchTerm}%`;
		const queryText = `
			SELECT * FROM notifications
			WHERE tags LIKE ? AND (title LIKE ? OR description LIKE ?)
			LIMIT ? OFFSET ?;
		`;

		const { status, data, message } = await fetchNotifications(queryText, [
			tagsPattern,
			searchPattern,
			searchPattern,
			limit,
			offset,
		]);
		return sendResponse(c, status, data, message);
	} catch (error) {
		logger.error('Error processing /search request:', error);
		return sendResponse(
			c,
			httpStatus.INTERNAL_SERVER_ERROR,
			null,
			'Internal Server Error',
		);
	}
});

// POST /notifications/refresh: Trigger data refresh
route.post('/refresh', restrictRunInterval, validateRefreshRequest, async c => {
	try {
		const { refresh } = c.req.valid('json') as { refresh: boolean };

		if (refresh) {
			await updateScheduleNotices();
			return sendResponse(
				c,
				httpStatus.OK,
				null,
				'Refresh completed successfully',
			);
		}

		return sendResponse(
			c,
			httpStatus.BAD_REQUEST,
			null,
			'Refresh not triggered. Set force Refresh to true to proceed.',
		);
	} catch (error) {
		logger.error('Error processing /refresh request:', error);
		return sendResponse(
			c,
			httpStatus.INTERNAL_SERVER_ERROR,
			null,
			'Refresh failed',
		);
	}
});

export { route };
