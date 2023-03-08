import { readFileSync } from "fs";
import { FlapsCommand } from "../types";
import { makeMessageResp } from "../lib/utils";

module.exports = {
    id: "lastdrink",
    name: "Last Drink",
    execute(args, buf, msg) {
        return new Promise((res) => {
            var newTime =
                Date.now() -
                new Date(readFileSync("./lastdrink.txt").toString()).getTime();
            var delta = newTime / 1000;
            var days = Math.floor(delta / 86400);
            delta -= days * 86400;
            var hours = Math.floor(delta / 3600) % 24;
            delta -= hours * 3600;
            var minutes = Math.floor(delta / 60) % 60;
            delta -= minutes * 60;
            var seconds = Math.round(delta % 60);
            var str = `good funo it has been a total of ${days} days ${hours} hours ${minutes} minutes ${seconds} seconds since your last drink\nplease do not drink you get very annoying and i get worried for your mental health`;
            res(makeMessageResp("flaps", str));
        });
    },
} satisfies FlapsCommand;
