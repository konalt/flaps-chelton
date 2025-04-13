const selector = document.getElementById("selector");
const outtxt = document.getElementById("outtxt");
const outimg = document.getElementById("outimg");
const outvid = document.getElementById("outvid");
const outmsg = document.getElementById("outmsg");
const outusername = document.getElementById("outusername");
const avatar = document.getElementById("avatar");
const pasteindicator = document.getElementById("pasteindicator");
const file = document.getElementById("file");
const clearImageButton = document.getElementById("clearimage");
const argsElement = document.getElementById("args");
const form = document.getElementById("form");
const useLastButton = document.getElementById("uselastgen");
const commandIDDisplay = document.getElementById("commandid");
const commandDescDisplay = document.getElementById("commanddesc");
const commandNeedsDisplay = document.getElementById("commandneeds");
const fileInputDiv = document.getElementById("fileinput");
const pastedImage = document.getElementById("pastedimage");
const pastedVideo = document.getElementById("pastedvideo");
const imageTypeDisplay = document.getElementById("imgtype");
const fileTypeDisplay = document.getElementById("filetype");

fetch("/api/commands")
    .then((r) => r.json())
    .then((resp) => {
        let sortedCommands = resp.sort((a, b) => {
            let nameA = a.name.toUpperCase();
            let nameB = b.name.toUpperCase();
            return nameA < nameB ? -1 : nameA > nameB ? 1 : 0;
        });
        for (const cmd of sortedCommands) {
            let opt = document.createElement("option");
            opt.value = cmd.id;
            opt.innerHTML = cmd.name;
            selector.appendChild(opt);
        }
        commands = sortedCommands;
        updateCommandInfo();
    });

function clearImage() {
    lasturl = "";
    urls = [];
    flaps.hide(pasteindicator);
    flaps.hide(clearImageButton);
    $("#file").val("");
}

let commands = [];

let lasturl = "";

function run() {
    flaps.hideError();
    let cmdid = selector.value;
    let command = commands.find((c) => c.id == cmdid);
    if (command.needs && !urls[0] && !command.needs[0].endsWith("?")) {
        flaps.showError("This command requires: " + command.needs.join(","));
        return;
    }
    let args = argsElement.value;
    flaps.hide(outimg);
    flaps.hide(outvid);
    flaps.hide(outtxt);
    flaps.hide(outmsg);
    flaps.hide(pasteindicator);
    flaps.show(loader);
    let useURL = urls;
    if (!command.needs) useURL = [];
    fetch("/api/runcmd", {
        method: "POST",
        body: JSON.stringify({
            id: cmdid,
            args: args,
            files: useURL,
        }),
        headers: {
            "Content-Type": "application/json",
        },
    })
        .then((r) => r.json())
        .then((resp) => {
            flaps.hide(loader);
            flaps.show(outmsg);
            if (resp.content.length > 0) {
                outtxt.innerText = resp.content;
                flaps.show(outtxt);
            }
            if (resp.buffer) {
                if (
                    resp.buffer.startsWith("data:video") ||
                    resp.buffer.startsWith("data:audio")
                ) {
                    outvid.src = resp.buffer;
                    flaps.show(outvid);
                } else if (resp.buffer.startsWith("data:image")) {
                    outimg.src = resp.buffer;
                    flaps.show(outimg);
                }
                lasturl = resp.buffer;
                if (command.needs) {
                    flaps.show(useLastButton);
                }
            }
            outusername.innerText = resp.username;
            avatar.src = "/avatar/" + resp.id + ".webp";
        })
        .catch((err) => {
            flaps.hide(loader);
            flaps.showError(err);
        });
}

form.addEventListener("submit", (e) => {
    e.preventDefault();
    run();
});

function readFilePromise(file) {
    return new Promise((res, _rej) => {
        const reader = new FileReader();
        reader.addEventListener(
            "load",
            () => {
                res(reader.result);
            },
            false
        );
        if (file) {
            reader.readAsDataURL(file);
        }
    });
}

function readFiles(input) {
    return Promise.all(Array.from(input.files).map((i) => readFilePromise(i)));
}

let urls = [];

file.addEventListener("change", (e) => {
    e.preventDefault();
    readFiles(file).then((url) => {
        urls = url;
        setPreviewBuffer(url[0], "uploaded");
    });
});

readFiles(file).then((url) => {
    if (url[0]) {
        urls = url;
        setPreviewBuffer(url[0], "uploaded");
    }
});

useLastButton.addEventListener("click", (e) => {
    e.preventDefault();
    if (lasturl) {
        urls = [lasturl];
        setPreviewBuffer(lasturl, "generated");
    }
});

function updateCommandInfo() {
    let command = commands.find((c) => c.id == selector.value);
    commandIDDisplay.innerText = command.id;
    commandDescDisplay.innerText = command.desc;
    if (command.needs) {
        commandNeedsDisplay.innerText = command.needs.join(",");
        if (lasturl) {
            flaps.show(useLastButton);
        }
        flaps.show(fileInputDiv);
    } else {
        commandNeedsDisplay.innerText = "none";
        flaps.hide(fileInputDiv);
        flaps.hide(useLastButton);
    }
}

selector.addEventListener("change", (e) => {
    e.preventDefault();
    updateCommandInfo();
});

clearImageButton.addEventListener("click", (e) => {
    e.preventDefault();
    clearImage();
});

function setPreviewBuffer(buffer, type) {
    flaps.show(pasteindicator);
    flaps.show(clearImageButton);
    flaps.hide(outmsg);

    flaps.hide(pastedImage);
    flaps.hide(pastedVideo);

    if (buffer.startsWith("data:video")) {
        pastedVideo.src = buffer;
        flaps.show(pastedVideo);
        fileTypeDisplay.innerText = "video";
    } else if (buffer.startsWith("data:image")) {
        pastedImage.src = buffer;
        flaps.show(pastedImage);
        fileTypeDisplay.innerText = "image";
    }
    imageTypeDisplay.innerText = type;
}

window.addEventListener("paste", function (event) {
    let items = (event.clipboardData || event.originalEvent.clipboardData)
        .items;
    for (const item of items) {
        if (item.kind === "file") {
            let blob = item.getAsFile();
            let reader = new FileReader();
            reader.onload = function () {
                urls = [reader.result];
                setPreviewBuffer(reader.result, "pasted");
            };
            reader.readAsDataURL(blob);
        }
    }
});
