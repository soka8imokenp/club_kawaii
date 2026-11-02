"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Crown, Hash, Lock, Send } from "lucide-react";
import { useAccount } from "@/lib/account";
import { useMembership } from "@/lib/membership";
import { useCreator, useMyClub } from "@/lib/studio";
import { createStore, uid } from "@/lib/store";
import { openJoin } from "./JoinSheet";

interface Msg {
    id: string;
    name: string;
    avatar: string;
    text: string;
    at: number;
    tier?: string;
    creator?: boolean;
}

const chatStore = createStore<Record<string, Msg[]>>("club.chat", {});
const FACES = ["photo-1527980965255-d3b416303d12", "photo-1500648767791-00dcc994a43e", "photo-1438761681033-6461ffad8d80", "photo-1534528741775-53994a69daeb"].map(
    (id) => `https://images.unsplash.com/${id}?q=80&w=120&h=120&auto=format&fit=crop`,
);
const SEED = [
    ["AnimeNinja", "Hammaga salom! Yangi qism zo'r chiqibdi"],
    ["sakura_tsh", "Keyingi efir qachon bo'ladi?"],
    ["ToshkentOtaku", "Juma kuni deyishgandi"],
    ["Dilnoza", "Men ham kutyapman 💜"],
];

/** Klub chati: kanallar tariflar bo'yicha (#umumiy — barcha a'zolar, #<tarif> — shu tarif va yuqorisi) */
export function ClubChat({ id }: { id: string }) {
    const c = useCreator(id);
    const member = useMembership(id);
    const myClub = useMyClub();
    const account = useAccount();
    const store = chatStore.use();
    const [channel, setChannel] = useState("general");
    const [text, setText] = useState("");
    const listRef = useRef<HTMLDivElement>(null);
    const key = `${id}:${channel}`;
    const msgs = store[key];

    useEffect(() => {
        const el = listRef.current;
        if (el) el.scrollTop = el.scrollHeight;
    }, [msgs?.length, channel]);

    if (!c) return null;
    const owner = myClub?.id === id;
    const myRank = owner ? c.tiers.length : member ? c.tiers.findIndex((t) => t.id === member.tierId) : -1;
    const channels = [{ id: "general", name: "umumiy", rank: 0 }, ...c.tiers.slice(1).map((t, i) => ({ id: t.id, name: t.name.toLowerCase(), rank: i + 1 }))];
    const ch = channels.find((x) => x.id === channel) ?? channels[0];
    const allowed = myRank >= ch.rank;
    const list: Msg[] =
        msgs ??
        SEED.map(([name, t], i) => ({ id: `s${i}`, name, text: t, avatar: FACES[i % FACES.length], at: 0, tier: c.tiers[Math.min(ch.rank + (i % 2), c.tiers.length - 1)].name }));

    return (
        <div className="-mx-3 -my-4 sm:m-0 h-[100dvh] sm:h-[calc(100svh-64px-3rem)] flex flex-col sm:grid sm:grid-cols-[220px_minmax(0,1fr)] gap-0 sm:gap-4">
            {/* Kanallar */}
            <aside className="shrink-0 sm:bg-card-bg sm:dark:bg-[#0a0a0a] sm:rounded-2xl sm:border border-border-sep sm:p-3">
                <div className="flex items-center gap-2 px-3 pt-3 sm:p-0 sm:mb-3">
                    <Link href={`/${c.id}`} aria-label="Orqaga" className="p-1.5 rounded-lg text-text-muted hover:text-text-main">
                        <ArrowLeft className="w-4 h-4" />
                    </Link>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={c.avatar} alt="" className="w-8 h-8 rounded-lg object-cover" />
                    <span className="text-sm font-black text-text-main truncate">{c.name}</span>
                </div>
                <nav className="flex sm:flex-col gap-1 overflow-x-auto no-scrollbar px-3 py-3 sm:p-0">
                    {channels.map((x) => (
                        <button
                            key={x.id}
                            type="button"
                            onClick={() => setChannel(x.id)}
                            className={`shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold cursor-pointer transition-colors ${channel === x.id ? "bg-primary/10 text-primary" : "text-text-muted hover:text-text-main hover:bg-foreground/[0.04]"}`}
                        >
                            <Hash className="w-4 h-4" /> {x.name}
                            {myRank < x.rank && <Lock className="w-3 h-3 ml-auto" />}
                        </button>
                    ))}
                </nav>
            </aside>

            {/* Xabarlar */}
            <section className="flex-1 min-h-0 flex flex-col bg-card-bg dark:bg-[#0a0a0a] sm:rounded-2xl sm:border border-border-sep">
                <div className="shrink-0 h-12 flex items-center gap-2 px-4 border-b border-border-sep text-sm font-black text-text-main">
                    <Hash className="w-4 h-4 text-text-muted" /> {ch.name}
                    <span className="text-xs font-mono font-normal text-text-muted">{ch.rank === 0 ? "· barcha a'zolar" : `· ${c.tiers[ch.rank].name} va yuqori`}</span>
                </div>
                {allowed ? (
                    <>
                        <div ref={listRef} className="flex-1 min-h-0 overflow-y-auto px-4 py-3 space-y-3">
                            {list.map((m) => (
                                <div key={m.id} className="flex gap-3">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={m.avatar} alt="" className="w-9 h-9 rounded-xl object-cover shrink-0 bg-foreground/5" />
                                    <div className="min-w-0">
                                        <p className="flex items-center gap-2 text-sm">
                                            <b className={m.creator ? "text-primary" : "text-text-main"}>{m.name}</b>
                                            {m.creator && <Crown className="w-3.5 h-3.5 text-amber-400" />}
                                            {m.tier && <span className="px-1.5 py-px rounded bg-foreground/[0.06] text-[10px] font-mono font-bold uppercase text-text-muted">{m.tier}</span>}
                                        </p>
                                        <p className="text-sm text-text-main break-words">{m.text}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <form
                            className="shrink-0 flex gap-2 p-2.5 border-t border-border-sep"
                            style={{ paddingBottom: "max(0.625rem, env(safe-area-inset-bottom))" }}
                            onSubmit={(e) => {
                                e.preventDefault();
                                const t = text.trim();
                                if (!t || !account) return;
                                const m: Msg = {
                                    id: uid(),
                                    name: owner ? c.name : account.name,
                                    avatar: owner ? c.avatar : account.avatar,
                                    text: t,
                                    at: Date.now(),
                                    creator: owner,
                                    tier: owner ? undefined : c.tiers[myRank]?.name,
                                };
                                chatStore.set((s) => ({ ...s, [key]: [...list, m].slice(-200) }));
                                setText("");
                            }}
                        >
                            <input value={text} onChange={(e) => setText(e.target.value)} placeholder={`#${ch.name} kanaliga yozing`} maxLength={500} aria-label="Xabar" className="flex-1 min-w-0 h-10 px-3 rounded-xl bg-foreground/[0.05] text-sm text-text-main placeholder:text-text-muted focus:outline-none" />
                            <button type="submit" disabled={!text.trim()} aria-label="Yuborish" className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center cursor-pointer disabled:bg-foreground/[0.06] disabled:text-text-muted">
                                <Send className="w-4 h-4" />
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center gap-3 p-8 text-center">
                        <Lock className="w-8 h-8 text-text-muted" />
                        <p className="font-black text-text-main">{myRank < 0 ? "Chat klub a'zolari uchun" : `#${ch.name} — ${c.tiers[ch.rank].name} va yuqori uchun`}</p>
                        <button type="button" onClick={() => openJoin(c.id, c.tiers[ch.rank].id)} className="px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-bold cursor-pointer">
                            {myRank < 0 ? "Klubga qo'shilish" : "Tarifni yangilash"}
                        </button>
                    </div>
                )}
            </section>
        </div>
    );
}
