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

function loadImage(url, cb) {
    var img = new Image();
    img.onload = () => {
        cb(img);
    };
    img.src = url;
}

$("#img").change(function (e) {
    e.preventDefault();
    readFile($("#img")[0], (url) => {
        canvasInit(url);
    });
});

$("#out").hide();
$("#maker").hide();

function canvasInit(url) {
    var canvas = document.getElementById("maker");
    /**
     * @type {CanvasRenderingContext2D} ctx
     */
    var ctx = canvas.getContext("2d");
    loadImage(url, (img) => {
        ctx.drawImage(img, 0, 0, 512, 512);
        var isMouseHeld = false;
        var x = 0;
        var y = 0;

        function circClear(x, y, r) {
            ctx.globalCompositeOperation = "destination-out";
            ctx.fillStyle = "black";
            ctx.beginPath();
            ctx.arc(x, y, r, 0, 2 * Math.PI);
            ctx.fill();
        }

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
            ctx.putImageData(imageData, 0, 0);
        }

        canvas.addEventListener(
            "mousedown",
            (e) => ((isMouseHeld = true), (x = e.offsetX), (y = e.offsetY))
        );
        canvas.addEventListener(
            "mouseup",
            (e) => ((isMouseHeld = false), (x = e.offsetX), (y = e.offsetY))
        );
        canvas.addEventListener(
            "mousemove",
            (e) => ((x = e.offsetX), (y = e.offsetY))
        );
        document.addEventListener("keydown", (e) => imgToMask());

        function update() {
            if (isMouseHeld) circClear(x, y, 32);
            requestAnimationFrame(update);
        }
        update();
        $("#maker").show();
        $("#btn").show();
        $("#btn").click(function (e) {
            e.preventDefault();
            imgToMask();
            saveMask();
        });
    });
}
