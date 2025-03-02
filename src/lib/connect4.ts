import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonInteraction,
    ButtonStyle,
    MessageFlags,
    User,
} from "discord.js";
import { uuidv4 } from "./utils";
import { Connect4Cell, Connect4Game, Connect4Line } from "../types";
import { editWebhookMessage } from "./webhooks";
import { createCanvas } from "canvas";
import { drawText } from "./canvas/drawText";

export let games: Record<string, Connect4Game> = {};

export function createMessageContent(game: Connect4Game) {
    let currentUser = game.isPlayer2Turn ? game.player2 : game.player1;
    let turnString =
        currentUser.username +
        (currentUser.username.endsWith("s") ? "'" : "'s");
    return `***CONNECT 4!!!***
${game.player1.username} (🔴) is playing against ${game.player2.username} (🔵)!
It's ${turnString} turn!
Use the buttons to drop your tokens in the drop zones.
Use the arrow on the side to scroll.`;
}

export function createComponentList(game: Connect4Game) {
    let row = new ActionRowBuilder();
    let iOffset = 0;
    if (game.buttonWindow == 0) {
        let button = new ButtonBuilder();
        let dropZone = 0;
        button.setCustomId(`c4-${game.id}-${dropZone}`);
        button.setStyle(
            game.isPlayer2Turn ? ButtonStyle.Primary : ButtonStyle.Danger
        );
        button.setLabel(`Drop Zone ${dropZone + 1}`);
        row.addComponents(button);
        iOffset = 1;
    } else {
        let scrollLeftButton = new ButtonBuilder();
        scrollLeftButton.setCustomId(`c4-${game.id}-sl`);
        scrollLeftButton.setStyle(ButtonStyle.Secondary);
        scrollLeftButton.setEmoji("◀️");
        scrollLeftButton.setDisabled(game.buttonWindow <= 0);
        row.addComponents(scrollLeftButton);
    }
    for (let i = 0; i < 3; i++) {
        let button = new ButtonBuilder();
        let dropZone = i + game.buttonWindow + iOffset;
        button.setCustomId(`c4-${game.id}-${dropZone}`);
        button.setStyle(
            game.isPlayer2Turn ? ButtonStyle.Primary : ButtonStyle.Danger
        );
        button.setLabel(`Drop Zone ${dropZone + 1}`);
        row.addComponents(button);
    }
    if (game.buttonWindow == 3) {
        let button = new ButtonBuilder();
        let dropZone = 3 + game.buttonWindow;
        button.setCustomId(`c4-${game.id}-${dropZone}`);
        button.setStyle(
            game.isPlayer2Turn ? ButtonStyle.Primary : ButtonStyle.Danger
        );
        button.setLabel(`Drop Zone ${dropZone + 1}`);
        row.addComponents(button);
    } else {
        let scrollRightButton = new ButtonBuilder();
        scrollRightButton.setCustomId(`c4-${game.id}-sr`);
        scrollRightButton.setStyle(ButtonStyle.Secondary);
        scrollRightButton.setEmoji("▶️");
        scrollRightButton.setDisabled(game.buttonWindow >= 4);
        row.addComponents(scrollRightButton);
    }
    return [row];
}

export function createGame(player1: User, player2: User) {
    const E = Connect4Cell.Empty;
    let game: Connect4Game = {
        board: [
            [E, E, E, E, E, E],
            [E, E, E, E, E, E],
            [E, E, E, E, E, E],
            [E, E, E, E, E, E],
            [E, E, E, E, E, E],
            [E, E, E, E, E, E],
            [E, E, E, E, E, E],
        ],
        isOver: false,
        isPlayer2Turn: false,
        player1,
        player2,
        id: uuidv4().split("-")[0],
        buttonWindow: 0,
    };
    games[game.id] = game;
    return game;
}

export async function handleInteraction(interaction: ButtonInteraction) {
    let cid = interaction.customId;
    let game = games[cid.split("-")[1]];
    if (!game) {
        interaction.reply({
            content: "This game is no longer in memory. Did Flaps restart?",
            flags: MessageFlags.Ephemeral,
        });
        return;
    }

    let buttonType = cid.split("-")[2];
    switch (buttonType) {
        case "sl":
            game.buttonWindow -= 3;
            if (game.buttonWindow < 0) game.buttonWindow = 0;
            break;
        case "sr":
            game.buttonWindow += 3;
            if (game.buttonWindow > 4) game.buttonWindow = 4;
            break;
        default:
            let dropzone = parseInt(buttonType);
            let filteredLine = game.board[dropzone].filter(
                (p) => p != Connect4Cell.Empty
            );
            filteredLine.push(
                game.isPlayer2Turn ? Connect4Cell.Blue : Connect4Cell.Red
            );
            while (filteredLine.length < 6) {
                filteredLine.push(Connect4Cell.Empty);
            }
            game.board[dropzone] = filteredLine as Connect4Line;
            game.isPlayer2Turn = !game.isPlayer2Turn;
    }
    await editWebhookMessage(
        interaction.message.id,
        "flaps",
        createMessageContent(game),
        interaction.message.channel,
        await createImage(game),
        `${cid}.png`,
        createComponentList(game)
    );
    interaction.deferUpdate();
}

function cellColor(cell: Connect4Cell) {
    switch (cell) {
        case Connect4Cell.Blue:
            return "#2e59d1";
        case Connect4Cell.Red:
            return "#c43636";
        case Connect4Cell.Empty:
            return "#eeeeee";
    }
}

export async function createImage(game: Connect4Game) {
    const circleSize = 75;
    const circleGap = 15;
    const gameW = (circleGap + circleSize) * 7;
    const gameH = (circleGap + circleSize) * 6;
    let canvas = createCanvas(gameW, gameH);
    let ctx = canvas.getContext("2d");
    ctx.fillStyle = "#e4e86f";
    ctx.fillRect(0, 0, gameW, gameH);
    ctx.textAlign = "center";
    for (let x = 0; x < 7; x++) {
        let positionX =
            (circleGap + circleSize) * x + (circleGap + circleSize) / 2;
        let fired = false;
        for (let y = 5; y >= 0; y--) {
            ctx.fillStyle = cellColor(game.board[x][y]);
            ctx.strokeStyle = "black";
            ctx.lineWidth = 3;
            ctx.beginPath();
            let positionY =
                (circleGap + circleSize) * (5 - y) +
                (circleGap + circleSize) / 2;
            ctx.moveTo(positionX + circleSize / 2, positionY);
            ctx.arc(positionX, positionY, circleSize / 2, 0, Math.PI * 2);
            ctx.closePath();
            ctx.fill();
            if (game.board[x][y - 1] != Connect4Cell.Empty && !fired) {
                fired = true;
                ctx.fillStyle = cellColor(
                    game.isPlayer2Turn ? Connect4Cell.Blue : Connect4Cell.Red
                );
                ctx.globalAlpha = 0.2;
                ctx.fill();
                ctx.globalAlpha = 1;
                ctx.font = `bold ${
                    circleSize * 0.75
                }px 'Open Sans', sans-serif`;
                ctx.fillStyle = "black";
                ctx.textBaseline = "middle";
                ctx.fillText(`${x + 1}`, positionX, positionY);
            }
            ctx.stroke();
        }
    }
    return canvas.toBuffer();
}
