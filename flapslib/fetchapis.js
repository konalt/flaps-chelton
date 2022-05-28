const fetch = require('node-fetch');
const { sendWebhookEmbed, sendWebhook } = require('./webhooks');
const download = require('./download');
const Discord = require("discord.js")

function randomArr(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

async function roulette(msgChannel) {
    var boards = ["b", "r9k", "s4s", "vip", "bant"];
    var board = randomArr(boards);
    fetch("https://a.4cdn.org/" + board + "/threads.json").then(r => r.json()).catch((err) => {
        sendWebhook("4chanroulette", "Error:\n" + err, false, msgChannel);
    }).then(r => {
        var thread = randomArr(randomArr(r).threads);
        fetch("https://a.4cdn.org/" + board + "/thread/" + thread.no + ".json").then(r => r.json()).then(r => {
            var post = r.posts[0];
            if (post.com) {
                var postText = post.com.replace(/<span class="quote">/gi, "").replace(/<span class="deadlink">/gi, "").replace(/&quot;/gi, "\"").replace(/<wbr>/gi, "").replace(/<br>/gi, "\n").replace(/<b>/gi, "**").replace(/<\/b>/gi, "**").replace(/<span class="fortune" style="color:#[0123456789abcdef]+">/gi, "").replace(/<\/span>/gi, "").replace(/&lt;/gi, "").replace(/&gt;/gi, ">").replace(/&#039;/gi, "'");
                [...postText.matchAll(/&lt;[^ \n]+/gi)].forEach(match => {
                    var m = match[0];
                    var link = m.substring("&lt;".length);
                    var link2 = link;
                    if (!link.startsWith("https://") || !link.startsWith("https://")) {
                        link2 = "http://" + link2
                    }
                    postText.replace(m, `[${link2}](${link})`);
                });
                [...postText.matchAll(/<a href="[^ "]+" class="quotelink">>>[0-9]+/gi)].forEach(match => {
                    var m = match[0];
                    var id = m.substring(m.indexOf(">>>") + 3);
                    console.log(id);
                    console.log(m);
                    postText.replace(m, `[>>${id}](https://boards.4chan.org/${board}/thread/${id})`);
                });
                var postTitle = postText.includes("\n") ? postText.split("\n")[0] : postText;
                var postDesc = postText.includes("\n") ? postText.split("\n").slice(1).join("\n") : "";
            }
            var ext = "s.png";
            fetch("https://i.4cdn.org/" + board + "/" + post.tim + ext, { method: "HEAD" }).then((res) => {
                if (!res.ok) ext = "s.jpg";
                fetch("https://i.4cdn.org/" + board + "/" + post.tim + ext.substring(1), { method: "HEAD" }).then((res2) => {
                    if (res2.ok) ext = ext.substring(1);
                    var embed = new Discord.MessageEmbed()
                        .setColor("#00cc66")
                        .setAuthor({ name: (post.name ? post.name : "Author"), iconURL: "https://res.cloudinary.com/crunchbase-production/image/upload/c_lpad,h_256,w_256,f_auto,q_auto:eco,dpr_1/v1506977414/y31m3uyt8lskvx7rlmjo.png" })
                        .setTimestamp(post.tim)
                        .addFields({ name: "Replies", value: (post.replies ? post.replies : 0).toString(), inline: true }, { name: "With images", value: (post.images ? post.images : 0).toString(), inline: true }, { name: "Users in thread", value: (post.images ? post.images : 0).toString(), inline: true }, { name: "Board", value: "/" + board + "/", inline: true }, { name: "Post No.", value: (post.no ? post.no.toString() : "Error"), inline: true }, (post.country_name ? { name: "Poster Country", value: post.country_name, inline: true } : { name: "\u200b", value: "\u200b", inline: true }))
                        .setURL("https://boards.4chan.org/" + board + "/thread/" + thread.no)
                        .setFooter({ text: 'Filename: ' + post.filename + post.ext })
                        .setImage("https://i.4cdn.org/" + board + "/" + post.tim + ext);
                    if (post.com && postDesc.length > 0) embed.setDescription(postDesc);
                    if (post.com) embed.setTitle(postTitle);
                    sendWebhookEmbed("4chanroulette", embed, false, msgChannel);
                });
            });
        }).catch((err) => {
            sendWebhook("4chanroulette", "Error:\n" + err, false, msgChannel);
        });
    });
}

module.exports = {
    roulette: roulette
}