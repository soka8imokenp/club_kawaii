"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { useCreators, usePosts } from "@/lib/studio";
import { PostCard } from "./PostCard";
import { CreatorTile } from "./Tiles";

/** Qidiruv: ijodkorlar va postlar (?q=) */
export function SearchView() {
    const params = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    const [q, setQ] = useState(params.get("q") ?? "");
    const [tab, setTab] = useState<"posts" | "creators">("posts");
    const creators = useCreators();
    const posts = usePosts();
    const query = q.trim().toLowerCase();
    const has = (s?: string) => !!s && s.toLowerCase().includes(query);
    const foundCreators = query ? creators.filter((c) => has(c.name) || has(c.tagline)) : [];
    const foundPosts = query ? posts.filter((p) => has(p.title) || has(p.text) || p.tags?.some((t) => has(t))) : [];

    return (
        <div className="pb-10 max-w-4xl mx-auto w-full">
            <label className="flex items-center gap-3 h-14 px-4 rounded-2xl bg-card-bg dark:bg-[#0a0a0a] border border-border-sep focus-within:border-primary transition-colors">
                <Search className="w-5 h-5 text-text-muted shrink-0" />
                <input
                    autoFocus
                    value={q}
                    onChange={(e) => {
                        setQ(e.target.value);
                        router.replace(e.target.value ? `${pathname}?q=${encodeURIComponent(e.target.value)}` : pathname, { scroll: false });
                    }}
                    placeholder="Postlar, ijodkorlar, teglar"
                    aria-label="Qidiruv"
                    className="w-full bg-transparent text-base text-text-main placeholder:text-text-muted focus:outline-none"
                />
            </label>

            {query && (
                <>
                    <div className="mt-5 flex gap-1 p-1 rounded-xl bg-foreground/[0.05] w-fit">
                        {[
                            { id: "posts" as const, label: `Postlar · ${foundPosts.length}` },
                            { id: "creators" as const, label: `Ijodkorlar · ${foundCreators.length}` },
                        ].map((t) => (
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
                    <div className="mt-5">
                        {tab === "posts" ? (
                            <div className="space-y-4 max-w-[680px]">
                                {foundPosts.map((p) => (
                                    <PostCard key={p.id} post={p} />
                                ))}
                            </div>
                        ) : (
                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {foundCreators.map((c) => (
                                    <CreatorTile key={c.id} c={c} />
                                ))}
                            </div>
                        )}
                        {(tab === "posts" ? foundPosts : foundCreators).length === 0 && <p className="py-16 text-center text-sm text-text-muted">Hech narsa topilmadi</p>}
                    </div>
                </>
            )}
            {!query && <p className="mt-10 text-center text-sm text-text-muted">Masalan: fanart, dublyaj, piano</p>}
        </div>
    );
}
