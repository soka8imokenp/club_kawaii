"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, BadgeCheck, Coins, Eye, Lock, Maximize, MessageSquareOff, MessageSquareText, Radio, Send, Square, Ticket, Timer, Users, Video, VideoOff, Volume2, VolumeX } from "lucide-react";
import { money, type Creator, type LiveStream } from "@/lib/club";
import { useMembership } from "@/lib/membership";
import { buy, track, useAccount, usePurchases } from "@/lib/account";
import { endLive, streamAccess, useCreator, useMyClub } from "@/lib/studio";
import { openDonate } from "../DonateSheet";
import { openJoin } from "../JoinSheet";
import { openLogin, openPay } from "../sheets";
import { LiveBadge } from "../Tiles";

interface ChatMsg {
    id: number;
    name: string;
    hue: number;
    text: string;
    tier?: string;
    amount?: number;
    me?: boolean;
    host?: boolean;
}

interface Flying {
    id: number;
    text: string;
    lane: number;
    gold: boolean;
    dur: number;
}

const VIEWERS = ["Aziza", "Jasur", "otaku_uz", "Dilnoza", "Sardor", "Kamola", "nekochan", "Bekzod", "Madina", "Timur", "sakura_tsh", "Ulug'bek"];
const LINES = ["salom hammaga!", "zo'r chiqyapti 🔥", "ovoz juda toza", "keyingi qism qachon?", "wwwww", "8888888", "kulib o'ldim 😂", "shu joyini yana bir marta!", "rahmat efir uchun", "kecha ham shu yerda edim", "kawaii ✨", "qoyil"];
const DONATIONS = [5000, 10000, 25000, 50000];
const LANES = 7;
const SLOW_SEC = 10;

/** Namunaviy chat: tomoshabinlar yozib turadi (server ulanmaguncha) */
function useStreamChat(c: Creator | undefined, active: boolean, rate: number) {
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
        if (!c || !active) return;
        const tick = () => {
            const name = VIEWERS[Math.floor(Math.random() * VIEWERS.length)];
            const donor = c.live?.donations && Math.random() < 0.07;
            push({
                name,
                hue: (name.charCodeAt(0) * 47) % 360,
                text: LINES[Math.floor(Math.random() * LINES.length)],
                tier: Math.random() < 0.4 ? c.tiers[Math.floor(Math.random() * c.tiers.length)].name : undefined,
                amount: donor ? DONATIONS[Math.floor(Math.random() * DONATIONS.length)] : undefined,
            });
        };
        const t = window.setInterval(tick, rate);
        return () => window.clearInterval(t);
    }, [c, active, rate, push]);

    const land = useCallback((id: number) => setFlying((list) => list.filter((f) => f.id !== id)), []);
    return { messages, flying, push, land };
}

export function StreamView({ id }: { id: string }) {
    const c = useCreator(id);
    const myClub = useMyClub();
    const member = useMembership(id);
    const purchases = usePurchases();
    const account = useAccount();
    const host = myClub?.id === id;
    const live = c?.live;
    const allowed = !!c && !!live && streamAccess(c, live, member, purchases, host);
    // Studiyadan boshlangan efirda tomoshabinlar asta-sekin qo'shiladi
    const chat = useStreamChat(c, allowed, host ? 3200 : 1800);
    const myTier = c && member && c.tiers.find((t) => t.id === member.tierId);

    useEffect(() => {
        if (allowed && !host) track((a) => (a.streams.includes(id) ? a : { ...a, streams: [...a.streams, id] }));
    }, [allowed, host, id]);

    if (!c || !live) {
        return (
            <div className="py-24 text-center">
                <Radio className="w-10 h-10 mx-auto text-text-muted" />
                <h1 className="mt-4 text-xl font-black text-text-main">Efir tugagan</h1>
                <p className="mt-1 text-sm text-text-muted">Yozuv saqlangan bo&apos;lsa, u ijodkor sahifasidagi «Efirlar» bo&apos;limida</p>
                {c && (
                    <Link href={`/${c.id}`} className="inline-block mt-5 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-bold">
                        {c.name} sahifasi
                    </Link>
                )}
            </div>
        );
    }

    const canChat = allowed && (live.chat !== "members" || !!member || host);
    const send = (text: string, amount?: number) =>
        chat.push({ name: host ? c.name : (account?.name ?? "Siz"), hue: 295, text, tier: host ? undefined : myTier?.name, amount, me: true, host });

    return (
        <div className="-mx-3 -my-4 sm:m-0 h-[100dvh] sm:h-auto flex flex-col sm:block lg:grid lg:grid-cols-[minmax(0,1fr)_380px] gap-5 items-start">
            <div className="min-w-0 shrink-0">
                <Player c={c} live={live} allowed={allowed} flying={chat.flying} onLand={chat.land} />

                {host && <HostBar c={c} live={live} />}

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
                        </Link>
                        <StreamBadges c={c} live={live} />
                    </div>
                    {!member && !host && (
                        <button type="button" onClick={() => openJoin(c.id, live.tier ?? undefined)} className="hidden sm:block shrink-0 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-sm font-bold cursor-pointer active:scale-[0.98] transition-all">
                            Klubga qo&apos;shilish
                        </button>
                    )}
                </div>
            </div>

            <StreamChat
                c={c}
                live={live}
                messages={chat.messages}
                canWrite={canChat}
                lockedReason={!allowed ? "Efirga kirgandan keyin yozish mumkin" : live.chat === "members" ? "Chat faqat klub a'zolari uchun" : undefined}
                loggedIn={!!account || host}
                onSend={(t) => send(t)}
                onDonate={() => openDonate({ creatorId: c.id, context: "stream", onSent: (amount, text) => send(text || "rahmat!", amount) })}
            />
        </div>
    );
}

