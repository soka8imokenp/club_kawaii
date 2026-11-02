"use client";

import Link from "next/link";
import { Clock, Eye, Lock, PenSquare, Radio, ShoppingBag, Trash2 } from "lucide-react";
import { agoLabel, money, postAgoMin } from "@/lib/club";
import { deletePost, useMyClub, useMyPosts } from "@/lib/studio";
import { panel } from "@/components/club/Tiles";
import { primaryBtn } from "./ui";
import { useNow } from "@/lib/store";

const KIND: Record<string, string> = { text: "Matn", image: "Rasm", video: "Video", audio: "Audio", poll: "So'rovnoma", event: "Anons" };

export function StudioPosts() {
    const club = useMyClub()!;
    const posts = useMyPosts();
    const now = useNow();
    const chip = "inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase";

    return (
        <div>
            <div className="flex items-center justify-between gap-3 mb-5">
                <h1 className="text-2xl font-black text-text-main">Postlar</h1>
                <Link href="/studio/new" className={primaryBtn}>
                    <PenSquare className="w-4 h-4" /> Yangi post
                </Link>
            </div>
            {posts.length === 0 ? (
                <div className={`${panel} py-16 text-center`}>
                    <p className="font-bold text-text-main">Hali post yo&apos;q</p>
                    <p className="mt-1 text-sm text-text-muted">Birinchi post — a&apos;zolar uchun eng muhim signal</p>
                </div>
            ) : (
                <div className={`${panel} divide-y divide-border-sep`}>
                    {posts.map((p) => {
                        const tier = club.tiers.find((t) => t.id === p.tier);
                        const scheduled = p.publishAt && p.publishAt > now;
                        return (
                            <div key={p.id} className="flex items-center gap-3 p-3 sm:p-4">
                                {p.media ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={p.media} alt="" className="w-16 h-12 rounded-lg object-cover shrink-0" />
                                ) : (
                                    <span className="w-16 h-12 rounded-lg bg-primary/10 shrink-0" />
                                )}
                                <div className="flex-1 min-w-0">
                                    <Link href={`/studio/posts/${p.id}`} className="block text-sm font-bold text-text-main truncate hover:text-primary">
                                        {p.title}
                                    </Link>
                                    <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px] font-mono text-text-muted">
                                        <span>{KIND[p.kind]}</span>
                                        <span>·</span>
                                        {scheduled ? (
                                            <span className={`${chip} bg-amber-400/15 text-amber-600 dark:text-amber-300`}>
                                                <Clock className="w-3 h-3" /> {new Date(p.publishAt!).toLocaleString("ru-RU", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                                            </span>
                                        ) : (
                                            <span>{agoLabel(postAgoMin(p))}</span>
                                        )}
                                        <span className={`${chip} ${tier ? "bg-primary/10 text-primary" : "bg-foreground/[0.06]"}`}>
                                            {tier ? <Lock className="w-3 h-3" /> : <Eye className="w-3 h-3" />} {tier ? `${tier.name}+` : "Ochiq"}
                                        </span>
                                        {p.publicAfterMin && <span className={`${chip} bg-foreground/[0.06]`}>Erta kirish</span>}
                                        {p.price && (
                                            <span className={`${chip} bg-foreground/[0.06]`}>
                                                <ShoppingBag className="w-3 h-3" /> {money(p.price)}
                                            </span>
                                        )}
                                        {p.vod && (
                                            <span className={`${chip} bg-[#ff3b5c]/10 text-[#ff3b5c]`}>
                                                <Radio className="w-3 h-3" /> Yozuv
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <Link href={`/studio/posts/${p.id}`} aria-label="Tahrirlash" className="p-2 rounded-lg text-text-muted hover:text-text-main hover:bg-foreground/[0.05]">
                                    <PenSquare className="w-4 h-4" />
                                </Link>
                                <button
                                    type="button"
                                    aria-label="O'chirish"
                                    onClick={() => confirm("Postni o'chirasizmi?") && deletePost(p.id)}
                                    className="p-2 rounded-lg text-text-muted hover:text-rose-500 hover:bg-rose-500/10 cursor-pointer"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
