var selector = document.getElementById("selector");
var outtxt = document.getElementById("outtxt");
var outimg = document.getElementById("outimg");
var outvid = document.getElementById("outvid");

axios.get("/api/commands").then((resp) => {
    let sorted = resp.data.sort((a, b) => {
        if (a.name < b.name) {
            return -1;
        }
        if (a.name > b.name) {
            return 1;
        }
        return 0;
    });
    sorted.forEach((cmd) => {
        var opt = document.createElement("option");
        opt.value = cmd.id;
        opt.innerHTML = cmd.name;
        selector.appendChild(opt);
    });
    commands = sorted;
    updateCommandInfo();
});

function clearImage() {
    lasturl = "";
    urls = [];
    $("#pasteindicator").hide();
    $("#file").val("");
    $("#clearimage").hide();
}

let commands = [];

let lasturl = "";

function run() {
    $("#err").hide();
    var cmdid = selector.value;
    let command = commands.find((c) => c.id == cmdid);
    if (command.needs && !urls[0] && !command.needs[0].endsWith("?")) {
        flaps.showError("This command requires: " + command.needs.join(","));
        return;
    }
    var args = document.getElementById("args").value;
    $(outimg).hide();
    $(outvid).hide();
    $(outtxt).hide();
    $("#pasteindicator").hide();
    $("#loader").show();
    var useURL = urls;
    if (!command.needs) useURL = [];
    axios
        .post("/api/runcmd", {
            id: cmdid,
            args: args,
            files: useURL,
        })
        .then(
            (resp) => {
                $("#loader").hide();
                outtxt.innerText = resp.data.content;
                if (resp.data.content.length > 0) {
                    $(outtxt).show();
                }
                if (resp.data.buffer) {
                    if (resp.data.buffer.startsWith("data:video")) {
                        outvid.src = resp.data.buffer;
                        $(outvid).show();
                    } else if (resp.data.buffer.startsWith("data:image")) {
                        outimg.src = resp.data.buffer;
                        $(outimg).show();
                    }
                    lasturl = resp.data.buffer;
                    $("#useprevl").show();
                }
            },
            (err) => {
                $("#loader").hide();
                window.flaps.showError(err);
            }
        );
}

$("#form").submit((e) => {
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
    return new Promise((res, _rej) => {
        Promise.all(
            Array.from(input.files).map((i) => readFilePromise(i))
        ).then((out) => {
            res(out);
        });
    });
}

var urls = [];

$("#file").change(function (e) {
    e.preventDefault();
    readFiles($("#file")[0]).then((url) => {
        urls = url;
        setPreviewBuffer(url[0], "uploaded");
    });
});

readFiles($("#file")[0]).then((url) => {
    if (url[0]) {
        urls = url;
        setPreviewBuffer(url[0], "uploaded");
    }
});

$("#uselastgen").click(function (e) {
    e.preventDefault();
    if (lasturl) {
        urls = [lasturl];
        setPreviewBuffer(lasturl, "generated");
    }
});
function updateCommandInfo() {
    let command = commands.find((c) => c.id == $(selector).val());
    $("#commandid").text(command.id);
    $("#commanddesc").text(command.desc);
    if (command.needs) {
        $("#commandneeds").text(command.needs.join(","));
        $("#fileinput").show();
    } else {
        $("#commandneeds").text("none");
        $("#fileinput").hide();
    }
}
$(selector).change(function (e) {
    e.preventDefault();
    updateCommandInfo();
});

$("#loader").hide();
$("#outimg").hide();
$("#outtxt").hide();
$("#pasteindicator").hide();
$("#pastedimage").hide();
$("#pastedvideo").hide();
$("#useprevl").hide();
$(outvid).hide();

$("#clearimage").hide();
$("#clearimage").click((e) => {
    e.preventDefault();
    clearImage();
});

function setPreviewBuffer(buffer, type) {
    $("#pasteindicator").show();
    $("#clearimage").show();
    $("#outimg").hide();
    $("#outvid").hide();
    $("#outtxt").hide();
    $("#pastedimage").hide();
    $("#pastedvideo").hide();
    if (buffer.startsWith("data:video")) {
        $("#pastedvideo")[0].src = buffer;
        $("#pastedvideo").show();
        $("#filetype").text("video");
    } else if (buffer.startsWith("data:image")) {
        $("#pastedimage")[0].src = buffer;
        $("#pastedimage").show();
        $("#filetype").text("image");
    }
    $("#imgtype").text(type);
}

window.addEventListener("paste", function (event) {
    var items = (event.clipboardData || event.originalEvent.clipboardData)
        .items;
    for (index in items) {
        var item = items[index];
        if (item.kind === "file") {
            var blob = item.getAsFile();
            var reader = new FileReader();
            reader.onload = function () {
                urls = [reader.result];
                setPreviewBuffer(reader.result, "pasted");
            };
            reader.readAsDataURL(blob);
        }
    }
});
