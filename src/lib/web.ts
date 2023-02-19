import express, { Router } from "express";
import { existsSync } from "fs";
import { dirname, join } from "path";
import packPath from "package-json-path";
import apiRouter from "./api";

export default function initializeWebServer(): Promise<void> {
    return new Promise<void>((res) => {
        const appRoot = dirname(packPath());

        const app = express();

        let cacheRouter = Router({
            mergeParams: true,
        });

        cacheRouter.get("*", (req, res) => {
            if (existsSync(join(appRoot, "/images/cache" + req.path))) {
                res.sendFile(join(appRoot, "/images/cache" + req.path));
            } else {
                res.status(404).contentType("text/plain").send("404 Not Found");
            }
        });

        var avatarRouter = Router({
            mergeParams: true,
        });

        avatarRouter.get("*", (req, res) => {
            if (existsSync(join(appRoot, "/images/avatars" + req.path))) {
                res.sendFile(join(appRoot, "/images/avatars" + req.path));
            } else {
                res.status(404).contentType("text/plain").send("404 Not Found");
            }
        });

        app.use(express.urlencoded({ extended: true }));
        app.use(express.json({ limit: "50mb" }));
        app.use("/api", apiRouter);
        app.use("/cache", cacheRouter);
        app.use("/avatar", avatarRouter);

        app.get("/", (req, res) => {
            res.sendFile(join(appRoot, "web/index.html"));
        });
        app.get("*", (req, res) => {
            if (existsSync(join(appRoot, "web", req.path))) {
                res.sendFile(join(appRoot, "web", req.path));
            } else if (existsSync(join(appRoot, "web", req.path + ".html"))) {
                res.sendFile(join(appRoot, "web", req.path + ".html"));
            } else {
                res.status(404).contentType("text/plain").send("404 Not Found");
            }
        });

        app.listen(process.env.WEB_PORT || 8080, () => {
            res();
        });
    });
}
