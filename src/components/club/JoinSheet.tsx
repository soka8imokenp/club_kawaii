"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Copy, Gift, PartyPopper, ShieldCheck, User } from "lucide-react";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { money, type Creator } from "@/lib/club";
import { join, memberNo, useMembership, type Membership } from "@/lib/membership";
import { addGift, notify, recordPayment, useAccount } from "@/lib/account";
import { useCreator } from "@/lib/studio";
import { createOpener } from "@/lib/store";
import { ClubCard } from "./ClubCard";
import { FieldLabel, LoginPrompt, MethodPicker, type Method } from "./sheets";

/* ---- Global ochish: istalgan joydan openJoin("soka", "sempai") ---- */
const opener = createOpener<{ creatorId: string; tierId?: string }>();
export const openJoin = (creatorId: string, tierId?: string) => opener.open({ creatorId, tierId });
const closeJoin = () => opener.close();

const PERIODS = [
    { months: 1, label: "1 oy", off: 0 },
    { months: 3, label: "3 oy", off: 5 },
    { months: 12, label: "1 yil", off: 15 },
] as const;

/** Klubga a'zo bo'lish oynasi: kimga → tarif → muddat (yoki sinov) → to'lov → karta "chiqariladi" */
export function JoinSheet() {
    const { open, props, key } = opener.use();
    return (
        <BottomSheet open={open} onClose={closeJoin} label="Klubga a'zo bo'lish" widthClass="sm:max-w-3xl lg:max-w-4xl">
            {props && <JoinGate key={key} creatorId={props.creatorId} initialTier={props.tierId} />}
        </BottomSheet>
    );
}

function JoinGate({ creatorId, initialTier }: { creatorId: string; initialTier?: string }) {
    const account = useAccount();
    const creator = useCreator(creatorId);
    if (!creator) return null;
    if (!account) return <LoginPrompt text={`${creator.name} klubiga qo'shilish uchun akkauntga kiring`} />;
    return <JoinBody creator={creator} initialTier={initialTier} />;
}

type Done = { kind: "member"; m: Membership } | { kind: "gift"; code: string };

