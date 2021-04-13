import { LiveUpdate } from "../app";
import { getAuthorUrl } from "./urls";

/**
 * @param string The string to escape.
 * @returns The escaped string.
 */
export function escape(string: string): string {
	return string.replace(/([!#()*+-=>[\\\]_`{|}~])/g, "\\$1");
}

/**
 * @param update The live update to get the escaped body of.
 * The escaped body of the live update.
 */
export function getEscapedBody(update: LiveUpdate): string {
	return escape(update.body);
}

/**
 * @param update The live update to get the escaped body of, with strikethrough if stricken.
 * The escaped body of the live update, possibly with strikethrough.
 */
export function getStrikenEscapedBody(update: LiveUpdate): string {
	if (update.stricken) {
		return "~" + getEscapedBody(update) + "~";
	}
	return getEscapedBody(update);
}

/**
 * @param update The update to get the representative message for.
 * The message representing the live update.
 */
export function getLiveUpdateMessage(update: LiveUpdate): string {
	return `**[u/${escape(update.author)}](${getAuthorUrl(update)}):** ${getStrikenEscapedBody(update)}`;
}
