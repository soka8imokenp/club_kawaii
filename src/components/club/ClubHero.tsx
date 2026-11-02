"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, BadgeCheck, FileText, Users } from "lucide-react";
import { categoryLabel, compact, money, type Creator } from "@/lib/club";
import { ClubCard } from "./ClubCard";
import { LiveBadge } from "./Tiles";

/** Bitta klub ekranda turish vaqti — pastki chiziqdagi progress shu vaqtda to'ladi */
const AUTO_MS = 6500;

/**
 * Bosh sahifa "qahramoni" — o'yinlardagi qahramon tanlash ekrani kabi:
 * butun fon tanlangan ijodkorning arti va rangida, orqada uning nomi katta harflarda,
 * oldinda klub kartalari to'plami, pastda — barcha klublar qatori (progress bilan).
 */
export function ClubHero({ creators }: { creators: Creator[] }) {
    const router = useRouter();
    const n = creators.length;
    const [active, setActive] = useState(0);
    const [drag, setDrag] = useState(0);
    const [dragging, setDragging] = useState(false);
    const [paused, setPaused] = useState(false);
    const start = useRef<{ x: number; y: number; id: number } | null>(null);
    const moved = useRef(false);

    const go = (d: number) => setActive((a) => (a + d + n) % n);
    const c = creators[active];
    const top = c.tiers[c.tiers.length - 1];

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
        <section
            className="club-hero relative w-screen ml-[calc(50%-50vw)] -mt-4 sm:-mt-6 overflow-hidden lg:h-[calc(100svh-64px)] lg:min-h-[620px] lg:max-h-[960px]"
            style={{ "--h": c.hue } as React.CSSProperties}
            onPointerEnter={(e) => e.pointerType === "mouse" && setPaused(true)}
            onPointerLeave={() => setPaused(false)}
            aria-roledescription="karusel"
            aria-label="Klublar"
        >
            <h1 className="sr-only">Kawaii Club — anime ijodkorlari klublari</h1>

            {/* Fon: har bir ijodkor arti, faoli ko'rinadi */}
            <div className="absolute inset-0" aria-hidden>
                {creators.map((x, i) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img key={x.id} src={x.banner} alt="" className="club-hero__bg" data-on={i === active || undefined} />
                ))}
                <div className="club-hero__tint" />
            </div>

            {/* Katta nom — kartalar ortida */}
            <div className="absolute inset-x-0 top-[6%] lg:top-auto lg:bottom-[22%] flex justify-center pointer-events-none select-none" aria-hidden>
                <span key={c.id} className="club-hero__word">
                    {c.name}
                </span>
            </div>

            <div className="relative h-full max-w-[1240px] mx-auto px-4 sm:px-6 flex flex-col">
                <div className="flex-1 flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-10 pt-6 lg:pt-0">
                    {/* Kartalar to'plami */}
                    <div
                        className="club-deck order-1 lg:order-2 shrink-0 lg:flex-1 h-[clamp(230px,60vw,300px)] sm:h-[340px] lg:h-[440px] lg:ml-12 [--deck-w:min(74vw,290px)] sm:[--deck-w:380px] lg:[--deck-w:420px]"
                        onPointerDown={onDown}
                        onPointerMove={onMove}
                        onPointerUp={onUp}
                        onPointerCancel={onUp}
                    >
                        {creators.map((x, i) => {
                            let off = i - active;
                            if (off > n / 2) off -= n;
                            if (off < -n / 2) off += n;
                            const abs = Math.abs(off);
                            const front = off === 0;
                            const dx = front ? drag : 0;
                            return (
                                <div
                                    key={x.id}
                                    className="club-deck__slot"
                                    data-dragging={front && dragging ? "" : undefined}
                                    style={{
                                        zIndex: 10 - abs,
                                        opacity: abs > 2 ? 0 : 1 - abs * 0.12,
                                        filter: front ? "none" : `brightness(${1 - abs * 0.22}) saturate(${1 - abs * 0.2})`,
                                        transform: `translate(-50%, -50%) translateX(calc(${off * 21}% + ${dx}px)) translateY(${abs * 6}%) rotate(${off * 7 + dx * 0.04}deg) scale(${1 - abs * 0.1})`,
                                        pointerEvents: abs > 2 ? "none" : undefined,
                                    }}
                                    onClick={() => {
                                        if (moved.current) return;
                                        if (front) router.push(`/${x.id}`);
                                        else setActive(i);
                                    }}
                                >
                                    <div className={`cursor-pointer ${front ? "club-hero__front" : "transition-transform hover:-translate-y-2"}`}>
                                        <ClubCard creator={x} tier={x.tiers[x.tiers.length - 1]} tilt={front && !dragging} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Tanlangan klub */}
                    <div key={c.id} className="order-2 lg:order-1 lg:w-[420px] shrink-0 text-white">
                        <p className="rise flex items-center gap-2 text-[11px] font-mono font-bold uppercase tracking-[0.2em] text-white/70">
                            {categoryLabel(c.category)} klubi
                            {c.live && <LiveBadge />}
                        </p>
                        <h2 className="rise mt-2 flex items-center gap-2 text-3xl sm:text-4xl lg:text-6xl font-black leading-[1.02] tracking-tight" style={{ animationDelay: "60ms" }}>
                            {c.name}
                            {c.verified && <BadgeCheck className="w-6 h-6 lg:w-9 lg:h-9 shrink-0" style={{ color: `oklch(0.82 0.12 ${c.hue})` }} />}
                        </h2>
                        <p className="rise mt-3 text-sm lg:text-base text-white/75 leading-relaxed max-w-md" style={{ animationDelay: "120ms" }}>
                            {c.tagline}
                        </p>
                        <p className="rise mt-4 flex items-center gap-4 text-xs font-mono text-white/60" style={{ animationDelay: "160ms" }}>
                            <span className="inline-flex items-center gap-1.5">
                                <Users className="w-3.5 h-3.5" /> {compact(c.members)} a&apos;zo
                            </span>
                            <span className="inline-flex items-center gap-1.5">
                                <FileText className="w-3.5 h-3.5" /> {c.posts} post
                            </span>
                            <span>{c.tiers.length} karta</span>
                        </p>
                        <div className="rise mt-6 flex items-center gap-4" style={{ animationDelay: "200ms" }}>
                            <Link
                                href={`/${c.id}`}
                                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white text-black text-sm font-extrabold hover:bg-white/90 active:scale-[0.98] transition-all"
                            >
                                Klubga kirish <ArrowRight className="w-4 h-4" />
                            </Link>
                            <span className="text-xs font-mono text-white/60 leading-tight">
                                kartalar
                                <br />
                                <b className="text-white">
                                    {money(c.tiers[0].price)}–{money(top.price)}
                                </b>{" "}
                                so&apos;m
                            </span>
                        </div>
                    </div>
                </div>

                {/* Klublar qatori: qahramon tanlash */}
                <div className="relative shrink-0 py-5 lg:py-7 flex gap-2 sm:gap-3 overflow-x-auto no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0" role="tablist" aria-label="Klubni tanlash">
                    {creators.map((x, i) => {
                        const on = i === active;
                        return (
                            <button
                                key={x.id}
                                type="button"
                                role="tab"
                                aria-selected={on}
                                aria-label={x.name}
                                onClick={() => setActive(i)}
                                className={`group relative shrink-0 flex items-center gap-2.5 p-1.5 pr-3 rounded-2xl text-left cursor-pointer transition-all duration-300 ${
                                    on ? "bg-white/15 backdrop-blur-md" : "hover:bg-white/8"
                                }`}
                            >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={x.avatar} alt="" className={`w-10 h-10 rounded-xl object-cover transition-all duration-300 ${on ? "" : "opacity-60 grayscale-[40%] group-hover:opacity-100"}`} />
                                <span className={`hidden sm:block min-w-0 transition-colors ${on ? "text-white" : "text-white/55 group-hover:text-white/85"}`}>
                                    <span className="block text-xs font-bold whitespace-nowrap">{x.name}</span>
                                    {/* Progress — to'lganda keyingi klubga o'tadi */}
                                    <span className="mt-1 block h-[3px] w-full min-w-16 rounded-full bg-white/15 overflow-hidden">
                                        {on && (
                                            <span
                                                key={active}
                                                className="club-hero__progress"
                                                style={{ animationDuration: `${AUTO_MS}ms`, animationPlayState: paused || dragging ? "paused" : "running" }}
                                                onAnimationEnd={() => go(1)}
                                            />
                                        )}
                                    </span>
                                </span>
                                {/* Telefonda progress — avatar ostida nuqta */}
                                {on && (
                                    <span
                                        key={`m${active}`}
                                        className="sm:hidden club-hero__progress club-hero__progress--dot"
                                        style={{ animationDuration: `${AUTO_MS}ms`, animationPlayState: paused || dragging ? "paused" : "running" }}
                                        onAnimationEnd={() => go(1)}
                                    />
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
