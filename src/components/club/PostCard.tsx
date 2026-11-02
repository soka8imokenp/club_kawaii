"use client";

import { useState } from "react";
import Link from "next/link";
import { BadgeCheck, Bell, BellRing, CalendarClock, Heart, Lock, MessageCircle, Music2, Play, Share2 } from "lucide-react";
import { agoLabel, creatorById, money, tierOf, type Post } from "@/lib/club";
import { canSee, useMemberships } from "@/lib/membership";
import { openJoin } from "./JoinSheet";

const card = "bg-card-bg dark:bg-[#0a0a0a] rounded-2xl border border-border-sep dark:border-white/[0.06] card-shadow theme-transition overflow-hidden";

/** Lenta va ijodkor sahifasidagi post. Yopiq bo'lsa — xira ko'rinish va tarifni ochish tugmasi. */
export function PostCard({ post, showAuthor = true }: { post: Post; showAuthor?: boolean }) {
    const memberships = useMemberships();
    const creator = creatorById(post.creatorId)!;
    const tier = tierOf(creator, post.tier);
    const open = canSee(post, memberships);
    const [liked, setLiked] = useState(false);

    return (
        <article className={card} style={{ "--h": creator.hue } as React.CSSProperties}>
            {/* Sarlavha qatori */}
            <header className="flex items-center gap-3 px-4 pt-4">
                {showAuthor && (
                    <Link href={`/${creator.id}`} className="shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={creator.avatar} alt="" className="w-10 h-10 rounded-xl object-cover" />
                    </Link>
                )}
                <div className="flex-1 min-w-0">
                    {showAuthor && (
                        <Link href={`/${creator.id}`} className="flex items-center gap-1 text-sm font-bold text-text-main hover:text-primary transition-colors w-fit">
                            {creator.name}
                            {creator.verified && <BadgeCheck className="w-4 h-4 text-primary" />}
                        </Link>
                    )}
                    <span className="text-xs font-mono text-text-muted">{agoLabel(post.agoMin)}</span>
                </div>
                <TierChip name={tier?.name} open={open} />
            </header>

            <div className="px-4 pt-3">
                <h3 className="text-[15px] sm:text-base font-extrabold text-text-main leading-snug">{post.title}</h3>
                <p className={`mt-1 text-sm text-text-muted leading-relaxed ${open ? "" : "line-clamp-2"}`}>{post.text}</p>
            </div>

            <PostMedia post={post} open={open} />

            {!open && tier && (
                <div className="mx-4 mt-3 flex items-center gap-3 p-3 rounded-xl bg-primary/[0.07] border border-primary/15">
                    <Lock className="w-4 h-4 text-primary shrink-0" />
                    <p className="flex-1 min-w-0 text-xs text-text-main">
                        <b>{tier.name}</b> klubi uchun · {money(tier.price)} so&apos;m/oy
                    </p>
                    <button
                        type="button"
                        onClick={() => openJoin(creator.id, tier.id)}
                        className="shrink-0 px-3.5 py-2 rounded-lg bg-primary hover:bg-primary/90 text-white text-xs font-bold cursor-pointer active:scale-95 transition-all"
                    >
                        Ochish
                    </button>
                </div>
            )}

            {/* Reaksiyalar */}
            <footer className="flex items-center gap-1 px-2 py-2 mt-1">
                <button
                    type="button"
                    disabled={!open}
                    onClick={() => setLiked((v) => !v)}
                    aria-pressed={liked}
                    className={`flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-xs font-bold cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-default ${
                        liked ? "text-rose-500" : "text-text-muted hover:text-text-main hover:bg-foreground/[0.04]"
                    }`}
                >
                    <Heart className={`w-4 h-4 transition-transform ${liked ? "fill-current scale-110" : ""}`} />
                    {post.likes + (liked ? 1 : 0)}
                </button>
                <span className="flex items-center gap-1.5 px-2.5 py-2 text-xs font-bold text-text-muted">
                    <MessageCircle className="w-4 h-4" />
                    {post.comments}
                </span>
                <button type="button" aria-label="Ulashish" className="ml-auto p-2 rounded-lg text-text-muted hover:text-text-main hover:bg-foreground/[0.04] cursor-pointer transition-colors">
                    <Share2 className="w-4 h-4" />
                </button>
            </footer>
        </article>
    );
}

export function TierChip({ name, open }: { name?: string; open: boolean }) {
    if (!name) return <span className="shrink-0 px-2 py-1 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider bg-foreground/[0.05] text-text-muted">Ochiq</span>;
    return (
        <span
            className={`shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider ${
                open ? "bg-primary/10 text-primary" : "bg-foreground/[0.05] text-text-muted"
            }`}
        >
            {!open && <Lock className="w-3 h-3" />}
            {name}+
        </span>
    );
}

