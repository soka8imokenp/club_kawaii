"use client";

import type { Creator, Tier } from "./club";
import { memberNo, type Membership } from "./membership";

function loadImage(src: string): Promise<HTMLImageElement | null> {
    return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => resolve(img);
        img.onerror = () => resolve(null);
        img.src = src;
    });
}

/** oklch → canvas rangi (zamonaviy brauzerlar canvas'da oklch'ni tushunadi) */
const ok = (l: number, c: number, h: number, a = 1) => `oklch(${l} ${c} ${h} / ${a})`;

/** Klub kartasini Stories uchun rasmga chizish (1080×1350) */
export async function renderCardImage(creator: Creator, tier: Tier, member: Membership): Promise<Blob | null> {
    const W = 1080;
    const H = 1350;
    const cv = document.createElement("canvas");
    cv.width = W;
    cv.height = H;
    const g = cv.getContext("2d");
    if (!g) return null;
    const h = creator.hue;

    // Fon
    const bg = g.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, ok(0.25, 0.1, h));
    bg.addColorStop(1, ok(0.08, 0.03, h));
    g.fillStyle = bg;
    g.fillRect(0, 0, W, H);

    const [banner, avatar] = await Promise.all([loadImage(creator.banner), loadImage(creator.avatar)]);

    // Karta
    const cw = 900;
    const ch = Math.round(cw / 1.586);
    const cx = (W - cw) / 2;
    const cy = 300;
    g.save();
    g.shadowColor = ok(0.4, 0.2, h, 0.6);
    g.shadowBlur = 80;
    g.shadowOffsetY = 40;
    g.beginPath();
    g.roundRect(cx, cy, cw, ch, 40);
    const cardBg = g.createLinearGradient(cx, cy, cx + cw, cy + ch);
    cardBg.addColorStop(0, ok(0.46, 0.15, h));
    cardBg.addColorStop(0.75, ok(0.17, 0.05, h));
    g.fillStyle = cardBg;
    g.fill();
    g.restore();

    g.save();
    g.beginPath();
    g.roundRect(cx, cy, cw, ch, 40);
    g.clip();
    if (banner) {
        const bw = cw * 0.66;
        const scale = Math.max(bw / banner.width, ch / banner.height);
        const iw = banner.width * scale;
        const ih = banner.height * scale;
        g.globalAlpha = 0.7;
        g.drawImage(banner, cx + cw - bw + (bw - iw) / 2, cy + (ch - ih) / 2, iw, ih);
        g.globalAlpha = 1;
    }
    const shade = g.createLinearGradient(cx, 0, cx + cw, 0);
    shade.addColorStop(0.28, ok(0.2, 0.08, h, 0.92));
    shade.addColorStop(0.75, ok(0.2, 0.08, h, 0.2));
    shade.addColorStop(1, ok(0.2, 0.08, h, 0));
    g.fillStyle = shade;
    g.fillRect(cx, cy, cw, ch);
    // Golografik chiziq
    const foil = g.createLinearGradient(cx, cy, cx + cw, cy + ch);
    foil.addColorStop(0.35, "rgba(255,255,255,0)");
    foil.addColorStop(0.45, ok(0.9, 0.14, h + 70, 0.35));
    foil.addColorStop(0.52, ok(0.9, 0.12, h + 180, 0.3));
    foil.addColorStop(0.62, "rgba(255,255,255,0)");
    g.fillStyle = foil;
    g.fillRect(cx, cy, cw, ch);
    g.restore();

    g.fillStyle = "#fff";
    g.font = "500 30px 'DM Mono', monospace";
    g.fillText("KAWAII CLUB", cx + 54, cy + 80);
    g.font = "800 30px 'Plus Jakarta Sans', sans-serif";
    const tw = g.measureText(tier.name).width;
    g.fillStyle = "rgba(255,255,255,0.18)";
    g.beginPath();
    g.roundRect(cx + cw - tw - 100, cy + 44, tw + 50, 54, 27);
    g.fill();
    g.fillStyle = "#fff";
    g.fillText(tier.name, cx + cw - tw - 75, cy + 82);

    const ay = cy + ch / 2 - 60;
    if (avatar) {
        g.save();
        g.beginPath();
        g.roundRect(cx + 54, ay, 120, 120, 28);
        g.clip();
        g.drawImage(avatar, cx + 54, ay, 120, 120);
        g.restore();
    } else {
        g.fillStyle = "rgba(255,255,255,0.2)";
        g.beginPath();
        g.roundRect(cx + 54, ay, 120, 120, 28);
        g.fill();
        g.fillStyle = "#fff";
        g.font = "900 60px 'Plus Jakarta Sans', sans-serif";
        g.fillText(creator.name[0], cx + 94, ay + 82);
    }
    g.fillStyle = "#fff";
    g.font = "900 56px 'Plus Jakarta Sans', sans-serif";
    g.fillText(creator.name, cx + 204, ay + 70);
    g.font = "500 28px 'DM Mono', monospace";
    g.fillStyle = "rgba(255,255,255,0.7)";
    g.fillText("Klub a'zosi", cx + 204, ay + 112);

    g.fillStyle = "#fff";
    g.font = "500 40px 'DM Mono', monospace";
    g.fillText(memberNo(member.number), cx + 54, cy + ch - 54);

    // Pastki matn
    g.textAlign = "center";
    g.fillStyle = "#fff";
    g.font = "900 64px 'Plus Jakarta Sans', sans-serif";
    g.fillText(`Men ${creator.name}`, W / 2, cy + ch + 190);
    g.fillText("klubidaman", W / 2, cy + ch + 270);
    g.font = "500 34px 'DM Mono', monospace";
    g.fillStyle = "rgba(255,255,255,0.6)";
    g.fillText(`club.kawaii.uz/${creator.id}`, W / 2, H - 90);

    return new Promise((resolve) => {
        try {
            cv.toBlob((b) => resolve(b), "image/png");
        } catch {
            // Tashqi rasm canvas'ni "ifloslantirgan" bo'lsa
            resolve(null);
        }
    });
}

/** Kartani ulashish: telefonda — tizim oynasi, kompyuterda — PNG yuklab olish */
export async function shareCard(creator: Creator, tier: Tier, member: Membership) {
    const blob = await renderCardImage(creator, tier, member);
    if (!blob) return false;
    const file = new File([blob], `kawaii-club-${creator.id}.png`, { type: "image/png" });
    if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: `${creator.name} klubi`, url: `https://club.kawaii.uz/${creator.id}` }).catch(() => {});
        return true;
    }
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = file.name;
    a.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    return true;
}
