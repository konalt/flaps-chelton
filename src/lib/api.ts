import { Router } from "express";
import stablediffusion from "./ai/stablediffusion";

const router = Router({
    mergeParams: true,
});

router.post("/dalle2", (req, res) => {
    stablediffusion({
        prompt: req.body.prompt,
    }).then((buf) => {
        res.contentType("image/png").send(buf);
    });
});

export default router;
