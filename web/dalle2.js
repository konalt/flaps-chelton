function dalle2() {
    var t = $("#prompt").val();
    $("#loader").show();
    $("#out").hide();
    axios
        .post(
            "https://konalt.us.to:4930/flaps_api/dalle2", {
                prompt: t,
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
            document.write(err);
        });
}

$("#dalle2form").submit(function(e) {
    e.preventDefault();
    dalle2();
});

$("#out").hide();
$("#loader").hide();