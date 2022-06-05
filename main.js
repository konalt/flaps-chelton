//#region Require shit
const Discord = require('discord.js');
const fs = require('fs');
const fetch = require('node-fetch');
const canvas = require("canvas");
const client = new Discord.Client({
    partials: ['MESSAGE', 'CHANNEL', 'REACTION', 'GUILD_MEMBER', 'USER'],
    intents: ["GUILDS", "GUILD_MESSAGES", "GUILD_VOICE_STATES"]
});
const flapslib = require("./flapslib/index");
//const WomboDreamApi = require("wombo-dream");
//! FIX THIS!!!!!!
const { getVideoDurationInSeconds } = require('get-video-duration')
const prism = require('prism-media');
const {
    NoSubscriberBehavior,
    StreamType,
    createAudioPlayer,
    createAudioResource,
    entersState,
    VoiceConnectionStatus,
    joinVoiceChannel,
    generateDependencyReport,
} = require('@discordjs/voice');
const download = require('./flapslib/download');
const { uuidv4 } = require('./flapslib/ai');
const { sendWebhook, editWebhookMsg } = require('./flapslib/webhooks');
const { cahWhiteCard } = require('./flapslib/cardsagainsthumanity');
//var dream = WomboDreamApi.buildDefaultInstance();
//TODO look at line 12

var memeMaking = {
    getImageData: async function(n) {
        if (!this.imageExists(n)) {
            n = "farquaad";
        }
        return fs.readFileSync("./images/sizes.txt").toString().split("\r\n").filter((l) => { return l.split(" ")[0] == n; })[0].split(" ");
    },
    imageExists: function(n) {
        return !!fs.readFileSync("./images/sizes.txt").toString().split("\r\n").find((l) => { return l.split(" ")[0] == n; });
    }
};

flapslib.webhooks.setClient(client);

var players = [
    createAudioPlayer({
        behaviors: {
            noSubscriber: NoSubscriberBehavior.Play,
            maxMissedFrames: Math.round(5000 / 20),
        },
    }),
    createAudioPlayer({
        behaviors: {
            noSubscriber: NoSubscriberBehavior.Play,
            maxMissedFrames: Math.round(5000 / 20),
        },
    }),
    createAudioPlayer({
        behaviors: {
            noSubscriber: NoSubscriberBehavior.Play,
            maxMissedFrames: Math.round(5000 / 20),
        },
    }),
    createAudioPlayer({
        behaviors: {
            noSubscriber: NoSubscriberBehavior.Play,
            maxMissedFrames: Math.round(5000 / 20),
        },
    }),
];

function attachRecorder(player, file, loop = false) {
    if (!file) return;
    players[player].play(
        createAudioResource(
            new prism.FFmpeg({
                args: [
                    '-analyzeduration',
                    '0',
                    '-loglevel',
                    '0',
                    '-i',
                    "./audio/" + file + (file.endsWith(".mp4") ? ".mp4" : ".mp3"),
                    '-acodec',
                    'libopus',
                    '-f',
                    'opus',
                    '-ar',
                    '48000',
                    '-ac',
                    '2',
                ],
            }), {
                inputType: StreamType.OggOpus,
            },
        ),
    );
}

async function connectToChannel(channels) {
    var connections = [];
    var ret = [];
    channels.forEach(c => {
        connections.push(joinVoiceChannel({
            channelId: c.id,
            guildId: c.guild.id,
            adapterCreator: c.guild.voiceAdapterCreator,
        }));
    });
    connections.forEach(c => {
        try {
            entersState(c, VoiceConnectionStatus.Ready, 30000);
            ret.push(c);
        } catch (error) {
            c.destroy();
            throw error;
        }
    });
    return ret;
}
var words = [
    ["political", "politic"],
    ["political", "trump"],
    ["political", "libtard"],
    ["political", "blue"],
    ["political", "biden"],
    ["political", "libby"],
    ["political", "texas"],
    ["political", "vote"],
    ["political", "elect"],
    ["political", "president"],
    ["political", "1947"],
    ["political", "1989"],
    ["political", "cold war"],
    ["political", "wake up"],
    ["political", "nine eleven"],
    ["political", "9/11"],
    ["forgor", "forgot"],
    ["forgor", "forgor"],
    ["forgor", "forget"],
    ["rember", "rember"],
    ["rember", "remebeer"],
    ["literally", "you cannot"]
];

function randomFromArray(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}
var swears = [
    "fucking",
    "shit",
    "motherfucking",
    "shitty",
    "fuck"
];

var lastRequests = {};
//#endregion
var serverVCs = {
    "924715479988330556": "930554613415956530",
    "910525327585992734": "910525328055762994",
    "760524739239477340": "874341836796362752"
};

canvas.registerFont('homodog.otf', { family: 'Homodog' });
canvas.registerFont('weezer.otf', { family: 'Weezer' });

client.on('ready', async() => {
    console.log(`Logged in as ${client.user.tag}`);

    const connections = await connectToChannel(Object.values(serverVCs).map((x) => { return client.channels.cache.get(x) }));
    connections[0].subscribe(players[0]);
    connections[1].subscribe(players[1]);
    connections[2].subscribe(players[2]);

    fs.readFile("./saved_status.txt", (_err, data) => {
        data = data.toString();
        console.log(data);
        client.user.setPresence({
            activities: [{
                name: data.split(" ").slice(1).join(" "),
                type: data.split(" ")[1].toUpperCase(),
                url: 'https://konalt.us.to',
                timestamps: {
                    start: Date.now()
                },
            }],
            afk: false,
            status: 'online',
        });
    });
});

Error.stackTraceLimit = 50;

var commands = {
    "<": "Sends a message as a webhook user. Get a list with !userlist",
    "!restart": "shoots flaps in the back of the head",
    "!eval": "runs javascripe",
    "!audio": "plays audio in your server vc",
    "!watchparty": "starts a watch party so you can watch youtube with frends!!!1",
    "!wpadd": "adds a video to the watch party queue",
    "!status": "changes flap statussy",
    "!yturl": "plays youtube video in voice chat",
    "!ytsearch": "searches then plays video in voice chat",
    "!markov": "use a markov chain text generator. produces silly results.",
    "!armstrong": "CALL AN AMBULANCE JACK, I'M HAVING AN ARMSTROKE",
    "!ytmp3": "downloads youtube video to mp3",
    "!gif": "creates a raiden punching armstrong gif",
    "!imageaudio": "turns an image into a video with audio",
    "!geq": "runs a geq on each pixel of a video. [info here](https://ffmpeg.org/ffmpeg-filters.html#geq)",
    "!caption": "captions a video.",
    "!aigen": "uses an ai to generate an image.",
    "!<:owl:964880176355897374>": "<:owl:964880176355897374>",
    "!3dtext": "generates some 3d text. you can add an image.",
    "!framephoto": "frames a photo.",
    "!speechbubble": "adds a speech bubble to an image. do !speechbubbleflip to flip it.",
    "!flip": "flips ~~chilton~~ an image horizontally",
    "!laugh": "captions an image. do !laugh attachment for an attachment. a list is in flaps/images/sizes.txt",
    "!person": "uses world class techmonoligies to generate a face.",
    "!complete": "uses world class techmonamologies to autocomplete some text.",
    "!retry": "uses world class techsmonlogoies to retry your !complete request.",
    "!basedmeter": "based meter",
    "!degeneracy": "gets a random post from either /b/, /r9k/, /s4s/ or /vip/. nsfw very possible.",
    "!flapslength": "size matters",
    "!petit": "gets a random youtube video with no views from petittube.com. its not a porn site, jack.",
    "!<:armstrong:962346935795208217>": "does nothing",
    "!help": "shows this",
    "!balkancuisine": "sends an image of balkan cuisine",
    "!morbius": "morbius review from metacritic"
};

var descriptions = {
    "489894082500493349": "a cold blooded killer, ready to strike whenever newports are on the line\nhttps://media.discordapp.net/attachments/910525327585992737/980522490856095825/4.PNG",
    "445968175381610496": "the creator of \"Flaps Chelton\", which is a discord bot designed to facilitate illegal activity.\nhttps://media.discordapp.net/attachments/910525327585992737/980524110952157254/unknown.png",
    "794301103721414676": "SCP-1222 - Description: horny little runcling. really loves <:nice:980058300240515124>\nhttps://media.discordapp.net/attachments/910525327585992737/980522446572650617/unknown.png",
    "976471678429311086": "'yeah i still would tho' 'agreed'\nhttps://media.discordapp.net/attachments/910525327585992737/980522944201629736/unknown.png",
    "775778497707769927": "el polozhenie\nhttps://media.discordapp.net/attachments/910525327585992737/980523248120889344/unknown.png",
    "741701565907206267": "Loves to make [[DEALS]]\nhttps://media.discordapp.net/attachments/910525327585992737/980524568416493668/unknown.png",
    "547476998071517195": "we couldnt find a photo for this guy. we went to mcdonalds instead\nhttps://media.discordapp.net/attachments/910525327585992737/980523453042028574/mcdondil.PNG"
};

