"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { Check, CreditCard, PartyPopper, ShieldCheck } from "lucide-react";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { creatorById, money, type Creator } from "@/lib/club";
import { join, memberNo, useMembership, type Membership } from "@/lib/membership";
import { ClubCard } from "./ClubCard";

/* ---- Global ochish: istalgan joydan openJoin("soka", "sempai") ---- */
type JoinState = { creatorId: string; tierId?: string; nonce: number } | null;
let state: JoinState = null;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
export function openJoin(creatorId: string, tierId?: string) {
    state = { creatorId, tierId, nonce: Date.now() };
    emit();
}
function closeJoin() {
    state = state && { ...state, nonce: -state.nonce };
    emit();
}
const subscribe = (cb: () => void) => (listeners.add(cb), () => listeners.delete(cb));

const PERIODS = [
    { months: 1, label: "1 oy", off: 0 },
    { months: 3, label: "3 oy", off: 5 },
    { months: 12, label: "1 yil", off: 15 },
] as const;

const METHODS = ["Click", "Payme", "Uzum", "Karta"] as const;

/** Klubga a'zo bo'lish oynasi: tarif → muddat → to'lov usuli → karta "chiqariladi" */
export function JoinSheet() {
    const s = useSyncExternalStore(subscribe, () => state, () => null);
    const open = !!s && s.nonce > 0;
    const creator = s ? creatorById(s.creatorId) : undefined;

    return (
        <BottomSheet open={open} onClose={closeJoin} label="Klubga a'zo bo'lish" widthClass="sm:max-w-3xl lg:max-w-4xl">
            {creator && s && <JoinBody key={Math.abs(s.nonce)} creator={creator} initialTier={s.tierId} />}
        </BottomSheet>
    );
}

