import { ffmpegNewBuffer } from "./ffmpeg";

export default function testVideo() {
    return ffmpegNewBuffer("-f lavfi -i testsrc -t 10 $OUT", [], "mp4");
}
