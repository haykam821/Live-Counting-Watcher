import { LiveUpdate } from "../app";

export function getAuthorUrl(update: LiveUpdate): string {
	return "https://reddit.com/user/" + update.author;
}

export function getThreadAboutUrl(thread: string): string {
	return "https://www.reddit.com/api/live/" + thread + "/about.json";
}
