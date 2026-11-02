"use client";

import { useState } from "react";
import Link from "next/link";
import { BadgeCheck, Check, Eye, FileText, Lock, Play, Share2, Target, Users } from "lucide-react";
import { categoryLabel, compact, creatorById, money, postsOf, type Creator, type Tier } from "@/lib/club";
import { canSee, memberNo, useMembership, useMemberships, type Membership } from "@/lib/membership";
import { ClubCard } from "./ClubCard";
import { openJoin } from "./JoinSheet";
import { PostCard } from "./PostCard";
import { LiveBadge, panel } from "./Tiles";

const TABS = [
    { id: "posts", label: "Postlar" },
    { id: "media", label: "Media" },
    { id: "about", label: "Haqida" },
] as const;
type Tab = (typeof TABS)[number]["id"];

/** Ijodkor sahifasi: banner, klub kartalari (tariflar), postlar, media devori */
export function CreatorView({ id }: { id: string }) {
    const c = creatorById(id)!;
    const member = useMembership(c.id);
    const [tab, setTab] = useState<Tab>("posts");
    const myTier = member && c.tiers.find((t) => t.id === member.tierId);

    return (
        <div className="pb-10" style={{ "--h": c.hue } as React.CSSProperties}>
            {/* Banner */}
            <div className="relative -mx-3 -mt-4 sm:mx-0 sm:mt-0 h-44 sm:h-64 lg:h-72 sm:rounded-3xl overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={c.banner} alt="" className="w-full h-full object-cover" />
                <div className="absolute inset-0" style={{ background: `linear-gradient(to top, oklch(0.18 0.06 ${c.hue} / 0.85), transparent 60%)` }} />
            </div>

            {/* Sarlavha */}
            <header className="relative px-1 sm:px-6 -mt-12 sm:-mt-16 flex flex-col sm:flex-row sm:items-end gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={c.avatar} alt="" className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl object-cover ring-4 ring-page-bg shadow-xl" />
                <div className="flex-1 min-w-0 sm:pb-1">
                    <h1 className="flex items-center gap-2 text-2xl sm:text-3xl font-black text-text-main">
                        <span className="truncate">{c.name}</span>
                        {c.verified && <BadgeCheck className="w-6 h-6 text-primary shrink-0" />}
                    </h1>
                    <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-mono text-text-muted">
                        <span className="px-2 py-0.5 rounded-md bg-foreground/[0.06] font-bold uppercase tracking-wider">{categoryLabel(c.category)}</span>
                        <span className="inline-flex items-center gap-1">
                            <Users className="w-3.5 h-3.5" /> {compact(c.members)} a&apos;zo
                        </span>
                        <span className="inline-flex items-center gap-1">
                            <FileText className="w-3.5 h-3.5" /> {c.posts} post
                        </span>
                    </p>
                </div>
                <div className="flex items-center gap-2 sm:pb-1">
                    {c.live && (
                        <Link href={`/${c.id}/live`} className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-[#ff3b5c] hover:bg-[#ff3b5c]/90 text-white text-sm font-bold active:scale-[0.98] transition-all">
                            <span className="w-2 h-2 rounded-full bg-white animate-pulse" /> Efirda
                            <span className="font-mono text-xs opacity-80">{c.live.viewers}</span>
                        </Link>
                    )}
                    {myTier ? (
                        <Link
                            href="/wallet"
                            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-primary/40 text-primary text-sm font-bold hover:bg-primary/[0.06] transition-colors"
                        >
                            <Check className="w-4 h-4" /> {myTier.name} · {memberNo(member!.number)}
                        </Link>
                    ) : (
                        <button
                            type="button"
                            onClick={() => openJoin(c.id)}
                            className="flex-1 sm:flex-none px-6 py-3 rounded-xl bg-primary hover:bg-primary/90 text-white text-sm font-bold cursor-pointer active:scale-[0.98] transition-all"
                        >
                            Klubga qo&apos;shilish
                        </button>
                    )}
                    <button type="button" aria-label="Ulashish" className="w-11 h-11 rounded-xl border border-border-sep text-text-muted hover:text-text-main flex items-center justify-center cursor-pointer transition-colors">
                        <Share2 className="w-4 h-4" />
                    </button>
                </div>
            </header>
            <p className="px-1 sm:px-6 mt-4 max-w-2xl text-sm text-text-muted leading-relaxed">{c.tagline}</p>

            {/* Telefonda: klub kartalari karuseli */}
            <section className="lg:hidden mt-6">
                <h2 className="mb-3 text-[11px] font-mono font-bold uppercase tracking-wider text-text-muted">Klub kartalari</h2>
                <div className="flex gap-3 overflow-x-auto no-scrollbar snap-x snap-mandatory -mx-3 px-3 pb-1">
                    {c.tiers.map((t) => (
                        <div key={t.id} className="w-[80vw] max-w-[340px] shrink-0 snap-center">
                            <TierOffer c={c} t={t} member={member} />
                        </div>
                    ))}
                </div>
            </section>

            <div className="mt-6 lg:mt-8 lg:grid lg:grid-cols-[minmax(0,1fr)_380px] gap-8 items-start">
                <div className="min-w-0">
                    <div className="flex items-center gap-6 border-b border-border-sep mb-5">
                        {TABS.map((t) => (
                            <button
                                key={t.id}
                                type="button"
                                onClick={() => setTab(t.id)}
                                className={`relative pb-3 text-sm font-bold cursor-pointer transition-colors ${tab === t.id ? "text-text-main" : "text-text-muted hover:text-text-main"}`}
                            >
                                {t.label}
                                <span className={`absolute left-0 right-0 -bottom-px h-0.5 rounded-full bg-primary transition-transform duration-300 ${tab === t.id ? "scale-x-100" : "scale-x-0"}`} />
                            </button>
                        ))}
                    </div>

                    {tab === "posts" && <Posts c={c} />}
                    {tab === "media" && <MediaWall c={c} />}
                    {tab === "about" && <About c={c} />}
                </div>

                {/* Kompyuterda: tariflar yon ustunda */}
                <aside className="hidden lg:block sticky top-[88px] space-y-4">
                    {c.live && <LiveCard c={c} />}
                    <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-text-muted">Klub kartalari</p>
                    {c.tiers.map((t) => (
                        <TierOffer key={t.id} c={c} t={t} member={member} />
                    ))}
                </aside>
            </div>
        </div>
    );
}

/** Tarif: karta + imtiyozlar + tugma */
function TierOffer({ c, t, member }: { c: Creator; t: Tier; member?: Membership }) {
    const rank = c.tiers.indexOf(t);
    const myRank = member ? c.tiers.findIndex((x) => x.id === member.tierId) : -1;
    const mine = rank === myRank;
    const left = t.limit ? t.limit - t.members : null;

    return (
        <div className={`${panel} p-3`}>
            <ClubCard creator={c} tier={t} member={mine ? member : undefined} />
            <div className="px-1 pt-3">
                <div className="flex items-baseline justify-between gap-2">
                    <span className="font-black text-text-main">{t.name}</span>
                    <span className="text-sm font-black text-text-main">
                        {money(t.price)} <span className="text-xs font-bold text-text-muted">so&apos;m/oy</span>
                    </span>
                </div>
                <ul className="mt-2 space-y-1.5">
                    {t.perks.map((p) => (
                        <li key={p} className="flex items-start gap-2 text-[13px] text-text-muted">
                            <Check className="w-3.5 h-3.5 mt-0.5 text-primary shrink-0" />
                            {p}
                        </li>
                    ))}
                </ul>
                <div className="mt-3 flex items-center justify-between text-[11px] font-mono text-text-muted">
                    <span>{compact(t.members)} a&apos;zo</span>
                    {left !== null && <span className="text-amber-500">{left} joy qoldi</span>}
                </div>
                <button
                    type="button"
                    disabled={mine}
                    onClick={() => openJoin(c.id, t.id)}
                    className={`mt-3 w-full py-2.5 rounded-xl text-sm font-bold cursor-pointer transition-all active:scale-[0.98] disabled:cursor-default ${
                        mine ? "bg-primary/10 text-primary" : rank > myRank ? "bg-primary hover:bg-primary/90 text-white" : "border border-border-sep text-text-muted hover:text-text-main"
                    }`}
                >
                    {mine ? "Sizning kartangiz" : myRank >= 0 ? (rank > myRank ? "Yangilash" : "Shu tarifga o'tish") : "Tanlash"}
                </button>
            </div>
        </div>
    );
}

function LiveCard({ c }: { c: Creator }) {
    return (
        <Link href={`/${c.id}/live`} className="group block relative aspect-video rounded-2xl overflow-hidden bg-black">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={c.live!.cover} alt="" className="w-full h-full object-cover opacity-80 transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 to-transparent" />
            <LiveBadge className="absolute top-3 left-3" />
            <span className="absolute top-3 right-3 inline-flex items-center gap-1 text-white text-[11px] font-mono">
                <Eye className="w-3.5 h-3.5" /> {c.live!.viewers}
            </span>
            <p className="absolute bottom-3 inset-x-3 text-white text-sm font-bold leading-snug">{c.live!.title}</p>
        </Link>
    );
}

function Posts({ c }: { c: Creator }) {
    const posts = postsOf(c.id);
    return (
        <div className="space-y-4">
            {posts.map((p) => (
                <PostCard key={p.id} post={p} showAuthor={false} />
            ))}
        </div>
    );
}

/** Media devori: bir xil o'lchamdagi kvadratlar; yopiqlari xira */
function MediaWall({ c }: { c: Creator }) {
    const memberships = useMemberships();
    const media = postsOf(c.id).filter((p) => p.media && (p.kind === "image" || p.kind === "video" || p.kind === "audio"));
    // Devor bo'sh ko'rinmasin — namunaviy ma'lumotda postlar kam
    const wall = [...media, ...media, ...media].slice(0, 12);

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
            {wall.map((p, i) => {
                const open = canSee(p, memberships);
                const tier = c.tiers.find((t) => t.id === p.tier);
                return (
                    <button
                        key={`${p.id}-${i}`}
                        type="button"
                        onClick={() => !open && tier && openJoin(c.id, tier.id)}
                        className="group relative aspect-square rounded-xl overflow-hidden bg-black cursor-pointer"
                    >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={p.media}
                            alt=""
                            className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${open ? "" : "blur-xl scale-110 opacity-70"}`}
                            style={{ objectPosition: `${(i * 37) % 100}% 50%` }}
                        />
                        {open && p.kind === "video" && (
                            <span className="absolute bottom-2 right-2 inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-black/65 text-white text-[10px] font-mono">
                                <Play className="w-3 h-3 fill-current" /> {p.duration}
                            </span>
                        )}
                        {!open && (
                            <span className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 text-white">
                                <Lock className="w-5 h-5" />
                                <span className="text-[10px] font-mono font-bold uppercase tracking-wider">{tier?.name}+</span>
                            </span>
                        )}
                    </button>
                );
            })}
        </div>
    );
}

function About({ c }: { c: Creator }) {
    const pct = c.goal ? Math.round((c.goal.current / c.goal.target) * 100) : 0;
    return (
        <div className="space-y-4">
            <div className={`${panel} p-5`}>
                <h3 className="font-black text-text-main">Klub haqida</h3>
                <p className="mt-2 text-sm text-text-muted leading-relaxed">{c.about}</p>
            </div>
            {c.goal && (
                <div className={`${panel} p-5`}>
                    <div className="flex items-center gap-2 text-[11px] font-mono font-bold uppercase tracking-wider text-text-muted">
                        <Target className="w-4 h-4 text-primary" /> Maqsad
                    </div>
                    <p className="mt-2 font-black text-text-main">{c.goal.title}</p>
                    <div className="mt-3 h-2.5 rounded-full bg-foreground/[0.07] overflow-hidden">
                        <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                    </div>
                    <p className="mt-2 flex justify-between text-xs font-mono text-text-muted">
                        <span>
                            {money(c.goal.current)} / {money(c.goal.target)} so&apos;m
                        </span>
                        <span className="font-bold text-primary">{pct}%</span>
                    </p>
                </div>
            )}
            <div className="grid grid-cols-3 gap-3">
                {[
                    { label: "A'zolar", value: compact(c.members) },
                    { label: "Postlar", value: c.posts },
                    { label: "Tariflar", value: c.tiers.length },
                ].map((s) => (
                    <div key={s.label} className={`${panel} p-4 text-center`}>
                        <p className="text-xl font-black text-text-main">{s.value}</p>
                        <p className="text-[11px] font-mono text-text-muted">{s.label}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
