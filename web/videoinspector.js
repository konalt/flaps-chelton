const fileInput = document.getElementById("file");
const video = document.getElementById("v");
const videoUI = document.getElementById("vui");
const inputUI = document.getElementById("ui");
const widthInput = document.getElementById("vw");
const heightInput = document.getElementById("vh");
const fpsInput = document.getElementById("vfps");
const positionDisplay = document.getElementById("pos");

function readFile(input, cb) {
    const file = input.files[0];
    const reader = new FileReader();
    reader.addEventListener(
        "load",
        () => {
            cb(reader.result);
        },
        false
    );
    if (file) {
        reader.readAsDataURL(file);
    }
}

fileInput.addEventListener("change", (e) => {
    e.preventDefault();
    readFile(fileInput, (url) => {
        video.src = url;
        flaps.show(videoUI);
        flaps.hide(inputUI);
    });
});

let sx = 0;
let sy = 0;
let sf = 0;

video.addEventListener("mousemove", (e) => {
    let w = widthInput.value;
    let h = heightInput.value;
    let fps = fpsInput.value;
    let cr = video.getBoundingClientRect();
    let x = (e.offsetX / cr.width) * w;
    let y = (e.offsetY / cr.height) * h;
    let frame = video.currentTime * fps;
    sx = x;
    sy = y;
    sf = frame;
    positionDisplay.innerText = `${Math.floor(sf)} ${Math.round(
        sx
    )} ${Math.round(sy)}`;
});

document.addEventListener("keydown", (e) => {
    let fps = fpsInput.value;
    if (e.code == "KeyQ") {
        video.currentTime = video.currentTime - 1 / fps;
    }
    if (e.code == "KeyW") {
        video.currentTime = video.currentTime + 1 / fps;
    }
    sf = video.currentTime * fps;
    positionDisplay.innerText = `${Math.floor(sf)} ${Math.round(
        sx
    )} ${Math.round(sy)}`;
});
