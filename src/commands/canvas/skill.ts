import { readFile } from "fs/promises";
import createQuote from "../../lib/canvas/createQuote";
import { getFileName, makeMessageResp } from "../../lib/utils";
import { FlapsCommand } from "../../types";
import { file } from "../../lib/ffmpeg/ffmpeg";

const ALIASES = {
    Logic: ["l"],
    Encyclopedia: ["enc", "ep"],
    Rhetoric: ["rh", "rht"],
    Drama: ["drm"],
    Conceptualization: ["cpt"],
    Visual_Calculus: ["vc", "vi"],
    Volition: ["vlt", "v"],
    Inland_Empire: ["ie"],
    Empathy: ["em"],
    Authority: [],
    Esprit_de_Corps: ["edc", "corps"],
    Suggestion: ["sg"],
    Endurance: ["end"],
    Pain_Threshold: ["pt", "pts", "ptsh"],
    Physical_Instrument: ["pi", "phi"],
    Electrochemistry: ["ec", "echem", "ech", "elch", "elc"],
    Shivers: ["shv", "sh"],
    Half_Light: ["hl", "hlt"],
    Hand0Eye_Coordination: ["hec", "handeye", "he", "coord"],
    Perception: ["prc", "pe"],
    Reaction_Speed: ["re"],
    Savoir_Faire: ["sf", "svr"],
    Interfacing: ["if", "inf"],
    Composure: ["cmp"],
    Composure_Baby: ["baby"],
};

const CATEGORY = {
    Intellect: [
        "Logic",
        "Encyclopedia",
        "Rhetoric",
        "Drama",
        "Conceptualization",
        "Visual_Calculus",
    ],
    Psyche: [
        "Volition",
        "Inland_Empire",
        "Empathy",
        "Authority",
        "Esprit_de_Corps",
        "Suggestion",
    ],
    Physique: [
        "Endurance",
        "Pain_Threshold",
        "Physical_Instrument",
        "Electrochemistry",
        "Shivers",
        "Half_Light",
    ],
    Motorics: [
        "Hand0Eye_Coordination",
        "Perception",
        "Reaction_Speed",
        "Savoir_Faire",
        "Interfacing",
        "Composure",
        "Composure_Baby",
    ],
};

const COLORS = {
    Intellect: "4eb2ce",
    Psyche: "625c7f",
    Physique: "832834",
    Motorics: "cea740",
};

module.exports = {
    id: "skill",
    name: "Skill",
    desc: "Disco Elysium skill says something",
    aliases: ["sk"],
    async execute(args) {
        let skillName = "Unknown";
        let skillCategory = "Unknown";
        for (const [skill, aliases] of Object.entries(ALIASES)) {
            if (
                aliases
                    .map((n: string) => n.toLowerCase())
                    .includes(args[0].toLowerCase()) ||
                skill.toLowerCase() == args[0].toLowerCase()
            )
                skillName = skill;
        }
        for (const [category, skills] of Object.entries(CATEGORY)) {
            if (skillName == "Unknown") {
                let skillsFiltered = skills.filter((s) =>
                    s.toLowerCase().startsWith(args[0].toLowerCase())
                );
                if (skillsFiltered.length == 1) skillName = skillsFiltered[0];
            }
            if (skills.includes(skillName)) skillCategory = category;
        }
        if (skillCategory == "Unknown") {
            return makeMessageResp(
                "flaps",
                `couldn't find the skill \`${args[0]}\``
            );
        }
        let portrait = await readFile(file(`elysiumskills/${skillName}.png`));
        let out = await createQuote(
            args.slice(1).join(" "),
            skillName.replace(/0/g, "/").replace(/_/g, " "),
            skillCategory,
            portrait,
            "#" + COLORS[skillCategory]
        );
        return makeMessageResp(
            "flaps",
            "",
            out,
            getFileName("Canvas_Skill", "png")
        );
    },
} satisfies FlapsCommand;