function JoinBody({ creator, initialTier }: { creator: Creator; initialTier?: string }) {
    const current = useMembership(creator.id);
    const [tierId, setTierId] = useState(initialTier ?? current?.tierId ?? creator.tiers[1]?.id ?? creator.tiers[0].id);
    const [months, setMonths] = useState<number>(1);
    const [method, setMethod] = useState<(typeof METHODS)[number]>("Click");
    const [done, setDone] = useState<Membership | null>(null);
    const [busy, setBusy] = useState(false);

    const tier = creator.tiers.find((t) => t.id === tierId)!;
    const period = PERIODS.find((p) => p.months === months)!;
    const total = Math.round((tier.price * months * (100 - period.off)) / 100 / 100) * 100;
    const isCurrent = current?.tierId === tierId;

    const pay = () => {
        setBusy(true);
        // To'lov serveri ulanmaguncha — namunaviy kechikish
        window.setTimeout(() => {
            setDone(join(creator.id, tierId, months));
            setBusy(false);
        }, 700);
    };

    if (done) {
        return (
            <div className="px-5 pb-6 pt-2 sm:p-10 text-center">
                <div className="max-w-sm mx-auto card-mint">
                    <ClubCard creator={creator} tier={tier} member={done} />
                </div>
                <div className="rise" style={{ animationDelay: "0.5s" }}>
                    <p className="mt-6 inline-flex items-center gap-2 text-primary text-xs font-mono font-bold uppercase tracking-wider">
                        <PartyPopper className="w-4 h-4" /> Xush kelibsiz
                    </p>
                    <h2 className="mt-1 text-2xl font-black text-text-main">Siz {creator.name} klubidasiz</h2>
                    <p className="mt-1 text-sm text-text-muted">
                        Kartangiz raqami <b className="font-mono text-text-main">{memberNo(done.number)}</b>. Yopiq postlar ochildi.
                    </p>
                    <div className="mt-6 flex flex-col sm:flex-row gap-2 justify-center">
                        <button type="button" onClick={closeJoin} className="px-6 py-3 rounded-xl bg-primary text-white text-sm font-bold cursor-pointer hover:bg-primary/90 active:scale-[0.98] transition-all">
                            Postlarni ko&apos;rish
                        </button>
                        <Link href="/wallet" onClick={closeJoin} className="px-6 py-3 rounded-xl border border-border-sep text-sm font-bold text-text-main hover:border-primary/40 transition-colors">
                            Kartalarim
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="sm:grid sm:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] sm:min-h-[520px]">
            {/* Chap: karta ko'rinishi */}
            <div className="px-5 pt-1 pb-4 sm:p-10 sm:bg-foreground/[0.03] sm:dark:bg-white/[0.02] flex flex-col justify-center">
                <p className="hidden sm:block text-xs font-mono uppercase tracking-wider text-text-muted mb-3">Sizning kartangiz</p>
                <div className="max-w-[300px] sm:max-w-none mx-auto w-full">
                    <ClubCard creator={creator} tier={tier} member={current} />
                </div>
                <ul className="hidden sm:block mt-6 space-y-2">
                    {tier.perks.map((p) => (
                        <li key={p} className="flex items-start gap-2 text-sm text-text-main">
                            <Check className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                            {p}
                        </li>
                    ))}
                </ul>
            </div>

            {/* O'ng: tanlovlar */}
            <div className="px-5 pb-5 sm:p-8 flex flex-col">
                <h2 className="text-lg sm:text-xl font-black text-text-main pr-10">{current ? "Tarifni o'zgartirish" : `${creator.name} klubiga qo'shilish`}</h2>

                <Label>Tarif</Label>
                <div className="space-y-2" role="radiogroup" aria-label="Tarif">
                    {creator.tiers.map((t) => {
                        const on = t.id === tierId;
                        const left = t.limit ? t.limit - t.members : null;
                        return (
                            <button
                                key={t.id}
                                type="button"
                                role="radio"
                                aria-checked={on}
                                onClick={() => setTierId(t.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left cursor-pointer transition-colors ${
                                    on ? "border-primary bg-primary/[0.07]" : "border-border-sep hover:border-primary/40"
                                }`}
                            >
                                <span className={`w-4 h-4 rounded-full border-2 shrink-0 ${on ? "border-primary bg-primary shadow-[inset_0_0_0_3px_var(--color-card-bg)]" : "border-text-muted/50"}`} />
                                <span className="flex-1 min-w-0">
                                    <span className="flex items-center gap-2 text-sm font-bold text-text-main">
                                        {t.name}
                                        {current?.tierId === t.id && <span className="text-[10px] font-mono text-primary">hozirgi</span>}
                                    </span>
                                    <span className="block text-xs text-text-muted truncate sm:hidden">{t.perks[0]}</span>
                                    <span className="hidden sm:block text-xs text-text-muted truncate">{t.perks.join(" · ")}</span>
                                </span>
                                <span className="text-right shrink-0">
                                    <span className="block text-sm font-black text-text-main">{money(t.price)}</span>
                                    {left !== null && <span className="block text-[10px] font-mono text-amber-500">{left} joy qoldi</span>}
                                </span>
                            </button>
                        );
                    })}
                </div>

                <Label>Muddat</Label>
                <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-foreground/[0.05]">
                    {PERIODS.map((p) => (
                        <button
                            key={p.months}
                            type="button"
                            onClick={() => setMonths(p.months)}
                            className={`py-2 rounded-lg text-sm font-bold cursor-pointer transition-all ${months === p.months ? "bg-card-bg text-text-main shadow-sm" : "text-text-muted hover:text-text-main"}`}
                        >
                            {p.label}
                            {p.off > 0 && <span className="ml-1 text-[10px] font-mono text-emerald-500">−{p.off}%</span>}
                        </button>
                    ))}
                </div>

                <Label>To&apos;lov usuli</Label>
                <div className="grid grid-cols-4 gap-2">
                    {METHODS.map((m) => (
                        <button
                            key={m}
                            type="button"
                            onClick={() => setMethod(m)}
                            className={`h-11 rounded-xl border text-xs font-bold cursor-pointer transition-colors inline-flex items-center justify-center gap-1 ${
                                method === m ? "border-primary text-primary bg-primary/[0.07]" : "border-border-sep text-text-muted hover:text-text-main"
                            }`}
                        >
                            {m === "Karta" && <CreditCard className="w-3.5 h-3.5" />}
                            {m}
                        </button>
                    ))}
                </div>

                <div className="mt-auto pt-6">
                    <div className="flex items-baseline justify-between mb-3">
                        <span className="text-sm text-text-muted">Jami, {period.label}</span>
                        <span className="text-2xl font-black text-text-main">
                            {money(total)} <span className="text-sm font-bold text-text-muted">so&apos;m</span>
                        </span>
                    </div>
                    <button
                        type="button"
                        disabled={busy || isCurrent}
                        onClick={pay}
                        className="w-full py-3.5 rounded-xl bg-primary hover:bg-primary/90 text-white font-mono text-sm uppercase tracking-wider font-extrabold cursor-pointer transition-all active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none"
                    >
                        {isCurrent ? "Bu sizning tarifingiz" : busy ? "To'lanmoqda…" : `${method} orqali to'lash`}
                    </button>
                    <p className="mt-2 flex items-center justify-center gap-1.5 text-[11px] text-text-muted">
                        <ShieldCheck className="w-3.5 h-3.5" /> Istalgan vaqtda bekor qilish mumkin
                    </p>
                </div>
            </div>
        </div>
    );
}

function Label({ children }: { children: React.ReactNode }) {
    return <p className="mt-5 mb-2 text-[11px] font-mono font-bold uppercase tracking-wider text-text-muted">{children}</p>;
}
