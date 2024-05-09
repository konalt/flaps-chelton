import express, { Router } from "express";
import { existsSync, readdirSync, mkdirSync } from "fs";
import { readFile, writeFile } from "fs/promises";
import { dirname, join } from "path";
import packPath from "package-json-path";
import apiRouter from "./api";
import createNormalizedAvatar from "./ffmpeg/createNormalizedAvatar";
import { Color, log, esc } from "./logger";

export default function initializeWebServer(): Promise<void> {
    return new Promise<void>(async (res) => {
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

        let imgRouter = Router({
            mergeParams: true,
        });

        imgRouter.get("*", (req, res) => {
            if (existsSync(join(appRoot, "/images/perma" + req.path))) {
                res.sendFile(join(appRoot, "/images/perma" + req.path));
            } else {
                res.status(404).contentType("text/plain").send("404 Not Found");
            }
        });

        var avatarRouter = Router({
            mergeParams: true,
        });

        let avatars = {};
        let p: Promise<Buffer>[] = [];
        if (!existsSync(join(appRoot, "/images/avatars/transcoded"))) {
            mkdirSync(join(appRoot, "/images/avatars/transcoded"));
        }
        for (const file of readdirSync(join(appRoot, "/images/avatars"))) {
            if (!file.endsWith("png")) continue;
            let id = file.split(".")[0];
            let filename = id + ".webp";
            if (
                existsSync(
                    join(appRoot, "/images/avatars/transcoded", filename)
                )
            ) {
                avatars[id] = await readFile(
                    join(appRoot, "/images/avatars/transcoded", filename)
                );
                continue;
            }
            log(
                `Transcoding avatar ${esc(Color.BrightCyan)}${file} ${esc(
                    Color.White
                )}to WebP...`,
                "avatar"
            );
            let prom = new Promise<Buffer>(async (res, rej) => {
                let original = await readFile(
                    join(appRoot, "/images/avatars", file)
                );
                let normalized = await createNormalizedAvatar(original);
                avatars[id] = normalized;
                await writeFile(
                    join(appRoot, "/images/avatars/transcoded", filename),
                    normalized
                );
                log(
                    `Transcoded avatar ${esc(Color.BrightCyan)}${file} ${esc(
                        Color.White
                    )}to WebP.`,
                    "avatar"
                );
                res(normalized);
            });
            p.push(prom);
        }
        await Promise.all(p);

        avatarRouter.get("*", (req, res) => {
            let id = req.path.split("/")[1].split(".")[0];
            if (avatars[id]) {
                res.contentType("webp").send(avatars[id]);
            } else {
                res.status(404).contentType("txt").send("404 Not Found");
            }
        });

        app.use((req, res, next) => {
            res.set("Access-Control-Allow-Origin", "*");
            res.set("Access-Control-Allow-Headers", "*");
            res.set("Server", "FlapsChelton");
            res.set("Connection", "Keep-Alive");
            next();
        });

        app.use(express.urlencoded({ extended: true }));
        app.use(express.json({ limit: "50mb" }));
        app.use("/api", apiRouter);
        app.use("/img", imgRouter);
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
