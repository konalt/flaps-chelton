import { strikethrough } from "discord.js";
import { CreateCompletionResponse } from "openai";
import { sendWebhook } from "../webhooks";
import { openai, model } from "./openai";
import { readFile } from "fs/promises";

export let monsoonPre = [1, "flaps", "I'm an AI."];

let temperatureOverride = -1;

export function setSanity(n: number) {
    if (typeof n !== "number" || !n) return;
    if ((n < 0 || n > 2) && n !== -1) return;
    temperatureOverride = n;
}

export function question(question: string): Promise<string> {
    return new Promise(async (res, rej) => {
        let monsoonData = await readFile("monsoon.txt", "utf-8");
        monsoonPre = [
            parseFloat(monsoonData.split(" ")[0]),
            monsoonData.split(" ")[1],
            monsoonData.split(" ").slice(2).join(" "),
        ];
        if (
            question.toLowerCase().includes("fr") &&
            question.toLowerCase().includes("on god")
        ) {
            return res("No, probably not");
        }
        openai
            .createCompletion({
                model: model,
                prompt: `${monsoonPre[2]}\nQ: ${question}\nA:`,
                temperature:
                    temperatureOverride == -1
                        ? Number(monsoonPre[0])
                        : temperatureOverride,
                max_tokens: 64,
                top_p: 1,
                frequency_penalty: 0,
                presence_penalty: 0,
            })
            .then((resp) => {
                res(resp.data.choices[0].text.split("Q:")[0].trim());
            });
    });
}
