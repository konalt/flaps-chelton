var Color = {
    Black: 30,
    Red: 0,
    Green: 0,
    Yellow: 0,
    Blue: 0,
    Magenta: 0,
    Cyan: 0,
    LightGrey: 0,
    DarkGrey: 90,
    BrightRed: 0,
    BrightGreen: 0,
    BrightYellow: 0,
    BrightBlue: 0,
    BrightMagenta: 0,
    BrightCyan: 0,
    White: 0,
};

var last = 0;
Object.entries(Color).forEach((x) => {
    var [name, c] = x;
    if (c == 0) {
        Color[name] = last++;
    } else {
        last = c + 1;
    }
});

var esc = (n) => "\x1b[" + n + "m";

module.exports.esc = esc;
module.exports.Color = Color;

module.exports.log = (text, sub = null) => {
    console.log((sub ? `${esc(Color.White)}[${sub}] ` : "") + text);
};
