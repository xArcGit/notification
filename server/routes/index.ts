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

// Utility function to handle invalid tag input
const validateTags = (tags: string[]): boolean => {
	return (
		Array.isArray(tags) &&
		tags.length > 0 &&
		tags.every(tag => typeof tag === 'string')
	);
};

// Utility function to construct the WHERE clause for search queries
const constructSearchQuery = (
	tags: string[],
	searchTerm: string,
	limit: number,
	offset: number,
): { queryText: string; params: any[] } => {
	const tagsPattern = `%${tags.join(',')}%`;
	let queryText = 'SELECT * FROM notifications WHERE tags LIKE ?';
	const params: any[] = [tagsPattern];

	if (searchTerm) {
		const searchPattern = `%${searchTerm}%`;
		queryText += ' AND title LIKE ?';
		params.push(searchPattern);
	}

	queryText += ' LIMIT ? OFFSET ?';
	params.push(limit, offset);

	return { queryText, params };
};

const route = new Hono();

// POST /notifications: Retrieve notifications based on tags with pagination
route.post('/', validateGetRequest, async c => {
	try {
		const { tags, limit, offset } = c.req.valid('json') as {
			tags: string[];
			limit: number;
			offset: number;
		};

		// Validate tags
		if (!validateTags(tags)) {
			return sendResponse(
				c,
				httpStatus.BAD_REQUEST,
				null,
				'Tags must be a non-empty array of strings',
			);
		}

		// Default limit if not provided or invalid
		const finalLimit = limit > 0 ? limit : 10;
		const finalOffset = offset >= 0 ? offset : 0;

		const { queryText, params } = constructSearchQuery(
			tags,
			'',
			finalLimit,
			finalOffset,
		);

		const { status, data, message } = await fetchNotifications(
			queryText,
			params,
		);
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

		// Validate tags
		if (!validateTags(tags)) {
			return sendResponse(
				c,
				httpStatus.BAD_REQUEST,
				null,
				'Tags must be a non-empty array of strings',
			);
		}

		// Default limit if not provided or invalid
		const finalLimit = limit > 0 ? limit : 10;
		const finalOffset = offset >= 0 ? offset : 0;

		// Construct the search query based on tags and search term
		const { queryText, params } = constructSearchQuery(
			tags,
			searchTerm,
			finalLimit,
			finalOffset,
		);

		const { status, data, message } = await fetchNotifications(
			queryText,
			params,
		);
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
