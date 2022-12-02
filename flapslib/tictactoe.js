const { MessageComponentInteraction } = require("discord.js"); //eslint-disable-line no-unused-vars
const { sendWebhookButton, editWebhookButton } = require("./webhooks");

function getButtons(board) {
    var btns = [
        {
            type: 1,
            components: [],
        },
        {
            type: 1,
            components: [],
        },
        {
            type: 1,
            components: [],
        },
    ];
    board.forEach((yLine, y) => {
        yLine.forEach((xo, x) => {
            switch (xo) {
                case 0:
                    btns[y].components.push({
                        type: 2,
                        style: 2,
                        label: "_",
                        custom_id: `TicTacToe_${x}.${y}.${xo}`,
                    });
                    break;
                case 1:
                    btns[y].components.push({
                        type: 2,
                        style: 4,
                        label: "X",
                        custom_id: `TicTacToe_${x}.${y}.${xo}`,
                    });
                    break;
                case 2:
                    btns[y].components.push({
                        type: 2,
                        style: 1,
                        label: "O",
                        custom_id: `TicTacToe_${x}.${y}.${xo}`,
                    });
                    break;

                default:
                    break;
            }
        });
    });
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
    sendWebhookButton(
        "tictactoe",
        `${player1} is challenging ${player2} to a duel!\nTurn: **X**`,
        getButtons(new Array(3).fill([0, 0, 0])),
        channel
    ).then((msgid) => {
        channel.messages.fetch(msgid).then((msg) => {
            console.log(msg);
        });
    });
}

module.exports = {
    startGame,
    handleInteraction,
};
