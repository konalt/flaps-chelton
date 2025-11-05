import { char, reload, templates } from "../canvas/char";
import make512x512 from "../canvas/make512x512";
import { choose } from "../utils";
import cubeTransition from "./cubetransition";
import { ffmpegBuffer, file } from "./ffmpeg";

export default async function osaka(buffers: [Buffer, string][]) {
    const img = [await make512x512(buffers[0][0], 500), "png"] as [
        Buffer,
        string
    ];

    if (templates._i) await reload();
    let chosenTemplates = choose(Object.keys(templates), 8);

    const chars = await Promise.all(
        chosenTemplates.map(
            async (id) =>
                [
                    await char(id, img[0]).then((c) => make512x512(c, 500)),
                    "png",
                ] as [Buffer, string]
        )
    );

    const cube = await cubeTransition([img, chars[0]], false);

    let td = 0.6;
    let to = 1.05;
    let offset = to / 2;
    const o = () => {
        offset += to;
        return offset - to;
    };

    return ffmpegBuffer(
        [
            `-loop 1 -t 2 -i $BUF0`,
            `-loop 1 -t 2 -i $BUF1`,
            `-loop 1 -t 2 -i $BUF2`,
            `-loop 1 -t 2 -i $BUF3`,
            `-loop 1 -t 2 -i $BUF4`,
            `-loop 1 -t 2 -i $BUF5`,
            `-loop 1 -t 2 -i $BUF6`,
            `-loop 1 -t 2 -i $BUF7`,
            `-loop 1 -t 2 -i $BUF8`,
            `-i $BUF9`,
            `-i ${file("osaka.mp3")}`,
            `-filter_complex "`,
            `[10:a]anull[out_a];`,
            `[9:v]scale=500:500,setsar=1:1,setpts=(PTS-STARTPTS)*0.3[cube];`,
            `[0:v]trim=0:${offset}[precube];`,
            `[precube][cube]concat=n=2:a=0:v=1[cubed];`,
            `[1:v][2:v]xfade=transition=wipeup:duration=${td}:offset=${o()}[out];`,
            `[out][3:v]xfade=transition=radial:duration=${td}:offset=${o()}[out];`,
            `[out][4:v]xfade=transition=revealright:duration=${td}:offset=${o()}[out];`,
            `[out][5:v]xfade=transition=circleopen:duration=${td}:offset=${o()}[out];`,
            `[out][6:v]xfade=transition=fadewhite:duration=${td}:offset=${o()}[out];`,
            `[out][7:v]xfade=transition=smoothdown:duration=${td}:offset=${o()}[out];`,
            `[out][8:v]xfade=transition=coverdown:duration=${td}:offset=${o()}[out];`,
            `[cubed][out]concat=n=2:a=0:v=1[out]`,
            `" -map "[out]" -shortest -map "[out_a]" $PRESET $OUT`,
        ].join(" "),
        [img, ...chars, [cube, "mp4"]],
        "mp4"
    );
}
