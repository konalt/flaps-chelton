import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_TOKEN });

const model = "davinci-002";

export { model };

export { openai };
