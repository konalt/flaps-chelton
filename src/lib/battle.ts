import { ButtonBuilder, ButtonStyle, User } from "discord.js";
import {
    Battle,
    BattleAction,
    BattleAttack,
    BattleMenuState,
    BattleWaitingType,
} from "../types";
import { encodeObject, hexToRGB, uuidv4 } from "./utils";
import { Image, createCanvas, createImageData, loadImage } from "canvas";
import { file } from "./ffmpeg/ffmpeg";

const attacks: BattleAttack[] = [
    {
        name: "Hypnosis",
        description: "Makes the enemy tired. Decreases defense.",
        cost: 8,
        damage: 0,
        selfAttackBuff: 0,
        selfDefenseBuff: 0,
        enemyDefenseDamage: 3,
        enemyAttackDamage: 0,
    },
    {
        name: "Scrape",
        description: "Lightly scratches the enemy.",
        cost: 5,
        damage: 10,
        selfAttackBuff: 0,
        selfDefenseBuff: 0,
        enemyDefenseDamage: 0,
        enemyAttackDamage: 0,
    },
];

export function createBattle(player: User): Battle {
    let id = uuidv4();
    let battle = {
        id,
        mns: BattleMenuState.Main,
        wt: BattleWaitingType.None,
        pid: player.id,
        slf: {
            nm: "Peter",
            hp: 32,
            mhp: 32,
            df: 8,
            mdf: 8,
            at: 12,
            mat: 12,
            fm: Math.random() > 0.5,
            lv: Math.floor(Math.random() * 10) + 10,
            en: 20,
        },
        enm: {
            nm: "Jenny",
            hp: 32,
            mhp: 32,
            df: 8,
            mdf: 8,
            at: 12,
            mat: 12,
            fm: Math.random() > 0.5,
            lv: Math.floor(Math.random() * 10) + 10,
            en: 20,
        },
        lai: {
            adr: 0,
            ddr: 0,
            at: attacks[0],
            dmg: 0,
        },
        so: BattleAction.Option1,
    } satisfies Battle;
    return battle;
}

export function getAttackFromAction(action: BattleAction) {
    let index = 0;
    switch (action) {
        case BattleAction.Option1:
            index = 0;
            break;
        case BattleAction.Option2:
            index = 1;
            break;
        case BattleAction.Option3:
            index = 2;
            break;
        case BattleAction.Option4:
            index = 3;
            break;
    }
    let at = attacks[index];
    return at;
}

export function handleBattleAttack(battle: Battle, attackAction: BattleAction) {
    let at = getAttackFromAction(attackAction);
    if (battle.slf.en < at.cost)
        return {
            success: false,
            damageDealt: 0,
            defenseDropped: 0,
            attackDropped: 0,
            defenseBuffed: 0,
            attackBuffed: 0,
            attack: at,
        };
    battle.slf.en -= at.cost;
    battle.enm.df -= at.enemyDefenseDamage;
    battle.enm.at -= at.enemyAttackDamage;
    let dmg = Math.round(
        at.damage * (1 - (battle.enm.df / battle.enm.mdf) * 0.5)
    );
    battle.enm.hp -= dmg;
    battle.slf.df += at.selfDefenseBuff;
    battle.slf.at += at.selfAttackBuff;
    return {
        success: true,
        damageDealt: dmg,
        defenseDropped: at.enemyDefenseDamage,
        attackDropped: at.enemyAttackDamage,
        defenseBuffed: at.selfDefenseBuff,
        attackBuffed: at.selfAttackBuff,
        attack: at,
    };
}

