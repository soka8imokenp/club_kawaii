"use client";

import { use, useState } from "react";
import Link from "next/link";
import { Gift } from "lucide-react";
import { CREATORS } from "@/lib/club";
import { useAccount } from "@/lib/account";
import { join, useMembership } from "@/lib/membership";
import { ClubCard } from "@/components/club/ClubCard";
import { LoginPrompt } from "@/components/club/sheets";

/** Sovg'a kartasini olish. Kod hozircha namunaviy: kodga ko'ra klub tanlanadi */
export default function GiftPage({ params }: { params: Promise<{ code: string }> }) {
    const { code } = use(params);
    const account = useAccount();
    const hash = [...code].reduce((s, ch) => s + ch.charCodeAt(0), 0);
    const c = CREATORS[hash % CREATORS.length];
    const tier = c.tiers[1] ?? c.tiers[0];
    const member = useMembership(c.id);
    const [claimed, setClaimed] = useState(false);

    return (
        <div className="max-w-md mx-auto w-full py-10 text-center">
            <p className="inline-flex items-center gap-2 text-primary text-xs font-mono font-bold uppercase tracking-wider">
                <Gift className="w-4 h-4" /> Sizga sovg&apos;a
            </p>
            <h1 className="mt-2 text-2xl font-black text-text-main">{c.name} klubi kartasi</h1>
            <div className={`mt-6 ${claimed ? "card-mint" : ""}`}>
                <ClubCard creator={c} tier={tier} member={member} />
            </div>
            <div className="mt-6">
                {!account ? (
                    <LoginPrompt text="Sovg'ani olish uchun akkauntga kiring" />
                ) : member ? (
                    <Link href="/wallet" className="inline-block px-6 py-3 rounded-xl bg-primary text-white text-sm font-bold">
                        Kartalarim
                    </Link>
                ) : (
                    <button
                        type="button"
                        onClick={() => {
                            join(c.id, tier.id, 1);
                            setClaimed(true);
                        }}
                        className="px-6 py-3 rounded-xl bg-primary text-white text-sm font-bold cursor-pointer"
                    >
                        Kartani olish
                    </button>
                )}
            </div>
        </div>
    );
}
