const fetch = require("node-fetch");
const fs = require("fs");
const owoify = require("owoify-js").default;
const Discord = require("discord.js");

var users = {};

updateUsers();

/**
 *
 * @param {string} id
 * @param {Discord.MessageEmbed} embed
 * @param {boolean} disableCustom
 * @param {Discord.TextChannel} msgChannel
 * @param {Object} customData
 * @param {Discord.Message} msg
 * @returns {Promise}
 */

function sendWebhook(
    id,
    content,
    disableCustom = false,
    msgChannel,
    customData = {},
    msg
) {
    return new Promise((resolve, _reject) => {
        updateUsers();
        if (!users[id] && id != "custom") {
            return sendWebhook(
                "flapserrors",
                'Error: unknown webhook bot "' +
                id +
                '". Original message content:\n---\n' +
                content,
                false,
                msgChannel
            );
        }
        var custom = false;
        if (id == "custom") {
            content = customData.content;
            if (customData.avatar == "attached" && msg.attachments.first()) {
                customData.avatar = msg.attachments.first().url;
            }
            custom = true;
        } else {
            if (users[id][2] && !disableCustom) content = eval(users[id][2])(content);
        }
        var dave = fs.readFileSync("./dave.txt").toString() == "yes";
        msgChannel
            .fetchWebhooks()
            .then((hooks) => {
                var hook = hooks.find(
                    (h) => h.name == "FlapsCheltonWebhook_" + msgChannel.id
                );
                var data = {
                    content: content,
                    username: custom ?
                        customData.username :
                        dave ?
                        "dave " + Math.floor(Math.random() * 200).toString() :
                        users[id][0] == "__FlapsNick__" ?
                        msgChannel.guild.me.nickname || client.user.username :
                        users[id][0],
                    avatar_url: custom ? customData.avatar : users[id][1],
                };
                if (!hook) {
                    msgChannel
                        .createWebhook("FlapsCheltonWebhook_" + msgChannel.id, {
                            avatar: "https://media.discordapp.net/attachments/882743320554643476/966013228641566760/numb.PNG",
                            reason: "flap chelton needed a webhook for the channel.",
                        })
                        .then((hook2) => {
                            trySend(hook2.url, data)
                                .then(() => {
                                    resolve();
                                })
                                .catch(() => {
                                    resolve("ALL_WAIT");
                                });
                        })
                        .catch(console.error);
                } else {
                    trySend(hook.url, data)
                        .then(() => {
                            resolve();
                        })
                        .catch(() => {
                            resolve("ALL_WAIT");
                        });
                }
            })
            .catch(console.error);
    });
}

function trySend(url, data) {
    return new Promise((res, rej) => {
        fetch(url, {
            method: "POST",
            body: JSON.stringify(data),
            headers: { "Content-Type": "application/json" },
        }).then((r) => {
            if (r.status == 429) {
                rej();
            }
            res();
        });
    });
}

function editWebhookMsg(msgid, msgChannel, content) {
    return new Promise((resolve, _reject) => {
        msgChannel
            .fetchWebhooks()
            .then((hooks) => {
                var hook = hooks.find(
                    (h) => h.name == "FlapsCheltonWebhook_" + msgChannel.id
                );
                fetch(hook.url + "/messages/" + msgid, {
                    method: "PATCH",
                    body: JSON.stringify({
                        content: content,
                    }),
                    headers: { "Content-Type": "application/json" },
                }).then(() => {
                    resolve();
                });
            })
            .catch(console.error);
    });
}
/**
 * @type {Discord.Client}
 */
var client;

function setClient(c) {
    client = c;
}

async function sendWebhookFile(id, filename, noDelete = false, msgChannel) {
    var message = await client.channels.cache.get("956316856422137856").send({
        files: [{
            attachment: filename,
        }, ],
    });

    sendWebhook(id, message.attachments.first().url, false, msgChannel);
}

function sendWebhookEmbed(
    id,
    embed,
    disableCustom = false,
    msgChannel,
    customData = {},
    msg
) {
    return new Promise((resolve, _reject) => {
        try {
            msgChannel
                .fetchWebhooks()
                .then((hooks) => {
                    var hook = hooks.find(
                        (h) => h.name == "FlapsCheltonWebhook_" + msgChannel.id
                    );
                    if (!hook) {
                        msgChannel
                            .createWebhook("FlapsCheltonWebhook_" + msgChannel.id, {
                                avatar: "https://media.discordapp.net/attachments/882743320554643476/966013228641566760/numb.PNG",
                                reason: "flap chelton needed a webhook for the channel.",
                            })
                            .then((hook2) => {
                                fetch(hook2.url, {
                                    method: "POST",
                                    body: JSON.stringify({
                                        embeds: [embed],
                                        username: users[id][0],
                                        avatar_url: users[id][1],
                                    }),
                                    headers: { "Content-Type": "application/json" },
                                }).then(() => {
                                    resolve();
                                });
                            })
                            .catch(console.error);
                    } else {
                        console.log(`{
    "embeds": [${JSON.stringify(embed.toJSON())}],
    "username": ${users[id[0]]},
    "avatar_url": ${users[id[1]]}
}`);
                        fetch(hook.url, {
                                method: "POST",
                                body: `{
                                "embeds": [${JSON.stringify(embed.toJSON())}],
                                "username": "${users[id][0]}",
                                "avatar_url": "${users[id][1]}"
                            }`,
                                headers: { "Content-Type": "application/json" },
                            })
                            .then((r) => r.text())
                            .then((r) => {
                                console.log(r);
                            });
                    }
                })
                .catch(console.error);
        } catch (e) {
            console.log("aaahahahahaha");
            console.log(e);
        }
    });
}

function updateUsers() {
    var usersArray = fs
        .readFileSync("./flaps_users.txt", "utf8")
        .toString()
        .split("\r\n")
        .map((u) => {
            return u.split("--");
        });
    usersArray.forEach((user) => {
        users[user[0]] = [
            user[1],
            user[2].startsWith("http") ?
            user[2] :
            "https://media.discordapp.net/attachments/882743320554643476/" +
            user[2] +
            "/unknown.png",
            user[3],
        ];
    });
}

function sendWebhookImage(id, data) {
    return false;
}

module.exports = {
    sendWebhook: sendWebhook,
    sendWebhookEmbed: sendWebhookEmbed,
    sendWebhookImage: sendWebhookImage,
    updateUsers: updateUsers,
    users: users,
    editWebhookMsg: editWebhookMsg,
    sendWebhookFile: sendWebhookFile,
    setClient: setClient,
};