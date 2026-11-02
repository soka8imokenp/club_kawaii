"use client";

import { useState } from "react";
import { ArrowUpRight, Check } from "lucide-react";
import { money } from "@/lib/club";
import { usePayments } from "@/lib/account";
import { useMyClub } from "@/lib/studio";
import { createStore, uid } from "@/lib/store";
import { panel } from "@/components/club/Tiles";
import { Section, Segmented, primaryBtn } from "./ui";

const COMMISSION = 10;
const payoutsStore = createStore<{ id: string; at: number; amount: number; to: string }[]>("club.payouts", []);

/** Daromad: obunalar, xaridlar, donatlar; komissiyadan keyingi balans va yechib olish */
export function Payouts() {
    const club = useMyClub()!;
    const payments = usePayments().filter((p) => p.creatorId === club.id);
    const payouts = payoutsStore.use();
    const [to, setTo] = useState("Uzcard");
    const [done, setDone] = useState(false);

    const subs = club.tiers.reduce((s, t) => s + t.members * t.price, 0);
    const extra = payments.reduce((s, p) => s + p.amount, 0);
    const gross = subs + extra;
    const net = Math.round((gross * (100 - COMMISSION)) / 100);
    const withdrawn = payouts.reduce((s, p) => s + p.amount, 0);
    const balance = Math.max(0, net - withdrawn);

    return (
        <div className="space-y-5">
            <h1 className="text-2xl font-black text-text-main">Daromad</h1>
            <div className="grid sm:grid-cols-3 gap-3">
                <div className={`${panel} p-5 sm:col-span-1`}>
                    <p className="text-[11px] font-mono text-text-muted">Yechib olish mumkin</p>
                    <p className="mt-2 text-3xl font-black text-text-main">
                        {money(balance)} <span className="text-sm font-bold text-text-muted">so&apos;m</span>
                    </p>
                </div>
                <div className={`${panel} p-5`}>
                    <p className="text-[11px] font-mono text-text-muted">Obunalar, oyiga</p>
                    <p className="mt-2 text-xl font-black text-text-main">{money(subs)}</p>
                </div>
                <div className={`${panel} p-5`}>
                    <p className="text-[11px] font-mono text-text-muted">Xaridlar va donatlar</p>
                    <p className="mt-2 text-xl font-black text-text-main">{money(extra)}</p>
                </div>
            </div>
            <p className="text-xs text-text-muted">Platforma komissiyasi — {COMMISSION}%. To&apos;lov tizimlari xarajati shu ichida.</p>

            <Section title="Pulni yechib olish">
                <Segmented value={to} onChange={setTo} options={["Uzcard", "Humo", "Click", "Payme"].map((v) => ({ value: v, label: v }))} />
                <button
                    type="button"
                    disabled={balance < 50000}
                    onClick={() => {
                        payoutsStore.set((l) => [{ id: uid(), at: Date.now(), amount: balance, to }, ...l]);
                        setDone(true);
                    }}
                    className={primaryBtn}
                >
                    {done ? <Check className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                    {balance < 50000 ? "Kamida 50 000 so'm kerak" : `${money(balance)} so'm yechish`}
                </button>
            </Section>

            <div className={`${panel} p-5`}>
                <h2 className="font-black text-text-main mb-3">Tarix</h2>
                {payments.length === 0 && payouts.length === 0 ? (
                    <p className="py-6 text-center text-sm text-text-muted">Hali tushum yo&apos;q</p>
                ) : (
                    <div className="divide-y divide-border-sep">
                        {payouts.map((p) => (
                            <Row key={p.id} title={`Yechildi → ${p.to}`} at={p.at} amount={-p.amount} />
                        ))}
                        {payments.map((p) => (
                            <Row key={p.id} title={p.title} at={p.at} amount={p.amount} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function Row({ title, at, amount }: { title: string; at: number; amount: number }) {
    return (
        <div className="flex items-center gap-3 py-3">
            <span className="flex-1 min-w-0">
                <span className="block text-sm font-bold text-text-main truncate">{title}</span>
                <span className="block text-[11px] font-mono text-text-muted">{new Date(at).toLocaleString("ru-RU")}</span>
            </span>
            <span className={`font-mono text-sm font-bold ${amount < 0 ? "text-text-muted" : "text-emerald-500"}`}>
                {amount < 0 ? "−" : "+"}
                {money(Math.abs(amount))}
            </span>
        </div>
    );
}