var deathCauses = [
    "so sad, dying of suicide. two shots to bak of hed",
    "they will slipp in the shower while masturbating",
    "they will slipp in the shower",
    "hanging themselves",
    "electrocution!!",
    "those RUSSIANs will get him!!!",
    "death by carrier pigeon"
];

client.on('messageCreate', async(msg) => {
    try {
        console.log(`${msg.author.username}#${msg.author.discriminator}: ${msg.content}`);
        if (msg.content.includes('copper') && !msg.author.bot) {
            msg.channel.send("copper you say?");
        }
        var messageFlags = [];
        words.forEach(word => {
            if (msg.content.toLowerCase().includes(word[1]) && !messageFlags.includes(word[0])) {
                messageFlags.push(word[0]);
            }
        });
        if (messageFlags.includes("political")) msg.react(client.emojis.cache.find(emoji => emoji.name === 'political'));
        if (messageFlags.includes("forgor")) msg.react("💀");
        if (messageFlags.includes("rember")) msg.react("😁");
        if (messageFlags.includes("literally")) msg.react(client.emojis.cache.find(emoji => emoji.name === "literally1984"));
        var commandArgs = msg.content.split(" ");
        var commandArgString = commandArgs.slice(1).join(" ");
        var command = commandArgs[0];
        if (msg.content.startsWith(">")) {
            var content = `${msg.content}`;
            if (!msg.reference) {
                sendWebhook("flaps", `buddy, ya gotta reply to a message if you wanna edit it!!!! also, this only works with <[name] messages.`, false, msg.channel);
            } else {
                editWebhookMsg(msg.reference.messageId, msg.channel, content.substring(1));
                msg.delete();
            }
        } else if (msg.content.startsWith("<")) {
            var content = `${msg.content}`;
            flapslib.webhooks.updateUsers();
            if (commandArgs[0].substring(1) == "all") {
                Object.keys(flapslib.webhooks.users).forEach((user, index) => {
                    setTimeout(() => {
                        try {
                            flapslib.webhooks.sendWebhook(user, content.substring(content.split(" ")[0].length + 1), false, msg.channel).then();
                        } catch (e) {
                            console.log("Error 2: Rate-limit. Trying again in 1000 ms");
                            setTimeout(() => {
                                flapslib.webhooks.sendWebhook(user, content.substring(content.split(" ")[0].length + 1), false, msg.channel).then();
                            }, 1000);
                        }
                    }, index * 800);
                });
                msg.delete();
                return;
            } else if (commandArgs[0].substring(1) == "custom") {
                console.log(msg.content.includes("--u") && msg.content.includes("--c") && msg.content.includes("--a"));
                if (!(msg.content.includes("--u") && msg.content.includes("--c") && msg.content.includes("--a"))) {
                    flapslib.webhooks.sendWebhook("flaps", "custom must have --u, --c and --a", false, msg.channel);
                    return;
                }
                flapslib.webhooks.sendWebhook("custom", content.substring(content.split(" ")[0].length + 1), false, msg.channel, {
                    content: content.split(" ").slice(content.split(" ").indexOf("--c") + 1, (function() {
                        var r = 0;
                        content.split(" ").forEach((el, index) => {
                            if (index > content.split(" ").indexOf("--c") && el.startsWith("--")) {
                                r = index - 2;
                            }
                        });
                        if (r == 0) {
                            r = content.split(" ").length;
                        }
                        return r;
                    })()).join(" "),
                    avatar: content.split(" ").slice(content.split(" ").indexOf("--a") + 1, (function() {
                        var r = 0;
                        content.split(" ").forEach((el, index) => {
                            if (index > content.split(" ").indexOf("--a") && el.startsWith("--")) {
                                r = index;
                            }
                        });
                        if (r == 0) {
                            r = content.split(" ").length;
                        }
                        return r;
                    })()).join(" "),
                    username: content.split(" ").slice(content.split(" ").indexOf("--u") + 1, (function() {
                        var r = 0;
                        content.split(" ").forEach((el, index) => {
                            if (index > content.split(" ").indexOf("--u") && el.startsWith("--")) {
                                r = index;
                            }
                        });
                        if (r == 0) {
                            r = content.split(" ").length;
                        }
                        return r;
                    })()).join(" ")
                }, msg).then();
                msg.delete();
                return;
            }
            if (!Object.keys(flapslib.webhooks.users).includes(commandArgs[0].substring(1))) return;
            flapslib.webhooks.sendWebhook(commandArgs[0].substring(1), msg.content.substring(commandArgs[0].length + 1), false, msg.channel).then(() => {
                msg.delete();
            });
        } else {
            switch (command) {
                case "!restart":
                    {
                        flapslib.webhooks.sendWebhook("flaps", "goodbye cruel world <a:woeisgone:797896105488678922>", true, msg.channel).then(() => {
                            process.exit(0);
                        });
                    }
                    break;
                case "!eval":
                    {
                        if (msg.author.id != "445968175381610496") {
                            flapslib.webhooks.sendWebhook("flaps", "no.", true, msg.channel);
                        } else {
                            try {
                                eval(commandArgString);
                            } catch (e) {
                                flapslib.webhooks.sendWebhook("flapserrors", "fuck you. eval didnt work.\n" + e.toString(), true, msg.channel);
                            }
                        }
                    }
                    break;
                case "!audio":
                    {
                        var validAudio = fs.readFileSync("./audio/audiocommand.txt").toString().split("\r\n");
                        if (validAudio.includes(commandArgs[1].toLowerCase())) {
                            attachRecorder(Object.keys(serverVCs).indexOf(msg.guild.id), commandArgs[1].toLowerCase(), msg.guild.id);
                        } else {
                            flapslib.webhooks.sendWebhook("flaps", "that audio not real <a:woeisgone:959946980954636399>\naudios are:\n```ansi\n" + validAudio.map(a => { return a.split("").map(b => { return "\x1b[" + Math.floor((Math.random() * 5) + 91).toString() + "m" + b; }).join(""); }).join("\n") + "```", true, msg.channel);
                        }
                    }
                    break;
                case "!yturl":
                    {
                        flapslib.yt.downloadYoutube(Object.keys(serverVCs).indexOf(msg.guild.id), commandArgs[1], msg.channel, (commandArgs[2] == "-v"), attachRecorder);
                    }
                    break;
                case "!watchparty":
                    {
                        flapslib.yt.startWatchParty(commandArgs[1], msg.channel);
                    }
                    break;
                case "!wpadd":
                    {
                        flapslib.yt.wpAddToQueue(commandArgs[2], commandArgs[1], msg.channel);
                    }
                    break;
                case "!status":
                    {
                        var types = ["PLAYING", "STREAMING", "COMPETING", "LISTENING", "WATCHING"];
                        if (types.includes(commandArgs[1].toUpperCase())) {
                            client.user.setPresence({
                                activities: [{
                                    name: msg.content.split(" ").map((v, i) => { return ((i == 0 || i == 1) ? "" : v) }).join(" "),
                                    type: commandArgs[1].toUpperCase(),
                                    url: 'https://konalt.us.to',
                                    timestamps: {
                                        start: Date.now()
                                    },
                                }],
                                afk: false,
                                status: 'online',
                            });
                            fs.writeFileSync("./saved_status.txt", commandArgs[1].toUpperCase() + " " + msg.content.split(" ").slice(2).join(" "));
                            flapslib.webhooks.sendWebhook("flaps", "done", false, msg.channel);
                        } else {
                            flapslib.webhooks.sendWebhook("flaps", "first argument must be one of these:\n```\n" + types.join("\n") + "\n```", false, msg.channel);
                        }
                    }
                    break;
                case "!ytsearch":
                    {
                        flapslib.yt.downloadYoutube(Object.keys(serverVCs).indexOf(msg.guild.id), commandArgString, msg.channel, false, attachRecorder);
                    }
                    break;
                case "!markov":
                    {
                        flapslib.ai.markov2(commandArgString, 1, msg.channel);
                    }
                    break;
                case "!fornitesex":
                    {
                        fetch("https://www.reddit.com/r/fornitesex/about.json").then(r => { return r.json() }).then(r => {
                            sendWebhook("flaps", `r/fornitesex has ${r.data.subscribers} members! wowie!!`, false, msg.channel);
                        });
                    }
                    break;
                case "!randompost":
                    {
                        fetch("https://www.reddit.com/" + commandArgs[1] + "/.json").then(r => { return r.json() }).then(r => {
                            var child = r.data.children[Math.floor(Math.random() * r.data.children.length)]
                            sendWebhook("flaps", `https://www.reddit.com` + child.data.permalink, false, msg.channel);
                        });
                    }
                    break;
                case "!armstrong":
                    {
                        flapslib.ai.armstrong(commandArgs[1] ? commandArgs[1] : 4, msg.channel);
                    }
                    break;
                case "!funnynumber":
                    {
                        var x = "";
                        if (commandArgs[1]) {
                            x = msg.content.split(" ").slice(1).join("_");
                        } else {
                            x = "hornet (hollow knight)".split(" ").join("_");
                        }
                        if (x.includes("child")) {
                            return sendWebhook("runcling", "🚔🚔🚔🚔🚨🚨🚨🚨🚨🚓🚓🚓🚓👮‍♀️👮‍♂️👮‍♂️👮‍♂️👮‍♂️👮👮‍♂️👮‍♂️🚓🚨👮‍♀️👮‍♂️👮‍♀️🚓🚔🚨", false, msg.channel);
                        }
                        x = x.replace("_--showname", "");
                        fetch("https://rule34.xxx/public/autocomplete.php?q=" + x, {
                            "credentials": "omit",
                            "headers": {
                                "User-Agent": "FlapsChelton",
                                "Accept": "*/*",
                                "Accept-Language": "en-US,en;q=0.5",
                                "Sec-Fetch-Dest": "empty",
                                "Sec-Fetch-Mode": "cors",
                                "Sec-Fetch-Site": "same-origin"
                            },
                            "referrer": "https://rule34.xxx/",
                            "method": "GET",
                            "mode": "cors"
                        }).then(r => { return r.json() }).then(r => {
                            var y = "";
                            if (!r[0]) {
                                sendWebhook("runcling", "holy fuck. you searched for something that even the horniest corner of the internet could not draw. good job dude.", false, msg.channel);
                            } else {
                                if (x != "hornet_(hollow_knight)") {
                                    y = r[0].label;
                                } else {
                                    y = r[0].label.substring(r[0].value.length + 2, r[0].label.length - 1).replace(/_/g, "\\_")
                                }
                            }
                            sendWebhook("runcling", y, false, msg.channel);
                        });
                    }
                    break;
                case "!countdown":
                    {
                        var endTime = new Date("2022-06-03T10:30:00Z");
                        endTime.setHours(endTime.getHours() - 1);
                        endTime = endTime.getTime();
                        var newTime = (endTime - Date.now());
                        if (commandArgs[1] == "hour") {
                            return sendWebhook("flaps", Math.floor(newTime / 1000 / 60 / 60) + " hours left.", false, msg.channel);
                        }

                        var delta = newTime / 1000;

                        var days = Math.floor(delta / 86400);
                        delta -= days * 86400;

                        var hours = Math.floor(delta / 3600) % 24;
                        delta -= hours * 3600;

                        var minutes = Math.floor(delta / 60) % 60;
                        delta -= minutes * 60;

                        var seconds = Math.round(delta % 60);

                        var str = `${days}d ${hours}h ${minutes}m ${seconds}s`
                        sendWebhook("flaps", str, false, msg.channel);
                    }
                    break;
                case "!coinflip":
                    sendWebhook("flaps", (Math.random() < 0.5 ? "heads" : "tails"), false, msg.channel);
                    break;
                case "!armstrong2":
                    {
                        flapslib.ai.armstrong2(msg.channel);
                    }
                    break;
                case "!oldmarkov":
                    {
                        flapslib.ai.markov(commandArgString, msg.channel);
                    }
                    break;
                case "!ytmp3":
                    {
                        flapslib.yt.downloadYoutubeToMP3(commandArgString, msg.channel, (commandArgs[2] == "-v"), client);
                    }
                    break;
                case "!gif":
                    {
                        flapslib.videowrapper.addText("raiden", commandArgString, msg, client);
                    }
                    break;
                case "!imageaudio":
                    {
                        if (msg.attachments.first(2)[1]) {
                            var id = uuidv4().replace(/-/g, "");
                            download(msg.attachments.first().url, "./images/cache/" + id + ".png", () => {
                                download(msg.attachments.first(2)[1].url, "./images/cache/" + id + ".mp3", () => {
                                    flapslib.videowrapper.imageAudio(id, msg, client);
                                });
                            });
                        }
                    }
                    break;
                case "!baitswitch":
                    {
                        if (msg.attachments.first(2)[1]) {
                            var id = uuidv4().replace(/-/g, "");
                            var a = msg.attachments.first(2)[1];
                            var b = msg.attachments.first();
                            //var largerW = (a.width > b.width) ? a.width : b.width;
                            //var largerH = (a.height > b.height) ? a.height : b.height
                            download(b.url, "./images/cache/" + id + ".png", () => {
                                download(a.url, "./images/cache/" + id + ".mp4", () => {
                                    flapslib.videowrapper.baitSwitch(id, msg, client, {
                                        w: b.width,
                                        h: b.height
                                    });
                                });
                            });
                        }
                    }
                    break;
                case "!videoaudio":
                    {
                        if (msg.attachments.first(2)[1]) {
                            var id = uuidv4().replace(/-/g, "");
                            download(msg.attachments.first().url, "./images/cache/" + id + ".mp4", () => {
                                download(msg.attachments.first(2)[1].url, "./images/cache/" + id + ".mp3", () => {
                                    flapslib.videowrapper.videoAudio(id, msg, client);
                                });
                            });
                        }
                    }
                    break;
                case "!stitch":
                    {
                        if (msg.attachments.first(2)[1]) {
                            var id = uuidv4().replace(/-/g, "");
                            var ext = "." + msg.attachments.first().url.split(".").pop();
                            download(msg.attachments.first().url, "./images/cache/" + id + ext, () => {
                                var id1 = uuidv4().replace(/-/g, "");
                                var ext1 = "." + msg.attachments.first().url.split(".").pop();
                                download(msg.attachments.first(2)[1].url, "./images/cache/" + id1 + ext1, () => {
                                    flapslib.videowrapper.stitch([id + ext, id1 + ext1], msg, client);
                                });
                            });
                        }
                    }
                    break;
                case "!geq":
                    {
                        if (msg.attachments.first()) {
                            var id = uuidv4().replace(/-/g, "");
                            var ext = "." + msg.attachments.first().url.split(".").pop()
                            download(msg.attachments.first().url, "./images/cache/" + id + ext, () => {
                                flapslib.videowrapper.geq(id, msg, client);
                            });
                        } else {
                            flapslib.videowrapper.geq("nullsrc", msg, client);
                        }
                    }
                    break;
                case "!ffmpeg":
                    {
                        if (msg.attachments.first()) {
                            var id = uuidv4().replace(/-/g, "");
                            var ext = "." + msg.attachments.first().url.split(".").pop()
                            download(msg.attachments.first().url, "./images/cache/" + id + ext, () => {
                                flapslib.videowrapper.complexFFmpeg(id, msg, client);
                            });
                        } else {
                            flapslib.videowrapper.complexFFmpeg("nullsrc", msg, client);
                        }
                    }
                    break;
                case "!caption":
                    {
                        if (!msg.attachments.first()) {
                            flapslib.webhooks.sendWebhook("ffmpeg", "i cant caption nothing you dummy", false, msg.channel, {}, msg);
                        } else {
                            var ext = "." + msg.attachments.first().url.split(".").pop()
                            if (ext != ".png" && ext != ".jpg") flapslib.webhooks.sendWebhook("ffmpeg", "got it bro. this might take a while tho", false, msg.channel, {}, msg);
                            var id = flapslib.ai.uuidv4().replace(/-/gi, "");
                            flapslib.download(msg.attachments.first().url, "images/cache/" + id + ext, () => {
                                console.log(id + ext);
                                flapslib.videowrapper.simpleMemeCaption(id, commandArgString, msg, client);
                            });
                        }
                    }
                    break;
                case "!squash":
                    {
                        if (!msg.attachments.first()) {
                            flapslib.webhooks.sendWebhook("ffmpeg", "(die)[https://konalt.us.to/files/videos/memes/dep.mp4]", false, msg.channel, {}, msg);
                        } else {
                            flapslib.webhooks.sendWebhook("ffmpeg", "got it bro. this might take a while tho", false, msg.channel, {}, msg);
                            var id = flapslib.ai.uuidv4().replace(/-/gi, "");
                            var ext = "." + msg.attachments.first().url.split(".").pop()
                            flapslib.download(msg.attachments.first().url, "images/cache/" + id + ext, () => {
                                flapslib.videowrapper.squash(id, msg, client);
                            });
                        }
                    }
                    break;
                case "!trim":
                    {
                        if (!msg.attachments.first()) {
                            flapslib.webhooks.sendWebhook("ffmpeg", "(die)[https://konalt.us.to/files/videos/memes/dep.mp4]", false, msg.channel, {}, msg);
                        } else {
                            flapslib.webhooks.sendWebhook("ffmpeg", "got it bro. this might take a while tho", false, msg.channel, {}, msg);
                            var id = flapslib.ai.uuidv4().replace(/-/gi, "");
                            var ext = "." + msg.attachments.first().url.split(".").pop()
                            flapslib.download(msg.attachments.first().url, "images/cache/" + id + ext, () => {
                                flapslib.videowrapper.trim(id, [commandArgs[1], commandArgs[2]], msg, client);
                            });
                        }
                    }
                    break;
                case "!videogif":
                    {
                        if (!msg.attachments.first()) {
                            flapslib.webhooks.sendWebhook("ffmpeg", "(die)[https://konalt.us.to/files/videos/memes/dep.mp4]", false, msg.channel, {}, msg);
                        } else {
                            flapslib.webhooks.sendWebhook("ffmpeg", "got it bro. this might take a while tho", false, msg.channel, {}, msg);
                            var id = flapslib.ai.uuidv4().replace(/-/gi, "");
                            var ext = "." + msg.attachments.first().url.split(".").pop()
                            flapslib.download(msg.attachments.first().url, "images/cache/" + id + ext, () => {
                                flapslib.videowrapper.videoGif(id, msg, client);
                            });
                        }
                    }
                    break;
                case "!stretch":
                    {
                        if (!msg.attachments.first()) {
                            flapslib.webhooks.sendWebhook("ffmpeg", "[<@489894082500493349>](https://konalt.us.to/files/videos/memes/findel.mp4)", false, msg.channel, {}, msg);
                        } else {
                            flapslib.webhooks.sendWebhook("ffmpeg", "got it bro. this might take a while tho", false, msg.channel, {}, msg);
                            var id = flapslib.ai.uuidv4().replace(/-/gi, "");
                            var ext = "." + msg.attachments.first().url.split(".").pop();
                            flapslib.download(msg.attachments.first().url, "images/cache/" + id + ext, () => {
                                flapslib.videowrapper.stretch(id, msg, client);
                            });
                        }
                    }
                    break;
                case "!aigen":
                    {
                        //startGenerating(commandArgString, 3);
                        flapslib.ai.generateImage(commandArgString, msg.channel, client);
                    }
                    break;
                case "!dream":
                    {
                        var lastState = "";
                        dream.generatePicture(commandArgs[1], 3, (task) => {
                            console.log(task.state, 'stage', task.photo_url_list.length);
                            if (lastState != task.state + " " + task.photo_url_list.length) {
                                lastState = task.state + " " + task.photo_url_list.length;
                                flapslib.webhooks.sendWebhook("deepai", lastState + "/21", false, msg.channel, {}, msg);
                            }
                        })
                        .then((task) => msg.channel.send(task.result.final))
                        .catch(console.error);
                    }
                    break;
                case "!txtgen":
                    {
                        flapslib.ai.txtgen(msg.channel);
                    }
                    break;
                case "!cah":
                    {
                        flapslib.cah(msg.channel);
                    }
                    break;
                case "!carbs":
                    {
                        console.log(msg.attachments.first());
                        var imgID2 = uuidv4().replace(/-/g, "_") + ".png";
                        var c = canvas.createCanvas(1280, 720);
                        var ctx = c.getContext('2d');
                        var images = ["yooo", "waow"];
                        canvas.loadImage(__dirname + "\\images\\" + images[Math.floor(Math.random() * images.length)] + ".png").then(async(frame) => {
                            ctx.drawImage(frame, 0, 0, 1280, 720);
                            var card = flapslib.cahWhiteCard().replace(/__/g, "");
                            ctx.fillStyle = "white";
                            ctx.lineWidth = 56 / 25;
                            ctx.strokeStyle = "black";
                            ctx.textAlign = "center";
                            ctx.font = 'normal normal bolder' + 56 + 'px Impact';
                            ctx.fillText(card, 1280 / 2, 66);
                            ctx.strokeText(card, 1280 / 2, 66);
                            var imageStream2 = Buffer.from(c.toDataURL("image/png").split(",")[1], "base64");
                            fs.writeFileSync("./images/cache/" + imgID2, imageStream2);

                            /**
                             * @type {Discord.Message}
                             */
                            var message = await client.channels.cache.get("956316856422137856").send({
                                files: [{
                                    attachment: __dirname + "\\images\\cache\\" + imgID2
                                }]
                            });

                            setTimeout(() => {
                                fs.unlinkSync("./images/cache/" + imgID2);
                            }, 10000);

                            flapslib.webhooks.sendWebhook("jamesphotoframe", message.attachments.first().url, false, msg.channel);
                        });
                    }
                    break;
                case "!<:owl:964880176355897374>":
                    {
                        flapslib.webhooks.sendWebhook("<:owl:964880176355897374>", "<:owl:964880176355897374>", true, msg.channel);
                    }
                    break;
                case "!3dtext":
                    {
                        flapslib.ai.threeDimensionalText(commandArgString, msg.channel, msg, client);
                    }
                    break;
                case "!funnyvideo":
                    {
                        var files = fs.readdirSync('E:/MBG/the Videos/');
                        var chosenFile = files[Math.floor(Math.random() * files.length)];
                        var filesize = fs.statSync("E:/MBG/the Videos/" + chosenFile).size / (1024 * 1024);
                        if (filesize > 8) {
                            sendWebhook("scal", "mm.. too big. its " + Math.round(filesize) + " inche-- i mean megabytes. megabytes.", false, msg.channel);
                        } else {
                            var message = await client.channels.cache.get("956316856422137856").send({
                                files: [{
                                    attachment: "E:/MBG/the Videos/" + chosenFile
                                }]
                            });

                            sendWebhook("scal", message.attachments.first().url, false, msg.channel);
                        }
                    }
                    break;
                case "!weezer":
                    {
                        var w = 552;
                        var h = w;
                        var c = canvas.createCanvas(w, h);
                        var ctx = c.getContext('2d');
                        var imgID2 = uuidv4() + ".png";
                        canvas.loadImage(__dirname + "\\images\\weezer1.png").then(async(weez1) => {
                            canvas.loadImage(__dirname + "\\images\\weezer2.png").then(async(weez2) => {
                                canvas.loadImage(__dirname + "\\images\\weezer3.png").then(async(weez3) => {
                                    canvas.loadImage(__dirname + "\\images\\weezer4.png").then(async(weez4) => {
                                        canvas.loadImage(__dirname + "\\images\\weezer5.png").then(async(weez5) => {
                                            canvas.loadImage(__dirname + "\\images\\weezer6.png").then(async(weez6) => {
                                                canvas.loadImage(__dirname + "\\images\\weezer7.png").then(async(weez7) => {
                                                    canvas.loadImage(__dirname + "\\images\\weezer8.png").then(async(weez8) => {
                                                        ctx.fillStyle = "#" + Math.floor(Math.random() * 16777215).toString(16);
                                                        var xs = [
                                                            0,
                                                            138,
                                                            276,
                                                            414
                                                        ];
                                                        var weezes = [
                                                            weez1,
                                                            weez2,
                                                            weez3,
                                                            weez4,
                                                            weez5,
                                                            weez6,
                                                            weez7,
                                                            weez8
                                                        ];
                                                        var currentIndex = xs.length,
                                                            randomIndex;
                                                        while (currentIndex != 0) {
                                                            randomIndex = Math.floor(Math.random() * currentIndex);
                                                            currentIndex--;
                                                            [xs[currentIndex], xs[randomIndex]] = [
                                                                xs[randomIndex], xs[currentIndex]
                                                            ];
                                                        }
                                                        var randomImage = weezes[Math.floor(Math.random() * weezes.length)];

                                                        ctx.fillRect(0, 0, w, h);
                                                        if (Math.random() < 0.5) {
                                                            ctx.globalAlpha = 0.4;
                                                            ctx.drawImage(randomImage, 0, 0, w, h);
                                                            ctx.globalAlpha = 1;
                                                        }
                                                        for (let i = 0; i < 4; i++) {
                                                            var randomizer = Math.random() + 0.5;
                                                            var randomizer2 = Math.random() * 0.4 + 0.8;
                                                            var willRotate = (Math.random < 0.5);
                                                            var angleInRadians = 90;
                                                            if (willRotate) {
                                                                ctx.translate(xs[i], h / 3 * randomizer);
                                                                ctx.rotate(angleInRadians);
                                                            }
                                                            ctx.drawImage(weezes[Math.floor(Math.random() * weezes.length)], xs[i] * randomizer2, h / 3 * randomizer, 138, 461 * randomizer);

                                                            if (randomizer > 1) {
                                                                randomizer = Math.random() + 0.5
                                                                ctx.globalAlpha = 0.4;
                                                                var y = (Math.floor(Math.random() * 3));
                                                                for (let i = 0; i < y; i++) {
                                                                    ctx.drawImage(weezes[Math.floor(Math.random() * weezes.length)], Math.floor(Math.random() * w), Math.floor(Math.random() * h), 138 * randomizer, 461 * randomizer);
                                                                }
                                                                ctx.globalAlpha = 1;
                                                            }
                                                            if (willRotate) {
                                                                ctx.translate(-xs[i], -(h / 3 * randomizer));
                                                                ctx.rotate(-angleInRadians);
                                                            }
                                                        }
                                                        ctx.transform(0, 0);
                                                        ctx.scale(1, 1);


                                                        ctx.fillStyle = "black";
                                                        ctx.font = "bold 48px Weezer";
                                                        var takenIndexes = [];
                                                        var y = (Math.floor(Math.random() * 4) + 4);
                                                        var texts = [
                                                            "weezer",
                                                            "weezur",
                                                            "winzur",
                                                            "weenis",
                                                            "winblo",
                                                            "amogus",
                                                            "wiener",
                                                            "boogus",
                                                            "spoons",
                                                            "doobus"
                                                        ];
                                                        for (let i = 0; i < y; i++) {
                                                            var chosenText = texts[Math.floor(Math.random() * texts.length)]
                                                            var tw = ctx.measureText(chosenText).width;
                                                            var possibleTextPlaces = [
                                                                [w - tw, 30],
                                                                [0, 30],
                                                                [0, h - 5],
                                                                [w - tw, h - 5],
                                                                [Math.floor(Math.random() * (w - tw)), Math.floor(Math.random() * (h - 5 + 30) - 30)],
                                                                [Math.floor(Math.random() * (w - tw)), Math.floor(Math.random() * (h - 5 + 30) - 30)],
                                                                [Math.floor(Math.random() * (w - tw)), Math.floor(Math.random() * (h - 5 + 30) - 30)],
                                                                [Math.floor(Math.random() * (w - tw)), Math.floor(Math.random() * (h - 5 + 30) - 30)],
                                                            ];
                                                            var chosenPlace = possibleTextPlaces[Math.floor(Math.random() * possibleTextPlaces.length)];
                                                            if (takenIndexes.includes(possibleTextPlaces.indexOf(chosenPlace))) {
                                                                y++;
                                                                continue;
                                                            }
                                                            ctx.fillText(chosenText, chosenPlace[0], chosenPlace[1]);
                                                            takenIndexes.push(possibleTextPlaces.indexOf(chosenPlace));
                                                            texts = texts.filter(t => { return t != chosenText });
                                                        }


                                                        var imageStream2 = Buffer.from(c.toDataURL("image/png").split(",")[1], "base64");
                                                        fs.writeFileSync("./images/cache/" + imgID2, imageStream2);

                                                        console.log(__dirname + "\\images\\cache\\" + imgID2);
                                                        /**
                                                         * @type {Discord.Message}
                                                         */
                                                        var message = await client.channels.cache.get("956316856422137856").send({
                                                            files: [{
                                                                attachment: __dirname + "\\images\\cache\\" + imgID2
                                                            }]
                                                        });

                                                        setTimeout(() => {
                                                            fs.unlinkSync("./images/cache/" + imgID2);
                                                        }, 10000);

                                                        flapslib.webhooks.sendWebhook("custom", message.attachments.first().url, false, msg.channel, {
                                                            username: "weezer",
                                                            avatar: message.attachments.first().url,
                                                            content: message.attachments.first().url
                                                        });
                                                    });
                                                });
                                            });
                                        });
                                    });
                                });
                            });
                        });
                    }
                    break;
                case "!calamitas":
                    {
                        var files = fs.readdirSync('E:/MBG/StuffAndThings/38/');
                        var chosenFile = files[Math.floor(Math.random() * files.length)];
                        var filesize = fs.statSync("E:/MBG/StuffAndThings/38/" + chosenFile).size / (1024 * 1024);
                        if (Math.random() < 0.2) {
                            flapslib.videowrapper.armstrongify("E:/MBG/StuffAndThings/38/" + chosenFile, msg, 1, client);
                            return;
                        }
                        if (filesize > 8) {
                            sendWebhook("scal", "ohh my god thats such a fucking big file. i cant,,, upload.,,,, itt ohohohhnnggmggnhahdf. its " + Math.round(filesize) + " megabyte. fucking hell. thats what she said.", false, msg.channel);
                        } else {
                            var message = await client.channels.cache.get("956316856422137856").send({
                                files: [{
                                    attachment: "E:/MBG/StuffAndThings/38/" + chosenFile
                                }]
                            });

                            sendWebhook("scal", message.attachments.first().url, false, msg.channel);
                        }
                    }
                    break;
                case "!millerswife":
                    {
                        var files = fs.readdirSync('E:/MBG/StuffAndThings/lormastur/');
                        var chosenFile = files[Math.floor(Math.random() * files.length)];
                        var filesize = fs.statSync("E:/MBG/StuffAndThings/lormastur/" + chosenFile).size / (1024 * 1024);
                        if (Math.random() < 0) {
                            flapslib.videowrapper.armstrongify("E:/MBG/StuffAndThings/lormastur/" + chosenFile, msg, 1, client);
                            return;
                        }
                        if (filesize > 8) {
                            sendWebhook("millerwife", "*ugngnh* " + Math.round(filesize) + " megabyte~~~~~. ah.. uhn......", false, msg.channel);
                        } else {
                            var message = await client.channels.cache.get("956316856422137856").send({
                                files: [{
                                    attachment: "E:/MBG/StuffAndThings/lormastur/" + chosenFile
                                }]
                            });

                            sendWebhook("millerwife", message.attachments.first().url, false, msg.channel);
                        }
                    }
                    break;
                case "!nohorny":
                    {
                        var id = uuidv4().replace(/-/g, "");
                        if (msg.attachments.first().url.endsWith(".mp4")) {
                            download(msg.attachments.first().url, "./images/cache/" + id + ".mp4", () => {
                                getVideoDurationInSeconds("./images/cache/" + id + ".mp4").then((duration) => {
                                    console.log(duration);
                                    flapslib.videowrapper.armstrongify(id + ".mp4", msg, duration, client);
                                });
                            });
                        } else {
                            download(msg.attachments.first().url, "./images/cache/" + id + ".png", () => {
                                flapslib.videowrapper.armstrongify(id + ".png", msg, 1, client);
                            });
                        }
                    }
                    break;
                case "!fbifiles":
                    {
                        var date = new Date(new Date().getTime() + Math.random() * (new Date(new Date().getFullYear() + 10, new Date().getMonth(), new Date().getDate()).getTime() - new Date().getTime()));
                        var dateStr = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} at ${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}:${date.getSeconds().toString().padStart(2, "0")}`;
                        if (commandArgString == "<:owl:964880176355897374>") {
                            sendWebhook("fbi", `that owl is FUCKING INVINCIBLE\nhttps://media.discordapp.net/attachments/838732607344214019/980236924994338846/unknown.png`, false, msg.channel);
                        } else if (commandArgString == "miller") {
                            sendWebhook("fbi", `MILLER IS A DICK FUCK MILLER (dont actually fuck miller, fuck his daughter instead)\nhttps://media.discordapp.net/attachments/882743320554643476/981644975815135362/miller1.PNG`, false, msg.channel);
                        } else {
                            sendWebhook("fbi", `oh shit. ${commandArgString} will die on ${dateStr}. death by ${flapslib.cahWhiteCard()}
fbi files on ${commandArgString}: ${(msg.mentions.users.first() ? (descriptions[msg.mentions.users.first().id] + "\nhere's a file photo" ? descriptions[msg.mentions.users.first().id] + "\nhere's a file photo" : "[[Blank]]") : "[[Blank]]")}`, false, msg.channel);
                        }
                    }
                    break;
                case "!framephoto":
                    {
                        if (msg.attachments.size > 0) {
                            console.log(msg.attachments.first());
                            var request = require('request').defaults({ encoding: null });

                            request.get(msg.attachments.first().url, function(error, response, body) {
                                if (!error && response.statusCode == 200) {
                                    //data = "data:" + response.headers["content-type"] + ";base64," + Buffer.from(body).toString('base64');
                                    var imageStream = Buffer.from(body, "base64");
                                    var imgID = uuidv4().replace(/-/g, "_") + ".jpg";
                                    var imgID2 = uuidv4().replace(/-/g, "_") + ".png";
                                    var w = msg.attachments.first().width;
                                    var h = msg.attachments.first().height;
                                    fs.writeFileSync("./images/cache/" + imgID, imageStream);
                                    //sendWebhook("flaps", imageStream.toString("base64").substring(0, 1000), true, msg.channel);
                                    var c = canvas.createCanvas(1413 - 130, 1031 - 140);
                                    var ctx = c.getContext('2d');
                                    canvas.loadImage(__dirname + "\\images\\cache\\" + imgID).then(async(photo) => {
                                        canvas.loadImage(__dirname + "\\images\\frame.png").then(async(frame) => {
                                            ctx.drawImage(photo, 72, 73, 1125, 729);
                                            ctx.drawImage(frame, -130 / 2, -140 / 2, 1413, 1031);
                                            var imageStream2 = Buffer.from(c.toDataURL("image/png").split(",")[1], "base64");
                                            fs.writeFileSync("./images/cache/" + imgID2, imageStream2);

                                            console.log(__dirname + "\\images\\cache\\" + imgID2);
                                            /**
                                             * @type {Discord.Message}
                                             */
                                            var message = await client.channels.cache.get("956316856422137856").send({
                                                files: [{
                                                    attachment: __dirname + "\\images\\cache\\" + imgID2
                                                }]
                                            });

                                            setTimeout(() => {
                                                fs.unlinkSync("./images/cache/" + imgID);
                                                fs.unlinkSync("./images/cache/" + imgID2);
                                            }, 10000);

                                            flapslib.webhooks.sendWebhook("jamesphotoframe", message.attachments.first().url, false, msg.channel);
                                        });
                                    });
                                } else {
                                    flapslib.webhooks.sendWebhook("jamesphotoframe", error, true, msg.channel);
                                }
                            });
                        } else {
                            flapslib.webhooks.sendWebhook("jamesphotoframe", "i cant frame nothing you dummy", false, msg.channel);
                        }
                    }
                    break;
                case "!speechbubble":
                    {
                        if (msg.attachments.size > 0) {
                            console.log(msg.attachments.first());
                            var request = require('request').defaults({ encoding: null });

                            request.get(msg.attachments.first().url, function(error, response, body) {
                                if (!error && response.statusCode == 200) {
                                    //data = "data:" + response.headers["content-type"] + ";base64," + Buffer.from(body).toString('base64');
                                    var imageStream = Buffer.from(body, "base64");
                                    var imgID = uuidv4().replace(/-/g, "_") + ".jpg";
                                    var imgID2 = uuidv4().replace(/-/g, "_") + ".png";
                                    fs.writeFileSync("./images/cache/" + imgID, imageStream);
                                    //sendWebhook("flaps", imageStream.toString("base64").substring(0, 1000), true, msg.channel);
                                    var w = msg.attachments.first().width;
                                    var h = msg.attachments.first().height;
                                    var c = canvas.createCanvas(w, h + 10);
                                    var ctx = c.getContext('2d');
                                    canvas.loadImage(__dirname + "\\images\\cache\\" + imgID).then(async(photo) => {
                                        canvas.loadImage(__dirname + "\\images\\speech.png").then(async(speechbubble) => {
                                            var sbHeight = w * (17 / 22);
                                            ctx.drawImage(photo, 0, 10, w, h);
                                            if (msg.content.includes("flip")) {
                                                ctx.translate(w, 0);
                                                ctx.scale(-1, 1);
                                            }
                                            ctx.drawImage(speechbubble, 0, -(sbHeight - (sbHeight / 3)), w, sbHeight);
                                            var imageStream2 = Buffer.from(c.toDataURL("image/png").split(",")[1], "base64");
                                            fs.writeFileSync("./images/cache/" + imgID2, imageStream2);

                                            console.log(__dirname + "\\images\\cache\\" + imgID2);
                                            /**
                                             * @type {Discord.Message}
                                             */
                                            var message = await client.channels.cache.get("956316856422137856").send({
                                                files: [{
                                                    attachment: __dirname + "\\images\\cache\\" + imgID2
                                                }]
                                            });

                                            setTimeout(() => {
                                                fs.unlinkSync("./images/cache/" + imgID);
                                                fs.unlinkSync("./images/cache/" + imgID2);
                                            }, 10000);

                                            flapslib.webhooks.sendWebhook("jamesphotoframe", message.attachments.first().url, false, msg.channel);
                                        });
                                    });
                                } else {
                                    flapslib.webhooks.sendWebhook("jamesphotoframe", error, true, msg.channel);
                                }
                            });
                        } else {
                            flapslib.webhooks.sendWebhook("jamesphotoframe", "i cant put a speech bubble on nothing you dummy", false, msg.channel);
                        }
                    }
                    break;
                case "!mybeloved":
                    {
                        if (!msg.attachments.first() || !msg.attachments.first().width) {
                            sendWebhook("mkswt", "GIVE ME AN IMAGE YOU DWANKIE", false, msg.channel);
                        } else {
                            var filename = uuidv4() + ".png";
                            download(msg.attachments.first().url, "./images/cache/" + filename, () => {
                                flapslib.makesweet(commandArgString, filename, msg.channel, client);
                            });
                        }
                    }
                    break;
                case "!heartclose":
                    {
                        if (!msg.attachments.first() || !msg.attachments.first().width) {
                            sendWebhook("mkswt", "GIVE ME AN IMAGE YOU DWANKIE", false, msg.channel);
                        } else {
                            var filename = uuidv4() + ".png";
                            download(msg.attachments.first().url, "./images/cache/" + filename, () => {
                                flapslib.reverseMakesweet(commandArgString, filename, msg.channel, client);
                            });
                        }
                    }
                    break;
                case "!flip":
                    {
                        if (msg.attachments.size > 0) {
                            console.log(msg.attachments.first());
                            var request = require('request').defaults({ encoding: null });

                            request.get(msg.attachments.first().url, function(error, response, body) {
                                if (!error && response.statusCode == 200) {
                                    //data = "data:" + response.headers["content-type"] + ";base64," + Buffer.from(body).toString('base64');
                                    var imageStream = Buffer.from(body, "base64");
                                    var imgID = uuidv4().replace(/-/g, "_") + ".jpg";
                                    var imgID2 = uuidv4().replace(/-/g, "_") + ".png";
                                    fs.writeFileSync("./images/cache/" + imgID, imageStream);
                                    var w = msg.attachments.first().width;
                                    var h = msg.attachments.first().height;
                                    var c = canvas.createCanvas(w, h);
                                    var ctx = c.getContext('2d');
                                    canvas.loadImage(__dirname + "\\images\\cache\\" + imgID).then(async(photo) => {
                                        ctx.translate(w, 0);
                                        ctx.scale(-1, 1);
                                        ctx.drawImage(photo, 0, 10, w, h);
                                        var imageStream2 = Buffer.from(c.toDataURL("image/png").split(",")[1], "base64");
                                        fs.writeFileSync("./images/cache/" + imgID2, imageStream2);

                                        console.log(__dirname + "\\images\\cache\\" + imgID2);
                                        /**
                                         * @type {Discord.Message}
                                         */
                                        var message = await client.channels.cache.get("956316856422137856").send({
                                            files: [{
                                                attachment: __dirname + "\\images\\cache\\" + imgID2
                                            }]
                                        });

                                        setTimeout(() => {
                                            fs.unlinkSync("./images/cache/" + imgID);
                                            fs.unlinkSync("./images/cache/" + imgID2);
                                        }, 10000);

                                        flapslib.webhooks.sendWebhook("jamesphotoframe", message.attachments.first().url, false, msg.channel);
                                    });
                                } else {
                                    flapslib.webhooks.sendWebhook("jamesphotoframe", error, true, msg.channel);
                                }
                            });
                        } else {
                            flapslib.webhooks.sendWebhook("jamesphotoframe", "i cant put a speech bubble on nothing you dummy", false, msg.channel);
                        }
                    }
                    break;
                case "!homodog":
                    {
                        //data = "data:" + response.headers["content-type"] + ";base64," + Buffer.from(body).toString('base64');
                        var imgID2 = uuidv4().replace(/-/g, "_") + ".png";
                        var text = commandArgString;
                        var id = flapslib.ai.uuidv4();

                        function doThing(imgid, w, h) {
                            var c = canvas.createCanvas(w, h);
                            var ctx = c.getContext('2d');
                            canvas.loadImage(__dirname + "\\images\\cache\\" + imgid).then(async(photo) => {
                                ctx.drawImage(photo, 0, 0, w, h);

                                ctx.fillStyle = "white";
                                ctx.strokeStyle = "black";
                                ctx.textAlign = "center";
                                ctx.font = 'normal normal bolder ' + h / 9.5 + 'px Homodog';
                                ctx.lineWidth = h / 340;

                                ctx.fillText(text, w / 2, h / 2);
                                ctx.strokeText(text, w / 2, h / 2);

                                var imageStream2 = Buffer.from(c.toDataURL("image/png").split(",")[1], "base64");
                                fs.writeFileSync("./images/cache/" + imgID2, imageStream2);

                                console.log(__dirname + "\\images\\cache\\" + imgID2);
                                /**
                                 * @type {Discord.Message}
                                 */
                                var message = await client.channels.cache.get("956316856422137856").send({
                                    files: [{
                                        attachment: __dirname + "\\images\\cache\\" + imgID2
                                    }]
                                });

                                setTimeout(() => {
                                    fs.unlinkSync("./images/cache/" + imgID2);
                                }, 10000);

                                flapslib.webhooks.sendWebhook("jamesphotoframe", message.attachments.first().url, false, msg.channel);
                            });
                        }
                        if (msg.attachments.first()) {
                            flapslib.download(msg.attachments.first().url, "images/cache/" + id, () => {
                                doThing(id, msg.attachments.first().width, msg.attachments.first().height);
                            });
                        } else {
                            doThing("..\\homophobicdog.png", 680, 680);
                        }
                    }
                    break;
                case "!laugh":
                    {
                        var image = msg.content.substring("!laugh ".length).length == 0 ? "farquaad" : msg.content.substring("!laugh ".length).split(" ")[0];
                        if (image == "attachment" && msg.attachments.first()) {
                            var id = flapslib.ai.uuidv4();
                            flapslib.download(msg.attachments.first().url, "images/cache/" + id, () => {
                                image = "cache/" + id;
                                var data = [
                                    "cache/" + id,
                                    msg.attachments.first().width.toString(),
                                    msg.attachments.first().height.toString(),
                                    (msg.attachments.first().height / 10).toString(),
                                    "D", "D", "D", "D"
                                ];
                                var c = canvas.createCanvas(parseInt(data[1]), parseInt(data[2]));
                                var ctx = c.getContext('2d');
                                var text = msg.content.split(" ").slice(2).join(" ");

                                ctx.fillStyle = "white";
                                ctx.strokeStyle = "black";
                                ctx.textAlign = "center";

                                canvas.loadImage(__dirname + '\\images\\' + image).then(async(i) => {
                                    ctx.font = 'normal normal bolder' + data[3] + 'px Impact';
                                    ctx.lineWidth = parseInt(data[3]) / 30;
                                    var text1Pos = [0, 0];
                                    var text2Pos = [0, 0];
                                    if (data[4] == "D") {
                                        text1Pos[0] = parseInt(data[1]) / 2;
                                    } else {
                                        text1Pos[0] = parseInt(data[4]);
                                    }
                                    if (data[5] == "D") {
                                        text1Pos[1] = parseInt(data[3]);
                                    } else if (data[5] == "B") {
                                        text1Pos[1] = parseInt(data[2]) - 10;
                                    } else {
                                        text1Pos[1] = parseInt(data[5]);
                                    }
                                    if (data[6] == "D") {
                                        text2Pos[0] = parseInt(data[1]) / 2;
                                    } else {
                                        text2Pos[0] = parseInt(data[6]);
                                    }
                                    if (data[7] == "D") {
                                        text2Pos[1] = parseInt(data[2]) - 10;
                                    } else if (data[7] == "T") {
                                        text2Pos[1] = parseInt(data[3]);
                                    } else {
                                        text2Pos[1] = parseInt(data[7]);
                                    }
                                    ctx.drawImage(i, 0, 0, parseInt(data[1]), parseInt(data[2]));
                                    if (text.includes(":")) {
                                        text = [text.split(":")[0], text.split(":")[1]];
                                    } else {
                                        text = [text, ""];
                                    }
                                    ctx.fillText(text[0], text1Pos[0], text1Pos[1]);
                                    ctx.strokeText(text[0], text1Pos[0], text1Pos[1]);
                                    ctx.fillText(text[1], text2Pos[0], text2Pos[1]);
                                    ctx.strokeText(text[1], text2Pos[0], text2Pos[1]);

                                    //console.log(c.toDataURL("image/png").split(",")[1]);

                                    var imgID = uuidv4().replace(/-/g, "_") + ".png";

                                    var imageStream = Buffer.from(c.toDataURL("image/png").split(",")[1], "base64");
                                    fs.writeFileSync("./images/cache/" + imgID, imageStream);

                                    console.log(__dirname + "\\images\\cache\\" + imgID);
                                    /**
                                     * @type {Discord.Message}
                                     */
                                    var message = await client.channels.cache.get("956316856422137856").send({
                                        files: [{
                                            attachment: __dirname + "\\images\\cache\\" + imgID
                                        }]
                                    });

                                    setTimeout(() => {
                                        fs.unlinkSync("./images/cache/" + imgID);
                                    }, 10000);

                                    flapslib.webhooks.sendWebhook("flaps", message.attachments.first().url, false, msg.channel);
                                });
                            });
                        } else {
                            var text;
                            if (memeMaking.imageExists(msg.content.substring("!laugh ".length).split(" ")[0])) {
                                text = msg.content.substring("!laugh ".length).length == 0 ? "" : msg.content.substring("!laugh ".length + image.length + 1);
                            } else {
                                image = "farquaad";
                                text = msg.content.substring("!laugh ".length).length == 0 ? "" : msg.content.substring("!laugh ".length);
                            }
                            var data = await memeMaking.getImageData(image);
                            var c = canvas.createCanvas(parseInt(data[1]), parseInt(data[2]));
                            var ctx = c.getContext('2d');

                            ctx.fillStyle = "white";
                            ctx.strokeStyle = "black";
                            ctx.textAlign = "center";

                            canvas.loadImage(__dirname + '\\images\\' + image + ".jpg").then(async(i) => {
                                ctx.font = 'normal normal bolder' + data[3] + 'px Impact';
                                ctx.lineWidth = parseInt(data[3]) / 30;
                                var text1Pos = [0, 0];
                                var text2Pos = [0, 0];
                                if (data[4] == "D") {
                                    text1Pos[0] = parseInt(data[1]) / 2;
                                } else {
                                    text1Pos[0] = parseInt(data[4]);
                                }
                                if (data[5] == "D") {
                                    text1Pos[1] = parseInt(data[3]);
                                } else if (data[5] == "B") {
                                    text1Pos[1] = parseInt(data[2]) - 10;
                                } else {
                                    text1Pos[1] = parseInt(data[5]);
                                }
                                if (data[6] == "D") {
                                    text2Pos[0] = parseInt(data[1]) / 2;
                                } else {
                                    text2Pos[0] = parseInt(data[6]);
                                }
                                if (data[7] == "D") {
                                    text2Pos[1] = parseInt(data[2]) - 10;
                                } else if (data[7] == "T") {
                                    text2Pos[1] = parseInt(data[3]);
                                } else {
                                    text2Pos[1] = parseInt(data[7]);
                                }
                                ctx.drawImage(i, 0, 0, parseInt(data[1]), parseInt(data[2]));
                                if (text.includes(":")) {
                                    text = [text.split(":")[0], text.split(":")[1]];
                                } else {
                                    text = [text, ""];
                                }
                                ctx.fillText(text[0], text1Pos[0], text1Pos[1]);
                                ctx.strokeText(text[0], text1Pos[0], text1Pos[1]);
                                ctx.fillText(text[1], text2Pos[0], text2Pos[1]);
                                ctx.strokeText(text[1], text2Pos[0], text2Pos[1]);

                                //console.log(c.toDataURL("image/png").split(",")[1]);

                                var imgID = uuidv4().replace(/-/g, "_") + ".png";

                                var imageStream = Buffer.from(c.toDataURL("image/png").split(",")[1], "base64");
                                fs.writeFileSync("./images/cache/" + imgID, imageStream);

                                console.log(__dirname + "\\images\\cache\\" + imgID);
                                /**
                                 * @type {Discord.Message}
                                 */
                                var message = await client.channels.cache.get("956316856422137856").send({
                                    files: [{
                                        attachment: __dirname + "\\images\\cache\\" + imgID
                                    }]
                                });

                                setTimeout(() => {
                                    fs.unlinkSync("./images/cache/" + imgID);
                                }, 10000);

                                flapslib.webhooks.sendWebhook("flaps", message.attachments.first().url, false, msg.channel);
                            });
                        }
                    }
                    break;
                case "!person":
                    {
                        flapslib.ai.person(msg.channel, client);
                    }
                    break;
                case "!upscale":
                    {
                        flapslib.ai.upscaleImage(msg, msg.channel, client);
                    }
                    break;
                case "!complete":
                    {
                        var text = msg.content.substring("!complete ".length);
                        var arrayshit = text.split(" ");
                        if (text.startsWith("-i")) {
                            var nextArr = [];
                            arrayshit.forEach(word => {
                                if (word == "-i") return;
                                if (Math.random() < 0.2) word = (word + " ").repeat(Math.floor(Math.random() * 5) + 2);
                                if (swears.includes(word.toLowerCase())) word = (word + " ").repeat(Math.floor(Math.random() * 7) + 3);
                                word = word.toUpperCase();
                                nextArr.push(word);
                            });
                            text = nextArr.join(" ");
                        }
                        lastRequests[msg.author.id] = text;
                        flapslib.ai.autocompleteText(text, msg.channel);
                    }
                    break;
                case "!statusideas":
                    {
                        var originalStatusIdeas = [
                            "they really played the shooting song in the woodwork room. two days later?",
                            "im gonna uhh smash a mug on the ground on june 3rd",
                            "MUG SMASHIG",
                            "me running away from the car i rigged to detonate",
                            "OMELETTES, JACK",
                            "38, hahaahah.e.. theeehee...",
                            "im gonna take 8 xannies",
                            "ima fucking murder my pain *swallows 50 nurofens*",
                        ];
                        var inputText = originalStatusIdeas.join("\n") + "\n";
                        sendWebhook("deepai", "beep boop am thinking......", false, msg.channel)
                        flapslib.ai.autocompleteText(inputText, msg.channel, true);
                    }
                    break;
                case "!3amgonewrong":
                    {
                        var originalTitles = [
                            "DO NOT ORDER FNAF HAPPY MEALS AT 3AM!!!! (THEY CAME AFTER US)",
                            "DO NOT WATCH JASON VOORHEES MOVIE AT 3 AM!! *HE CAME AFTER US*",
                            "CUTTING OPEN HAUNTED ENCANTO DOLL AT 3 AM!! (WHAT'S INSIDE?)",
                            "DO NOT WATCH MICKEY MOUSE LOST EPISODE AT 3 AM!! *HAUNTED*",
                            "DRONE CATCHES SONIC.EXE AND SHADOW RACING AT A TRACK AND FIELD!!",
                            "DO NOT MAKE SONIC 2 VOODOO DOLL AT 3 AM CHALLENGE!! (ACTUALLY WORKED)",
                            "DO NOT WATCH VENOM MOVIE AT 3 AM",
                            "DO NOT ORDER SONIC 2 HAPPY MEAL FROM MCDONALDS AT 3 AM!! (HE CAME AFTER US)",
                        ];
                        var inputText = originalTitles.join("\n") + "\n";
                        sendWebhook("deepai", "beep boop am thinking......", false, msg.channel)
                        flapslib.ai.autocompleteText(inputText, msg.channel, true);
                    }
                    break;
                case "!donotcall":
                    {
                        var white = cahWhiteCard().toUpperCase();
                        white = white.substring(2, white.length - 3);
                        sendWebhook("flaps", `DO NOT CALL ${white} AT 3AM!!`, false, msg.channel);
                    }
                    break;
                case "!watermark":
                    {
                        var id = uuidv4() + ".png";
                        var imgID2 = uuidv4() + ".png";
                        if (!msg.attachments.first()) return;
                        flapslib.download(msg.attachments.first().url, "images/cache/" + id, () => {
                            var w = msg.attachments.first().width,
                                h = msg.attachments.first().height;
                            var c = canvas.createCanvas(w, h);
                            var ctx = c.getContext('2d');
                            canvas.loadImage(__dirname + "\\images\\cache\\" + id).then(async(photo) => {
                                canvas.loadImage(__dirname + (command.startsWith("!cheltonco") ? "\\images\\cheltonco.png" : "\\images\\redditwatermark.png")).then(async(reddit) => {
                                    ctx.drawImage(photo, 0, 0, w, h);

                                    //var amount = Math.floor(Math.random() * 100);
                                    var amount = 75;
                                    var redditwidth = w / 4;
                                    var redditheight = redditwidth;
                                    for (let i = 0; i < amount; i++) {
                                        var x = Math.floor(Math.random() * w) - redditwidth / 2;
                                        var y = Math.floor(Math.random() * h) - redditheight / 2;
                                        var alpha = Math.random();
                                        var scaleRandomizer = Math.random() + 0.5;
                                        ctx.globalAlpha = alpha;
                                        ctx.drawImage(reddit, x, y, redditwidth * scaleRandomizer, redditheight * scaleRandomizer);
                                        ctx.globalAlpha = 1;
                                    }

                                    var imageStream2 = Buffer.from(c.toDataURL("image/png").split(",")[1], "base64");
                                    fs.writeFileSync("./images/cache/" + imgID2, imageStream2);

                                    console.log(__dirname + "\\images\\cache\\" + imgID2);
                                    /**
                                     * @type {Discord.Message}
                                     */
                                    var message = await client.channels.cache.get("956316856422137856").send({
                                        files: [{
                                            attachment: __dirname + "\\images\\cache\\" + imgID2
                                        }]
                                    });

                                    setTimeout(() => {
                                        fs.unlinkSync("./images/cache/" + imgID2);
                                    }, 10000);

                                    flapslib.webhooks.sendWebhook(command.startsWith("!watermark") ? "reddit" : "flaps", message.attachments.first().url, false, msg.channel);
                                });
                            });
                        });
                    }
                    break;
                case "!img":
                    {
                        var text = msg.content.substring("!img ".length);
                        textToImage(text, msg.guild.id);
                    }
                    break;
                case "!retry":
                    {
                        var text = lastRequests[msg.author.id];
                        if (!text) return sendWebhook("deepai", "request something first you dumbo");
                        flapslib.ai.autocompleteText(text, msg.channel);
                    }
                    break;
                case "!basedmeter":
                    {
                        flapslib.webhooks.sendWebhook("based", "https://media.discordapp.net/attachments/882743320554643476/929056031101833216/IlphMLX5ggUAAAAASUVORK5CYII.png", false, msg.channel);
                    }
                    break;
                case "!degeneracy":
                    {
                        flapslib.fetchapis.roulette(msg.channel);
                    }
                    break;
                case "!flapslength":
                    {
                        var lines = fs.readFileSync("./main.js").toString().split("\r\n").length;
                        var lengths = {
                            "main.js": parseInt(lines.toString())
                        };
                        fs.readdir("./flapslib", (err, files) => {
                            files.forEach(file => {
                                var l = fs.readFileSync("./flapslib/" + file).toString().split("\r\n").length;
                                lines += l;
                                lengths[file] = l;
                            });
                            fs.readdir("E:/MBG/2site/sites/konalt/flaps/watchparty/videos", (err, files) => {
                                var flapsCacheFilesize = 0;
                                files.forEach(file => {
                                    var stats = fs.statSync("E:/MBG/2site/sites/konalt/flaps/watchparty/videos/" + file);
                                    var fileSizeInBytes = stats.size;
                                    var fileSizeInMegabytes = fileSizeInBytes / (1024 * 1024);
                                    flapsCacheFilesize += fileSizeInMegabytes;
                                });
                                flapsCacheFilesize = Math.round(flapsCacheFilesize * 10) / 10;
                                flapslib.webhooks.sendWebhook("flaps", "i grow to " + lines + " lines.\nFlapsCache:tm: total size taken: " + flapsCacheFilesize + "MB\nbreakdown:\n" + (Object.entries(lengths).map((x) => { return x[0] + ": " + x[1] + " lines" }).join("\n")), false, msg.channel);
                            });
                        });
                    }
                    break;
                case "!petit":
                    {
                        try {
                            await fetch("https://petittube.com/index.php", {
                                "credentials": "omit",
                                "headers": {
                                    "User-Agent": "FlapsChelton",
                                    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
                                    "Accept-Language": "en-US,en;q=0.5",
                                    "Upgrade-Insecure-Requests": "1",
                                    "Sec-Fetch-Dest": "document",
                                    "Sec-Fetch-Mode": "navigate",
                                    "Sec-Fetch-Site": "same-origin",
                                    "Cache-Control": "max-age=0"
                                },
                                "method": "GET",
                                "mode": "cors"
                            }).then(r => r.text()).then((content) => {
                                var a = content.substring(content.indexOf("https://www.youtube.com/embed/") + "https://www.youtube.com/embed/".length, (content.indexOf("https://www.youtube.com/embed/") + "https://www.youtube.com/embed/".length + 11));
                                console.log(a);
                                flapslib.webhooks.sendWebhook("deepai", "https://youtube.com/watch?v=" + a, false, msg.channel);
                            });
                        } catch (e) {
                            console.log("aw");
                            console.log(e);
                        }
                    }
                    break;
                case "!help":
                    {
                        var f = "flaps chelton help:\n";
                        Object.entries(commands).forEach(x => {
                            f += `${x[0]}: ${x[1]}\n`;
                        });
                        flapslib.webhooks.sendWebhook("flaps", f, false, msg.channel, {}, msg);
                    }
                    break;
                case "!balkancuisine":
                    {
                        var message = await client.channels.cache.get("956316856422137856").send({
                            files: [{
                                attachment: "images/ciggies/" + Math.floor(Math.random() * 17) + ".jpg"
                            }]
                        });

                        flapslib.webhooks.sendWebhook("balkan", message.attachments.first().url, false, msg.channel);
                    }
                    break;
                case "!funnycat":
                    {
                        var message = await client.channels.cache.get("956316856422137856").send({
                            files: [{
                                attachment: "images/cybercat.jpg"
                            }]
                        });

                        flapslib.webhooks.sendWebhook("balkan", message.attachments.first().url, false, msg.channel);
                    }
                    break;
                case "!morbius":
                    {
                        flapslib.moviereview.morbiusReview(msg.channel);
                    }
                    break;
            }
        }
    } catch (err) {
        flapslib.webhooks.sendWebhook("flapserrors", "Oooops! Looks like flaps broke.\n<@445968175381610496>, here's the scoop:\n" + err.stack, false, msg.channel);
    }
});

setInterval(() => {
    var d = new Date();
    if (
        d.getMinutes() == 33 &&
        d.getHours() == 23 &&
        d.getFullYear() == 2033 &&
        d.getMonth() == 2 &&
        d.getDate() == 3) {
        console.log(d.getMinutes(), d.getHours(), d.getFullYear(), d.getMonth(), d.getDate());
        sendWebhook("flaps", "@everyone MEET UP IN FUNKY TOWN OR I KICK YOUR ASSES\n IT\'S 3/3/33 23:33 YA FUCKIN DONGS!!!!!", false, client.channels.cache.get("924715825435385897"));
    }
}, 1000);
setInterval(() => {
    var d = new Date();
    if (d.getMinutes() == 0 && d.getHours() == 0 && d.getSeconds() < 1) {
        sendWebhook("flaps", "midnight", false, client.channels.cache.get("924715825435385897"));
    }
}, 1000);
//#endregion
fs.readFile("./token.txt", (err, data) => {
    if (err) {
        console.error(err);
    } else {
        client.login(data.toString());
    }
});

flapslib.watchparty_init(client);