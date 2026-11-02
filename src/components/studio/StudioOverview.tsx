"use client";

import Link from "next/link";
import { Check, FileText, Layers, PenSquare, Radio, TrendingUp, Users, Wallet } from "lucide-react";
import { compact, money } from "@/lib/club";
import { useMyClub, useMyLive, useMyPosts } from "@/lib/studio";
import { panel } from "@/components/club/Tiles";
import { primaryBtn } from "./ui";

/** Kunlik qiymatlar (namunaviy, klub id'siga bog'liq — har safar bir xil) */
function series(seed: string, days: number, base: number) {
    let h = 0;
    for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
    return Array.from({ length: days }, (_, i) => {
        h = (h * 1103515245 + 12345) >>> 0;
        return Math.max(0, Math.round(base * (0.4 + (i / days) * 0.8) + ((h % 100) / 100) * base * 0.5));
    });
}

export function StudioOverview() {
    const club = useMyClub()!;
    const posts = useMyPosts();
    const live = useMyLive();
    const monthly = club.tiers.reduce((s, t) => s + t.members * t.price, 0);
    const views = series(club.id, 14, 40 + posts.length * 25);
    const max = Math.max(...views, 1);
    const steps = [
        { done: club.tiers.some((t) => t.perks.length > 1 || t.price !== 10000), label: "Tariflar va kartalarni sozlang", href: "/studio/tiers" },
        { done: posts.length > 0, label: "Birinchi postni chiqaring", href: "/studio/new" },
        { done: posts.some((p) => p.vod) || !!live, label: "Birinchi efirni o'tkazing", href: "/studio/live" },
        { done: !!club.goal, label: "Maqsad qo'ying (masalan, yangi mikrofon)", href: "/studio/settings" },
    ];
    const kpis = [
        { label: "A'zolar", value: compact(club.members), Icon: Users },
        { label: "Oylik daromad", value: `${money(monthly)}`, sub: "so'm", Icon: Wallet },
        { label: "Postlar", value: posts.length, Icon: FileText },
        { label: "Tariflar", value: club.tiers.length, Icon: Layers },
    ];

    return (
        <div className="space-y-5">
            <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-black text-text-main">Salom, {club.name}</h1>
                    <p className="mt-1 text-sm text-text-muted">Klubingiz bugun qanday ketyapti</p>
                </div>
                <div className="flex gap-2">
                    <Link href="/studio/live" className="inline-flex items-center gap-2 px-4 py-3 rounded-xl border border-border-sep text-sm font-bold text-text-main hover:border-[#ff3b5c]/50 transition-colors">
                        <Radio className="w-4 h-4 text-[#ff3b5c]" /> Efir
                    </Link>
                    <Link href="/studio/new" className={primaryBtn}>
                        <PenSquare className="w-4 h-4" /> Yangi post
                    </Link>
                </div>
            </div>

            {live && (
                <Link href={`/${club.id}/live`} className="flex items-center gap-3 p-4 rounded-2xl bg-[#ff3b5c]/[0.08] border border-[#ff3b5c]/25">
                    <span className="live-dot" />
                    <span className="flex-1 min-w-0 text-sm font-bold text-text-main truncate">Efir davom etmoqda: {live.title}</span>
                    <span className="text-xs font-bold text-[#ff3b5c]">Efirga o&apos;tish →</span>
                </Link>
            )}

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {kpis.map(({ label, value, sub, Icon }) => (
                    <div key={label} className={`${panel} p-4`}>
                        <p className="flex items-center gap-1.5 text-[11px] font-mono text-text-muted">
                            <Icon className="w-3.5 h-3.5" /> {label}
                        </p>
                        <p className="mt-2 text-2xl font-black text-text-main">
                            {value} {sub && <span className="text-xs font-bold text-text-muted">{sub}</span>}
                        </p>
                    </div>
                ))}
            </div>

            <div className="grid lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] gap-5">
                <div className={`${panel} p-5`}>
                    <div className="flex items-center justify-between">
                        <h2 className="flex items-center gap-2 font-black text-text-main">
                            <TrendingUp className="w-4 h-4 text-primary" /> Ko&apos;rishlar, 14 kun
                        </h2>
                        <span className="text-[11px] font-mono text-text-muted">namunaviy</span>
                    </div>
                    <div className="mt-5 h-44 flex items-end gap-1.5">
                        {views.map((v, i) => (
                            <div key={i} className="group flex-1 h-full flex flex-col justify-end">
                                <span className="text-[9px] font-mono text-text-muted text-center opacity-0 group-hover:opacity-100 transition-opacity">{v}</span>
                                <span className="block rounded-t-md bg-primary/70 group-hover:bg-primary transition-colors" style={{ height: `${Math.max(4, (v / max) * 100)}%` }} />
                            </div>
                        ))}
                    </div>
                </div>

                <div className={`${panel} p-5`}>
                    <h2 className="font-black text-text-main">Birinchi qadamlar</h2>
                    <ul className="mt-3 space-y-1">
                        {steps.map((s) => (
                            <li key={s.label}>
                                <Link href={s.href} className="flex items-center gap-3 px-2 py-2.5 rounded-xl hover:bg-foreground/[0.04] transition-colors">
                                    <span className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${s.done ? "bg-emerald-500 text-white" : "border-2 border-border-sep"}`}>
                                        {s.done && <Check className="w-3.5 h-3.5" />}
                                    </span>
                                    <span className={`text-sm font-bold ${s.done ? "text-text-muted line-through" : "text-text-main"}`}>{s.label}</span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            <div className={`${panel} p-5`}>
                <div className="flex items-center justify-between mb-3">
                    <h2 className="font-black text-text-main">So&apos;nggi postlar</h2>
                    <Link href="/studio/posts" className="text-xs font-mono font-bold uppercase text-text-muted hover:text-primary">
                        Hammasi →
                    </Link>
                </div>
                {posts.length === 0 ? (
                    <p className="py-6 text-center text-sm text-text-muted">Hali post yo&apos;q</p>
                ) : (
                    posts.slice(0, 5).map((p) => (
                        <Link key={p.id} href={`/studio/posts/${p.id}`} className="flex items-center gap-3 px-2 py-2.5 rounded-xl hover:bg-foreground/[0.04] transition-colors">
                            <span className="flex-1 min-w-0 text-sm font-bold text-text-main truncate">{p.title}</span>
                            <span className="text-xs font-mono text-text-muted">{p.likes} ♥</span>
                        </Link>
                    ))
                )}
            </div>
        </div>
    );
}
