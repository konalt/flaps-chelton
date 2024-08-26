import { Message } from "discord.js";
import { FlapsCommand } from "../types";
import stablediffusion from "../lib/ai/stablediffusion";
import { getFileName, makeMessageResp } from "../lib/utils";

module.exports = {
    id: "stablediffusion",
    aliases: ["dalle2", "dalle"],
    name: "Stable Diffusion",
    desc: "Generates an image with Stable Diffusion.",
    async execute(args) {
        let image = await stablediffusion({
            prompt: args.join(" "),
        });
        return makeMessageResp(
            "dalle2",
            "",
            image,
            getFileName("AI_StableDiff", "png")
        );
    },
} satisfies FlapsCommand;