function JoinBody({ creator, initialTier }: { creator: Creator; initialTier?: string }) {
    const current = useMembership(creator.id);
    const [tierId, setTierId] = useState(initialTier ?? current?.tierId ?? creator.tiers[1]?.id ?? creator.tiers[0].id);
    const [gift, setGift] = useState(false);
    // 0 — sinov muddati
    const [months, setMonths] = useState<number>(1);
    const [method, setMethod] = useState<Method>("Click");
    const [done, setDone] = useState<Done | null>(null);
    const [busy, setBusy] = useState(false);
    const [copied, setCopied] = useState(false);

    const tier = creator.tiers.find((t) => t.id === tierId)!;
    const trialOk = !!creator.trial && !current && !gift;
    const trial = months === 0 && trialOk;
    const period = PERIODS.find((p) => p.months === months) ?? PERIODS[0];
    const total = trial ? creator.trial!.price : Math.round((tier.price * period.months * (100 - period.off)) / 100 / 100) * 100;
    const isCurrent = !gift && current?.tierId === tierId;

    const pay = () => {
        setBusy(true);
        // To'lov serveri ulanmaguncha — namunaviy kechikish
        window.setTimeout(() => {
            if (gift) {
                const code = addGift(creator.id, tierId, period.months);
                recordPayment({ kind: "gift", creatorId: creator.id, title: `Sovg'a: ${creator.name} · ${tier.name}, ${period.label}`, amount: total, method });
                setDone({ kind: "gift", code });
            } else {
                const m = join(creator.id, tierId, trial ? 1 : period.months, trial ? creator.trial!.days : undefined);
                recordPayment({ kind: trial ? "trial" : "subscription", creatorId: creator.id, title: `${creator.name} · ${tier.name}${trial ? ` (sinov, ${creator.trial!.days} kun)` : `, ${period.label}`}`, amount: total, method });
                notify({ kind: "payment", title: `${creator.name} klubiga xush kelibsiz`, text: `${tier.name} kartasi ${memberNo(m.number)}`, href: "/wallet", avatar: creator.avatar });
                setDone({ kind: "member", m });
            }
            setBusy(false);
        }, 700);
    };

    if (done?.kind === "gift") {
        const link = `https://club.kawaii.uz/gift/${done.code}`;
        return (
            <div className="px-5 pb-6 pt-2 sm:p-10 text-center">
                <div className="max-w-sm mx-auto card-mint">
                    <ClubCard creator={creator} tier={tier} />
                </div>
                <div className="rise" style={{ animationDelay: "0.5s" }}>
                    <p className="mt-6 inline-flex items-center gap-2 text-primary text-xs font-mono font-bold uppercase tracking-wider">
                        <Gift className="w-4 h-4" /> Sovg&apos;a tayyor
                    </p>
                    <h2 className="mt-1 text-2xl font-black text-text-main">Havolani do&apos;stingizga yuboring</h2>
                    <p className="mt-1 text-sm text-text-muted">
                        {tier.name} kartasi, {period.label}. Havola orqali kirgan do&apos;stingiz kartani oladi.
                    </p>
                    <div className="mt-5 flex items-center gap-2 max-w-md mx-auto p-1.5 pl-4 rounded-xl bg-foreground/[0.05]">
                        <span className="flex-1 min-w-0 truncate text-left text-sm font-mono text-text-main">{link}</span>
                        <button
                            type="button"
                            onClick={() => {
                                navigator.clipboard?.writeText(link).catch(() => {});
                                setCopied(true);
                            }}
                            className="shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-white text-xs font-bold cursor-pointer"
                        >
                            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                            {copied ? "Nusxalandi" : "Nusxalash"}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (done?.kind === "member") {
        return (
            <div className="px-5 pb-6 pt-2 sm:p-10 text-center">
                <div className="max-w-sm mx-auto card-mint">
                    <ClubCard creator={creator} tier={tier} member={done.m} />
                </div>
                <div className="rise" style={{ animationDelay: "0.5s" }}>
                    <p className="mt-6 inline-flex items-center gap-2 text-primary text-xs font-mono font-bold uppercase tracking-wider">
                        <PartyPopper className="w-4 h-4" /> Xush kelibsiz
                    </p>
                    <h2 className="mt-1 text-2xl font-black text-text-main">Siz {creator.name} klubidasiz</h2>
                    <p className="mt-1 text-sm text-text-muted">
                        Kartangiz raqami <b className="font-mono text-text-main">{memberNo(done.m.number)}</b>. Yopiq postlar ochildi.
                        {done.m.trialUntil && " Sinov muddati tugagach, oylik to'lov avtomatik yechiladi — istalgan vaqtda bekor qilish mumkin."}
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
        <div className="sm:grid sm:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] sm:min-h-[540px]">
            {/* Chap: karta ko'rinishi */}
            <div className="px-5 pt-1 pb-4 sm:p-10 sm:bg-foreground/[0.03] sm:dark:bg-white/[0.02] flex flex-col justify-center">
                <p className="hidden sm:block text-xs font-mono uppercase tracking-wider text-text-muted mb-3">{gift ? "Sovg'a kartasi" : "Sizning kartangiz"}</p>
                <div className="max-w-[300px] sm:max-w-none mx-auto w-full">
                    <ClubCard creator={creator} tier={tier} member={gift ? undefined : current} />
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
                <h2 className="text-lg sm:text-xl font-black text-text-main pr-10">{gift ? "Kartani sovg'a qilish" : current ? "Tarifni o'zgartirish" : `${creator.name} klubiga qo'shilish`}</h2>

                <div className="mt-4 grid grid-cols-2 gap-1 p-1 rounded-xl bg-foreground/[0.05]">
                    {[
                        { v: false, label: "O'zimga", Icon: User },
                        { v: true, label: "Sovg'a", Icon: Gift },
                    ].map(({ v, label, Icon }) => (
                        <button
                            key={label}
                            type="button"
                            onClick={() => {
                                setGift(v);
                                if (v && months === 0) setMonths(1);
                            }}
                            className={`inline-flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-bold cursor-pointer transition-all ${gift === v ? "bg-card-bg text-text-main shadow-sm" : "text-text-muted hover:text-text-main"}`}
                        >
                            <Icon className="w-4 h-4" /> {label}
                        </button>
                    ))}
                </div>

                <FieldLabel>Tarif</FieldLabel>
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
                                        {!gift && current?.tierId === t.id && <span className="text-[10px] font-mono text-primary">hozirgi</span>}
                                    </span>
                                    <span className="block text-xs text-text-muted truncate">{t.perks.join(" · ")}</span>
                                </span>
                                <span className="text-right shrink-0">
                                    <span className="block text-sm font-black text-text-main">{money(t.price)}</span>
                                    {left !== null && <span className="block text-[10px] font-mono text-amber-500">{left} joy qoldi</span>}
                                </span>
                            </button>
                        );
                    })}
                </div>

                <FieldLabel>Muddat</FieldLabel>
                <div className={`grid ${trialOk ? "grid-cols-4" : "grid-cols-3"} gap-1 p-1 rounded-xl bg-foreground/[0.05]`}>
                    {trialOk && (
                        <button
                            type="button"
                            onClick={() => setMonths(0)}
                            className={`py-2 rounded-lg text-sm font-bold cursor-pointer transition-all leading-tight ${months === 0 ? "bg-card-bg text-text-main shadow-sm" : "text-text-muted hover:text-text-main"}`}
                        >
                            Sinov
                            <span className="block text-[10px] font-mono text-emerald-500">{creator.trial!.days} kun</span>
                        </button>
                    )}
                    {PERIODS.map((p) => (
                        <button
                            key={p.months}
                            type="button"
                            onClick={() => setMonths(p.months)}
                            className={`py-2 rounded-lg text-sm font-bold cursor-pointer transition-all leading-tight ${months === p.months ? "bg-card-bg text-text-main shadow-sm" : "text-text-muted hover:text-text-main"}`}
                        >
                            {p.label}
                            <span className={`block text-[10px] font-mono ${p.off ? "text-emerald-500" : "text-text-muted"}`}>{p.off ? `−${p.off}%` : "oylik"}</span>
                        </button>
                    ))}
                </div>
                {trial && (
                    <p className="mt-2 text-xs text-text-muted">
                        {creator.trial!.days} kun {money(creator.trial!.price)} so&apos;m, keyin {money(tier.price)} so&apos;m/oy. Istalgan vaqtda bekor qilish mumkin.
                    </p>
                )}

                <FieldLabel>To&apos;lov usuli</FieldLabel>
                <MethodPicker value={method} onChange={setMethod} />

                <div className="mt-auto pt-6">
                    <div className="flex items-baseline justify-between mb-3">
                        <span className="text-sm text-text-muted">Jami{trial ? ", sinov" : `, ${period.label}`}</span>
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
