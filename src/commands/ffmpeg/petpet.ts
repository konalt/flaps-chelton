import handleFFmpeg from "../../lib/ffmpeg/handleFFmpeg";
import { getFileExt, getFileName } from "../../lib/utils";
import { FlapsCommand } from "../../types";
import handleFFmpegCatch from "../../lib/ffmpeg/handleFFmpegCatch";
import petpet from "../../lib/ffmpeg/petpet";

module.exports = {
    id: "petpet",
    name: "Pet Pet",
    desc: "Pets an image.",
    aliases: ["pet"],
    needs: ["image"],
    execute(args, buf, msg) {
        return new Promise((res, rej) => {
            petpet(buf).then(
                handleFFmpeg(getFileName("Effect_PetPet", "gif"), res),
                handleFFmpegCatch(res)
            );
        });
    },
} satisfies FlapsCommand;
