import { Message, TextBasedChannel } from "discord.js";

export interface FlapsCommand {
    id: string;
    aliases?: string[];
    name: string;
    desc?: string;
    needs?: string[];
    showOnCommandSimulator?: boolean;
    execute: (
        args: string[],
        buf: [Buffer, string][],
        msg: Message
    ) => Promise<FlapsCommandResponse>;
}
export type FlapsCommandResponse = FlapsMessageCommandResponse;
export interface FlapsMessageCommandResponse {
    type: CommandResponseType;
    id: string;
    content: string;
    channel: TextBasedChannel;
    buffer: Buffer | null;
    filename: string | null;
}
export enum CommandResponseType {
    Message,
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
export interface CaptionOptions {
    text: string;
    fontsize: number;
}
export interface TrimOptions {
    start: number;
    end: number;
}
export interface SpeedOptions {
    speed: number;
}
export interface SpinOptions {
    speed: number;
    length: number;
    gif: boolean;
}
export interface CropOptions {
    x: number;
    y: number;
    width: number;
    height: number;
    mode: "pixel" | "percent";
}

export interface RGBColor {
    r: number;
    g: number;
    b: number;
}

export interface AutoStatusInfo {
    channel: string;
    text: string;
    webhook: string;
}

export interface Web3DAnimation {
    step: (...args: any[]) => Promise<Buffer>;
    destroy: () => void;
    lastFrame: Buffer;
}

export interface TTSSAMLine {
    speed: number;
    pitch: number;
    text: string;
}
