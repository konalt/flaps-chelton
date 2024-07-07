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

let curl = "";

$("#img").change(function (e) {
    e.preventDefault();
    readFile($("#img")[0], (url) => {
        curl = url;
    });
});

$("#depthform").submit(function (e) {
    e.preventDefault();
    $("#out").hide();
    $("#loader").show();
    axios
        .post(
            "/api/depth",
            {
                img: curl,
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
});

$("#loader").hide();
$("#out").hide();
