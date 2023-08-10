function question() {
    var t = $("#question").val();
    axios
        .post("/api/question", {
            question: t,
        })
        .then((res) => {
            $("#out").text(res.data);
        })
        .catch((err) => {
            console.error(err);
        });
}

$("#questionform").submit(function (e) {
    e.preventDefault();
    question();
});
