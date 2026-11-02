"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, ChevronLeft, ChevronRight, Users } from "lucide-react";
import { categoryLabel, compact, money, type Creator } from "@/lib/club";
import { ClubCard } from "./ClubCard";

const AUTO_MS = 5000;

/**
 * Bosh sahifa "qahramoni" — klub kartalari to'plami.
 * Yon kartani bossangiz oldinga chiqadi, oldingi kartani bossangiz — klubga o'tasiz.
 * Telefonda kartani chapga/o'ngga surib almashtirasiz.
 */
export function ClubDeck({ creators }: { creators: Creator[] }) {
    const router = useRouter();
    const n = creators.length;
    const [active, setActive] = useState(0);
    const [drag, setDrag] = useState(0);
    const [dragging, setDragging] = useState(false);
    const [paused, setPaused] = useState(false);
    const start = useRef<{ x: number; y: number; id: number } | null>(null);
    const moved = useRef(false);

    const go = (d: number) => setActive((a) => (a + d + n) % n);

    // Avtomatik almashish (kursor ustida bo'lsa yoki tortilayotganda — to'xtaydi)
    useEffect(() => {
        if (paused || dragging) return;
        const t = window.setInterval(() => setActive((a) => (a + 1) % n), AUTO_MS);
        return () => window.clearInterval(t);
    }, [paused, dragging, n]);

    const current = creators[active];
    const top = current.tiers[current.tiers.length - 1];

    const onDown = (e: React.PointerEvent) => {
        start.current = { x: e.clientX, y: e.clientY, id: e.pointerId };
        moved.current = false;
    };
    const onMove = (e: React.PointerEvent) => {
        const s = start.current;
        if (!s || s.id !== e.pointerId) return;
        const dx = e.clientX - s.x;
        if (!moved.current && Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(e.clientY - s.y)) {
            moved.current = true;
            setDragging(true);
            (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
        }
        if (moved.current) setDrag(dx);
    };
    const onUp = () => {
        if (moved.current) {
            if (Math.abs(drag) > 70) go(drag < 0 ? 1 : -1);
            setDrag(0);
            setDragging(false);
        }
        start.current = null;
    };

    return (
        <div className="flex flex-col lg:flex-row lg:items-center gap-6 lg:gap-12" onPointerEnter={() => setPaused(true)} onPointerLeave={() => setPaused(false)}>
            {/* Kartalar */}
            <div
                className="club-deck order-1 lg:order-2 shrink-0 lg:flex-1 lg:ml-6 h-[clamp(240px,62vw,300px)] sm:h-[340px] lg:h-[420px] [--deck-w:min(78vw,300px)] sm:[--deck-w:380px] lg:[--deck-w:440px]"
                onPointerDown={onDown}
                onPointerMove={onMove}
                onPointerUp={onUp}
                onPointerCancel={onUp}
            >
                {creators.map((c, i) => {
                    // Faol kartaga nisbatan o'rni: -2..2
                    let off = i - active;
                    if (off > n / 2) off -= n;
                    if (off < -n / 2) off += n;
                    const abs = Math.abs(off);
                    const front = off === 0;
                    const dx = front ? drag : 0;
                    const tier = c.tiers[c.tiers.length - 1];
                    return (
                        <div
                            key={c.id}
                            className="club-deck__slot"
                            data-dragging={front && dragging ? "" : undefined}
                            style={{
                                zIndex: 10 - abs,
                                opacity: abs > 2 ? 0 : 1,
                                filter: front ? "none" : `brightness(${1 - abs * 0.18}) saturate(${1 - abs * 0.15})`,
                                transform: `translate(-50%, -50%) translateX(calc(${off * 21}% + ${dx}px)) translateY(${abs * 5}%) rotate(${off * 6 + dx * 0.04}deg) scale(${1 - abs * 0.08})`,
                                pointerEvents: abs > 2 ? "none" : undefined,
                            }}
                            onClick={() => {
                                if (moved.current) return;
                                if (front) router.push(`/${c.id}`);
                                else setActive(i);
                            }}
                        >
                            <div className={`cursor-pointer ${front ? "" : "transition-transform hover:-translate-y-2"}`}>
                                <ClubCard creator={c} tier={tier} tilt={front && !dragging} />
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Tanlangan klub haqida */}
            <div className="order-2 lg:order-1 lg:w-[400px] shrink-0">
                <p className="hidden lg:flex items-center gap-2 text-[11px] font-mono font-bold uppercase tracking-[0.2em] text-primary">Klub kartalari</p>
                <h1 className="hidden lg:block mt-3 text-5xl font-black text-text-main leading-[1.05] tracking-tight">
                    Sevimli ijodkoringning
                    <br />
                    klubiga qo&apos;shil
                </h1>
                <p className="hidden lg:block mt-4 text-text-muted leading-relaxed">Obuna — bu klub kartasi. Yopiq postlar, a&apos;zolar efirlari va ijodkor bilan yaqin aloqa.</p>

                <div key={current.id} className="rise lg:mt-8 rounded-2xl lg:rounded-none p-4 lg:p-0 bg-card-bg dark:bg-[#0a0a0a] lg:bg-transparent lg:dark:bg-transparent border lg:border-0 border-border-sep dark:border-white/[0.06]">
                    <div className="flex items-center gap-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={current.avatar} alt="" className="w-11 h-11 rounded-xl object-cover" />
                        <div className="min-w-0 flex-1">
                            <p className="font-extrabold text-text-main truncate">{current.name}</p>
                            <p className="text-xs font-mono text-text-muted">
                                {categoryLabel(current.category)} · <Users className="inline w-3 h-3 -mt-0.5" /> {compact(current.members)}
                            </p>
                        </div>
                        <div className="flex gap-1">
                            <button type="button" onClick={() => go(-1)} aria-label="Oldingi" className="w-9 h-9 rounded-lg flex items-center justify-center text-text-muted hover:text-text-main hover:bg-foreground/[0.05] cursor-pointer">
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button type="button" onClick={() => go(1)} aria-label="Keyingi" className="w-9 h-9 rounded-lg flex items-center justify-center text-text-muted hover:text-text-main hover:bg-foreground/[0.05] cursor-pointer">
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                    <p className="mt-3 text-sm text-text-muted leading-relaxed line-clamp-2">{current.tagline}</p>
                    <div className="mt-4 flex items-center gap-3">
                        <Link
                            href={`/${current.id}`}
                            className="flex-1 lg:flex-none inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary hover:bg-primary/90 text-white text-sm font-bold active:scale-[0.98] transition-all"
                        >
                            Klubga kirish <ArrowRight className="w-4 h-4" />
                        </Link>
                        <span className="text-xs font-mono text-text-muted">
                            {money(current.tiers[0].price)}–{money(top.price)} so&apos;m
                        </span>
                    </div>
                </div>

                {/* Nuqtalar */}
                <div className="mt-4 flex gap-1.5 justify-center lg:justify-start" aria-hidden>
                    {creators.map((c, i) => (
                        <span key={c.id} className={`h-1 rounded-full transition-all duration-500 ${i === active ? "w-6 bg-primary" : "w-1.5 bg-foreground/15"}`} />
                    ))}
                </div>
            </div>
        </div>
    );
}
