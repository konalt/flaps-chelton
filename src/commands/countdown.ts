import { FlapsCommand } from "../types";
import { makeMessageResp } from "../lib/utils";

function makeString(arr: string[]) {
    if (arr.length === 1) return arr[0];
    const firsts = arr.slice(0, arr.length - 1);
    const last = arr[arr.length - 1];
    return firsts.join(", ") + " and " + last;
}

module.exports = {
    id: "countdown",
    name: "Countdown",
    desc: "Returns the amount of time left until the ECMA262 21.4.1.32 date set in the .env.",
    async execute() {
        let endDate = new Date(
            process.env.COUNTDOWN_END_DATE ?? "1970-01-01T00:00:00.000Z"
        );
        let endUnix = endDate.getTime();
        let curUnix = Date.now();
        if (endUnix <= curUnix) {
            return makeMessageResp("flaps", "IT ALREADY HAPPENED DUMBASS");
        } else {
            let timeLeft = endUnix - curUnix;
            let delta = timeLeft / 1000;
            let days = Math.floor(delta / 86400);
            delta -= days * 86400;
            let hours = Math.floor(delta / 3600) % 24;
            delta -= hours * 3600;
            let minutes = Math.floor(delta / 60) % 60;
            delta -= minutes * 60;
            let seconds = Math.round(delta % 60);
            let str: string[] = [];
            if (days > 0) {
                str.push(`${days} days`);
            }
            if (hours > 0) {
                str.push(`${hours} hours`);
            }
            if (minutes > 0) {
                str.push(`${minutes} minutes`);
            }
            if (seconds > 0) {
                str.push(`${seconds} seconds`);
            }
            return makeMessageResp("flaps", `only ${makeString(str)} left`);
        }
    },
} satisfies FlapsCommand;
