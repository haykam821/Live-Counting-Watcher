import { Filter } from "./filter";

interface ChatReference {
	chat: number;
}

export type FilteredChat = Filter & ChatReference;
