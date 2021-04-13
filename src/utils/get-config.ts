import { CosmiconfigResult } from "cosmiconfig/dist/types";
import { configurationLog } from "./debug";
import { cosmiconfig } from "cosmiconfig";
import mergeDeep from "merge-deep";

export interface LiveCountingWatcherConfig {
	fullChat: number;
	thread: string;
	token: string;
}

interface LiveCountingWatcherConfigResult extends CosmiconfigResult {
	config: LiveCountingWatcherConfig;
}

const baseConfig: LiveCountingWatcherConfig = {
	fullChat: null,
	token: null,
	thread: null,
};

/**
 * Gets the user-defined configuration with default values.
 * @returns The configuration object.
 */
export async function getConfig(): Promise<LiveCountingWatcherConfig> {
	const explorer = cosmiconfig("live-counting-watcher", {
		searchPlaces: [
			"package.json",
			"config.json",
			".live-counting-watcherrc",
			".live-counting-watcherrc.json",
			".live-counting-watcherrc.yaml",
			".live-counting-watcherrc.yml",
			".live-counting-watcherrc.js",
			".live-counting-watcherrc.cjs",
			"live-counting-watcherrc.config.js",
			"live-counting-watcherrc.config.cjs",
		],
	});

	const unmergedResult: LiveCountingWatcherConfigResult = await explorer.search();

	const result = mergeDeep({
		config: baseConfig,
	}, unmergedResult);

	configurationLog("loaded configuration from '%s'", result.filepath);
	configurationLog("loaded configuration: %O", result.config);

	if (result.config.token === null) {
		configurationLog("configuration must have a token to authenticate to Telegram");
		return null;
	} else if (result.config.thread === null) {
		configurationLog("configuration must have a thread to watch");
		return null;
	}

	return result.config;
}
