import { WebhookBot } from "../types";
import { sample } from "./utils";

export const users: WebhookBot[] = [
    {
        id: "flaps",
        name: "flaps chelton",
    },
    {
        id: "kb",
        name: "the killer boss",
    },
    {
        id: "dziad",
        name: "dziad ufolud",
    },
    {
        id: "jeremiah",
        name: "the racist jeremiah fink",
    },
    {
        id: "sammy",
        name: "sammy merk",
    },
    {
        id: "micheal",
        name: "Taoiseach Micheál Martin",
    },
    {
        id: "norma",
        name: "Norma Foley #OpenSchools",
    },
    {
        id: "deepai",
        name: "ROBOT FROM THE LOONEY BIN",
    },
    {
        id: "briez",
        name: "Briez Drohmer #illinoispride",
    },
    {
        id: "joingle",
        name: "🥰🥰 Joe Joingle 🥰🥰",
        quirk(text) {
            return "🥰🥰 " + text + " 🥰🥰";
        },
    },
    {
        id: "zephiel",
        name: "Mr. Zephiel",
    },
    {
        id: "lamazzu",
        name: "MR LAMAZZU | NEW EP",
    },
    {
        id: "jaz",
        name: "DJ Jaz",
    },
    {
        id: "cicero",
        name: "UNCLEAN CICERO #CROWCAUSECANCER #CANCER",
        quirk(text) {
            return text.toUpperCase();
        },
    },
    {
        id: "spamton",
        name: "Spamton G. Spamton",
        quirk: spamtonify,
    },
    {
        id: "gabe",
        name: 'the angel "gabriel"',
        quirk(text) {
            var z = [
                "\u0315",
                "\u031b",
                "\u0340",
                "\u0341",
                "\u0358",
                "\u0321",
                "\u0322",
                "\u0327",
                "\u0328",
                "\u0334",
                "\u0335",
                "\u0336",
                "\u034f",
                "\u035c",
                "\u035d",
                "\u035e",
                "\u035f",
                "\u0360",
                "\u0362",
                "\u0338",
                "\u0337",
                "\u0361",
                "\u0489",
            ];
            var newtxt = "";
            for (var i = 0; i < text.length; i++) {
                if (z.includes(text.substr(i, 1))) {
                    continue;
                }
                newtxt += text.substr(i, 1);
                for (var j = 0; j < Math.floor(Math.random() * 16); j++) {
                    newtxt += z[Math.floor(Math.random() * z.length)];
                }
            }
            return newtxt;
        },
    },
    {
        id: "tom",
        name: "freaky tom",
    },
    {
        id: "wake",
        name: "joe biden wake up",
    },
    {
        id: "shang",
        name: "Shang Jiu-Li (Chinese Mole Man)",
        quirk(x) {
            return x
                .replace(/mr/gi, "mistuh")
                .replace(/mister/gi, "mistuh")
                .replace(/[rw]/gi, "w");
        },
    },
    {
        id: "intruder",
        name: "an intruder",
    },
    {
        id: "lamioti",
        name: "mr lamioti",
    },
    {
        id: "shapiro",
        name: "Ben Shapiro #OwnTheLibs",
        quirk(x) {
            return x + ", libtard";
        },
    },
    {
        id: "based",
        name: "The Based Department",
    },
    {
        id: "scringo",
        name: "el scringo",
    },
    {
        id: "elves",
        name: "The Elves",
    },
    {
        id: "xi",
        name: "Xi Jinping - 习近平",
        quirk(x) {
            var chinese =
                "现在是你成为大人物的机会用你的灵魂我有我是新的你不是";
            var words = x.split(" ");
            var retval = words
                .map((word) => {
                    return (
                        word +
                        (Math.random() < 0.5
                            ? " " +
                              chinese.substring(
                                  Math.floor(Math.random() * chinese.length)
                              )
                            : "")
                    );
                })
                .join(" ");
            return retval;
        },
    },
    {
        id: "william",
        name: "william jenkins",
    },
    {
        id: "ena",
        name: "ENA",
    },
    {
        id: "4chanroulette",
        name: "4Chan Roulette",
    },
    {
        id: "bonus",
        name: "bonus nose jim",
    },
    {
        id: "anita",
        name: "Blonde Lady Anita (Anita Ire)",
    },
    {
        id: "zimbabwe",
        name: "CEO of Zimbabwe (Real)",
    },
    {
        id: "bruno",
        name: "BRUNO POWROZNIK",
        quirk(x) {
            var y = [".", ",", "!", "?"],
                z = false;
            y.forEach((p) => {
                if (x.endsWith(p)) {
                    z = true;
                }
            });
            return x.toUpperCase() + (z ? " FUCKING STRS" : ". FUCKING STRS");
        },
    },
    {
        id: "dentist",
        name: "gustavo fing",
        quirk(x) {
            return "**" + x + "**";
        },
    },
    {
        id: "firingsquad",
        name: "The Firing Squad",
    },
    {
        id: "salmon",
        name: "Salmon of Knowledge",
    },
    {
        id: "walter",
        name: "walt whit",
    },
    {
        id: "jesse",
        name: "jese pine",
    },
    {
        id: "scal",
        name: "el supremo del calamitas",
    },
    {
        id: "locke",
        name: "Locke (murkywanker insider)",
    },
    {
        id: "jamesphotoframe",
        name: "james the photo framer (now selling speech bubbles)",
    },
    {
        id: "rals",
        name: "Ralsei",
    },
    {
        id: "flapserrors",
        name: "Flaps Chelton® Error Handling™©",
    },
    {
        id: "owl",
        name: "owl",
        quirk() {
            return "<:owl:964880176355897374>";
        },
    },
    {
        id: "armstrong",
        name: "OMELETTE LOVER",
        quirk(x) {
            return x.toUpperCase();
        },
    },
    {
        id: "ffmpeg",
        name: "majik vido editor bot",
    },
    {
        id: "balkan",
        name: "hairy balkan man",
    },
    {
        id: "morbius",
        name: "msorbingus best movie",
    },
    {
        id: "cah",
        name: "cars against dragons",
    },
    {
        id: "restman",
        name: "adnvansed techmonamologise",
    },
    {
        id: "dallas",
        name: "dallas",
    },
    {
        id: "censor",
        name: "el censoro",
        quirk(x) {
            var y = `${x}`;
            (x.match(/[aeiou]/gi) ? x.match(/[aeiou]/gi) : []).forEach((z) => {
                if (Math.random() < 0.5) {
                    y = y.replace(z, "\\*");
                }
            });
            return y;
        },
    },
    {
        id: "mkswt",
        name: "my beloved",
    },
    {
        id: "fbi",
        name: "mr fbi man",
    },
    {
        id: "caption",
        name: "video/image captioneer",
    },
    {
        id: "runcling",
        name: "little runcling of the dark web",
    },
    {
        id: "reddit",
        name: "REDDIT NATIOn!!!!!!!",
    },
    {
        id: "weezer",
        name: "weezer",
    },
    {
        id: "giftest",
        name: "the hyperchad",
    },
    {
        id: "millerwife",
        name: "millers wife",
    },
    {
        id: "welldressed",
        name: "A Well Dressed Man.",
    },
    {
        id: "dalle",
        name: "Salvador Dall-E",
    },
    {
        id: "rps",
        name: "rock paper scissors 1",
    },
    {
        id: "smallcock",
        name: "small cock department",
    },
    {
        id: "ben",
        name: "Talking Ben",
    },
    {
        id: "southerner",
        name: "Poor Person Hater",
    },
    {
        id: "cockdep",
        name: "Cock Department",
        quirk(x) {
            return x.replace(/mr/gi, "mistuh").replace(/mister/gi, "mistuh");
        },
    },
    {
        id: "ghost",
        name: "Ghost (separate from machine)",
    },
    {
        id: "monsoon",
        name: "monsoo mgr",
    },
    {
        id: "haircut",
        name: "bad haircut bot",
    },
    {
        id: "raiden",
        name: "raiden mgr",
    },
    {
        id: "doktor",
        name: "dok tor",
    },
    {
        id: "wendys",
        name: "Wendy's",
    },
    {
        id: "sanfran",
        name: "SAFN FRANZISCO REDISENT",
        quirk(x) {
            return x
                .toLowerCase()
                .split("")
                .map(function (c) {
                    return (
                        (Math.random() < 0.5 ? c : c.toUpperCase()) +
                        (Math.random() < 0.5
                            ? ""
                            : Math.random() < 0.5
                            ? " HRNNRANGE "
                            : " hoohhgngngh ")
                    );
                })
                .join("");
        },
    },
    {
        id: "neco",
        name: "racist cat",
    },
    {
        id: "funo",
        name: "funo",
    },
    {
        id: "scott",
        name: "scott",
    },
    {
        id: "walmart",
        name: "walmart customer service",
    },
    {
        id: "homodog",
        name: "homophobic dog",
    },
    {
        id: "comedy",
        name: "the most comedic of all",
    },
    {
        id: "pigeon",
        name: "pigon",
    },
    {
        id: "frank",
        name: "FRANNKKKKKK JOOONESSSSS",
    },
    {
        id: "nursinghome",
        name: "the nursing home",
    },
    {
        id: "nursingresident",
        name: "nursing home resident",
    },
    {
        id: "microsoft",
        name: "FUCKING MICROSOFT",
    },
    {
        id: "finger",
        name: "kid named overused joke",
    },
    {
        id: "nft",
        name: "nft",
    },
    {
        id: "obama",
        name: "obamam",
    },
    {
        id: "obunga",
        name: "obungor",
    },
    {
        id: "ubisoft",
        name: "mr ubi soft",
    },
    {
        id: "redditor",
        name: "famed redditor",
    },
    {
        id: "saul",
        name: "saul",
    },
    {
        id: "goofygabe",
        name: "and why he goufy",
    },
    {
        id: "ballin",
        name: "BALLIN !?!?",
    },
    {
        id: "tressel",
        name: "jim tressel",
    },
    {
        id: "twink",
        name: "femboy twink",
    },
    {
        id: "gus",
        name: "gus frig",
    },
    {
        id: "hundred",
        name: "THE 100TH BOT 💯💯",
        quirk(x) {
            return "💯💯" + x.toUpperCase() + "💯💯";
        },
    },
    {
        id: "howard",
        name: "howar hamin",
    },
    {
        id: "weezer",
        name: "weezing time",
        quirk(x) {
            return x
                .split(" ")
                .map((y) => {
                    return "w" + y.substring(1);
                })
                .join(" ");
        },
    },
    {
        id: "politics",
        name: "politician",
    },
    {
        id: "nikku",
        name: "waow niku",
    },
    {
        id: "openai",
        name: '"open" ai',
    },
    {
        id: "snatcher",
        name: "snatcher the child predator",
    },
    {
        id: "spamtonneo",
        name: "[[SPAMTER NEO]]",
        quirk: spamtonify,
    },
    {
        id: "clueless",
        name: "<- clueless",
    },
    {
        id: "quizzical",
        name: "huh?",
    },
    {
        id: "wombo",
        name: "NEXT-GENERATION DIFFUSION AI-GENERATED IMAGES",
    },
    {
        id: "dalle2",
        name: "Dall-E 2's Diversity Filter",
        quirk(x) {
            var diversity = ["black", "asian", "indian", "ethnic"];
            return (
                x +
                (", " +
                    diversity[Math.floor(Math.random() * diversity.length)] +
                    " woman")
            );
        },
    },
    {
        id: "jonathan",
        name: "jonathan",
    },
    {
        id: "toshiro",
        name: "bigtime toshiro",
    },
    {
        id: "barry",
        name: "barry, 63",
    },
    {
        id: "neo",
        name: "1739",
    },
    {
        id: "youngthug",
        name: "young thug",
    },
    {
        id: "youngfish",
        name: "hello young thug",
    },
    {
        id: "butcher",
        name: "billy butcher the chad",
    },
    {
        id: "doctor",
        name: "medical professional",
    },
    {
        id: "stuff",
        name: "robert downey jr",
    },
    {
        id: "dalle2",
        name: "2aale daples slpres",
    },
    {
        id: "knook",
        name: "knook",
    },
    {
        id: "tictactoe",
        name: "tic tac toe bot",
    },
    {
        id: "nick",
        name: "nick from left for dead",
    },
    {
        id: "horsey",
        name: "food",
    },
    {
        id: "firearms",
        name: "warrior",
    },
    {
        id: "commando",
        name: "commadno",
    },
    {
        id: "dictionary",
        name: "My First Dictionary!",
    },
    {
        id: "ihatesuicide",
        name: "i HATE suicide! 💖",
    },
    {
        id: "sisyphus",
        name: "sisyphus #BoulderPushin",
    },
    {
        id: "adrian",
        name: "hecu adrian shepherd",
    },
    {
        id: "uzi",
        name: "oozi oozi",
    },
    {
        id: "n",
        name: "regular old wife thief",
    },
    {
        id: "v",
        name: "v",
    },
    {
        id: "j",
        name: "cereal destination j",
    },
    {
        id: "lemmy",
        name: "LEMMY LEMMTON THE LEMMCORD BOT",
    },
    {
        id: "bigboss",
        name: "big boss",
    },
    {
        id: "anton",
        name: "anton chigurh",
    },
    {
        id: "coach",
        name: "Coach.",
        quirk: (text) => {
            let cia = text
                .replace(/cia/gi, "CIA")
                .replace(/fbi/gi, "FBI")
                .replace(/nsa/gi, "NSA")
                .replace(/\?/g, "..?");
            let cap = cia.charAt(0).toUpperCase() + cia.substring(1);
            if (cap.endsWith(".") || cap.endsWith("?")) {
                return cap;
            } else {
                return cap + "...";
            }
        },
    },
    {
        id: "confucius",
        name: "Kong Fuzi",
    },
    {
        id: "jordan",
        name: "jordan peterson",
    },
    {
        id: "rogan",
        name: "joe rogan",
    },
    {
        id: "rebecca",
        name: "toothpaste girl",
    },
    {
        id: "lizzy",
        name: "banana split",
    },
    {
        id: "thad",
        name: "HEALTHPILLED BandageLord",
    },
    {
        id: "cyn",
        name: "The Flesh (currently demanding)",
    },
    {
        id: "doll",
        name: "doll being all alone",
    },
    {
        id: "pomni",
        name: "pomniacci the famous clown",
    },
    {
        id: "knight",
        name: "The Knight",
    },
    {
        id: "purevessel",
        name: "Pure Vessel",
    },
    {
        id: "grimm",
        name: "bat clown",
    },
    {
        id: "cordie",
        name: "66th spider brigade",
    },
    {
        id: "icon",
        name: "ic-0n the magical cube",
    },
    {
        id: "cornifer",
        name: "map guy",
    },
    {
        id: "reedus",
        name: "NORMAN REEDUS from HELLUVA DEAD",
    },
    {
        id: "investor",
        name: "billionaire investor",
    },
    {
        id: "gassy",
        name: "🦸🦸🦸 INCREDIBLE GASSY 💨💨💨",
        quirk: (content) => {
            let farts = [
                "BRAAAP",
                "PBBBT",
                "PRRRRRPT",
                "FRRRRRP",
                "BRAAAAAAAP",
            ];
            let words = content.split(" ");
            for (let i = 0; i < words.length / 5; i++) {
                words.splice(
                    (words.length + 1) * Math.random() || 0,
                    0,
                    `(${sample(farts)})`
                );
            }
            let out = words.join(" ");
            return out;
        },
    },
    {
        id: "tessa",
        name: "tassy",
    },
    {
        id: "vodka",
        name: "bottle of vodka",
    },
    {
        id: "alice",
        name: "insane southerner",
    },
    {
        id: "chrome",
        name: "marketshare dominator",
    },
    {
        id: "octavia",
        name: "Octavia",
    },
    {
        id: "lute",
        name: "lute <3",
    },
    {
        id: "kate",
        name: "kate the chaser",
    },
    {
        id: "slenderman",
        name: "the slenderman",
    },
    {
        id: "sketchbook",
        name: "sketchbook dhmis",
    },
    {
        id: "yellowguy",
        name: "yellow guy",
    },
    {
        id: "redguy",
        name: "red guy",
    },
    {
        id: "duckguy",
        name: "duck guy",
    },
    {
        id: "tony",
        name: "tony the 'talking' clock",
    },
    {
        id: "shrignold",
        name: "Shrignold (Little Baby Pigeon)",
    },
    {
        id: "colin",
        name: "colin the computery guy",
    },
    {
        id: "steakguy",
        name: "somewhat humanoid steak",
    },
    {
        id: "lamp",
        name: "the legful lamp",
    },
    {
        id: "roy",
        name: "roy gribbleston",
    },
    {
        id: "briefcase",
        name: "the briefcase",
    },
    {
        id: "coffin",
        name: "floorboard person",
    },
    {
        id: "warren",
        name: "AN EAGLE (NOT A WORM)",
    },
    {
        id: "lily",
        name: "Lily",
    },
    {
        id: "todney",
        name: "Todney",
    },
    {
        id: "choochoo",
        name: "Choo Choo",
    },
    {
        id: "electracey",
        name: "elecwifey",
    },
    {
        id: "peridot",
        name: "peridot",
    },
    {
        id: "kalahari",
        name: "Kalahari",
    },
    {
        id: "blitzo",
        name: "Blitzø",
    },
    {
        id: "fizz",
        name: "Fizzarolli",
    },
    {
        id: "loona",
        name: "Loona",
    },
    {
        id: "millie",
        name: "Millie",
    },
    {
        id: "moxxie",
        name: "Moxxie",
    },
    {
        id: "ozzie",
        name: "Asmodeus",
    },
    {
        id: "stolas",
        name: "Stolas",
    },
    {
        id: "goodra",
        name: "Goodra!",
        /* quirk: (text) => {
            return text
                .split(" ")
                .map((w) => {
                    return "goodra";
                })
                .join(" ");
        }, */
    },
    {
        id: "greninja",
        name: "Greninja",
    },
    {
        id: "wartortle",
        name: "Wartortle",
    },
    {
        id: "fonthillhorse",
        name: "the fonthill horse",
    },
    {
        id: "magic8ball",
        name: "magic ⑨ ball",
    },
    {
        id: "gangle",
        name: "gangle",
    },
];

function spamtonify(text: string): string {
    var swears = ["fuck", "shit", "dick", "cock"];
    var a = false;
    return (
        text
            .toLowerCase()
            .split(" ")
            .map((w) => {
                let retval = "";
                if (Math.random() <= (a ? 0.5 : 0.2)) {
                    a ? (w = w + "]]") : (w = "[[" + w);
                    a = !a;
                }
                if (!a && !w.endsWith("]]")) {
                    retval = w.toUpperCase();
                } else {
                    retval =
                        (w.startsWith("[[") ? "[[" : "") +
                        w.charAt(w.startsWith("[[") ? 2 : 0).toUpperCase() +
                        w.slice(w.startsWith("[[") ? 3 : 1);
                }
                swears.forEach((swear) => {
                    if (retval.toLowerCase().includes(swear.toLowerCase())) {
                        retval = retval
                            .toLowerCase()
                            .replace(swear, "[$!?!]")
                            .toUpperCase();
                    }
                });
                return retval;
            })
            .join(" ") + (a ? "]]" : "")
    );
}
