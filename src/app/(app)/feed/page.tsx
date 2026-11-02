"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, WalletCards } from "lucide-react";
import { CREATORS, POSTS, creatorById, type PostKind } from "@/lib/club";
import { useMemberships } from "@/lib/membership";
import { PostCard } from "@/components/club/PostCard";
import { panel } from "@/components/club/Tiles";

const TABS = [
    { id: "mine", label: "Obunalarim" },
    { id: "all", label: "Kashf etish" },
] as const;

const KINDS: { id: PostKind | "all"; label: string }[] = [
    { id: "all", label: "Hammasi" },
    { id: "video", label: "Video" },
    { id: "image", label: "Rasm" },
    { id: "audio", label: "Audio" },
    { id: "text", label: "Matn" },
];

export default function FeedPage() {
    const memberships = useMemberships();
    const mine = memberships.map((m) => ({ m, c: creatorById(m.creatorId)! })).filter((x) => x.c);
    const mineIds = new Set(mine.map((x) => x.c.id));
    const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("mine");
    const [kind, setKind] = useState<PostKind | "all">("all");

    const posts = POSTS.filter((p) => (tab === "mine" ? mineIds.has(p.creatorId) : !mineIds.has(p.creatorId)))
        .filter((p) => kind === "all" || p.kind === kind || (kind === "text" && (p.kind === "poll" || p.kind === "event")))
        .sort((a, b) => a.agoMin - b.agoMin);

    const live = CREATORS.filter((c) => c.live);
    const suggest = CREATORS.filter((c) => !mineIds.has(c.id)).slice(0, 4);

    return (
        <div className="lg:grid lg:grid-cols-[250px_minmax(0,1fr)_300px] gap-6 items-start pb-10">
            {/* Chap: mening klublarim */}
            <aside className="hidden lg:block sticky top-[88px] space-y-4">
                <div className={`${panel} p-3`}>
                    <p className="px-2 pt-1 pb-2 text-[11px] font-mono font-bold uppercase tracking-wider text-text-muted">Mening klublarim</p>
                    {mine.map(({ m, c }) => (
                        <Link key={c.id} href={`/${c.id}`} className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-foreground/[0.04] transition-colors">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={c.avatar} alt="" className="w-9 h-9 rounded-xl object-cover" />
                            <span className="min-w-0 flex-1">
                                <span className="block text-sm font-bold text-text-main truncate">{c.name}</span>
                                <span className="block text-[11px] font-mono" style={{ color: `oklch(0.65 0.15 ${c.hue})` }}>
                                    {c.tiers.find((t) => t.id === m.tierId)?.name}
                                </span>
                            </span>
                            {c.live && <span className="live-dot" />}
                        </Link>
                    ))}
                    {mine.length === 0 && <p className="px-2 pb-2 text-xs text-text-muted">Hali klub yo&apos;q</p>}
                    <Link href="/wallet" className="mt-1 flex items-center gap-2 px-2 py-2 rounded-xl text-xs font-bold text-primary hover:bg-primary/[0.06] transition-colors">
                        <WalletCards className="w-4 h-4" /> Klub kartalarim
                    </Link>
                </div>
            </aside>

            {/* Markaz: lenta */}
            <div className="min-w-0 max-w-[680px] mx-auto w-full">
                {/* Telefonda: klublar "hikoyalar" qatori */}
                <div className="lg:hidden flex gap-3 overflow-x-auto no-scrollbar -mx-3 px-3 pb-4">
                    {[...mine.map((x) => x.c), ...live.filter((c) => !mineIds.has(c.id))].map((c) => (
                        <Link key={c.id} href={c.live ? `/${c.id}/live` : `/${c.id}`} className="shrink-0 w-16 text-center">
                            <span className="story-ring block" data-live={c.live ? "" : undefined}>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={c.avatar} alt="" className="w-full aspect-square rounded-2xl object-cover border-2 border-page-bg" />
                            </span>
                            <span className="block mt-1 text-[10px] font-bold text-text-main truncate">{c.live ? "Jonli" : c.name}</span>
                        </Link>
                    ))}
                </div>

                <div className="flex items-center gap-1 p-1 rounded-xl bg-foreground/[0.05] w-fit">
                    {TABS.map((t) => (
                        <button
                            key={t.id}
                            type="button"
                            onClick={() => setTab(t.id)}
                            className={`px-4 py-2 rounded-lg text-sm font-bold cursor-pointer transition-all ${tab === t.id ? "bg-card-bg text-text-main shadow-sm" : "text-text-muted hover:text-text-main"}`}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>
                <div className="flex gap-2 overflow-x-auto no-scrollbar mt-3 mb-4 -mx-3 px-3 sm:mx-0 sm:px-0">
                    {KINDS.map((k) => (
                        <button
                            key={k.id}
                            type="button"
                            onClick={() => setKind(k.id)}
                            className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors border ${
                                kind === k.id ? "border-primary text-primary bg-primary/[0.07]" : "border-border-sep text-text-muted hover:text-text-main"
                            }`}
                        >
                            {k.label}
                        </button>
                    ))}
                </div>

                <div className="space-y-4">
                    {posts.map((p) => (
                        <PostCard key={p.id} post={p} />
                    ))}
                    {posts.length === 0 && (
                        <div className={`${panel} p-10 text-center`}>
                            <p className="font-bold text-text-main">{tab === "mine" && mine.length === 0 ? "Siz hali hech qaysi klubda emassiz" : "Bu yerda hozircha bo'sh"}</p>
                            <Link href="/creators" className="inline-block mt-3 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-bold">
                                Ijodkorlarni ko&apos;rish
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            {/* O'ng: efirlar va tavsiyalar */}
            <aside className="hidden lg:block sticky top-[88px] space-y-4">
                <div className={`${panel} p-3`}>
                    <p className="px-2 pt-1 pb-2 flex items-center gap-2 text-[11px] font-mono font-bold uppercase tracking-wider text-text-muted">
                        <span className="live-dot" /> Hozir efirda
                    </p>
                    {live.map((c) => (
                        <Link key={c.id} href={`/${c.id}/live`} className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-foreground/[0.04] transition-colors">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={c.avatar} alt="" className="w-9 h-9 rounded-xl object-cover ring-2 ring-[#ff3b5c]" />
                            <span className="min-w-0 flex-1">
                                <span className="block text-sm font-bold text-text-main truncate">{c.name}</span>
                                <span className="block text-[11px] text-text-muted truncate">{c.live!.title}</span>
                            </span>
                            <span className="text-[11px] font-mono text-text-muted inline-flex items-center gap-1">
                                <Eye className="w-3 h-3" />
                                {c.live!.viewers}
                            </span>
                        </Link>
                    ))}
                </div>
                <div className={`${panel} p-3`}>
                    <p className="px-2 pt-1 pb-2 text-[11px] font-mono font-bold uppercase tracking-wider text-text-muted">Sizga yoqishi mumkin</p>
                    {suggest.map((c) => (
                        <Link key={c.id} href={`/${c.id}`} className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-foreground/[0.04] transition-colors">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={c.avatar} alt="" className="w-9 h-9 rounded-xl object-cover" />
                            <span className="min-w-0 flex-1">
                                <span className="block text-sm font-bold text-text-main truncate">{c.name}</span>
                                <span className="block text-[11px] text-text-muted truncate">{c.tagline}</span>
                            </span>
                        </Link>
                    ))}
                </div>
            </aside>
        </div>
    );
}
