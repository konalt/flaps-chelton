const outImage = document.getElementById("out");
const promptInput = document.getElementById("prompt");
const loader = document.getElementById("loader");
const form = document.getElementById("dalle2form");

function dalle2() {
    var t = promptInput.value;
    flaps.show(loader);
    flaps.hideError();
    flaps.hide(outImage);
    fetch("/api/dalle2", {
        method: "POST",
        body: JSON.stringify({
            prompt: t,
        }),
        headers: {
            "Content-Type": "application/json",
        },
    })
        .then((resp) => resp.blob())
        .then((blob) => {
            outImage.src = URL.createObjectURL(blob);
            flaps.show(outImage);
            flaps.hide(loader);
        })
        .catch((e) => {
            flaps.hide(loader);
            flaps.showError(e);
        });
}

form.addEventListener("submit", (e) => {
    e.preventDefault();
    dalle2();
});
