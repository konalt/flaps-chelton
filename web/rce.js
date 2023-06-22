var selector = document.getElementById("selector");
var outtxt = document.getElementById("outtxt");
var outimg = document.getElementById("outimg");
var outvid = document.getElementById("outvid");

axios.get("/api/commands").then((resp) => {
    resp.data.forEach((cmd) => {
        var opt = document.createElement("option");
        opt.value = cmd.id;
        opt.innerHTML = cmd.name;
        selector.appendChild(opt);
    });
});

function run() {
    var cmdid = selector.value;
    var args = document.getElementById("args").value;
    $(outimg).hide();
    $(outvid).hide();
    console.log(urls);
    axios
        .post("/api/runcmd", {
            id: cmdid,
            args: args,
            files: urls,
        })
        .then((resp) => {
            outtxt.innerText = resp.data.content;
            if (resp.data.buffer) {
                if (resp.data.buffer.startsWith("data:video")) {
                    outvid.src = resp.data.buffer;
                    $(outvid).show();
                } else if (resp.data.buffer.startsWith("data:image")) {
                    outimg.src = resp.data.buffer;
                    $(outimg).show();
                }
            }
        });
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
        console.log(url);
        urls = url;
    });
});

$("#loader").hide();
$("#outimg").hide();
$(outvid).hide();
