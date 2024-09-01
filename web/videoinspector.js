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

$("#v")[0].addEventListener("mousemove", (e) => {
    let w = $("#vw").val();
    let h = $("#vh").val();
    let fps = $("#vfps").val();
    let cr = $("#v")[0].getBoundingClientRect();
    let x = (e.offsetX / cr.width) * w;
    let y = (e.offsetY / cr.height) * h;
    let frame = $("#v")[0].currentTime * fps;
    $("#pos").text(`${Math.floor(frame)} ${Math.round(x)} ${Math.round(y)}`);
});
