"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, BadgeCheck, Coins, Eye, Lock, Maximize, MessageSquareOff, MessageSquareText, Send, Volume2, VolumeX } from "lucide-react";
import { creatorById, money, type Creator } from "@/lib/club";
import { hasTier, useMembership } from "@/lib/membership";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { openJoin } from "../JoinSheet";
import { LiveBadge } from "../Tiles";

interface ChatMsg {
    id: number;
    name: string;
    hue: number;
    text: string;
    /** Klub tarifi nomi (belgi uchun) */
    tier?: string;
    /** Donat summasi */
    amount?: number;
    me?: boolean;
}

interface Flying {
    id: number;
    text: string;
    lane: number;
    gold: boolean;
    dur: number;
}

const VIEWERS = ["Aziza", "Jasur", "otaku_uz", "Dilnoza", "Sardor", "Kamola", "nekochan", "Bekzod", "Madina", "Timur", "sakura_tsh", "Ulug'bek"];
const LINES = [
    "salom hammaga!",
    "zo'r chiqyapti 🔥",
    "ovoz juda toza",
    "keyingi qism qachon?",
    "wwwww",
    "8888888",
    "kulib o'ldim 😂",
    "shu joyini yana bir marta!",
    "rahmat efir uchun",
    "kecha ham shu yerda edim",
    "kawaii ✨",
    "qoyil",
];
const DONATIONS = [5000, 10000, 25000, 50000];
const LANES = 7;

/** Namunaviy chat: tomoshabinlar yozib turadi (server ulanmaguncha) */
function useStreamChat(c: Creator) {
    const [messages, setMessages] = useState<ChatMsg[]>([]);
    const [flying, setFlying] = useState<Flying[]>([]);
    const seq = useRef(0);
    const lane = useRef(0);

    const push = useCallback((m: Omit<ChatMsg, "id">) => {
        const id = ++seq.current;
        setMessages((list) => [...list.slice(-120), { ...m, id }]);
        lane.current = (lane.current + 1 + Math.floor(Math.random() * 3)) % LANES;
        const text = m.amount ? `${m.name}: ${money(m.amount)} so'm — ${m.text}` : m.text;
        setFlying((list) => [...list.slice(-30), { id, text, lane: lane.current, gold: !!m.amount, dur: 7 + Math.random() * 3 }]);
    }, []);

    useEffect(() => {
        const tick = () => {
            const name = VIEWERS[Math.floor(Math.random() * VIEWERS.length)];
            const donor = Math.random() < 0.07;
            push({
                name,
                hue: (name.charCodeAt(0) * 47) % 360,
                text: LINES[Math.floor(Math.random() * LINES.length)],
                tier: Math.random() < 0.4 ? c.tiers[Math.floor(Math.random() * c.tiers.length)].name : undefined,
                amount: donor ? DONATIONS[Math.floor(Math.random() * DONATIONS.length)] : undefined,
            });
        };
        const t = window.setInterval(tick, 1800);
        return () => window.clearInterval(t);
    }, [c, push]);

    const land = useCallback((id: number) => setFlying((list) => list.filter((f) => f.id !== id)), []);
    return { messages, flying, push, land };
}

