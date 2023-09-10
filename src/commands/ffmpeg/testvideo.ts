import testVideo from "../../lib/ffmpeg/testvideo";
import { getFileName, makeMessageResp } from "../../lib/utils";
import { FlapsCommand } from "../../types";

module.exports = {
    id: "testvideo",
    name: "Test Video",
    desc: "Creates a 10-second test video.",
    execute() {
        return new Promise((res, rej) => {
            testVideo().then(
                (file) => {
                    res(
                        makeMessageResp(
                            "ffmpeg",
                            "test",
                            null,
                            file,
                            getFileName("Effect_TestVideo", "mp4")
                        )
                    );
                },
                (error) => {
                    res(
                        makeMessageResp(
                            "ffmpeg",
                            "FFmpeg fucked up bruh\n```" + error + "```"
                        )
                    );
                }
            );
        });
    },
} satisfies FlapsCommand;
