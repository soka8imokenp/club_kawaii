"use client";

import { useState } from "react";
import Link from "next/link";
import { BadgeCheck, Bell, BellRing, CalendarClock, Clock, Heart, Lock, MessageCircle, Radio, Share2, ShoppingBag } from "lucide-react";
import { agoLabel, earlyLeftMin, leftLabel, money, postAgoMin, type Post } from "@/lib/club";
import { buy } from "@/lib/account";
import { useCanSee, useCreator } from "@/lib/studio";
import { openJoin } from "./JoinSheet";
import { openPay } from "./sheets";
import { useNow } from "@/lib/store";
import { AudioPlayer, VideoPlayer, openLightbox } from "./media";

const card = "bg-card-bg dark:bg-[#0a0a0a] rounded-2xl border border-border-sep dark:border-white/[0.06] card-shadow theme-transition overflow-hidden";

/** Lenta, ijodkor sahifasi va post sahifasidagi post. Yopiq bo'lsa — xira ko'rinish va ochish yo'llari. */
export function PostCard({ post, showAuthor = true, full = false }: { post: Post; showAuthor?: boolean; full?: boolean }) {
    const creator = useCreator(post.creatorId);
    const canSee = useCanSee();
    const [liked, setLiked] = useState(false);
    const now = useNow();
    if (!creator) return null;
    const tier = creator.tiers.find((t) => t.id === post.tier);
    const open = canSee(post);
    const early = earlyLeftMin(post);
    const scheduled = post.publishAt && post.publishAt > now;
    const href = `/p/${post.id}`;

    const share = () => {
        const url = `${location.origin}${href}`;
        if (navigator.share) navigator.share({ title: post.title, url }).catch(() => {});
        else navigator.clipboard?.writeText(url).catch(() => {});
    };

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
                    <span className="flex items-center gap-2 text-xs font-mono text-text-muted">
                        {scheduled ? (
                            <span className="inline-flex items-center gap-1 text-amber-500">
                                <Clock className="w-3 h-3" /> Rejalashtirilgan
                            </span>
                        ) : (
                            agoLabel(postAgoMin(post))
                        )}
                        {post.vod && (
                            <span className="inline-flex items-center gap-1 text-[#ff3b5c]">
                                <Radio className="w-3 h-3" /> Efir yozuvi
                            </span>
                        )}
                    </span>
                </div>
                <TierChip name={tier?.name} open={open} early={!!post.publicAfterMin && early > 0} />
            </header>

            <div className="px-4 pt-3">
                {full ? (
                    <h1 className="text-lg sm:text-xl font-black text-text-main leading-snug">{post.title}</h1>
                ) : (
                    <Link href={href} className="block text-[15px] sm:text-base font-extrabold text-text-main leading-snug hover:text-primary transition-colors">
                        {post.title}
                    </Link>
                )}
                <p className={`mt-1 text-sm text-text-muted leading-relaxed whitespace-pre-line ${open ? (full ? "" : "line-clamp-4") : "line-clamp-2"}`}>{post.text}</p>
                {open && post.tags && post.tags.length > 0 && (
                    <p className="mt-2 flex flex-wrap gap-1.5">
                        {post.tags.map((t) => (
                            <span key={t} className="text-xs font-mono text-primary">
                                #{t}
                            </span>
                        ))}
                    </p>
                )}
            </div>

            <PostMedia post={post} open={open} />

            {!open && (tier || post.price) && (
                <div className="mx-4 mt-3 p-3 rounded-xl bg-primary/[0.07] border border-primary/15 space-y-2.5">
                    {tier && (
                        <div className="flex items-center gap-3">
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
                    {post.price && (
                        <div className="flex items-center gap-3">
                            <ShoppingBag className="w-4 h-4 text-text-muted shrink-0" />
                            <p className="flex-1 min-w-0 text-xs text-text-muted">Yoki obunasiz — faqat shu post</p>
                            <button
                                type="button"
                                onClick={() =>
                                    openPay({
                                        title: post.title,
                                        subtitle: `${creator.name} · alohida post`,
                                        image: post.media,
                                        amount: post.price!,
                                        kind: "post",
                                        creatorId: creator.id,
                                        onPaid: () => buy("posts", post.id),
                                        doneText: "Post ochildi — u doim siz bilan qoladi",
                                    })
                                }
                                className="shrink-0 px-3.5 py-2 rounded-lg border border-border-sep text-text-main text-xs font-bold cursor-pointer hover:border-primary/40 active:scale-95 transition-all"
                            >
                                {money(post.price)} so&apos;m
                            </button>
                        </div>
                    )}
                    {post.publicAfterMin && early > 0 && (
                        <p className="flex items-center gap-2 text-[11px] font-mono text-text-muted">
                            <Clock className="w-3.5 h-3.5" /> Hamma uchun {leftLabel(early)} ochiladi
                        </p>
                    )}
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
                <Link href={full ? "#izohlar" : `${href}#izohlar`} className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-xs font-bold text-text-muted hover:text-text-main hover:bg-foreground/[0.04] transition-colors">
                    <MessageCircle className="w-4 h-4" />
                    {post.comments}
                </Link>
                <button type="button" onClick={share} aria-label="Ulashish" className="ml-auto p-2 rounded-lg text-text-muted hover:text-text-main hover:bg-foreground/[0.04] cursor-pointer transition-colors">
                    <Share2 className="w-4 h-4" />
                </button>
            </footer>
        </article>
    );
}

export function TierChip({ name, open, early }: { name?: string; open: boolean; early?: boolean }) {
    if (!name) return <span className="shrink-0 px-2 py-1 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider bg-foreground/[0.05] text-text-muted">Ochiq</span>;
    return (
        <span
            className={`shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider ${
                open ? "bg-primary/10 text-primary" : "bg-foreground/[0.05] text-text-muted"
            }`}
        >
            {!open && (early ? <Clock className="w-3 h-3" /> : <Lock className="w-3 h-3" />)}
            {early ? "Erta kirish" : `${name}+`}
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
                    const pct = total ? Math.round((votes / total) * 100) : 0;
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
            <div className={`mx-4 mt-3 ${open ? "" : "opacity-60 pointer-events-none"}`}>
                <AudioPlayer cover={post.media} duration={post.duration} seed={post.likes} />
            </div>
        );
    }

    if (!post.media) return null;

    if (open && post.kind === "video") {
        return (
            <div className="mt-3">
                <VideoPlayer poster={post.media} duration={post.duration} />
            </div>
        );
    }

    // Galereya
    if (open && post.gallery && post.gallery.length > 1) {
        const g = post.gallery;
        const shown = g.slice(0, 4);
        return (
            <div className="mt-3 grid grid-cols-2 gap-0.5 bg-black">
                {shown.map((src, i) => (
                    <button key={i} type="button" onClick={() => openLightbox(g, i)} className={`relative overflow-hidden cursor-zoom-in ${shown.length === 3 && i === 0 ? "row-span-2" : "aspect-square"}`}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={src} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                        {i === 3 && g.length > 4 && <span className="absolute inset-0 bg-black/55 flex items-center justify-center text-white text-xl font-black">+{g.length - 4}</span>}
                    </button>
                ))}
            </div>
        );
    }

    return (
        <button
            type="button"
            disabled={!open}
            onClick={() => openLightbox([post.media!])}
            className={`relative block w-full mt-3 aspect-video overflow-hidden bg-black ${open ? "cursor-zoom-in" : "cursor-default"}`}
        >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={post.media} alt="" className={`w-full h-full object-cover transition-transform duration-700 ${open ? "" : "blur-2xl scale-110 opacity-70"}`} />
            {!open && (
                <span className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-white">
                    <span className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center">
                        <Lock className="w-5 h-5" />
                    </span>
                    <span className="text-xs font-mono">{post.kind === "video" ? `Video · ${post.duration}` : post.gallery ? `${post.gallery.length} ta rasm` : "Rasm"}</span>
                </span>
            )}
        </button>
    );
}
