import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Palette } from "lucide-react";
import { CATEGORIES, CREATORS } from "@/lib/club";
import { ClubHero } from "@/components/club/ClubHero";
import { CreatorTile, LiveTile, SectionHead, panel } from "@/components/club/Tiles";

export const metadata: Metadata = {
    title: "Kawaii Club • Ijodkorlar klublari",
    description: "Anime ijodkorlari klublari: obunalar, yopiq kontent va jonli efirlar.",
};

export default function HomePage() {
    const featured = [...CREATORS].sort((a, b) => b.members - a.members).slice(0, 6);
    const live = CREATORS.filter((c) => c.live).sort((a, b) => b.live!.viewers - a.live!.viewers).slice(0, 3);

    return (
        <div className="space-y-10 sm:space-y-14 pb-10">
            {/* Qahramon: qahramon tanlash ekrani uslubida klub kartalari */}
            <ClubHero creators={featured} />

            {/* Jonli efirlar */}
            {live.length > 0 && (
                <section>
                    <SectionHead
                        href="/live"
                        title={
                            <>
                                <span className="live-dot" /> Hozir efirda
                            </>
                        }
                    />
                    <div className="flex sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-4 overflow-x-auto sm:overflow-visible no-scrollbar snap-x snap-mandatory -mx-3 px-3 sm:mx-0 sm:px-0">
                        {live.map((c) => (
                            <div key={c.id} className="w-[78vw] sm:w-auto shrink-0 snap-start">
                                <LiveTile c={c} />
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Klublar */}
            <section>
                <SectionHead title="Mashhur klublar" href="/creators" />
                <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-3 px-3 sm:mx-0 sm:px-0 mb-4">
                    {CATEGORIES.map((c) => (
                        <Link
                            key={c.id}
                            href={`/creators?c=${c.id}`}
                            className="shrink-0 px-3.5 py-2 rounded-xl bg-foreground/[0.05] text-sm font-bold text-text-muted hover:text-text-main hover:bg-foreground/[0.08] transition-colors"
                        >
                            {c.label}
                        </Link>
                    ))}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {CREATORS.slice(0, 8).map((c) => (
                        <CreatorTile key={c.id} c={c} />
                    ))}
                </div>
            </section>

            {/* Ijodkorlar uchun */}
            <section className={`${panel} p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center gap-5`}>
                <span className="w-12 h-12 rounded-2xl bg-primary/12 text-primary flex items-center justify-center shrink-0">
                    <Palette className="w-6 h-6" />
                </span>
                <div className="flex-1">
                    <h2 className="text-lg font-black text-text-main">Ijodkormisiz? O&apos;z klubingizni oching</h2>
                    <p className="mt-1 text-sm text-text-muted">Tariflar va kartalaringizni yarating, yopiq postlar chiqaring, a&apos;zolar uchun efir qiling. Komissiya — faqat daromaddan.</p>
                </div>
                <button type="button" className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-primary hover:bg-primary/90 text-white text-sm font-bold cursor-pointer active:scale-[0.98] transition-all">
                    Ijodkor bo&apos;lish <ArrowRight className="w-4 h-4" />
                </button>
            </section>
        </div>
    );
}
