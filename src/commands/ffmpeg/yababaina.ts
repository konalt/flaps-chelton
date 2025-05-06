import handleFFmpeg from "../../lib/ffmpeg/handleFFmpeg";
import yababaina from "../../lib/ffmpeg/yababaina";
import { getFileName } from "../../lib/utils";
import { FlapsCommand } from "../../types";
import handleFFmpegCatch from "../../lib/ffmpeg/handleFFmpegCatch";

module.exports = {
    id: "yababaina",
    name: "Yababaina",
    desc: "ヤババイナ バッドなミュージック ちゃっかりしっくり鳴ってんだ Vi Vinyl 掘ったら掘ったで 雑多唸ってん DOWN DOWN ヤババイナ バッドな休日 やっぱりかったりぃなってんだ サバイバーさっさとバツ! してやったりなんまいだ",
    needs: ["image"],
    execute(args, buf) {
        return new Promise((res, rej) => {
            yababaina(buf[0][0]).then(
                handleFFmpeg(getFileName("Effect_Yababaina", "mp4"), res),
                handleFFmpegCatch(res)
            );
        });
    },
} satisfies FlapsCommand;
