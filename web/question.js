function question() {
    var t = $("#question").val();
    axios
        .post("https://flaps.us.to/api/question", {
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
