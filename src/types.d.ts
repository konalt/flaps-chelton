import { Message } from "discord.js";

export interface FlapsCommand {
    id: string;
    aliases?: string[];
    name: string;
    desc?: string;
    needs?: string[];
    execute: (args: string[], buf: [Buffer, string][], msg: Message) => void;
}
export interface WebhookBot {
    id: string;
    name: string;
    avatar?: string;
    quirk?: (inContent: string) => string;
}

export interface RedditListing {
    kind: "Listing";
    data: RedditListingData;
}
export interface RedditListingData {
    after: string | null;
    dist: number;
    modhash: string;
    geo_filter: any;
    children: RedditPost[];
}
export interface RedditPost {
    kind: "t3";
    data: Record<string, any>;
}

export interface StableDiffusionOptions {
    img2img?: boolean;
    img?: string;
    mask?: string;
    prompt: string;
    inpaint?: boolean;
}

export interface Caption2Options {
    text: string;
}
export interface TrimOptions {
    start: number;
    end: number;
}
export interface SpeedOptions {
    speed: number;
}

export interface RGBColor {
    r: number;
    g: number;
    b: number;
}
