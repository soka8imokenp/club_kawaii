"use client";

import Link from "next/link";
import { ArrowLeft, BadgeCheck, SearchX } from "lucide-react";
import { agoLabel, compact, postAgoMin } from "@/lib/club";
import { useMembership } from "@/lib/membership";
import { useCreator, useMyClub, usePosts } from "@/lib/studio";
import { Comments } from "./Comments";
import { openJoin } from "./JoinSheet";
import { PostCard } from "./PostCard";
import { panel } from "./Tiles";
import { useNow } from "@/lib/store";

/** Post sahifasi: to'liq post, izohlar, ijodkor va uning boshqa postlari */
export function PostView({ id }: { id: string }) {
    const posts = usePosts({ includeScheduled: true });
    const myClub = useMyClub();
    const post = posts.find((p) => p.id === id);
    const creator = useCreator(post?.creatorId ?? "");
    const member = useMembership(post?.creatorId ?? "");
    const now = useNow();

    if (!post || !creator || (post.publishAt && post.publishAt > now && myClub?.id !== post.creatorId)) {
        return (
            <div className="py-24 text-center">
                <SearchX className="w-10 h-10 mx-auto text-text-muted" />
                <h1 className="mt-4 text-xl font-black text-text-main">Post topilmadi</h1>
                <Link href="/feed" className="inline-block mt-5 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-bold">
                    Lentaga qaytish
                </Link>
            </div>
        );
    }

    const more = posts.filter((p) => p.creatorId === post.creatorId && p.id !== post.id && !(p.publishAt && p.publishAt > now)).slice(0, 4);

    return (
        <div className="pb-10">
            <Link href={`/${creator.id}`} className="inline-flex items-center gap-2 mb-4 text-sm font-bold text-text-muted hover:text-text-main transition-colors">
                <ArrowLeft className="w-4 h-4" /> {creator.name}
            </Link>
            <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_340px] gap-6 items-start">
                <div className="min-w-0 max-w-[760px] space-y-4">
                    <PostCard post={post} full />
                    <Comments post={post} />
                </div>

                <aside className="mt-6 lg:mt-0 lg:sticky lg:top-[88px] space-y-4">
                    <div className={`${panel} p-4`}>
                        <Link href={`/${creator.id}`} className="flex items-center gap-3">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={creator.avatar} alt="" className="w-12 h-12 rounded-2xl object-cover" />
                            <span className="min-w-0">
                                <span className="flex items-center gap-1 font-black text-text-main truncate">
                                    {creator.name}
                                    {creator.verified && <BadgeCheck className="w-4 h-4 text-primary shrink-0" />}
                                </span>
                                <span className="text-xs font-mono text-text-muted">{compact(creator.members)} a&apos;zo</span>
                            </span>
                        </Link>
                        <p className="mt-3 text-sm text-text-muted leading-relaxed">{creator.tagline}</p>
                        {!member && myClub?.id !== creator.id && (
                            <button type="button" onClick={() => openJoin(creator.id)} className="mt-4 w-full py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-sm font-bold cursor-pointer active:scale-[0.98] transition-all">
                                Klubga qo&apos;shilish
                            </button>
                        )}
                    </div>
                    {more.length > 0 && (
                        <div className={`${panel} p-3`}>
                            <p className="px-2 pt-1 pb-2 text-[11px] font-mono font-bold uppercase tracking-wider text-text-muted">Boshqa postlar</p>
                            {more.map((p) => (
                                <Link key={p.id} href={`/p/${p.id}`} className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-foreground/[0.04] transition-colors">
                                    {p.media ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={p.media} alt="" className="w-14 h-10 rounded-lg object-cover shrink-0" />
                                    ) : (
                                        <span className="w-14 h-10 rounded-lg bg-primary/10 shrink-0" />
                                    )}
                                    <span className="min-w-0">
                                        <span className="block text-sm font-bold text-text-main line-clamp-1">{p.title}</span>
                                        <span className="block text-[11px] font-mono text-text-muted">{agoLabel(postAgoMin(p))}</span>
                                    </span>
                                </Link>
                            ))}
                        </div>
                    )}
                </aside>
            </div>
        </div>
    );
}
