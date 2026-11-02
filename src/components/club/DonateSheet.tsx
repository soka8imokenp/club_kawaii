"use client";

import { useState } from "react";
import { Coins } from "lucide-react";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { money } from "@/lib/club";
import { notify, recordPayment, track, useAccount } from "@/lib/account";
import { useCreator } from "@/lib/studio";
import { createOpener } from "@/lib/store";
import { FieldLabel, LoginPrompt, MethodPicker, type Method } from "./sheets";

const AMOUNTS = [5000, 10000, 25000, 50000, 100000];

interface DonateProps {
    creatorId: string;
    /** "goal" — maqsadga, "stream" — efirda (xabar ekranda uchadi) */
    context: "goal" | "stream";
    onSent?: (amount: number, text: string) => void;
}

const opener = createOpener<DonateProps>();
export const openDonate = (p: DonateProps) => opener.open(p);

/** Donat: maqsadni qo'llab-quvvatlash yoki efirda xabar bilan */
export function DonateSheet() {
    const { open, props, key } = opener.use();
    return (
        <BottomSheet open={open} onClose={opener.close} label="Donat">
            {props && <Body key={key} {...props} />}
        </BottomSheet>
    );
}

function Body({ creatorId, context, onSent }: DonateProps) {
    const account = useAccount();
    const c = useCreator(creatorId);
    const [amount, setAmount] = useState(10000);
    const [text, setText] = useState("");
    const [method, setMethod] = useState<Method>("Click");
    if (!c) return null;
    if (!account) return <LoginPrompt text="Donat yuborish uchun akkauntga kiring" />;

    return (
        <form
            className="px-5 pb-5 sm:p-7"
            onSubmit={(e) => {
                e.preventDefault();
                const msg = text.trim();
                recordPayment({ kind: "donation", creatorId, title: context === "goal" ? `Maqsad: ${c.goal?.title ?? c.name}` : `Efirda donat · ${c.name}`, amount, method });
                track((a) => ({ ...a, donations: a.donations + 1, donated: a.donated + amount }));
                notify({ kind: "payment", title: "Donat yuborildi", text: `${c.name} · ${money(amount)} so'm`, avatar: c.avatar });
                onSent?.(amount, msg);
                setText("");
                opener.close();
            }}
        >
            <h2 className="flex items-center gap-2 text-lg font-black text-text-main pr-10">
                <Coins className="w-5 h-5 text-amber-500" /> {context === "goal" ? "Maqsadni qo'llab-quvvatlash" : `${c.name}ga donat`}
            </h2>
            <p className="mt-1 text-sm text-text-muted">
                {context === "goal" && c.goal ? c.goal.title : "Xabaringiz chatda ajralib turadi va ekrandan oltin rangda uchib o'tadi."}
            </p>
            <FieldLabel>Summa</FieldLabel>
            <div className="grid grid-cols-5 gap-2">
                {AMOUNTS.map((a) => (
                    <button
                        key={a}
                        type="button"
                        onClick={() => setAmount(a)}
                        className={`py-3 rounded-xl border text-sm font-black cursor-pointer transition-colors ${amount === a ? "border-amber-400 bg-amber-400/12 text-amber-600 dark:text-amber-300" : "border-border-sep text-text-main hover:border-amber-400/50"}`}
                    >
                        {a / 1000}K
                    </button>
                ))}
            </div>
            <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Xabar (ixtiyoriy)"
                maxLength={120}
                aria-label="Donat xabari"
                className="mt-3 w-full h-11 px-3.5 rounded-xl bg-foreground/[0.04] border border-border-sep text-sm text-text-main placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors"
            />
            <FieldLabel>To&apos;lov usuli</FieldLabel>
            <MethodPicker value={method} onChange={setMethod} />
            <button type="submit" className="mt-5 w-full py-3.5 rounded-xl bg-amber-400 hover:bg-amber-400/90 text-black font-mono text-sm uppercase tracking-wider font-extrabold cursor-pointer active:scale-[0.98] transition-all">
                {money(amount)} so&apos;m yuborish
            </button>
        </form>
    );
}