export function handleBattleAction(battle: Battle, action: BattleAction) {
    switch (battle.mns) {
        case BattleMenuState.Main:
            switch (action) {
                case BattleAction.Fight:
                    battle.mns = BattleMenuState.ChooseAttack;
                    return battle;
                case BattleAction.Item:
                    battle.mns = BattleMenuState.ChooseItem;
                    return battle;
                case BattleAction.Run:
                    battle.mns = BattleMenuState.RunConfirm;
                    return battle;
            }
            return battle;
        case BattleMenuState.ChooseAttack:
            switch (action) {
                case BattleAction.Option1:
                case BattleAction.Option2:
                case BattleAction.Option3:
                case BattleAction.Option4:
                    battle.so = action;
                    battle.mns = BattleMenuState.AttackConfirm;
                    return battle;
                case BattleAction.Back:
                    battle.mns = BattleMenuState.Main;
                    return battle;
            }
            return battle;
        case BattleMenuState.ChooseItem:
            switch (action) {
                case BattleAction.Back:
                    battle.mns = BattleMenuState.Main;
                    return battle;
            }
            return battle;
        case BattleMenuState.RunConfirm:
            switch (action) {
                case BattleAction.Yes:
                    battle.mns = BattleMenuState.Waiting;
                    battle.wt = BattleWaitingType.Flee;
                    return battle;
                case BattleAction.Back:
                case BattleAction.No:
                    battle.mns = BattleMenuState.Main;
                    return battle;
            }
        case BattleMenuState.AttackConfirm:
            switch (action) {
                case BattleAction.Yes:
                    let attack = handleBattleAttack(battle, battle.so);
                    battle.mns = BattleMenuState.Waiting;
                    battle.wt = BattleWaitingType.PostAttackInfo;
                    battle.lai = {
                        adr: attack.attackDropped,
                        ddr: attack.defenseDropped,
                        dmg: attack.damageDealt,
                        at: attack.attack,
                    };
                    return battle;
                case BattleAction.Back:
                case BattleAction.No:
                    battle.mns = BattleMenuState.ChooseAttack;
                    return battle;
            }
        case BattleMenuState.Waiting:
            switch (battle.wt) {
                case BattleWaitingType.PostAttackInfo:
                    battle.wt = BattleWaitingType.PostEnemyAttackInfo;
                    return battle;
                case BattleWaitingType.PostEnemyAttackInfo:
                    battle.mns = BattleMenuState.Main;
                    return battle;
            }
    }
    return battle;
}

export function battleActionButton(
    action: BattleAction,
    label: string,
    style: ButtonStyle,
    emoji: string = "",
    enabled: boolean = true
) {
    let actionstr = getBattleActionString(action);
    let btn = new ButtonBuilder()
        .setCustomId(`battle-${actionstr}`)
        .setLabel(label)
        .setStyle(style)
        .setDisabled(!enabled);
    if (emoji.length > 0) btn.setEmoji(emoji);
    return btn;
}

export function getComponents(battle: Battle) {
    let b = battleActionButton;
    switch (battle.mns) {
        case BattleMenuState.Main:
            return [
                b(BattleAction.Fight, "Fight!", ButtonStyle.Primary),
                b(BattleAction.Item, "Item", ButtonStyle.Secondary),
                b(BattleAction.Run, "Run", ButtonStyle.Danger),
            ];
        case BattleMenuState.ChooseAttack:
            return [
                b(BattleAction.Back, "Back", ButtonStyle.Secondary, "👈"),
                b(BattleAction.Option1, attacks[0].name, ButtonStyle.Primary),
                b(BattleAction.Option2, attacks[1].name, ButtonStyle.Primary),
                b(BattleAction.Option3, attacks[0].name, ButtonStyle.Primary),
                b(BattleAction.Option4, attacks[0].name, ButtonStyle.Primary),
            ];
        case BattleMenuState.ChooseItem:
            return [
                b(BattleAction.Back, "Back", ButtonStyle.Secondary, "👈"),
                b(BattleAction.Option1, "Shield Potion", ButtonStyle.Primary),
                b(BattleAction.Option2, "Steroids", ButtonStyle.Primary),
                b(BattleAction.Option3, "touhou copy", ButtonStyle.Primary),
                b(BattleAction.Option4, "jar of piss", ButtonStyle.Primary),
            ];
        case BattleMenuState.RunConfirm:
            return [
                b(BattleAction.Back, "Back", ButtonStyle.Secondary, "👈"),
                b(BattleAction.Yes, "I'm sure", ButtonStyle.Danger),
            ];
        case BattleMenuState.AttackConfirm:
            return [
                b(BattleAction.Back, "Back", ButtonStyle.Secondary, "👈"),
                b(BattleAction.Yes, "Attack!", ButtonStyle.Primary),
            ];
        case BattleMenuState.Waiting:
            switch (battle.wt) {
                case BattleWaitingType.PostAttackInfo:
                case BattleWaitingType.PostEnemyAttackInfo:
                    return [
                        b(BattleAction.Yes, "Next", ButtonStyle.Primary, "👉"),
                    ];
                case BattleWaitingType.Flee:
                    return [
                        b(
                            BattleAction.No,
                            "Escaped...",
                            ButtonStyle.Secondary,
                            "🏃",
                            false
                        ),
                    ];
            }
    }
    return [
        b(
            BattleAction.Back,
            "You reached an invalid state. Go back?",
            ButtonStyle.Secondary,
            "👈"
        ),
    ];
}

