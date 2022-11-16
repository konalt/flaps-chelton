const { MessageComponentInteraction } = require("discord.js"); //eslint-disable-line no-unused-vars
const { sendWebhookButton, editWebhookButton } = require("./webhooks");

function getButtons(turn) {
    var btns = [{
        type: 1,
        components: [],
    }, ];
    for (let i = 0; i < 7; i++) {
        btns[0].components.push({
            type: 2,
            style: turn,
            label: "_",
            custom_id: `Con4_${i}`,
        });
    }
    console.log(btns);
    return btns;
}

function getBoard(buttons) {
    var board = [];
    buttons.forEach((yLine) => {
        var temp = [];
        yLine.components.forEach((xo) => {
            temp.push(xo.label == "_" ? 0 : xo.label == "X" ? 1 : 2);
        });
        board.push(temp);
    });
    return board;
}

/**
 *
 * @param {MessageComponentInteraction} interaction
 */

function handleInteraction(interaction) {
    var data = interaction.customId.split("_")[1].split(".");
    var [x, y] = data;
    var z = interaction.message.content.split("**")[1] == "X" ? 1 : 2;
    var player1 = interaction.message.mentions.users.first(2)[0];
    var player2 =
        interaction.message.mentions.users.first(2)[1] ||
        interaction.message.mentions.users.first(2)[0];
    var channel = interaction.message.channel;
    var board = getBoard(interaction.message.components);
    board[y][x] = z;
    editWebhookButton(
        interaction.message.id,
        `${player1} is challenging ${player2} to a duel!\nTurn: **${
            z == 1 ? "O" : "X"
        }**`,
        getButtons(board),
        channel
    ).then(() => {
        console.log("Update");
    });
}

function startGame(player1, player2, channel) {
    sendWebhookButton("tictactoe", "test", getButtons(1), channel).then(
        (msgid) => {
            console.log(msgid);
        }
    );
}

module.exports = {
    startGame,
    handleInteraction,
};