"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { CATEGORIES, CREATORS, type CategoryId } from "@/lib/club";
import { CreatorTile } from "./Tiles";

const SORTS = [
    { id: "top", label: "Mashhur" },
    { id: "live", label: "Efirda" },
    { id: "cheap", label: "Arzonroq" },
] as const;

/** Ijodkorlar katalogi: qidiruv, kategoriya (?c=) va saralash */
export function CreatorsBrowser() {
    const params = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    const cat = (params.get("c") as CategoryId | null) ?? null;
    const [q, setQ] = useState("");
    const [sort, setSort] = useState<(typeof SORTS)[number]["id"]>("top");

    const setCat = (id: CategoryId | null) => router.replace(id ? `${pathname}?c=${id}` : pathname, { scroll: false });

    const query = q.trim().toLowerCase();
    const list = CREATORS.filter((c) => !cat || c.category === cat)
        .filter((c) => !query || c.name.toLowerCase().includes(query) || c.tagline.toLowerCase().includes(query))
        .sort((a, b) => {
            if (sort === "live") return (b.live?.viewers ?? -1) - (a.live?.viewers ?? -1);
            if (sort === "cheap") return a.tiers[0].price - b.tiers[0].price;
            return b.members - a.members;
        });

    const chip = (on: boolean) =>
        `shrink-0 px-3.5 py-2 rounded-xl text-sm font-bold cursor-pointer transition-colors ${on ? "bg-primary text-white" : "bg-foreground/[0.05] text-text-muted hover:text-text-main"}`;

    return (
        <>
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                <label className="flex-1 flex items-center gap-2 h-11 px-3.5 rounded-xl bg-card-bg dark:bg-[#0a0a0a] border border-border-sep dark:border-white/[0.06] text-text-muted focus-within:border-primary transition-colors">
                    <Search className="w-4 h-4 shrink-0" />
                    <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ijodkor yoki mavzu" aria-label="Qidiruv" className="w-full bg-transparent text-sm text-text-main placeholder:text-text-muted focus:outline-none" />
                </label>
                <div className="flex gap-1 p-1 rounded-xl bg-foreground/[0.05] w-fit">
                    {SORTS.map((s) => (
                        <button
                            key={s.id}
                            type="button"
                            onClick={() => setSort(s.id)}
                            className={`px-3 py-2 rounded-lg text-xs font-bold cursor-pointer transition-all ${sort === s.id ? "bg-card-bg text-text-main shadow-sm" : "text-text-muted hover:text-text-main"}`}
                        >
                            {s.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-3 px-3 sm:mx-0 sm:px-0 mt-4 mb-5">
                <button type="button" onClick={() => setCat(null)} className={chip(!cat)}>
                    Hammasi
                </button>
                {CATEGORIES.map((c) => (
                    <button key={c.id} type="button" onClick={() => setCat(c.id)} className={chip(cat === c.id)}>
                        {c.label}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {list.map((c) => (
                    <CreatorTile key={c.id} c={c} />
                ))}
            </div>
            {list.length === 0 && <p className="py-16 text-center text-sm text-text-muted">Hech narsa topilmadi</p>}
        </>
    );
}
