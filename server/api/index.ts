import db from '../config/databases';
import { featch as featchIpu } from './ipu';

interface Notification {
	title: string;
	description: string;
	urls: string;
	tags: string;
}

interface Return {
	message: string;
	tags: string;
}

const updateData = (Notifications: Notification[]): Return => {
	// Update data
	return {
		message: 'Data updated',
		tags: Notifications.map(notification => notification.tags).join(', '),
	};
};

const getData = () => {
	// Get data
};
