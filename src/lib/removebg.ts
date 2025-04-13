import { bufferToDataURL } from "./utils";

export default async function removeBackground(img: Buffer) {
    let url = bufferToDataURL(img, "image/png");
    let response = await fetch(
        `http://localhost:${process.env.REMOVEBG_SERVER_PORT}/`,
        {
            method: "POST",
            body: JSON.stringify({
                image: url,
            }),
            headers: {
                "Content-Type": "application/json",
            },
        }
    ).then((r) => r.arrayBuffer());
    return Buffer.from(response);
}
