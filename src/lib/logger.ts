import { time } from "./utils";

export enum Color {
    Reset = 0,
    Black = 30,
    Red = 31,
    Green = 32,
    Yellow = 33,
    Blue = 34,
    Magenta = 35,
    Cyan = 36,
    LightGrey = 37,
    DarkGrey = 90,
    BrightRed = 91,
    BrightGreen = 92,
    BrightYellow = 93,
    BrightBlue = 94,
    BrightMagenta = 95,
    BrightCyan = 96,
    White = 97,
}

export const esc = (n: number) => "\x1b[" + n.toString() + "m";

export const log = (text = "Text Here", sub: string | null = null) => {
    console.log(
        (sub
            ? `${esc(Color.White)}[${sub}] ${esc(
                  Color.DarkGrey
              )}[${time()}]${esc(0)} `
            : `${esc(Color.White)}`) +
            text +
            esc(0)
    );
};
