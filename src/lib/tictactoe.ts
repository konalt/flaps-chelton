import { ActionRowBuilder, ButtonBuilder, ButtonStyle, User } from "discord.js";
import { TicTacToeBoard, TicTacToeCell, TicTacToeGame } from "../types";
import { uuidv4 } from "./utils";

export let games: Record<string, TicTacToeGame> = {};

export function makeMove(x: number, y: number, gameID: string) {
    let game = games[gameID];
    let current = game.board[y][x];
    if (current == TicTacToeCell.Empty) {
        games[gameID].board[y][x] = game.nextPlace;
        if (game.nextPlace == TicTacToeCell.X) {
            game.nextPlace = TicTacToeCell.O;
        } else {
            game.nextPlace = TicTacToeCell.X;
        }
    }
}

export function cellToString(cell: TicTacToeCell) {
    switch (cell) {
        case TicTacToeCell.Empty:
            return "_";
        case TicTacToeCell.X:
            return "X";
        case TicTacToeCell.O:
            return "O";
    }
}

export function cellToStyle(cell: TicTacToeCell) {
    switch (cell) {
        case TicTacToeCell.Empty:
            return ButtonStyle.Secondary;
        case TicTacToeCell.X:
            return ButtonStyle.Primary;
        case TicTacToeCell.O:
            return ButtonStyle.Danger;
    }
}

export function createComponentList(board: TicTacToeBoard, id: string) {
    function btn(x: number, y: number, cell: TicTacToeCell) {
        return new ButtonBuilder()
            .setCustomId(`ttt-${id}-${x}x${y}`)
            .setLabel(cellToString(cell))
            .setStyle(cellToStyle(cell))
            .setDisabled(cell !== TicTacToeCell.Empty);
    }
    let y = 0;
    let rows: ActionRowBuilder[] = [];
    for (const yLine of board) {
        let row = new ActionRowBuilder();
        let x = 0;
        for (const cell of yLine) {
            row.addComponents(btn(x, y, cell));
            x++;
        }
        y++;
        rows.push(row);
    }
    return rows;
}

export function createGame(player1: User, player2: User) {
    const E = TicTacToeCell.Empty;
    let game: TicTacToeGame = {
        board: [
            [E, E, E],
            [E, E, E],
            [E, E, E],
        ],
        isOver: false,
        nextPlace: TicTacToeCell.X,
        player1,
        player2,
        id: uuidv4().split("-")[0],
    };
    games[game.id] = game;
    return game;
}