async function makeSilhouette(image: Image) {
    const canvas = createCanvas(image.width, image.height);
    const ctx = canvas.getContext("2d");
    ctx.translate(image.width / 2, image.height / 2);
    ctx.scale(-1, 1);
    ctx.translate(-image.width / 2, -image.height / 2);
    ctx.drawImage(image, 0, 0);
    const imageData = ctx.getImageData(0, 0, image.width, image.height);
    for (let i = 0; i < imageData.data.length; i += 4) {
        imageData.data[i] = imageData.data[i + 1] = imageData.data[i + 2] = 0;
        if (imageData.data[i + 3] > 0) imageData.data[i + 3] = 255;
    }
    ctx.putImageData(imageData, 0, 0);
    return await loadImage(canvas.toBuffer());
}

export function getBattleText(battle: Battle) {
    switch (battle.mns) {
        case BattleMenuState.Main:
            return `${battle.enm.nm} attacks!\nWhat will you do?`;
        case BattleMenuState.ChooseAttack:
            return `Choose an attack.`;
        case BattleMenuState.ChooseItem:
            return `Choose an item to use.`;
        case BattleMenuState.RunConfirm:
            return `Are you sure you want to flee?`;
        case BattleMenuState.AttackConfirm:
            let attack = getAttackFromAction(battle.so);
            return `${attack.name} - ${attack.cost} energy\n${attack.description}`;
        case BattleMenuState.Waiting:
            switch (battle.wt) {
                case BattleWaitingType.PostAttackInfo:
                    let tx = `${battle.slf.nm} used ${battle.lai.at.name}!\n`;
                    if (battle.lai.dmg > 0)
                        tx += `It dealt ${battle.lai.dmg} damage!`;
                    if (battle.lai.ddr > 0)
                        tx += `${battle.enm.nm}'s DEFENSE dropped to ${battle.enm.df}!`;
                    if (battle.lai.adr > 0)
                        tx += `${battle.enm.nm}'s ATTACK dropped to ${battle.enm.at}!`;
                    return tx;
                case BattleWaitingType.PostEnemyAttackInfo:
                    let at =
                        attacks[Math.floor(Math.random() * attacks.length)];
                    battle.enm.en -= at.cost;
                    battle.slf.df -= at.enemyDefenseDamage;
                    battle.slf.at -= at.enemyAttackDamage;
                    let dmg = Math.round(
                        at.damage * (1 - (battle.slf.df / battle.slf.mdf) * 0.5)
                    );
                    battle.slf.hp -= dmg;
                    battle.enm.df += at.selfDefenseBuff;
                    battle.enm.at += at.selfAttackBuff;
                    battle.lai = {
                        at,
                        dmg: dmg,
                        adr: at.enemyAttackDamage,
                        ddr: at.enemyDefenseDamage,
                    };
                    let etx = `${battle.enm.nm} used ${battle.lai.at.name}!\n`;
                    if (battle.lai.dmg > 0)
                        etx += `It dealt ${battle.lai.dmg} damage!`;
                    if (battle.lai.ddr > 0)
                        etx += `${battle.slf.nm}'s DEFENSE dropped to ${battle.slf.df}!`;
                    if (battle.lai.adr > 0)
                        etx += `${battle.slf.nm}'s ATTACK dropped to ${battle.slf.at}!`;
                    return etx;
                case BattleWaitingType.Flee:
                    return `You escaped the notoriously dangerous\n${battle.enm.nm}.`;
            }
    }
}

