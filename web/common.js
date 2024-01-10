$("#err").hide();

window.flaps = {};

window.flaps.showError = (msg) => {
    $("#err").text(msg.toString());
    $("#err").show();
};
