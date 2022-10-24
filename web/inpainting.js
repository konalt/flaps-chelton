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

function dalle2() {
    var t = $("#prompt").val();
    $("#loader").show();
    $("#out").hide();
    $("canvas.maker").hide();
    $("#genbtn").attr("disabled", "disabled");
    imgToMask();
    var maskURL = canvas2.toDataURL("image/png");
    readFile($("#img")[0], (imgURL) => {
        axios
            .post(
                "https://konalt.us.to:4930/flaps_api/inpaint", {
                    prompt: t,
                    img: imgURL,
                    mask: maskURL,
                }, {
                    responseType: "blob",
                }
            )
            .then((res) => {
                var blob = new Blob([res.data], { type: "image/png" });
                $("#out").attr("src", URL.createObjectURL(blob));
                $("#out").show();
                $("#loader").hide();
            })
            .catch((err) => {
                console.error(err);
                //document.write(err);
            });
    });
}

$("#genbtn").attr("disabled", "disabled");

$("#dalle2form").submit(function(e) {
    e.preventDefault();
    dalle2();
});

function loadImage(url, cb) {
    var img = new Image();
    img.onload = () => {
        cb(img);
    };
    img.src = url;
}

$("#img").change(function(e) {
    e.preventDefault();
    $("#loader").hide();
    $("#out").hide();
    $("canvas.maker").hide();
    readFile($("#img")[0], (url) => {
        canvasInit(url);
    });
});

$("#loader").hide();
$("#out").hide();
$("canvas.maker").hide();
$("#maker2").hide();

var canvas = document.getElementById("maker");
/**
 * @type {CanvasRenderingContext2D} ctx
 */
var ctx = canvas.getContext("2d");

var canvas2 = document.getElementById("maker2");
/**
 * @type {CanvasRenderingContext2D} ctx
 */
var ctx2 = canvas2.getContext("2d");

var canvas3 = document.getElementById("maker3");
/**
 * @type {CanvasRenderingContext2D} ctx
 */
var ctx3 = canvas3.getContext("2d");

function circClear(x, y, r) {
    ctx.globalCompositeOperation = "destination-out";
    ctx.fillStyle = "black";
    ctx.beginPath();
    ctx.arc(x, y, r, 0, 2 * Math.PI);
    ctx.fill();
    ctx.globalCompositeOperation = "source-over";
}

function circ(x, y, r) {
    ctx3.beginPath();
    ctx3.arc(x, y, r, 0, 2 * Math.PI);
    ctx3.strokeStyle = "black";
    ctx3.lineWidth = 3;
    ctx3.stroke();
    ctx3.strokeStyle = "white";
    ctx3.lineWidth = 1;
    ctx3.stroke();
}
var isMouseHeld = false;
var x = 0;
var y = 0;

canvas.addEventListener(
    "mousedown",
    (e) => ((isMouseHeld = true), (x = e.offsetX), (y = e.offsetY))
);
canvas.addEventListener(
    "mouseup",
    (e) => ((isMouseHeld = false), (x = e.offsetX), (y = e.offsetY))
);
document.addEventListener("mouseup", (e) => (isMouseHeld = false));
canvas.addEventListener("mousemove", (e) => ((x = e.offsetX), (y = e.offsetY)));

function update() {
    if (isMouseHeld) circClear(x, y, 32);
    ctx3.clearRect(0, 0, 512, 512);
    circ(x, y, 32);
    requestAnimationFrame(update);
}
update();

function imgToMask() {
    var imageData = ctx.getImageData(0, 0, 512, 512);
    var d = imageData.data;
    for (var i = 0; i < d.length; i += 4) {
        var pix = [d[i], d[i + 1], d[i + 2], d[i + 3]];
        pix[0] = 255;
        pix[1] = 255;
        pix[2] = 255;
        [d[i], d[i + 1], d[i + 2], d[i + 3]] = pix;
    }
    ctx2.putImageData(imageData, 0, 0);
}

function canvasInit(url) {
    loadImage(url, (img) => {
        ctx.drawImage(img, 0, 0, 512, 512);

        $("canvas.maker").show();
        $("#genbtn").removeAttr("disabled");
    });
}