import handleFFmpeg from "../../lib/ffmpeg/handleFFmpeg";
import pokeball from "../../lib/ffmpeg/pokeball";
import { getFileName } from "../../lib/utils";
import { FlapsCommand } from "../../types";
import handleFFmpegCatch from "../../lib/ffmpeg/handleFFmpegCatch";

module.exports = {
    id: "pokeball",
    name: "Pokéball",
    desc: "Pops an image out of a pokéball",
    needs: ["image"],
    execute(args, buf) {
        return new Promise((res, rej) => {
            pokeball(buf).then(
                handleFFmpeg(getFileName("Effect_Pokeball", "gif"), res),
                handleFFmpegCatch(res)
            );
        });
    },
} satisfies FlapsCommand;
