"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { ArrowUpRight, X } from "lucide-react";
import { SITES, type KawaiiSite } from "@/lib/sites";
import { usePresence } from "@/components/ui/usePresence";
import { useSwipeDismiss } from "@/components/ui/useSwipeDismiss";

// ---- Global holat: istalgan joydan (logotip, menyu) ochish ----
let isOpen = false;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
export const openSites = () => {
    isOpen = true;
    emit();
};
const closeSites = () => {
    isOpen = false;
    emit();
};
const subscribe = (l: () => void) => {
    listeners.add(l);
    return () => listeners.delete(l);
};
const noop = () => () => {};

const CLOSE_MS = 280;

/** Quyon belgisi — logotip niqobi orqali, rang currentColor */
function Bunny({ className = "" }: { className?: string }) {
    return (
        <span
            className={`block bg-current ${className}`}
            style={{ mask: "url(/images/logo.svg) center / contain no-repeat", WebkitMask: "url(/images/logo.svg) center / contain no-repeat" }}
            aria-hidden
        />
    );
}

/** Bitta sayt — ro'yxat qatori. Belgisi — bizning quyon, har sayt o'z rangida. */
function SiteRow({ site, index, onNavigate }: { site: KawaiiSite; index: number; onNavigate: () => void }) {
    const accent = `oklch(0.7 0.16 ${site.hue})`;
    const body = (
        <>
            {/* Chapdagi rangli chiziq — hover/joriy saytda to'liq balandlikka cho'ziladi */}
            <span
                className={`absolute left-0 top-1/2 -translate-y-1/2 w-[3px] rounded-r-full transition-all duration-300 ${site.current ? "h-8" : "h-0 group-hover:h-6"}`}
                style={{ background: accent }}
                aria-hidden
            />
            <span
                className="relative w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:-rotate-[8deg] group-active:scale-95"
                style={{ background: `color-mix(in oklab, ${accent} 16%, transparent)`, color: accent, boxShadow: `inset 0 0 0 1px color-mix(in oklab, ${accent} 35%, transparent)` }}
            >
                <Bunny className="w-5 h-6" />
            </span>
            <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2">
                    <span className="font-black text-text-main leading-tight">{site.name}</span>
                    {site.current && (
                        <span className="px-1.5 py-px rounded-md text-[9px] font-mono font-bold uppercase tracking-wider whitespace-nowrap" style={{ background: `color-mix(in oklab, ${accent} 18%, transparent)`, color: accent }}>
                            Shu yerda
                        </span>
                    )}
                </span>
                <span className="block text-xs text-text-muted truncate">{site.tagline}</span>
            </span>
            {!site.current && (
                <ArrowUpRight className="w-4 h-4 text-text-muted shrink-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" style={{ color: undefined }} />
            )}
        </>
    );
    const cls = "sites-tile group relative w-full flex items-center gap-3.5 pl-4 pr-4 py-3 text-left transition-colors hover:bg-foreground/[0.035] active:bg-foreground/[0.06] cursor-pointer";
    const style = { animationDelay: `${90 + index * 50}ms` };
    return site.current ? (
        <button type="button" onClick={onNavigate} className={cls} style={style}>
            {body}
        </button>
    ) : (
        <a href={site.url} onClick={onNavigate} className={cls} style={style}>
            {body}
        </a>
    );
}

/**
 * Kawaii saytlari paneli — logotipni bosib turganda yuqoridan tushadi.
 * Fonga bosish, Esc va yuqoriga svayp bilan yopiladi. Layout'da bir marta turadi.
 */
export function SitesPanel() {
    const open = useSyncExternalStore(subscribe, () => isOpen, () => false);
    const mounted = useSyncExternalStore(noop, () => true, () => false);
    const { shown, closing } = usePresence(open, CLOSE_MS);
    const [dragY, setDragY] = useState(0);
    const [dragging, setDragging] = useState(false);
    const panelRef = useRef<HTMLDivElement>(null);

    useSwipeDismiss(panelRef, {
        axis: "y",
        reverse: true,
        enabled: open && mounted,
        onMove: (y) => {
            setDragging(true);
            setDragY(y);
        },
        onRelease: (dismiss) => {
            setDragging(false);
            if (dismiss) closeSites();
            else setDragY(0);
        },
    });

    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeSites();
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [open]);

    if (!shown && dragY !== 0) setDragY(0);
    if (!shown || !mounted) return null;

    return createPortal(
        <div className="fixed inset-0 z-[1001] font-sans" role="dialog" aria-modal="true" aria-label="Kawaii saytlari">
            <button
                type="button"
                aria-label="Yopish"
                onClick={closeSites}
                className="sheet-fade absolute inset-0 bg-black/55 backdrop-blur-sm cursor-default transition-opacity duration-300"
                style={{ opacity: closing ? 0 : Math.max(0.2, 1 - dragY / 300) }}
            />
            <div className="sites-drop absolute inset-x-0 top-0 flex justify-center px-2.5 sm:px-4" style={{ paddingTop: "max(10px, env(safe-area-inset-top))" }}>
                <div
                    ref={panelRef}
                    className="relative w-full max-w-sm rounded-3xl bg-card-bg dark:bg-[#0c0c12] border border-border-sep dark:border-primary/25 shadow-2xl shadow-black/40 overflow-hidden theme-transition"
                    style={{
                        transform: closing ? "translateY(calc(-100% - 24px))" : `translateY(${-dragY}px)`,
                        transition: dragging ? "none" : `transform ${CLOSE_MS}ms cubic-bezier(0.32, 0.72, 0, 1)`,
                    }}
                >
                    {/* Sarlavha */}
                    <div className="flex items-center gap-3 px-4 pt-4 pb-3">
                        <span className="sites-bunny w-10 h-10 rounded-2xl bg-primary text-white flex items-center justify-center shadow-md shadow-primary/30">
                            <Bunny className="w-5 h-6" />
                        </span>
                        <div className="min-w-0 flex-1">
                            <div className="font-black text-text-main leading-tight">kawaii platformasi</div>
                            <div className="text-[11px] font-mono text-text-muted">Bir bosishda — boshqa saytga</div>
                        </div>
                        <button
                            type="button"
                            onClick={closeSites}
                            aria-label="Yopish"
                            className="hidden sm:flex w-9 h-9 rounded-full bg-foreground/[0.06] text-text-muted hover:text-text-main items-center justify-center cursor-pointer"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="mx-2 mb-2 rounded-2xl border border-border-sep divide-y divide-border-sep overflow-hidden">
                        {SITES.map((s, i) => (
                            <SiteRow key={s.id} site={s} index={i} onNavigate={closeSites} />
                        ))}
                    </div>

                    {/* Tortish dastagi — yuqoriga svayp bilan yopiladi */}
                    <div className="sm:hidden pb-2.5 pt-0.5" aria-hidden>
                        <span className="block mx-auto h-1 w-10 rounded-full bg-foreground/20" />
                    </div>
                </div>
            </div>
        </div>,
        document.body,
    );
}
