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

let commands = [];

let lasturl = "";

function run() {
    var cmdid = selector.value;
    var args = document.getElementById("args").value;
    $(outimg).hide();
    $(outvid).hide();
    $(outtxt).hide();
    $("#loader").show();
    var useURL = urls;
    if ($("#useprev").is(":checked") && lasturl.length > 0) {
        useURL = [lasturl];
    }
    let command = commands.find((c) => c.id == cmdid);
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
    });
});

readFiles($("#file")[0]).then((url) => {
    urls = url;
});

$("#useprev").change(function (e) {
    e.preventDefault();
    if ($("#useprev").is(":checked")) {
        $("#file").hide();
    } else {
        $("#file").show();
    }
});
function updateCommandInfo() {
    let command = commands.find((c) => c.id == $(selector).val());
    $("#commandid").text(command.id);
    $("#commanddesc").text(command.desc);
    if (command.needs) {
        $("#commandneeds").text(command.needs.join(","));
    } else {
        $("#commandneeds").text("none");
    }
}
$(selector).change(function (e) {
    e.preventDefault();
    updateCommandInfo();
});

$("#loader").hide();
$("#outimg").hide();
$("#outtxt").hide();
$("#useprevl").hide();
$(outvid).hide();