export function StreamView({ id }: { id: string }) {
    const c = creatorById(id)!;
    const live = c.live!;
    const member = useMembership(c.id);
    const allowed = hasTier(c, live.tier, member);
    const tier = c.tiers.find((t) => t.id === live.tier);
    const myTier = member && c.tiers.find((t) => t.id === member.tierId);
    const chat = useStreamChat(c);
    const [donate, setDonate] = useState(false);

    const send = (text: string, amount?: number) => chat.push({ name: "Siz", hue: 295, text, tier: myTier?.name, amount, me: true });

    return (
        <div className="-mx-3 -my-4 sm:m-0 h-[100dvh] sm:h-auto flex flex-col sm:block lg:grid lg:grid-cols-[minmax(0,1fr)_380px] gap-5 items-start">
            <div className="min-w-0 shrink-0">
                <Player c={c} allowed={allowed} tierName={tier?.name} flying={chat.flying} onLand={chat.land} />

                {/* Efir haqida */}
                <div className="px-3 sm:px-0 pt-3 sm:pt-4 flex items-start gap-3">
                    <Link href={`/${c.id}`} className="shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={c.avatar} alt="" className="w-11 h-11 rounded-xl object-cover ring-2 ring-[#ff3b5c]" />
                    </Link>
                    <div className="flex-1 min-w-0">
                        <h1 className="text-base sm:text-lg font-black text-text-main leading-snug">{live.title}</h1>
                        <Link href={`/${c.id}`} className="inline-flex items-center gap-1 text-xs font-bold text-text-muted hover:text-primary transition-colors">
                            {c.name}
                            {c.verified && <BadgeCheck className="w-3.5 h-3.5 text-primary" />}
                            <span className="font-mono font-normal">· {live.startedMin} daq oldin boshlandi</span>
                        </Link>
                    </div>
                    {!member && (
                        <button type="button" onClick={() => openJoin(c.id, tier?.id)} className="hidden sm:block shrink-0 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-sm font-bold cursor-pointer active:scale-[0.98] transition-all">
                            Klubga qo&apos;shilish
                        </button>
                    )}
                </div>
            </div>

            {/* Chat */}
            <StreamChat c={c} messages={chat.messages} canWrite={allowed} onSend={send} onDonate={() => setDonate(true)} />

            <DonateSheet open={donate} onClose={() => setDonate(false)} c={c} onSend={(amount, text) => send(text || "rahmat!", amount)} />
        </div>
    );
}

function Player({ c, allowed, tierName, flying, onLand }: { c: Creator; allowed: boolean; tierName?: string; flying: Flying[]; onLand: (id: number) => void }) {
    const boxRef = useRef<HTMLDivElement>(null);
    const [muted, setMuted] = useState(true);
    const [danmaku, setDanmaku] = useState(true);
    const [w, setW] = useState(800);

    // Uchib o'tuvchi xabarlar masofasi — pleyer kengligi
    useEffect(() => {
        const el = boxRef.current;
        if (!el) return;
        const ro = new ResizeObserver(() => setW(el.clientWidth));
        ro.observe(el);
        return () => ro.disconnect();
    }, []);

    return (
        <div ref={boxRef} className="group relative aspect-video bg-black sm:rounded-2xl overflow-hidden" style={{ "--w": `${w}px` } as React.CSSProperties}>
            <video
                src="/media/stream.mp4"
                poster={c.live!.cover}
                autoPlay
                muted={muted}
                loop
                playsInline
                className={`w-full h-full object-cover ${allowed ? "" : "blur-2xl scale-110 opacity-60"}`}
            />

            {/* Danmaku */}
            {allowed && danmaku && (
                <div className="absolute inset-x-0 top-[4%] bottom-[22%] overflow-hidden pointer-events-none text-[13px] sm:text-base">
                    {flying.map((f) => (
                        <span
                            key={f.id}
                            className="danmaku-line"
                            onAnimationEnd={() => onLand(f.id)}
                            style={{ top: `${(f.lane / LANES) * 100}%`, ["--dur" as string]: `${f.dur}s`, color: f.gold ? "#ffd166" : undefined }}
                        >
                            {f.text}
                        </span>
                    ))}
                </div>
            )}

            {/* Yuqori qator */}
            <div className="absolute top-3 left-3 right-3 flex items-center gap-2">
                <Link href={`/${c.id}`} aria-label="Orqaga" className="sm:hidden w-8 h-8 rounded-lg bg-black/50 text-white flex items-center justify-center">
                    <ArrowLeft className="w-4 h-4" />
                </Link>
                <LiveBadge />
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-black/55 text-white text-[11px] font-mono">
                    <Eye className="w-3.5 h-3.5" /> {c.live!.viewers}
                </span>
            </div>

            {/* Boshqaruv */}
            {allowed && (
                <div className="absolute inset-x-0 bottom-0 p-3 flex items-center gap-1 bg-gradient-to-t from-black/70 to-transparent sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    <CtlBtn label={muted ? "Ovozni yoqish" : "Ovozni o'chirish"} onClick={() => setMuted((v) => !v)}>
                        {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                    </CtlBtn>
                    <CtlBtn label={danmaku ? "Uchuvchi xabarlarni o'chirish" : "Uchuvchi xabarlarni yoqish"} onClick={() => setDanmaku((v) => !v)}>
                        {danmaku ? <MessageSquareText className="w-5 h-5" /> : <MessageSquareOff className="w-5 h-5" />}
                    </CtlBtn>
                    <span className="flex-1" />
                    <CtlBtn label="To'liq ekran" onClick={() => (document.fullscreenElement ? document.exitFullscreen() : boxRef.current?.requestFullscreen?.())}>
                        <Maximize className="w-5 h-5" />
                    </CtlBtn>
                </div>
            )}

            {/* A'zolar uchun efir */}
            {!allowed && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center text-white px-6">
                    <span className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center">
                        <Lock className="w-6 h-6" />
                    </span>
                    <p className="font-black text-lg">{tierName} klubi a&apos;zolari uchun efir</p>
                    <button type="button" onClick={() => openJoin(c.id, c.live!.tier ?? undefined)} className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-sm font-bold cursor-pointer active:scale-[0.98] transition-all">
                        Kartani olish
                    </button>
                </div>
            )}
        </div>
    );
}

function CtlBtn({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
    return (
        <button type="button" onClick={onClick} aria-label={label} title={label} className="w-10 h-10 rounded-lg text-white hover:bg-white/15 flex items-center justify-center cursor-pointer transition-colors">
            {children}
        </button>
    );
}

function StreamChat({ c, messages, canWrite, onSend, onDonate }: { c: Creator; messages: ChatMsg[]; canWrite: boolean; onSend: (t: string) => void; onDonate: () => void }) {
    const [input, setInput] = useState("");
    const listRef = useRef<HTMLDivElement>(null);
    const stick = useRef(true);

    // Pastda turgan bo'lsa — yangi xabarga ergashadi
    useEffect(() => {
        const el = listRef.current;
        if (el && stick.current) el.scrollTop = el.scrollHeight;
    }, [messages.length]);

    return (
        <section
            className="mt-3 sm:mt-4 lg:mt-0 flex-1 min-h-0 w-full flex flex-col bg-card-bg dark:bg-[#0a0a0a] sm:rounded-2xl sm:border border-border-sep dark:border-white/[0.06] sm:card-shadow theme-transition sm:h-[520px] lg:h-[calc(100svh-64px-3rem)] lg:sticky lg:top-[88px]"
            aria-label="Efir chati"
        >
            <div className="shrink-0 flex items-center justify-between h-12 px-4 border-b border-border-sep">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-text-muted">Efir chati</span>
                <span className="text-[11px] font-mono text-text-muted">{c.name}</span>
            </div>
            <div
                ref={listRef}
                onScroll={(e) => {
                    const el = e.currentTarget;
                    stick.current = el.scrollHeight - el.scrollTop - el.clientHeight < 40;
                }}
                className="flex-1 min-h-0 overflow-y-auto no-scrollbar px-4 py-3 space-y-2 text-[13px] leading-snug"
            >
                {messages.length === 0 && <p className="pt-6 text-center text-xs font-mono text-text-muted">Chat yuklanmoqda…</p>}
                {messages.map((m) =>
                    m.amount ? (
                        <div key={m.id} className="rounded-xl p-2.5 bg-amber-400/12 border border-amber-400/30">
                            <p className="flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-300">
                                <Coins className="w-3.5 h-3.5" /> {m.name} · {money(m.amount)} so&apos;m
                            </p>
                            <p className="mt-0.5 text-text-main">{m.text}</p>
                        </div>
                    ) : (
                        <p key={m.id} className="break-words">
                            {m.tier && <span className="mr-1 px-1 py-px rounded text-[9px] font-mono font-bold uppercase bg-primary/12 text-primary align-middle">{m.tier}</span>}
                            <b style={{ color: m.me ? "var(--color-primary)" : `oklch(0.68 0.14 ${m.hue})` }}>{m.name}</b>
                            <span className="text-text-main">: {m.text}</span>
                        </p>
                    ),
                )}
            </div>
            <form
                className="shrink-0 flex items-center gap-2 p-2.5 border-t border-border-sep"
                style={{ paddingBottom: "max(0.625rem, env(safe-area-inset-bottom))" }}
                onSubmit={(e) => {
                    e.preventDefault();
                    const text = input.trim();
                    if (!text) return;
                    stick.current = true;
                    onSend(text);
                    setInput("");
                }}
            >
                <button type="button" onClick={onDonate} disabled={!canWrite} aria-label="Donat" title="Donat" className="shrink-0 w-10 h-10 rounded-xl bg-amber-400/15 text-amber-600 dark:text-amber-300 flex items-center justify-center cursor-pointer hover:bg-amber-400/25 transition-colors disabled:opacity-40">
                    <Coins className="w-4 h-4" />
                </button>
                <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    disabled={!canWrite}
                    placeholder={canWrite ? "Xabar yozish…" : "Yozish uchun klubga qo'shiling"}
                    maxLength={200}
                    enterKeyHint="send"
                    aria-label="Chatga xabar"
                    className="flex-1 min-w-0 h-10 px-3 rounded-xl bg-foreground/[0.05] text-sm text-text-main placeholder:text-text-muted focus:outline-none focus:bg-foreground/[0.08] transition-colors disabled:opacity-60"
                />
                <button
                    type="submit"
                    disabled={!input.trim()}
                    aria-label="Yuborish"
                    className="shrink-0 w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center active:scale-95 transition-all cursor-pointer disabled:bg-foreground/[0.06] disabled:text-text-muted disabled:cursor-default"
                >
                    <Send className="w-4 h-4" />
                </button>
            </form>
        </section>
    );
}

function DonateSheet({ open, onClose, c, onSend }: { open: boolean; onClose: () => void; c: Creator; onSend: (amount: number, text: string) => void }) {
    const [amount, setAmount] = useState(10000);
    const [text, setText] = useState("");

    return (
        <BottomSheet open={open} onClose={onClose} label="Donat" title={<h2 className="text-lg font-black text-text-main">{c.name}ga donat</h2>}>
            <form
                className="px-5 pb-5"
                onSubmit={(e) => {
                    e.preventDefault();
                    onSend(amount, text.trim());
                    setText("");
                    onClose();
                }}
            >
                <p className="text-sm text-text-muted">Xabaringiz chatda ajralib turadi va ekrandan oltin rangda uchib o&apos;tadi.</p>
                <div className="mt-4 grid grid-cols-4 gap-2">
                    {DONATIONS.map((a) => (
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
                <button type="submit" className="mt-4 w-full py-3.5 rounded-xl bg-amber-400 hover:bg-amber-400/90 text-black font-mono text-sm uppercase tracking-wider font-extrabold cursor-pointer active:scale-[0.98] transition-all">
                    {money(amount)} so&apos;m yuborish
                </button>
            </form>
        </BottomSheet>
    );
}