/** Efir sozlamalari belgilari: kirish, yozuv, chat */
export function StreamBadges({ c, live }: { c: Creator; live: LiveStream }) {
    const tier = c.tiers.find((t) => t.id === live.tier);
    const chip = "inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider";
    return (
        <div className="mt-2 flex flex-wrap gap-1.5">
            {live.access === "free" && <span className={`${chip} bg-emerald-500/12 text-emerald-600 dark:text-emerald-400`}>Bepul</span>}
            {live.access === "members" && (
                <span className={`${chip} bg-primary/12 text-primary`}>
                    <Lock className="w-3 h-3" /> {tier ? `${tier.name}+` : "A'zolar"}
                </span>
            )}
            {live.access === "ticket" && (
                <span className={`${chip} bg-amber-400/15 text-amber-600 dark:text-amber-300`}>
                    <Ticket className="w-3 h-3" /> Chipta {money(live.price ?? 0)}
                </span>
            )}
            <span className={`${chip} bg-foreground/[0.06] text-text-muted`}>
                {live.record ? <Video className="w-3 h-3" /> : <VideoOff className="w-3 h-3" />}
                {live.record ? (live.recordAccess === "public" ? "Yozuv hamma uchun" : "Yozuv saqlanadi") : "Yozuvsiz"}
            </span>
            {live.chat !== "all" && (
                <span className={`${chip} bg-foreground/[0.06] text-text-muted`}>
                    {live.chat === "slow" ? <Timer className="w-3 h-3" /> : <Users className="w-3 h-3" />}
                    {live.chat === "slow" ? `Sekin chat ${SLOW_SEC}s` : "Chat a'zolarga"}
                </span>
            )}
        </div>
    );
}

/** Efir egasi paneli: vaqt, tomoshabinlar, donatlar, tugatish */
function HostBar({ c, live }: { c: Creator; live: LiveStream }) {
    const router = useRouter();
    const [now, setNow] = useState(() => Date.now());
    const [confirm, setConfirm] = useState(false);
    useEffect(() => {
        const t = window.setInterval(() => setNow(Date.now()), 1000);
        return () => window.clearInterval(t);
    }, []);
    const sec = Math.max(0, Math.floor((now - (live.startedAt ?? now)) / 1000));
    const viewers = Math.min(400, Math.floor(sec / 4));
    const clock = `${Math.floor(sec / 3600)}:${String(Math.floor((sec % 3600) / 60)).padStart(2, "0")}:${String(sec % 60).padStart(2, "0")}`;

    const finish = () => {
        const vod = endLive({ durationMin: Math.max(1, Math.round(sec / 60)), donated: 0 });
        router.push(vod ? `/p/${vod.id}` : `/${c.id}`);
    };

    return (
        <div className="mx-3 sm:mx-0 mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 p-3 rounded-2xl bg-[#ff3b5c]/[0.08] border border-[#ff3b5c]/20">
            <span className="inline-flex items-center gap-2 text-sm font-bold text-text-main">
                <span className="live-dot" /> Siz efirdasiz
            </span>
            <span className="text-xs font-mono text-text-muted">{clock}</span>
            <span className="inline-flex items-center gap-1 text-xs font-mono text-text-muted">
                <Eye className="w-3.5 h-3.5" /> {viewers}
            </span>
            <span className="text-xs font-mono text-text-muted">{live.record ? "Yozilmoqda" : "Yozuvsiz"}</span>
            <span className="flex-1" />
            {confirm ? (
                <span className="flex items-center gap-2">
                    <span className="text-xs text-text-muted">{live.record ? "Yozuv post sifatida saqlanadi" : "Yozuv saqlanmaydi"}</span>
                    <button type="button" onClick={finish} className="px-3 py-2 rounded-lg bg-[#ff3b5c] text-white text-xs font-bold cursor-pointer">
                        Tugatish
                    </button>
                    <button type="button" onClick={() => setConfirm(false)} className="px-3 py-2 rounded-lg border border-border-sep text-xs font-bold text-text-main cursor-pointer">
                        Yo&apos;q
                    </button>
                </span>
            ) : (
                <button type="button" onClick={() => setConfirm(true)} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#ff3b5c] hover:bg-[#ff3b5c]/90 text-white text-xs font-bold cursor-pointer">
                    <Square className="w-3 h-3 fill-current" /> Efirni tugatish
                </button>
            )}
        </div>
    );
}

