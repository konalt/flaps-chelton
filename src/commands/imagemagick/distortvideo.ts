import { addBufferSequence, removeBuffer } from "../..";
import convertToImageSequence from "../../lib/ffmpeg/convertToImageSequence";
import { ffmpegBuffer } from "../../lib/ffmpeg/ffmpeg";
import {
    getFrameCount,
    getVideoDimensions,
    getVideoLength,
} from "../../lib/ffmpeg/getVideoDimensions";
import distort from "../../lib/imagemagick/distort";
import { getFileName, makeMessageResp } from "../../lib/utils";
import { FlapsCommand } from "../../types";

module.exports = {
    id: "distortvideo",
    name: "Distort Video",
    desc: "Distorts every frame of a video.",
    needs: ["video"],
    async execute(args, buf) {
        let factor = Math.max(0.05, Math.min(parseFloat(args[0]) || 0.5, 2));
        let dimensions = await getVideoDimensions(buf[0], true);
        let frameCount = await getFrameCount(buf[0]);
        let framerate = frameCount / (await getVideoLength(buf[0]));
        let smallVideo = await ffmpegBuffer(
            `-i $BUF0 -vf scale=300:-2 $PRESET $OUT`,
            buf,
            "mp4"
        );
        let realDims = await getVideoDimensions([smallVideo, "mp4"]);
        let fO = 0;
        let newFrames: Buffer[] = [];
        while (fO < frameCount - 2) {
            let promises: Promise<Buffer>[] = [];
            while (promises.length < 200) {
                if (fO == frameCount - 2) break;
                console.log(fO);
                promises.push(
                    ffmpegBuffer(
                        `-ss ${
                            (1 / framerate) * fO
                        } -i $BUF0 -vframes 1 $PRESET $OUT`,
                        buf,
                        "png"
                    ).then((i) => distort(i, factor, true, realDims))
                );
                fO++;
            }
            newFrames.push(...(await Promise.all(promises)));
        }
        let animationSequence = addBufferSequence(newFrames, "png");
        let animationConcat = await ffmpegBuffer(
            `-pattern_type sequence -framerate ${framerate} -f image2 -i http://localhost:56033/${animationSequence} -i $BUF0 -framerate ${framerate} -filter_complex "[0:v]scale=${dimensions.join(
                ":"
            )}[ov];[1:a]anull[oa]" -map "[ov]" -map "[oa]" $PRESET $OUT`,
            [[smallVideo, "mp4"]],
            "mp4"
        );
        removeBuffer(animationSequence);
        return makeMessageResp(
            "ffmpeg",
            "",
            animationConcat,
            getFileName("ImageMagick_DistortVideo", "mp4")
        );
    },
} satisfies FlapsCommand;
