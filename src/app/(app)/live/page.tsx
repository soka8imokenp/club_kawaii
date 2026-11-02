"use client";

import Link from "next/link";
import { CalendarClock } from "lucide-react";
import { useCreators, usePosts } from "@/lib/studio";
import { LiveTile, SectionHead, panel } from "@/components/club/Tiles";

export default function LivePage() {
    const CREATORS = useCreators();
    const POSTS = usePosts();
    const creatorById = (id: string) => CREATORS.find((c) => c.id === id);
    const live = CREATORS.filter((c) => c.live).sort((a, b) => b.live!.viewers - a.live!.viewers);
    const soon = POSTS.filter((p) => p.event);

    return (
        <div className="pb-10 space-y-10">
            <section>
                <h1 className="flex items-center gap-2.5 text-2xl sm:text-3xl font-black text-text-main">
                    <span className="live-dot" /> Hozir efirda
                </h1>
                <p className="mt-1 mb-5 text-sm text-text-muted">{live.reduce((s, c) => s + c.live!.viewers, 0)} kishi tomosha qilmoqda</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-6">
                    {live.map((c) => (
                        <LiveTile key={c.id} c={c} />
                    ))}
                </div>
            </section>

            <section>
                <SectionHead title="Rejadagi efirlar" />
                <div className="grid sm:grid-cols-2 gap-3">
                    {soon.map((p) => {
                        const c = creatorById(p.creatorId)!;
                        return (
                            <Link key={p.id} href={`/${c.id}`} className={`${panel} interactive-panel flex items-center gap-4 p-4`}>
                                <span className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                    <CalendarClock className="w-6 h-6" />
                                </span>
                                <span className="min-w-0 flex-1">
                                    <span className="block text-[11px] font-mono uppercase tracking-wider text-primary">{p.event!.when}</span>
                                    <span className="block font-bold text-text-main truncate">{p.event!.title}</span>
                                    <span className="block text-xs text-text-muted truncate">{c.name}</span>
                                </span>
                            </Link>
                        );
                    })}
                </div>
            </section>
        </div>
    );
}