function forEachPixel(
    imageData: ImageData,
    callback: (pixel: { r: number; g: number; b: number; a: number }) => {
        r: number;
        g: number;
        b: number;
        a: number;
    }
) {
    let data = [];
    for (let i = 0; i < imageData.data.length; i += 4) {
        let pix = {
            r: imageData.data[i],
            g: imageData.data[i + 1],
            b: imageData.data[i + 2],
            a: imageData.data[i + 3],
        };
        let newpix = callback(pix);
        if (!newpix) newpix = pix;
        data[i] = newpix.r;
        data[i + 1] = newpix.g;
        data[i + 2] = newpix.b;
        data[i + 3] = newpix.a;
    }
    return createImageData(
        new Uint8ClampedArray(data),
        imageData.width,
        imageData.height
    );
}

export async function imageDataToImage(imageData: ImageData) {
    const canvas = createCanvas(imageData.width, imageData.height);
    const ctx = canvas.getContext("2d");
    ctx.putImageData(imageData, 0, 0);
    return await loadImage(canvas.toBuffer());
}

export async function createCreatureImage(color: string) {
    const [base, highlights, shadows] = await Promise.all(
        ["base", "highlights", "shadows"].map((s) =>
            loadImage(file(`battle/creature-${s}.png`))
        )
    );
    const [w, h] = [base.width, base.height];
    const canvas = createCanvas(w, h);
    const ctx = canvas.getContext("2d");
    const [r, g, b] = hexToRGB(color);

    ctx.drawImage(base, 0, 0);
    const baseImageData = ctx.getImageData(0, 0, w, h);
    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(highlights, 0, 0);
    const highlightsImageData = ctx.getImageData(0, 0, w, h);
    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(shadows, 0, 0);
    const shadowsImageData = ctx.getImageData(0, 0, w, h);
    ctx.clearRect(0, 0, w, h);

    const newBaseP = imageDataToImage(
        forEachPixel(baseImageData, (pixel) => {
            if (pixel.r == 255 && pixel.g == 0 && pixel.b == 0)
                return { r: 0, g: 0, b: 0, a: pixel.a };
            if (pixel.r == 0 && pixel.g == 255 && pixel.b == 255)
                return { r, g, b, a: pixel.a };
            if (pixel.r == 0 && pixel.g == 255 && pixel.b == 0)
                return { r: 255, g: 255, b: 255, a: pixel.a };
        })
    );
    const newHighlightsP = imageDataToImage(
        forEachPixel(highlightsImageData, (pixel) => {
            if (pixel.r == 255 && pixel.g == 0 && pixel.b == 255)
                return { r: 255, g: 255, b: 255, a: 100 };
            if (pixel.r == 0 && pixel.g == 0 && pixel.b == 255)
                return { r: 128, g: 128, b: 128, a: 50 };
        })
    );
    const newShadowsP = imageDataToImage(
        forEachPixel(shadowsImageData, (pixel) => {
            if (pixel.r == 255 && pixel.g == 255 && pixel.b == 0)
                return { r: 0, g: 0, b: 0, a: 128 };
        })
    );
    const [newBase, newHighlights, newShadows] = await Promise.all([
        newBaseP,
        newHighlightsP,
        newShadowsP,
    ]);

    ctx.drawImage(newBase, 0, 0);
    ctx.drawImage(newHighlights, 0, 0);
    ctx.drawImage(newShadows, 0, 0);

    return canvas.toBuffer();
}

