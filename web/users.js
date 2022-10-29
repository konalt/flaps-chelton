var selector = document.getElementById("userid");

function addToSelector(x, disabled = false) {
    var option = document.createElement("option");
    option.value = x;
    option.innerHTML = x;
    option.disabled = disabled;
    selector.appendChild(option);
}

function getUser(id) {
    return users.find((x) => x.id == id);
}

function update(id) {
    var user = getUser(id);
    if (!user) {
        flaps.showError("Error: No user with id " + id);
    } else {
        $("#userinfo").show();
        $("#useravatar").attr("src", user.avatar);
        $("#username").text(user.username);
        $("#hasquirk").text(user.hasQuirk ? "Yes" : "No");
    }
}

var users = [];

axios
    .get("https://konalt.us.to:4930/flaps_api/all_users")
    .then((res) => {
        addToSelector("<i>&lt;Choose one&gt;</i>", true);
        Object.entries(res.data)
            .sort((a, b) => a[0].localeCompare(b[0]))
            .forEach((x) => {
                var data = {
                    id: x[0],
                    username: x[1][0],
                    avatar: x[1][1],
                    quirk: x[1][2] ?
                        eval(x[1][2]) :
                        (x) => {
                            return x;
                        },
                    hasQuirk: !!x[1][2],
                };
                addToSelector(data.id);
                users.push(data);
            });
        $(selector).change(() => {
            update($(selector).val());
        });
        update($(selector).val());
    })
    .catch((err) => {
        flaps.showError(err);
    });