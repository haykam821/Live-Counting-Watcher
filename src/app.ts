import WebSocket, { Data } from "ws";
import got, { Response } from "got";

import { LiveCountingWatcherConfig } from "./utils/get-config";
import { Telegraf } from "telegraf";
import { doesFilterMatch } from "./utils/filter";
import { getLiveUpdateMessage } from "./utils/formatting";
import { getThreadAboutUrl } from "./utils/urls";
import { log } from "./utils/debug";

interface LiveThreadBody {
	data: {
		/* eslint-disable-next-line camelcase */
		websocket_url: string;
	};
	kind: "LiveUpdateEvent";
}

interface LiveThreadData {
	payload: Record<string, unknown>;
	type: string;
}

export interface LiveUpdate {
	/* eslint-disable camelcase */
	body: string;
	name: string;
	created: number;
	author: string;
	created_utc: number;
	body_html: string;
	stricken: boolean;
	id: string;
	/* eslint-enable camelcase */
}

export default class App {
	private readonly config: LiveCountingWatcherConfig;
	private readonly client: Telegraf;
	private socket: WebSocket;

	constructor(config: LiveCountingWatcherConfig) {
		this.config = config;
		this.client = new Telegraf(config.token);
		this.refreshSocket();

		this.handleSocketMessage = this.handleSocketMessage.bind(this);
		this.refreshSocket = this.refreshSocket.bind(this);
	}

	async start(): Promise<void> {
		await this.client.launch();
	}

	private async sendLiveUpdateMessage(message: string, chat: number): Promise<void> {
		if (chat && typeof chat === "number") {
			try {
				await this.client.telegram.sendMessage(chat, message, {
					/* eslint-disable camelcase */
					disable_web_page_preview: true,
					parse_mode: "MarkdownV2",
					/* eslint-enable camelcase */
				});
				log("sent live update message to chat %s", chat);
			} catch (error) {
				log("failed to send live update message to chat %s: %O", chat, error);
			}
		}
	}

	private handleSocketMessage(rawData: Data): void {
		const data: LiveThreadData = JSON.parse(rawData.toString());

		if (data.payload && data.payload.kind === "LiveUpdate") {
			const update = data.payload.data as LiveUpdate;
			log("received live update from user u/%s with data: %O", update.author, update);

			const message = getLiveUpdateMessage(update);

			this.sendLiveUpdateMessage(message, this.config.fullChat);
			for (const filteredChat of this.config.filteredChats) {
				if (doesFilterMatch(update.body, filteredChat)) {
					this.sendLiveUpdateMessage(message, filteredChat.chat);
				}
			}
		} else {
			log("received socket message with type '%s' and payload: %O", data.type, data.payload);
		}
	}

	private getThreadAboutUrl(): string {
		return getThreadAboutUrl(this.config.thread);
	}

	private async getThreadSocketUrl(): Promise<string> {
		try {
			const response: Response<LiveThreadBody> = await got.get(this.getThreadAboutUrl(), {
				responseType: "json",
			});

			if (!response.body.data || typeof response.body.data !== "object") {
				throw new Error("Thread has no data");
			} else if (!response.body.data.websocket_url) {
				throw new Error("Missing thread socket URL");
			} else if (typeof response.body.data.websocket_url !== "string") {
				throw new TypeError("Invalid type for thread socket URL");
			}

			return response.body.data.websocket_url;
		} catch (error) {
			throw new Error("Failed to get thread socket URL: " + error.message);
		}
	}

	private async refreshSocket(): Promise<void> {
		if (this.socket !== null && this.socket instanceof WebSocket) {
			this.socket.close();
		}

		const url = await this.getThreadSocketUrl();
		this.socket = new WebSocket(url);

		// Listeners
		this.socket.on("open", () => {
			log("connected to thread socket at %s", url);
		});
		this.socket.on("message", this.handleSocketMessage);
		this.socket.on("close", this.refreshSocket);
	}
}
