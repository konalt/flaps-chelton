export interface FlapsCommand {
    id: string;
    aliases?: string[];
    name: string;
    desc?: string;
    execute: Function;
}
export interface WebhookBot {
    id: string;
    name: string;
    avatar?: string;
    quirk?: (inContent: string) => string;
}