function Player({ c, live, allowed, flying, onLand }: { c: Creator; live: LiveStream; allowed: boolean; flying: Flying[]; onLand: (id: number) => void }) {
    const boxRef = useRef<HTMLDivElement>(null);
    const [muted, setMuted] = useState(true);
    const [danmaku, setDanmaku] = useState(true);
    const [w, setW] = useState(800);
    const tier = c.tiers.find((t) => t.id === live.tier);

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
                poster={live.cover}
                autoPlay
                muted={muted}
                loop
                playsInline
                className={`w-full h-full object-cover ${allowed ? "" : "blur-2xl scale-110 opacity-60"}`}
            />

            {allowed && live.danmaku && danmaku && (
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

            <div className="absolute top-3 left-3 right-3 flex items-center gap-2">
                <Link href={`/${c.id}`} aria-label="Orqaga" className="sm:hidden w-8 h-8 rounded-lg bg-black/50 text-white flex items-center justify-center">
                    <ArrowLeft className="w-4 h-4" />
                </Link>
                <LiveBadge />
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-black/55 text-white text-[11px] font-mono">
                    <Eye className="w-3.5 h-3.5" /> {live.viewers}
                </span>
                {live.record && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-black/55 text-white text-[10px] font-mono font-bold uppercase" title="Efir yozib olinmoqda">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#ff3b5c]" /> Rec
                    </span>
                )}
            </div>

            {allowed && (
                <div className="absolute inset-x-0 bottom-0 p-3 flex items-center gap-1 bg-gradient-to-t from-black/70 to-transparent sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    <CtlBtn label={muted ? "Ovozni yoqish" : "Ovozni o'chirish"} onClick={() => setMuted((v) => !v)}>
                        {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                    </CtlBtn>
                    {live.danmaku && (
                        <CtlBtn label={danmaku ? "Uchuvchi xabarlarni o'chirish" : "Uchuvchi xabarlarni yoqish"} onClick={() => setDanmaku((v) => !v)}>
                            {danmaku ? <MessageSquareText className="w-5 h-5" /> : <MessageSquareOff className="w-5 h-5" />}
                        </CtlBtn>
                    )}
                    <span className="flex-1" />
                    <CtlBtn label="To'liq ekran" onClick={() => (document.fullscreenElement ? document.exitFullscreen() : boxRef.current?.requestFullscreen?.())}>
                        <Maximize className="w-5 h-5" />
                    </CtlBtn>
                </div>
            )}

            {!allowed && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center text-white px-6">
                    <span className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center">{live.access === "ticket" ? <Ticket className="w-6 h-6" /> : <Lock className="w-6 h-6" />}</span>
                    {live.access === "ticket" ? (
                        <>
                            <p className="font-black text-lg">Pullik efir</p>
                            <div className="flex flex-wrap justify-center gap-2">
                                <button
                                    type="button"
                                    onClick={() =>
                                        openPay({
                                            title: live.title,
                                            subtitle: `${c.name} · efirga chipta`,
                                            image: live.cover,
                                            amount: live.price ?? 0,
                                            kind: "ticket",
                                            creatorId: c.id,
                                            onPaid: () => buy("tickets", c.id),
                                            doneText: live.record ? "Chipta olindi. Yozuv ham siz uchun ochiq bo'ladi" : "Chipta olindi — yoqimli tomosha!",
                                        })
                                    }
                                    className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-400/90 text-black text-sm font-bold cursor-pointer active:scale-[0.98] transition-all"
                                >
                                    Chipta · {money(live.price ?? 0)} so&apos;m
                                </button>
                                {tier && (
                                    <button type="button" onClick={() => openJoin(c.id, tier.id)} className="px-5 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-sm font-bold cursor-pointer transition-colors">
                                        {tier.name} a&apos;zolariga bepul
                                    </button>
                                )}
                            </div>
                        </>
                    ) : (
                        <>
                            <p className="font-black text-lg">{tier ? `${tier.name} klubi a'zolari uchun efir` : "Klub a'zolari uchun efir"}</p>
                            <button type="button" onClick={() => openJoin(c.id, live.tier ?? undefined)} className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-sm font-bold cursor-pointer active:scale-[0.98] transition-all">
                                Kartani olish
                            </button>
                        </>
                    )}
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

function StreamChat({
    c,
    live,
    messages,
    canWrite,
    lockedReason,
    loggedIn,
    onSend,
    onDonate,
}: {
    c: Creator;
    live: LiveStream;
    messages: ChatMsg[];
    canWrite: boolean;
    lockedReason?: string;
    loggedIn: boolean;
    onSend: (t: string) => void;
    onDonate: () => void;
}) {
    const [input, setInput] = useState("");
    const [cooldown, setCooldown] = useState(0);
    const listRef = useRef<HTMLDivElement>(null);
    const stick = useRef(true);

    useEffect(() => {
        const el = listRef.current;
        if (el && stick.current) el.scrollTop = el.scrollHeight;
    }, [messages.length]);

    // Sekin rejim: har xabardan keyin kutish
    useEffect(() => {
        if (cooldown <= 0) return;
        const t = window.setTimeout(() => setCooldown((s) => s - 1), 1000);
        return () => window.clearTimeout(t);
    }, [cooldown]);

    const blocked = !canWrite || cooldown > 0;

    return (
        <section
            className="mt-3 sm:mt-4 lg:mt-0 flex-1 min-h-0 w-full flex flex-col bg-card-bg dark:bg-[#0a0a0a] sm:rounded-2xl sm:border border-border-sep dark:border-white/[0.06] sm:card-shadow theme-transition sm:h-[520px] lg:h-[calc(100svh-64px-3rem)] lg:sticky lg:top-[88px]"
            aria-label="Efir chati"
        >
            <div className="shrink-0 flex items-center justify-between h-12 px-4 border-b border-border-sep">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-text-muted">Efir chati</span>
                <span className="text-[11px] font-mono text-text-muted">{live.chat === "slow" ? `Sekin rejim · ${SLOW_SEC}s` : live.chat === "members" ? "Faqat a'zolar" : c.name}</span>
            </div>
            <div
                ref={listRef}
                onScroll={(e) => {
                    const el = e.currentTarget;
                    stick.current = el.scrollHeight - el.scrollTop - el.clientHeight < 40;
                }}
                className="flex-1 min-h-0 overflow-y-auto no-scrollbar px-4 py-3 space-y-2 text-[13px] leading-snug"
            >
                {messages.length === 0 && <p className="pt-6 text-center text-xs font-mono text-text-muted">{lockedReason ?? "Chat kutilmoqda…"}</p>}
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
                            {m.host && <span className="mr-1 px-1 py-px rounded text-[9px] font-mono font-bold uppercase bg-[#ff3b5c]/15 text-[#ff3b5c] align-middle">Efir egasi</span>}
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
                    if (!loggedIn) return openLogin();
                    const text = input.trim();
                    if (!text || blocked) return;
                    stick.current = true;
                    onSend(text);
                    setInput("");
                    if (live.chat === "slow") setCooldown(SLOW_SEC);
                }}
            >
                {live.donations && (
                    <button
                        type="button"
                        onClick={onDonate}
                        disabled={!canWrite}
                        aria-label="Donat"
                        title="Donat"
                        className="shrink-0 w-10 h-10 rounded-xl bg-amber-400/15 text-amber-600 dark:text-amber-300 flex items-center justify-center cursor-pointer hover:bg-amber-400/25 transition-colors disabled:opacity-40"
                    >
                        <Coins className="w-4 h-4" />
                    </button>
                )}
                <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onFocus={() => !loggedIn && openLogin()}
                    disabled={!canWrite}
                    placeholder={!canWrite ? (lockedReason ?? "Yozib bo'lmaydi") : cooldown > 0 ? `${cooldown} soniya kuting…` : "Xabar yozish…"}
                    maxLength={200}
                    enterKeyHint="send"
                    aria-label="Chatga xabar"
                    className="flex-1 min-w-0 h-10 px-3 rounded-xl bg-foreground/[0.05] text-sm text-text-main placeholder:text-text-muted focus:outline-none focus:bg-foreground/[0.08] transition-colors disabled:opacity-60"
                />
                <button
                    type="submit"
                    disabled={!input.trim() || blocked}
                    aria-label="Yuborish"
                    className="shrink-0 w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center active:scale-95 transition-all cursor-pointer disabled:bg-foreground/[0.06] disabled:text-text-muted disabled:cursor-default"
                >
                    <Send className="w-4 h-4" />
                </button>
            </form>
        </section>
    );
}
