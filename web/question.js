function question() {
    var t = $("#question").val();
    axios
        .post("https://konalt.us.to:4930/flaps_api/question", {
            question: t,
        })
        .then((res) => {
            $("#out").text(res.data);
        })
        .catch((err) => {
            console.error(err);
        });
}

$("#questionform").submit(function(e) {
    e.preventDefault();
    question();
});