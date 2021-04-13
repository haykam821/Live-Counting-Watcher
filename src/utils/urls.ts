import { LiveUpdate } from "../app";

/**
 * @param update The live update to get the author URL of.
 * @returns The URL of the live update's author.
 */
export function getAuthorUrl(update: LiveUpdate): string {
	return "https://reddit.com/user/" + update.author;
}

/**
 * @param thread The live thread to get the about URL of.
 * @returns The about URL of the live thread.
 */
export function getThreadAboutUrl(thread: string): string {
	return "https://www.reddit.com/api/live/" + thread + "/about.json";
}
