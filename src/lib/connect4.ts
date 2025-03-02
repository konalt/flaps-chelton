import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonInteraction,
    ButtonStyle,
    MessageFlags,
    User,
} from "discord.js";
import { SPOILERBUG, uuidv4 } from "./utils";
import {
    Connect4Board,
    Connect4Cell,
    Connect4Game,
    Connect4Line,
} from "../types";
import { editWebhookMessage } from "./webhooks";
import { createCanvas } from "canvas";
import { client } from "..";

export let games: Record<string, Connect4Game> = {};

function encodeGame(game: Connect4Game) {
    let out = [];
    out.push(game.player1.id);
    out.push(game.player2.id);
    out.push(game.buttonWindow);
    out.push(Number(game.isPlayer2Turn));
    out.push(Number(game.isOver));
    let boardString = "";
    for (const line of game.board) {
        let filteredLine = line.filter((p) => p != Connect4Cell.Empty);
        for (const token of filteredLine) {
            boardString += token;
        }
        boardString += "-";
    }
    out.push(boardString);
    return out.join(",");
}

async function decodeGame(gameString: string) {
    let gameData = gameString.split(",");
    let player1 = await client.users.fetch(gameData[0]);
    let player2 = await client.users.fetch(gameData[1]);
    let buttonWindow = parseInt(gameData[2]);
    let isPlayer2Turn = gameData[3] == "1";
    let isOver = gameData[4] == "1";
    let board = [];
    for (const line of gameData[5].split("-")) {
        let boardLine = [];
        for (const char of line) {
            boardLine.push(parseInt(char));
        }
        while (boardLine.length < 6) {
            boardLine.push(Connect4Cell.Empty);
        }
        board.push(boardLine);
    }
    let game: Connect4Game = {
        player1,
        player2,
        buttonWindow,
        isPlayer2Turn,
        isOver,
        board: board as Connect4Board,
    };
    return game;
}

export function createMessageContent(game: Connect4Game) {
    let currentUser = game.isPlayer2Turn ? game.player2 : game.player1;
    let turnString =
        currentUser.username +
        (currentUser.username.endsWith("s") ? "'" : "'s");
    return `***CONNECT 4!!!***
${game.player1.username} (🔴) is playing against ${game.player2.username} (🔵)!
It's ${turnString} turn!${SPOILERBUG}$${encodeGame(game)}`;
}

export function createComponentList(game: Connect4Game) {
    let row = new ActionRowBuilder();
    let iOffset = 0;
    if (game.buttonWindow == 0) {
        let button = new ButtonBuilder();
        let dropZone = 0;
        button.setCustomId(`c4-${dropZone}`);
        button.setStyle(
            game.isPlayer2Turn ? ButtonStyle.Primary : ButtonStyle.Danger
        );
        button.setLabel(`Drop Zone ${dropZone + 1}`);
        row.addComponents(button);
        iOffset = 1;
    } else {
        let scrollLeftButton = new ButtonBuilder();
        scrollLeftButton.setCustomId(`c4-sl`);
        scrollLeftButton.setStyle(ButtonStyle.Secondary);
        scrollLeftButton.setEmoji("◀️");
        scrollLeftButton.setDisabled(game.buttonWindow <= 0);
        row.addComponents(scrollLeftButton);
    }
    for (let i = 0; i < 3; i++) {
        let button = new ButtonBuilder();
        let dropZone = i + game.buttonWindow + iOffset;
        button.setCustomId(`c4-${dropZone}`);
        button.setStyle(
            game.isPlayer2Turn ? ButtonStyle.Primary : ButtonStyle.Danger
        );
        button.setLabel(`Drop Zone ${dropZone + 1}`);
        row.addComponents(button);
    }
    if (game.buttonWindow == 3) {
        let button = new ButtonBuilder();
        let dropZone = 3 + game.buttonWindow;
        button.setCustomId(`c4-${dropZone}`);
        button.setStyle(
            game.isPlayer2Turn ? ButtonStyle.Primary : ButtonStyle.Danger
        );
        button.setLabel(`Drop Zone ${dropZone + 1}`);
        row.addComponents(button);
    } else {
        let scrollRightButton = new ButtonBuilder();
        scrollRightButton.setCustomId(`c4-sr`);
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
        buttonWindow: 0,
    };
    return game;
}

export async function handleInteraction(interaction: ButtonInteraction) {
    let cid = interaction.customId;
    let game = await decodeGame(interaction.message.content.split("$")[1]);
    let currentUser = game.isPlayer2Turn ? game.player2 : game.player1;
    let turnString =
        currentUser.username +
        (currentUser.username.endsWith("s") ? "'" : "'s");
    if (interaction.user.id !== currentUser.id) {
        interaction.reply({
            content: `It's ${turnString} turn!`,
            flags: MessageFlags.Ephemeral,
        });
        return;
    }

    let buttonType = cid.split("-")[1];
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
    interaction.deferUpdate();
    await editWebhookMessage(
        interaction.message.id,
        "flaps",
        createMessageContent(game),
        interaction.message.channel,
        await createImage(game),
        `${cid}.png`,
        createComponentList(game)
    );
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