function PostMedia({ post, open }: { post: Post; open: boolean }) {
    const [vote, setVote] = useState<number | null>(null);
    const [remind, setRemind] = useState(false);

    if (post.kind === "poll" && post.poll) {
        const total = post.poll.options.reduce((s, o) => s + o.votes, 0) + (vote !== null ? 1 : 0);
        return (
            <div className={`px-4 pt-3 space-y-2 ${open ? "" : "blur-[3px] pointer-events-none select-none"}`}>
                {post.poll.options.map((o, i) => {
                    const votes = o.votes + (vote === i ? 1 : 0);
                    const pct = Math.round((votes / total) * 100);
                    return (
                        <button
                            key={o.label}
                            type="button"
                            onClick={() => setVote(i)}
                            disabled={vote !== null}
                            className={`relative w-full overflow-hidden flex items-center justify-between px-3.5 py-2.5 rounded-xl border text-sm text-left cursor-pointer disabled:cursor-default transition-colors ${
                                vote === i ? "border-primary" : "border-border-sep hover:border-primary/40"
                            }`}
                        >
                            {vote !== null && <span className="absolute inset-y-0 left-0 bg-primary/12 transition-[width] duration-700" style={{ width: `${pct}%` }} />}
                            <span className="relative font-bold text-text-main">{o.label}</span>
                            {vote !== null && <span className="relative font-mono text-xs text-text-muted">{pct}%</span>}
                        </button>
                    );
                })}
                <p className="text-[11px] font-mono text-text-muted">{total} ovoz</p>
            </div>
        );
    }

    if (post.kind === "event" && post.event) {
        return (
            <div className="mx-4 mt-3 rounded-xl overflow-hidden relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {post.media && <img src={post.media} alt="" className="absolute inset-0 w-full h-full object-cover" />}
                <div className="relative flex items-center gap-4 p-4 bg-gradient-to-r from-black/85 via-black/70 to-black/30 text-white">
                    <div className="w-12 h-12 rounded-xl bg-white/12 flex items-center justify-center shrink-0">
                        <CalendarClock className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-mono uppercase tracking-wider text-white/70">{post.event.when}</p>
                        <p className="font-extrabold truncate">{post.event.title}</p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setRemind((v) => !v)}
                        className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold cursor-pointer transition-colors ${remind ? "bg-white text-black" : "bg-white/15 hover:bg-white/25"}`}
                    >
                        {remind ? <BellRing className="w-3.5 h-3.5" /> : <Bell className="w-3.5 h-3.5" />}
                        {remind ? "Eslatiladi" : "Eslatish"}
                    </button>
                </div>
            </div>
        );
    }

    if (post.kind === "audio") {
        return (
            <div className={`mx-4 mt-3 flex items-center gap-3 p-3 rounded-xl bg-foreground/[0.04] ${open ? "" : "opacity-60"}`}>
                <div className="relative w-14 h-14 rounded-lg overflow-hidden shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {post.media && <img src={post.media} alt="" className={`w-full h-full object-cover ${open ? "" : "blur-sm"}`} />}
                    <span className="absolute inset-0 flex items-center justify-center bg-black/35 text-white">{open ? <Play className="w-5 h-5 fill-current" /> : <Lock className="w-4 h-4" />}</span>
                </div>
                {/* Soxta to'lqin shakli */}
                <div className="flex-1 flex items-center gap-[3px] h-8" aria-hidden>
                    {Array.from({ length: 36 }, (_, i) => (
                        <span key={i} className="flex-1 rounded-full bg-primary/40" style={{ height: `${Math.round(25 + Math.abs(Math.sin(i * 1.7 + post.likes)) * 75)}%` }} />
                    ))}
                </div>
                <span className="text-xs font-mono text-text-muted inline-flex items-center gap-1">
                    <Music2 className="w-3.5 h-3.5" />
                    {post.duration}
                </span>
            </div>
        );
    }

    if (!post.media) return null;

    return (
        <div className="relative mt-3 aspect-video overflow-hidden bg-black">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={post.media} alt="" className={`w-full h-full object-cover transition-transform duration-700 ${open ? "" : "blur-2xl scale-110 opacity-70"}`} />
            {open && post.kind === "video" && (
                <>
                    <span className="absolute inset-0 m-auto w-14 h-14 rounded-full bg-black/55 backdrop-blur flex items-center justify-center text-white">
                        <Play className="w-6 h-6 fill-current ml-0.5" />
                    </span>
                    <span className="absolute right-3 bottom-3 px-1.5 py-0.5 rounded bg-black/70 text-white text-[11px] font-mono">{post.duration}</span>
                </>
            )}
            {!open && (
                <span className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-white">
                    <span className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center">
                        <Lock className="w-5 h-5" />
                    </span>
                    <span className="text-xs font-mono">{post.kind === "video" ? `Video · ${post.duration}` : "Rasm"}</span>
                </span>
            )}
        </div>
    );
}
