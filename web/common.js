const errorElement = document.getElementById("err");

window.flaps = {};

window.flaps.show = (el) => {
    el.style.display = "";
};
window.flaps.hide = (el) => {
    el.style.display = "none";
};

window.flaps.showError = (msg) => {
    errorElement.innerText = msg;
    window.flaps.show(errorElement);
};
window.flaps.hideError = () => {
    window.flaps.hide(errorElement);
};
