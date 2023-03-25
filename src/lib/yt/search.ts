import cp from "child_process";

export function getFirstResultID(search: string) {
    if (search.includes("weezer")) return "kemivUKb4f4";
    var ytProcess = cp.spawnSync(
        "yt-dlp",
        (
            "ytsearch:" +
            search.split(" ").join("+") +
            " --get-id --default-search ytsearch"
        ).split(" ")
    );
    return ytProcess.stdout.toString().trim();
}
