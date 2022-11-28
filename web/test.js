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

function run() {
    $("#loader").show();
    $("#err").hide();
    $("#out").hide();
    $("#genbtn").attr("disabled", "disabled");
    axios
        .post(
            "https://flaps.us.to/api/canvas/watermark",
            {
                file: imgURL,
            },
            {
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
            console.error(err.response);
            err.response.data.text().then((t) => {
                $("#loader").hide();
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
