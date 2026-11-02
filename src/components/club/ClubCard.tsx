"use client";

import { useRef } from "react";
import type { Creator, Tier } from "@/lib/club";
import { memberNo, type Membership } from "@/lib/membership";
import { money } from "@/lib/club";

/** Kursor bo'yicha 3D egilish va golografik yaltirash (CSS o'zgaruvchilari orqali, re-render'siz) */
export function useTilt<T extends HTMLElement>(max = 12) {
    const ref = useRef<T>(null);
    const onPointerMove = (e: React.PointerEvent<T>) => {
        if (e.pointerType === "touch") return;
        const el = ref.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width;
        const y = (e.clientY - r.top) / r.height;
        el.style.setProperty("--rx", `${(0.5 - y) * max}deg`);
        el.style.setProperty("--ry", `${(x - 0.5) * max}deg`);
        el.style.setProperty("--mx", `${x * 100}%`);
        el.style.setProperty("--my", `${y * 100}%`);
        el.style.setProperty("--on", "1");
    };
    const onPointerLeave = () => {
        const el = ref.current;
        if (!el) return;
        el.style.setProperty("--rx", "0deg");
        el.style.setProperty("--ry", "0deg");
        el.style.setProperty("--on", "0");
    };
    return { ref, onPointerMove, onPointerLeave };
}

export function Bunny({ className = "" }: { className?: string }) {
    return (
        <span
            aria-hidden
            className={`inline-block bg-current ${className}`}
            style={{ mask: "url(/images/logo.svg) center / contain no-repeat", WebkitMask: "url(/images/logo.svg) center / contain no-repeat" }}
        />
    );
}

interface ClubCardProps {
    creator: Creator;
    tier: Tier;
    member?: Membership;
    /** Kursor bilan egilish */
    tilt?: boolean;
    className?: string;
}

/**
 * Klub kartasi — club.kawaii'ning "xarakteri". Har bir tarif — kolleksiya kartasi:
 * ijodkor rangida, golografik qatlam bilan. A'zo bo'lsangiz kartada raqamingiz bo'ladi.
 */
export function ClubCard({ creator, tier, member, tilt = true, className = "" }: ClubCardProps) {
    const { ref, onPointerMove, onPointerLeave } = useTilt<HTMLDivElement>();
    const level = creator.tiers.findIndex((x) => x.id === tier.id);

    return (
        <div ref={ref} onPointerMove={tilt ? onPointerMove : undefined} onPointerLeave={tilt ? onPointerLeave : undefined} className={`club-card-wrap ${className}`} style={{ "--h": creator.hue } as React.CSSProperties}>
            <div className={`club-card club-card--l${level}`}>
                {/* Ijodkor banneri — kartaning teksturasi */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={creator.banner} alt="" className="club-card__art" draggable={false} />
                <div className="club-card__shade" />
                <div className="club-card__foil" />
                <div className="club-card__glare" />

                <div className="club-card__body">
                    <div className="flex items-start justify-between gap-2">
                        <span className="club-card__brand">
                            <Bunny className="club-card__bunny" />
                            KAWAII CLUB
                        </span>
                        <span className="club-card__tier">{tier.name}</span>
                    </div>

                    <div className="flex items-center gap-[3cqw] min-w-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={creator.avatar} alt="" className="club-card__avatar" draggable={false} />
                        <div className="min-w-0">
                            <div className="club-card__name">{creator.name}</div>
                            <div className="club-card__meta">{member ? "Klub a'zosi" : `${tier.perks.length} imtiyoz`}</div>
                        </div>
                    </div>

                    <div className="flex items-end justify-between gap-2">
                        <span className="club-card__number">{member ? memberNo(member.number) : "# ————"}</span>
                        <span className="club-card__price">
                            {money(tier.price)} <small>so&apos;m/oy</small>
                        </span>
                    </div>
                </div>
                {/* Daraja chiziqlari (1–3) */}
                <div className="club-card__pips" aria-hidden>
                    {[0, 1, 2].map((i) => (
                        <i key={i} data-on={i <= level || undefined} />
                    ))}
                </div>
            </div>
        </div>
    );
}
