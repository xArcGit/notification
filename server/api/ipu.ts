import puppeteer, { type Browser, type Page } from 'puppeteer';

import { insertOrUpdateNotifications } from './index';
import { logger } from '@utils/logger';

interface ScheduleNotice {
	title: string;
	year: string;
	viewLink: string;
	downloadLink: string;
}

async function scrapeScheduleNotices(): Promise<ScheduleNotice[]> {
	const browser: Browser = await puppeteer.launch({ headless: true });
	const page: Page = await browser.newPage();

	await page.goto('https://ipu.admissions.nic.in/schedule-notices/');

	const data: ScheduleNotice[] = await page.evaluate(() => {
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

	await browser.close();
	return data;
}

const updateScheduleNotices = async (): Promise<void> => {
	try {
		const notices = await scrapeScheduleNotices();
		const resultMessage = insertOrUpdateNotifications(notices);
		logger.info(resultMessage);
	} catch (error) {
		logger.error('Error updating schedule notices:', error);
	}
};

export { scrapeScheduleNotices, updateScheduleNotices };
