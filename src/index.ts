import App from "./app";
import { getConfig } from "./utils/get-config";

/**
 *
 */
async function start() {
	const config = await getConfig();
	if (config === null) return;

	const app = new App(config);
	app.start();
}
/* eslint-disable-next-line unicorn/prefer-top-level-await */
start();
