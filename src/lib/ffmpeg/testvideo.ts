import { ffmpegBuffer } from "./ffmpeg";

export default function testVideo() {
    return ffmpegBuffer("-f lavfi -i testsrc -t 10 $OUT", [], "mp4");
}
