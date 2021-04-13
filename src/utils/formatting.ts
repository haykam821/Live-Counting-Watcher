import { LiveUpdate } from "../app";
import { getAuthorUrl } from "./urls";

export function escape(string: string): string {
	return string.replace(/([\\_*[\]()~`>#+-=|{}.!])/g, "\\$1");
}

export function getEscapedBody(update: LiveUpdate): string {
	return escape(update.body);
}

export function getStrikenEscapedBody(update: LiveUpdate): string {
	if (update.stricken) {
		return "~" + getEscapedBody(update) + "~";
	}
	return getEscapedBody(update);
}

export function getLiveUpdateMessage(update: LiveUpdate): string {
	return `**[u/${escape(update.author)}](${getAuthorUrl(update)}):** ${getStrikenEscapedBody(update)}`;
}
