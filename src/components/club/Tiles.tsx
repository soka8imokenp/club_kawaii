import Link from "next/link";
import { ArrowRight, BadgeCheck, Eye, Lock } from "lucide-react";
import { categoryLabel, compact, money, type Creator } from "@/lib/club";

export const panel = "bg-card-bg dark:bg-[#0a0a0a] rounded-2xl border border-border-sep dark:border-white/[0.06] card-shadow theme-transition";

/** Bo'lim sarlavhasi: nom + ixtiyoriy "hammasi" havolasi */
export function SectionHead({ title, href, more = "Hammasi", children }: { title: React.ReactNode; href?: string; more?: string; children?: React.ReactNode }) {
    return (
        <div className="flex items-center justify-between gap-3 mb-3">
            <h2 className="flex items-center gap-2 text-lg sm:text-xl font-black text-text-main">{title}</h2>
            {children}
            {href && (
                <Link href={href} className="inline-flex items-center gap-1 text-xs font-mono font-bold uppercase tracking-wider text-text-muted hover:text-primary transition-colors">
                    {more} <ArrowRight className="w-3.5 h-3.5" />
                </Link>
            )}
        </div>
    );
}

export function LiveBadge({ className = "" }: { className?: string }) {
    return (
        <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-[#ff3b5c] text-white text-[10px] font-mono font-bold uppercase tracking-wider ${className}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            Jonli
        </span>
    );
}

/** Ijodkor kartochkasi (katalog va tavsiyalar) */
export function CreatorTile({ c }: { c: Creator }) {
    return (
        <Link href={`/${c.id}`} className={`${panel} group block overflow-hidden interactive-panel`} style={{ "--h": c.hue } as React.CSSProperties}>
            <div className="relative h-28 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={c.banner} alt="" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                {c.live && <LiveBadge className="absolute top-3 left-3" />}
                <span className="absolute top-3 right-3 px-2 py-1 rounded-md bg-black/45 backdrop-blur text-white text-[10px] font-mono font-bold uppercase tracking-wider">{categoryLabel(c.category)}</span>
            </div>
            <div className="px-4 pb-4 -mt-7 relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={c.avatar} alt="" className="w-14 h-14 rounded-2xl object-cover ring-4 ring-card-bg dark:ring-[#0a0a0a]" />
                <p className="mt-2 flex items-center gap-1 font-extrabold text-text-main truncate">
                    {c.name}
                    {c.verified && <BadgeCheck className="w-4 h-4 text-primary shrink-0" />}
                </p>
                <p className="mt-0.5 text-xs text-text-muted line-clamp-2 min-h-[2.5em]">{c.tagline}</p>
                <div className="mt-3 flex items-center justify-between text-xs font-mono">
                    <span className="text-text-muted">{compact(c.members)} a&apos;zo</span>
                    <span className="font-bold text-text-main">{money(c.tiers[0].price)} so&apos;mdan</span>
                </div>
            </div>
        </Link>
    );
}

/** Jonli efir kartochkasi */
export function LiveTile({ c }: { c: Creator }) {
    const live = c.live!;
    const tier = c.tiers.find((t) => t.id === live.tier);
    return (
        <Link href={`/${c.id}/live`} className="group block">
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-black">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={live.cover} alt="" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />
                <LiveBadge className="absolute top-3 left-3" />
                <span className="absolute top-3 right-3 inline-flex items-center gap-1 px-2 py-1 rounded-md bg-black/55 text-white text-[11px] font-mono">
                    <Eye className="w-3.5 h-3.5" /> {live.viewers}
                </span>
                {tier && (
                    <span className="absolute bottom-3 right-3 inline-flex items-center gap-1 px-2 py-1 rounded-md bg-black/55 backdrop-blur text-white text-[10px] font-mono font-bold uppercase">
                        <Lock className="w-3 h-3" /> {tier.name}+
                    </span>
                )}
            </div>
            <div className="flex items-start gap-3 mt-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={c.avatar} alt="" className="w-9 h-9 rounded-xl object-cover shrink-0" />
                <div className="min-w-0">
                    <p className="text-sm font-bold text-text-main leading-snug line-clamp-2 group-hover:text-primary transition-colors">{live.title}</p>
                    <p className="text-xs font-mono text-text-muted">
                        {c.name} · {live.startedMin} daq
                    </p>
                </div>
            </div>
        </Link>
    );
}
