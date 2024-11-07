import db from '../config/databases';

// Define an interface for the notification data
interface ScheduleNotice {
	title: string;
	year: string;
	viewLink: string;
	downloadLink: string;
}

// Function to check if a record already exists in the database
const isDuplicate = (title: string, viewLink: string): boolean => {
	const stmt = db.query(
		'SELECT COUNT(*) as count FROM notifications WHERE title = ? AND view_link = ?',
	);
	const result = stmt.get(title, viewLink);
	return (result as { count: number }).count > 0;
};

// Function to insert notifications into the database with fixed tags
const insertOrUpdateNotifications = (notices: ScheduleNotice[]): string => {
	let insertedCount = 0;
	let skippedCount = 0;

	const insertStmt = db.prepare(`
		INSERT INTO notifications (title, description, view_link, download_link, tags)
		VALUES (?, ?, ?, ?, ?)
	`);

	const fixedTags = 'ipu';

	for (const notice of notices) {
		if (!isDuplicate(notice.title, notice.viewLink)) {
			insertStmt.run(
				notice.title,
				notice.year,
				notice.viewLink,
				notice.downloadLink,
				fixedTags,
			);
			insertedCount++;
		} else {
			skippedCount++;
		}
	}

	return `Inserted: ${insertedCount}, Skipped (duplicates): ${skippedCount}`;
};

export { insertOrUpdateNotifications };
