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

function readFilePromise(input) {
    return new Promise((res, rej) => {
        const file = input.files[0];
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

var inputDiv = document.getElementById("i");
var outputDiv = document.getElementById("out-container");
var ins = [];
function inputMode(mode, name = "Input" + ins.length, name2 = "...") {
    var x = ins.length;
    switch (mode) {
        case "image":
            var str = `<label for="img${x}">${name}</label><input type="file" name="img${x}" id="img${x}" accept="image/png,image/jpeg"/>`;
            inputDiv.innerHTML += str;
            break;
        case "text":
            var str = `<label for="txt${x}">${name}</label><br /><input type="text" name="txt${x}" id="txt${x}" class="wide" placeholder="${name2}" autocomplete="off" />`;
            inputDiv.innerHTML += str;
            break;

        default:
            break;
    }
    ins.push(mode);
}

var output;
function outputMode(mode) {
    switch (mode) {
        case "image":
            var str = `<img id="out" class="no-scale-out" />`;
            outputDiv.innerHTML = str;
            break;
        case "video":
            var str = `<video id="out" controls />`;
            outputDiv.innerHTML = str;
            break;

        default:
            break;
    }
    output = mode;
    $("#out").hide();
}

var effects = null;

var API_URL = "/api";

var selector = document.getElementById("selector");

function addToSelector(x, y, disabled = false) {
    var option = document.createElement("option");
    option.value = x;
    option.innerHTML = y;
    option.disabled = disabled;
    selector.appendChild(option);
}

axios
    .get(API_URL + "/suite_data")
    .then((res) => {
        effects = res.data.effects;
        Object.entries(effects).forEach((eff) => {
            addToSelector(eff[0], eff[1].name);
        });
        $(selector).change(() => {
            setEffect($(selector).val());
        });
        setEffect($(selector).val());
    })
    .catch((err) => {
        flaps.showError(err);
    });

var currentEffect = {};

function setEffect(eff) {
    if (!effects[eff]) {
        flaps.showError("No effect: " + eff);
    } else {
        inputDiv.innerHTML = "";
        ins = [];
        var e = effects[eff];
        currentEffect = e;
        e.inputs.forEach((input) => {
            inputMode(input.type, input.name, input.name2);
        });
        outputMode(e.output);
        console.log(e.name);
        $("#genbtn").removeAttr("disabled");
    }
}

$("#genbtn").attr("disabled", "disabled");

async function getData() {
    return new Promise((res, rej) => {
        var proms = [];
        currentEffect.inputs.forEach(async (i, n) => {
            switch (i.type) {
                case "image":
                    proms.push(readFilePromise($("#img" + n)[0]));
                    break;
                case "text":
                    proms.push($("#txt" + n).val());
                    break;
            }
        });
        Promise.all(proms).then((results) => {
            var d = {};
            results.forEach((x, n) => {
                d[currentEffect.inputs[n].paramname] = x;
            });
            res(d);
        });
    });
}

async function run() {
    $("#loader").show();
    $("#err").hide();
    $("#out").hide();
    $("#genbtn").attr("disabled", "disabled");
    var data = await getData();
    axios
        .post(API_URL + currentEffect.url, data, {
            responseType: "blob",
        })
        .then((res) => {
            var blob = new Blob([res.data], { type: "image/png" });
            $("#out").attr("src", URL.createObjectURL(blob));
            $("#out").show();
            $("#loader").hide();
            $("#genbtn").removeAttr("disabled");
        })
        .catch((err) => {
            console.error(err.response);
            err.response.data.text().then((t) => {
                $("#loader").hide();
                $("#genbtn").removeAttr("disabled");
                flaps.showError(t);
            });
        });
}

$("#form").submit(function (e) {
    e.preventDefault();
    run();
});

$("#img").change(function (e) {
    e.preventDefault();
    $("#loader").hide();
    $("#out").hide();
    readFile($("#img")[0], (url) => {
        imgURL = url;
    });
});

$("#loader").hide();
$("#out").hide();

var imgURL = "";

window.addEventListener("paste", function (event) {
    var items = (event.clipboardData || event.originalEvent.clipboardData)
        .items;
    for (index in items) {
        var item = items[index];
        if (item.kind === "file") {
            var blob = item.getAsFile();
            var reader = new FileReader();
            $("#loader").hide();
            $("#out").hide();
            reader.onload = function (event) {
                imgURL = event.target.result;
            };
            reader.readAsDataURL(blob);
        }
    }
});
