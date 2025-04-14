import express from "express";
import { removeBackground } from "@imgly/background-removal-node";

let app = express();

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));

app.post("/", async (req, res) => {
    let url = req.body.image;
    let buffered = Buffer.from(url.split(",")[1], "base64");
    let blob = new Blob([buffered], {
        type: "image/png",
    });
    let removed = await removeBackground(blob, {
        output: {
            format: "image/png",
        },
    });
    res.contentType("png").send(Buffer.from(await removed.arrayBuffer()));
});

app.listen(process.env.REMOVEBG_SERVER_PORT);
