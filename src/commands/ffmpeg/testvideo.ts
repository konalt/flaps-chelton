import testVideo from "../../lib/ffmpeg/testvideo";
import { getFileName, makeMessageResp } from "../../lib/utils";
import { FlapsCommand } from "../../types";

module.exports = {
    id: "testvideo",
    name: "Test Video",
    desc: "Creates a 10-second test video.",
    async execute() {
        let file = await testVideo();
        return makeMessageResp(
            "ffmpeg",
            "",
            file,
            getFileName("Effect_TestVideo", "mp4")
        );
    },
} satisfies FlapsCommand;
