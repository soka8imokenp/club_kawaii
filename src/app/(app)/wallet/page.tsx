"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, CalendarDays, Check, CreditCard, WalletCards } from "lucide-react";
import { creatorById, money } from "@/lib/club";
import { formatDate, leave, memberNo, nextCharge, useMemberships } from "@/lib/membership";
import { ClubCard } from "@/components/club/ClubCard";
import { openJoin } from "@/components/club/JoinSheet";
import { panel } from "@/components/club/Tiles";

/** Klub kartalarim — hamyon: kartalar ustma-ust, bosilgani ochiladi */
export default function WalletPage() {
    const list = useMemberships();
    const [selected, setSelected] = useState<string | null>(null);
    const [confirm, setConfirm] = useState(false);
    const activeId = list.some((m) => m.creatorId === selected) ? selected : list[0]?.creatorId;
    const m = list.find((x) => x.creatorId === activeId);
    const c = m && creatorById(m.creatorId);
    const tier = c && m && c.tiers.find((t) => t.id === m.tierId);
    const total = list.reduce((s, x) => s + (creatorById(x.creatorId)?.tiers.find((t) => t.id === x.tierId)?.price ?? 0), 0);

    if (list.length === 0) {
        return (
            <div className="max-w-md mx-auto text-center py-20">
                <span className="w-16 h-16 mx-auto rounded-3xl bg-primary/10 text-primary flex items-center justify-center">
                    <WalletCards className="w-8 h-8" />
                </span>
                <h1 className="mt-5 text-2xl font-black text-text-main">Hamyoningiz bo&apos;sh</h1>
                <p className="mt-2 text-sm text-text-muted">Klubga qo&apos;shilsangiz, uning kartasi shu yerda paydo bo&apos;ladi.</p>
                <Link href="/creators" className="inline-flex items-center gap-2 mt-6 px-6 py-3 rounded-xl bg-primary text-white text-sm font-bold">
                    Ijodkorlarni ko&apos;rish <ArrowRight className="w-4 h-4" />
                </Link>
            </div>
        );
    }

    return (
        <div className="pb-10">
            <div className="flex items-end justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-black text-text-main">Klub kartalarim</h1>
                    <p className="mt-1 text-sm text-text-muted">
                        {list.length} ta klub · oyiga {money(total)} so&apos;m
                    </p>
                </div>
            </div>

            <div className="lg:grid lg:grid-cols-[440px_minmax(0,1fr)] gap-10 items-start">
                {/* Kartalar to'plami */}
                <div className="max-w-[440px] mx-auto lg:mx-0 w-full flex flex-col">
                    {list.map((x, i) => {
                        const cr = creatorById(x.creatorId);
                        const t = cr?.tiers.find((tt) => tt.id === x.tierId);
                        if (!cr || !t) return null;
                        const prevActive = i > 0 && list[i - 1].creatorId === activeId;
                        const isActive = x.creatorId === activeId;
                        return (
                            <button
                                key={x.creatorId}
                                type="button"
                                onClick={() => {
                                    setSelected(x.creatorId);
                                    setConfirm(false);
                                }}
                                aria-pressed={isActive}
                                className={`relative block w-full text-left cursor-pointer transition-[margin,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${isActive ? "" : "hover:-translate-y-1.5"}`}
                                style={{ marginTop: i === 0 ? 0 : prevActive ? "4%" : "-48%", zIndex: i }}
                            >
                                <ClubCard creator={cr} tier={t} member={x} tilt={isActive} />
                            </button>
                        );
                    })}
                </div>

                {/* Tanlangan a'zolik */}
                {m && c && tier && (
                    <div key={c.id} className={`rise ${panel} mt-8 lg:mt-0 p-5 sm:p-7`}>
                        <div className="flex items-center gap-3">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={c.avatar} alt="" className="w-12 h-12 rounded-2xl object-cover" />
                            <div className="flex-1 min-w-0">
                                <Link href={`/${c.id}`} className="block font-black text-text-main hover:text-primary transition-colors truncate">
                                    {c.name}
                                </Link>
                                <p className="text-xs font-mono text-text-muted">
                                    {tier.name} · {memberNo(m.number)}
                                </p>
                            </div>
                            <Link href={`/${c.id}`} className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-foreground/[0.05] text-sm font-bold text-text-main hover:bg-foreground/[0.08] transition-colors">
                                Klubga <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>

                        <dl className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-3">
                            <Info label="A'zo bo'lgan" value={formatDate(m.since)} Icon={CalendarDays} />
                            <Info label="Keyingi to'lov" value={formatDate(nextCharge(m))} Icon={CreditCard} />
                            <Info label="Oylik" value={`${money(tier.price)} so'm`} Icon={WalletCards} />
                        </dl>

                        <p className="mt-6 mb-2 text-[11px] font-mono font-bold uppercase tracking-wider text-text-muted">Imtiyozlar</p>
                        <ul className="space-y-2">
                            {tier.perks.map((p) => (
                                <li key={p} className="flex items-start gap-2 text-sm text-text-main">
                                    <Check className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                                    {p}
                                </li>
                            ))}
                        </ul>

                        <div className="mt-7 flex flex-col sm:flex-row gap-2">
                            <button
                                type="button"
                                onClick={() => openJoin(c.id)}
                                className="px-5 py-3 rounded-xl bg-primary hover:bg-primary/90 text-white text-sm font-bold cursor-pointer active:scale-[0.98] transition-all"
                            >
                                Tarifni o&apos;zgartirish
                            </button>
                            {confirm ? (
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            leave(c.id);
                                            setConfirm(false);
                                        }}
                                        className="flex-1 px-5 py-3 rounded-xl bg-rose-500 hover:bg-rose-500/90 text-white text-sm font-bold cursor-pointer"
                                    >
                                        Ha, bekor qilish
                                    </button>
                                    <button type="button" onClick={() => setConfirm(false)} className="px-5 py-3 rounded-xl border border-border-sep text-sm font-bold text-text-main cursor-pointer">
                                        Yo&apos;q
                                    </button>
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => setConfirm(true)}
                                    className="px-5 py-3 rounded-xl border border-border-sep text-sm font-bold text-text-muted hover:text-rose-500 hover:border-rose-500/40 cursor-pointer transition-colors"
                                >
                                    A&apos;zolikni bekor qilish
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function Info({ label, value, Icon }: { label: string; value: string; Icon: typeof CalendarDays }) {
    return (
        <div className="p-3 rounded-xl bg-foreground/[0.04]">
            <dt className="flex items-center gap-1.5 text-[11px] font-mono text-text-muted">
                <Icon className="w-3.5 h-3.5" /> {label}
            </dt>
            <dd className="mt-1 text-sm font-bold text-text-main">{value}</dd>
        </div>
    );
}
