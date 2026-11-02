"use client";

import { useState } from "react";
import { Check, CreditCard, Send, ShieldCheck } from "lucide-react";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { money } from "@/lib/club";
import { login, recordPayment, useAccount, type PaymentKind } from "@/lib/account";
import { createOpener } from "@/lib/store";

export const METHODS = ["Click", "Payme", "Uzum", "Karta"] as const;
export type Method = (typeof METHODS)[number];

/** To'lov usulini tanlash qatori */
export function MethodPicker({ value, onChange }: { value: Method; onChange: (m: Method) => void }) {
    return (
        <div className="grid grid-cols-4 gap-2">
            {METHODS.map((m) => (
                <button
                    key={m}
                    type="button"
                    onClick={() => onChange(m)}
                    className={`h-11 rounded-xl border text-xs font-bold cursor-pointer transition-colors inline-flex items-center justify-center gap-1 ${
                        value === m ? "border-primary text-primary bg-primary/[0.07]" : "border-border-sep text-text-muted hover:text-text-main"
                    }`}
                >
                    {m === "Karta" && <CreditCard className="w-3.5 h-3.5" />}
                    {m}
                </button>
            ))}
        </div>
    );
}

export function FieldLabel({ children }: { children: React.ReactNode }) {
    return <p className="mt-5 mb-2 text-[11px] font-mono font-bold uppercase tracking-wider text-text-muted">{children}</p>;
}

/** Kirmagan bo'lsa — to'lov oynasi o'rnida chiqadi */
export function LoginPrompt({ text = "Davom etish uchun akkauntga kiring" }: { text?: string }) {
    return (
        <div className="px-5 pb-6 pt-2 sm:p-10 text-center">
            <span className="w-14 h-14 mx-auto rounded-2xl bg-[#2AABEE]/15 text-[#2AABEE] flex items-center justify-center">
                <Send className="w-6 h-6" />
            </span>
            <h2 className="mt-4 text-xl font-black text-text-main">Kirish</h2>
            <p className="mt-1 text-sm text-text-muted">{text}</p>
            <button
                type="button"
                onClick={login}
                className="mt-6 w-full max-w-xs mx-auto inline-flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#2AABEE] hover:bg-[#2AABEE]/90 text-white text-sm font-bold cursor-pointer active:scale-[0.98] transition-all"
            >
                <Send className="w-4 h-4" /> Telegram orqali kirish
            </button>
            <p className="mt-3 text-[11px] text-text-muted">Parol kerak emas — Telegram tasdiqlaydi</p>
        </div>
    );
}

/* ================= Kirish oynasi ================= */
const loginOpener = createOpener<null>();
export const openLogin = () => loginOpener.open(null);

export function LoginSheet() {
    const { open, key } = loginOpener.use();
    const account = useAccount();
    return (
        <BottomSheet open={open && !account} onClose={loginOpener.close} label="Kirish">
            <LoginPrompt key={key} text="Klublarga qo'shilish, izoh yozish va efirlarda chat uchun" />
        </BottomSheet>
    );
}

/* ================= Universal to'lov oynasi ================= */
export interface PayRequest {
    title: string;
    subtitle?: string;
    image?: string;
    amount: number;
    kind: PaymentKind;
    creatorId: string;
    /** Jismoniy mahsulot — manzil so'raladi */
    address?: boolean;
    onPaid: () => void;
    doneText?: string;
}

const payOpener = createOpener<PayRequest>();
export const openPay = (r: PayRequest) => payOpener.open(r);

export function PaySheet() {
    const { open, props, key } = payOpener.use();
    return (
        <BottomSheet open={open} onClose={payOpener.close} label="To'lov">
            {props && <PayBody key={key} r={props} />}
        </BottomSheet>
    );
}

function PayBody({ r }: { r: PayRequest }) {
    const account = useAccount();
    const [method, setMethod] = useState<Method>("Click");
    const [address, setAddress] = useState("");
    const [state, setState] = useState<"idle" | "busy" | "done">("idle");

    if (!account) return <LoginPrompt />;

    if (state === "done") {
        return (
            <div className="px-5 pb-6 pt-2 sm:p-8 text-center">
                <span className="w-14 h-14 mx-auto rounded-full bg-emerald-500/15 text-emerald-500 flex items-center justify-center rise">
                    <Check className="w-7 h-7" />
                </span>
                <h2 className="mt-4 text-xl font-black text-text-main">To&apos;landi</h2>
                <p className="mt-1 text-sm text-text-muted">{r.doneText ?? "Xaridingiz ochildi"}</p>
                <button type="button" onClick={payOpener.close} className="mt-6 w-full py-3 rounded-xl bg-primary text-white text-sm font-bold cursor-pointer">
                    Yopish
                </button>
            </div>
        );
    }

    const pay = () => {
        setState("busy");
        window.setTimeout(() => {
            recordPayment({ kind: r.kind, creatorId: r.creatorId, title: r.title, amount: r.amount, method });
            r.onPaid();
            setState("done");
        }, 650);
    };

    return (
        <div className="px-5 pb-5 sm:p-7">
            <div className="flex items-center gap-3 pr-10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {r.image && <img src={r.image} alt="" className="w-14 h-14 rounded-xl object-cover shrink-0" />}
                <div className="min-w-0">
                    <h2 className="font-black text-text-main leading-snug">{r.title}</h2>
                    {r.subtitle && <p className="text-xs text-text-muted">{r.subtitle}</p>}
                </div>
            </div>

            {r.address && (
                <>
                    <FieldLabel>Yetkazib berish manzili</FieldLabel>
                    <textarea
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        rows={2}
                        placeholder="Shahar, ko'cha, uy"
                        aria-label="Manzil"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-foreground/[0.04] border border-border-sep text-sm text-text-main placeholder:text-text-muted focus:outline-none focus:border-primary resize-none"
                    />
                </>
            )}

            <FieldLabel>To&apos;lov usuli</FieldLabel>
            <MethodPicker value={method} onChange={setMethod} />

            <div className="mt-6 flex items-baseline justify-between mb-3">
                <span className="text-sm text-text-muted">Jami</span>
                <span className="text-2xl font-black text-text-main">
                    {money(r.amount)} <span className="text-sm font-bold text-text-muted">so&apos;m</span>
                </span>
            </div>
            <button
                type="button"
                onClick={pay}
                disabled={state === "busy" || (r.address && address.trim().length < 6)}
                className="w-full py-3.5 rounded-xl bg-primary hover:bg-primary/90 text-white font-mono text-sm uppercase tracking-wider font-extrabold cursor-pointer transition-all active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none"
            >
                {state === "busy" ? "To'lanmoqda…" : `${method} orqali to'lash`}
            </button>
            <p className="mt-2 flex items-center justify-center gap-1.5 text-[11px] text-text-muted">
                <ShieldCheck className="w-3.5 h-3.5" /> Xavfsiz to&apos;lov · chek Telegramga keladi
            </p>
        </div>
    );
}
