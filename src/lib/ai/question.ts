import { strikethrough } from "discord.js";
import { CreateCompletionResponse } from "openai";
import { sendWebhook } from "../webhooks";
import { openai, model } from "./openai";

export default (question: string): Promise<string> => {
    return new Promise((res, rej) => {
        if (
            question.toLowerCase().includes("fr") &&
            question.toLowerCase().includes("on god")
        ) {
            return res("No, probably not");
        }
        openai
            .createCompletion({
                model: model,
                prompt: `Q: ${question}\nA:`,
                temperature: 1,
                max_tokens: 100,
                top_p: 1,
                frequency_penalty: 0,
                presence_penalty: 0,
            })
            .then((resp) => {
                res(resp.data.choices[0].text.split("Q:")[0].trim());
            });
    });
};
