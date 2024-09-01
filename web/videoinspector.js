function readFile(input, cb) {
    const file = input.files[0];
    const reader = new FileReader();
    reader.addEventListener(
        "load",
        () => {
            cb(reader.result);
        },
        false
    );
    if (file) {
        reader.readAsDataURL(file);
    }
}

$("#file").change((e) => {
    e.preventDefault();
    readFile($("#file")[0], (url) => {
        $("#v")[0].src = url;
        $("#vui").show();
        $("#ui").hide();
    });
});

let sx = 0;
let sy = 0;
let sf = 0;

$("#v")[0].addEventListener("mousemove", (e) => {
    let w = $("#vw").val();
    let h = $("#vh").val();
    let fps = $("#vfps").val();
    let cr = $("#v")[0].getBoundingClientRect();
    let x = (e.offsetX / cr.width) * w;
    let y = (e.offsetY / cr.height) * h;
    let frame = $("#v")[0].currentTime * fps;
    sx = x;
    sy = y;
    sf = frame;
    $("#pos").text(`${Math.floor(sf)} ${Math.round(sx)} ${Math.round(sy)}`);
});

document.addEventListener("keydown", (e) => {
    let fps = $("#vfps").val();
    if (e.code == "KeyQ") {
        $("#v")[0].currentTime = $("#v")[0].currentTime - 1 / fps;
    }
    if (e.code == "KeyW") {
        $("#v")[0].currentTime = $("#v")[0].currentTime + 1 / fps;
    }
    sf = $("#v")[0].currentTime * fps;
    $("#pos").text(`${Math.floor(sf)} ${Math.round(sx)} ${Math.round(sy)}`);
});
