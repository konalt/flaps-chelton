function t(datetime) {
    if (datetime == "N/A") return "N/A";
    var date = new Date(datetime);
    return `${date.getHours().toString().padStart(2, "0")}:${date
        .getMinutes()
        .toString()
        .padStart(2, "0")}:${date.getSeconds().toString().padStart(2, "0")}`;
}

var chart = new Chart("chart", {
    type: "line",
    data: {
        labels: ["Loading..."],
        datasets: [{
            data: [0],
            borderColor: "black",
            fill: true,
        }, ],
    },
    options: {
        animation: {
            duration: 0,
        },
        scales: {
            yAxes: [{
                display: true,
                ticks: {
                    suggestedMin: 0,
                    suggestedMax: 100,
                },
            }, ],
        },
        legend: {
            display: false,
        },
    },
});

function update(data) {
    chart.data = {
        labels: data.map((x) => t(x[1])),
        datasets: [{
                data: data.map((x) => x[0]),
                borderColor: "red",
                fill: false,
            },
            {
                data: data.map((x) => x[2]),
                borderColor: "blue",
                fill: false,
            },
        ],
    };
    chart.update();
}

function time(t) {
    if (t == "N/A") return "N/A";
    return new Date(t).toISOString().slice(11, 19);
}

setInterval(() => {
    axios
        .get("https://konalt.us.to:4930/flaps_api/analytics")
        .then((res) => {
            $("#uptime").text(time(res.data.uptime));
            update(
                res.data.stats.map((x) => [
                    Math.floor(x.cpu * 100),
                    x.time,
                    Math.floor(x.mem * 1000),
                ])
            );
        })
        .catch((err) => {
            console.error(err);
        });
}, 1000);