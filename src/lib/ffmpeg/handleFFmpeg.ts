import { FlapsCommandResponse } from "../../types";
import { makeMessageResp } from "../utils";

export default function handleFFmpeg(
    filename: string,
    resolveFn: (resp: FlapsCommandResponse) => void
): (buffer: Buffer) => void {
    return function handler(buffer: Buffer) {
        resolveFn(makeMessageResp("ffmpeg", "", buffer, filename));
    };
}
