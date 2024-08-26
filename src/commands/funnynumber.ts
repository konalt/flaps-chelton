import { FlapsCommand } from "../types";
import fetch from "node-fetch";
import { makeMessageResp } from "../lib/utils";

module.exports = {
    id: "funnynumber",
    name: "Funny Number",
    desc: "Gets the funny number of a character.",
    showOnCommandSimulator: false,
    async execute(args) {
        let tag = "";
        if (args[0]) {
            tag = args.join("_");
        } else {
            tag = "calamitas".split(" ").join("_");
        }
        let autocompleteData = await fetch(
            "https://rule34.xxx/public/autocomplete.php?q=" +
                tag.replace(/'/g, "&#039;")
        ).then((r) => {
            return r.json();
        });

        autocompleteData = autocompleteData.filter((z: { label: string }) =>
            z.label.replace(/&#039;/g, "'").startsWith(tag)
        );
        if (!autocompleteData[0]) {
            return makeMessageResp(
                "runcling",
                "holy fuck. you searched for something that even the horniest corner of the internet could not draw. good job dude."
            );
        }
        let output = autocompleteData
            .map((z: { label: string }) => {
                return `**${tag}**${z.label
                    .replace(/&#039;/g, "'")
                    .substring(tag.length)
                    .replace(/_/g, "\\_")}`;
            })
            .join("\n");
        return makeMessageResp("runcling", output);
    },
} satisfies FlapsCommand;
