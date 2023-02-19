import { Router } from "express";
import { StableDiffusionOptions } from "../types";
import stablediffusion from "./ai/stablediffusion";

const router = Router({
    mergeParams: true,
});

router.post("/dalle2", (req, res) => {
    stablediffusion({
        prompt: req.body.prompt,
    })
        .then((buf) => {
            res.contentType("image/png").send(buf);
        })
        .catch((err) => {
            res.status(500).contentType("text/plain").send(err);
        });
});

router.post("/inpaint", (req, res) => {
    let obj = { ...req.body };
    Object.assign(obj, { inpaint: true });
    stablediffusion(obj as StableDiffusionOptions, req.body.single || false)
        .then((buf) => {
            res.contentType("image/png").send(buf);
        })
        .catch((err) => {
            res.status(500).contentType("text/plain").send(err);
        });
});

export default router;
