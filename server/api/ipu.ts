import puppeteer, { type Browser, type Page } from 'puppeteer';

import { insertOrUpdateNotifications } from './index';

// Define an interface for the scraped data
interface ScheduleNotice {
	title: string;
	year: string;
	viewLink: string;
	downloadLink: string;
}

// Function to scrape data from the website
async function scrapeScheduleNotices(): Promise<ScheduleNotice[]> {
	// Launch Puppeteer
	const browser: Browser = await puppeteer.launch({ headless: true });
	const page: Page = await browser.newPage();

	// Navigate to the URL
	await page.goto('https://ipu.admissions.nic.in/schedule-notices/');

	// Extract data
	const data: ScheduleNotice[] = await page.evaluate(() => {
		// Define an interface inside the evaluate function for type safety
		interface ScheduleNotice {
			title: string;
			year: string;
			viewLink: string;
			downloadLink: string;
		}

		const rows = document.querySelectorAll('tr');
		const extractedData: ScheduleNotice[] = [];

		for (const row of Array.from(rows)) {
			const titleElement = row.querySelector<HTMLAnchorElement>(
				'td[data-th="Title "] a',
			);
			const yearElement = row.querySelector<HTMLSpanElement>(
				'td[data-th="Year "] span',
			);
			const downloadElement = row.querySelector<HTMLAnchorElement>(
				'td[data-th="View / Download"] a.download',
			);

			if (titleElement && yearElement && downloadElement) {
				extractedData.push({
					title: titleElement.textContent?.trim() || '',
					year: yearElement.textContent?.trim() || '',
					viewLink: titleElement.href || '',
					downloadLink: downloadElement.href || '',
				});
			}
		}

		return extractedData;
	});

	// Close the browser
	await browser.close();

	return data;
}

// Main function to perform scraping and update the database
const updateScheduleNotices = async (): Promise<void> => {
	try {
		const notices = await scrapeScheduleNotices();
		const resultMessage = insertOrUpdateNotifications(notices);
		console.log(resultMessage);
	} catch (error) {
		console.error('Error updating schedule notices:', error);
	}
};

// Run the update process
updateScheduleNotices();

export { scrapeScheduleNotices };