export async function getBattleImage(battle: Battle) {
    const [w, h] = [800, 600];
    const canvas = createCanvas(w, h);
    const ctx = canvas.getContext("2d");

    const creatureImage = await loadImage(await createCreatureImage("#ed74e7"));
    const creatureSilhouetteImage = await makeSilhouette(creatureImage);

    function img(image: Image, x: number, y: number, scale: number) {
        ctx.drawImage(
            image,
            x - (image.width * scale) / 2,
            y - (image.height * scale) / 2,
            image.width * scale,
            image.height * scale
        );
    }

    ctx.imageSmoothingEnabled = false;

    let backgroundGradient = ctx.createLinearGradient(0, 0, 0, h);
    backgroundGradient.addColorStop(0, "#00a1ff");
    backgroundGradient.addColorStop(0.12, "#22a1bb");
    backgroundGradient.addColorStop(0.3, "#898d8e");
    backgroundGradient.addColorStop(0.38, "#e3e3e3");
    backgroundGradient.addColorStop(1, "#ffffff");
    ctx.fillStyle = backgroundGradient;
    ctx.fillRect(0, 0, w, h);

    img(creatureImage, 600, 250, 6);
    if (battle.wt !== BattleWaitingType.Flee)
        img(creatureSilhouetteImage, 180, 390, 12);

    let boxGradient = ctx.createLinearGradient(0, 450, 0, 600);
    boxGradient.addColorStop(0.08, "#898d8e");
    boxGradient.addColorStop(0.39, "#ffffff");
    boxGradient.addColorStop(0.61, "#ffffff");
    boxGradient.addColorStop(0.92, "#898d8e");
    ctx.fillStyle = boxGradient;
    ctx.fillRect(0, 450, w, 150);
    ctx.fillStyle = "black";
    ctx.fillRect(0, 445, w, 5);

    ctx.fillStyle = "white";
    ctx.strokeStyle = "black";
    ctx.lineWidth = 10;
    ctx.strokeRect(10, 460, w - 20, 150 - 20);
    ctx.fillRect(10, 460, w - 20, 150 - 20);

    ctx.fillStyle = "black";
    ctx.font = '30px "VCR OSD Mono"';
    ctx.textBaseline = "top";
    ctx.fillText(getBattleText(battle), 20, 470);

    ctx.fillStyle = "rgba(0,0,0,0.5)";
    ctx.fillRect(0, 0, w, 60);
    ctx.font = '20px "VCR OSD Mono"';
    ctx.fillStyle = "white";
    ctx.fillText(
        `MenuState: ${BattleMenuState[battle.mns]}\nWaitingType: ${
            BattleWaitingType[battle.wt]
        }`,
        0,
        0
    );

    return canvas.toBuffer();
}

export function getBattleActionString(action: BattleAction): string {
    switch (action) {
        case BattleAction.Fight:
            return "fight";
        case BattleAction.Item:
            return "item";
        case BattleAction.Run:
            return "run";
        case BattleAction.Option1:
            return "o1";
        case BattleAction.Option2:
            return "o2";
        case BattleAction.Option3:
            return "o3";
        case BattleAction.Option4:
            return "o4";
        case BattleAction.Option5:
            return "o5";
        case BattleAction.Yes:
            return "yes";
        case BattleAction.No:
            return "no";
    }
    return "back";
}

export function getBattleAction(id: string): BattleAction {
    switch (id.split("-")[1]) {
        case "fight":
            return BattleAction.Fight;
        case "item":
            return BattleAction.Item;
        case "run":
            return BattleAction.Run;
        case "o1":
            return BattleAction.Option1;
        case "o2":
            return BattleAction.Option2;
        case "o3":
            return BattleAction.Option3;
        case "o4":
            return BattleAction.Option4;
        case "o5":
            return BattleAction.Option5;
        case "yes":
            return BattleAction.Yes;
        case "no":
            return BattleAction.No;
    }
    return BattleAction.Back;
}
