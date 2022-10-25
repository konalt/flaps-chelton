function dalle2() {
    var t = $("#prompt").val();
    $("#loader").show();
    $("#err").hide();
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
            console.error(err.response);
            err.response.data.text().then((t) => {
                $("#loader").hide();
                $("#err").text(t);
                $("#err").show();
            });
        });
}

$("#dalle2form").submit(function(e) {
    e.preventDefault();
    dalle2();
});

$("#err").hide();
$("#out").hide();
$("#loader").hide();