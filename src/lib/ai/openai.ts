import { Configuration, OpenAIApi } from "openai";

const openai = new OpenAIApi(
    new Configuration({ apiKey: process.env.OPENAI_TOKEN })
);

const model = "davinci-002";

export { model };

export { openai };
