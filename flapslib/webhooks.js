const fetch = require('node-fetch');
const fs = require('fs');

var users = {};

updateUsers();

function sendWebhook(id, content, disableCustom = false, msgChannel, customData = {}, msg) {
    return new Promise((resolve, _reject) => {
        var custom = false;
        if (id == "custom") {
            content = customData.content;
            if (customData.avatar == "attached" && msg.attachments.first()) {
                customData.avatar = msg.attachments.first().url;
            }
            console.log(customData);
            custom = true;
        } else {
            if (users[id][2] && !disableCustom) content = eval(users[id][2])(content);
        }
        msgChannel.fetchWebhooks()
            .then(hooks => {
                var hook = hooks.find(h => h.name == "FlapsCheltonWebhook_" + msgChannel.id);
                if (!hook) {
                    msgChannel.createWebhook("FlapsCheltonWebhook_" + msgChannel.id, {
                            avatar: "https://media.discordapp.net/attachments/882743320554643476/966013228641566760/numb.PNG",
                            reason: "flap chelton needed a webhook for the channel."
                        }).then((hook2) => {
                            fetch(hook2.url, {
                                method: 'POST',
                                body: JSON.stringify({
                                    content: content,
                                    username: custom ? customData.username : users[id][0],
                                    avatar_url: custom ? customData.avatar : users[id][1]
                                }),
                                headers: { 'Content-Type': 'application/json' }
                            }).then(() => { resolve() });
                        })
                        .catch(console.error);
                } else {
                    fetch(hook.url, {
                        method: 'POST',
                        body: JSON.stringify({
                            content: content,
                            username: custom ? customData.username : users[id][0],
                            avatar_url: custom ? customData.avatar : users[id][1]
                        }),
                        headers: { 'Content-Type': 'application/json' }
                    }).then(() => { resolve() });
                }
            }).catch(console.error);
    });
}

function editWebhookMsg(msgid, msgChannel, content) {
    return new Promise((resolve, _reject) => {
        msgChannel.fetchWebhooks()
            .then(hooks => {
                var hook = hooks.find(h => h.name == "FlapsCheltonWebhook_" + msgChannel.id);
                fetch(hook.url + "/messages/" + msgid, {
                    method: 'PATCH',
                    body: JSON.stringify({
                        content: content
                    }),
                    headers: { 'Content-Type': 'application/json' }
                }).then(() => { resolve() });
            }).catch(console.error);
    });
}

function sendWebhookEmbed(id, embed, disableCustom = false, msgChannel, customData = {}, msg) {
    return new Promise((resolve, _reject) => {
        try {
            msgChannel.fetchWebhooks()
                .then(hooks => {
                    var hook = hooks.find(h => h.name == "FlapsCheltonWebhook_" + msgChannel.id);
                    if (!hook) {
                        msgChannel.createWebhook("FlapsCheltonWebhook_" + msgChannel.id, {
                                avatar: "https://media.discordapp.net/attachments/882743320554643476/966013228641566760/numb.PNG",
                                reason: "flap chelton needed a webhook for the channel."
                            }).then((hook2) => {
                                fetch(hook2.url, {
                                    method: 'POST',
                                    body: JSON.stringify({
                                        embeds: [embed],
                                        username: users[id][0],
                                        avatar_url: users[id][1]
                                    }),
                                    headers: { 'Content-Type': 'application/json' }
                                }).then(() => { resolve() });
                            })
                            .catch(console.error);
                    } else {
                        fetch(hook.url, {
                            method: 'POST',
                            body: JSON.stringify({
                                embeds: [embed],
                                username: users[id][0],
                                avatar_url: users[id][1]
                            }),
                            headers: { 'Content-Type': 'application/json' }
                        }).then(() => { resolve() });
                    }
                }).catch(console.error);
        } catch (e) {
            console.log("aaahahahahaha");
            console.log(e);
        }
    });
}

function updateUsers() {
    var usersArray = fs.readFileSync("./flaps_users.txt", "utf8").toString().split("\r\n").map(u => { return u.split("--"); });
    usersArray.forEach(user => {
        users[user[0]] = [user[1], (user[2].startsWith("http") ? user[2] : "https://media.discordapp.net/attachments/882743320554643476/" + user[2] + "/unknown.png"), user[3]];
    });
}

function sendWebhookImage(id, data) {
    return fetch('https://discordapp.com/api/webhooks/913913950356258859/x6DwVkrOjJM8xssw8NMjKhe2Xdim8OLyPQmH_CHOlaliCinKAjLC-HgFHjHitH7wV84U', {
        method: 'POST',
        body: JSON.stringify({
            attachments: [data],
            username: users[id][0],
            avatar_url: users[id][1]
        }),
        headers: { 'Content-Type': 'application/json' }
    });
}

module.exports = {
    sendWebhook: sendWebhook,
    sendWebhookEmbed: sendWebhookEmbed,
    sendWebhookImage: sendWebhookImage,
    updateUsers: updateUsers,
    users: users,
    editWebhookMsg: editWebhookMsg
}