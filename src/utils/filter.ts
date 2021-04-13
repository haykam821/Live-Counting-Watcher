interface SimpleFilter {
	includes: string;
}

interface RegExpFilter {
	pattern: string;
	flags?: string;
}

interface MultiFilter {
	filters: Filter[];
}

export type Filter = SimpleFilter | RegExpFilter | MultiFilter;

/**
 * @param message The message to execute the filter on.
 * @param filter The filter to test.
 */
export function doesFilterMatch(message: string, filter: Filter): boolean {
	if ("includes" in filter) {
		return message.includes(filter.includes);
	} else if ("pattern" in filter) {
		const expression = new RegExp(filter.pattern, filter.flags);
		return expression.test(message);
	} else if ("filters" in filter) {
		for (const subFilter of filter.filters) {
			if (!this.doesFilterMatch(message, subFilter)) {
				return false;
			}
		}
		return true;
	}

	throw new Error("Unknown filtered chat: " + filter);
}
