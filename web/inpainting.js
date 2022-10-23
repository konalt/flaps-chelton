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
    readFile($("#img")[0], (imgURL) => {
        readFile($("#mask")[0], (maskURL) => {
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
    });
}

$("#dalle2form").submit(function(e) {
    e.preventDefault();
    dalle2();
});

$("#out").hide();
$("#loader").hide();