"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CalendarClock, Radio, Ticket, Users, Video } from "lucide-react";
import type { ChatMode, LiveStream, StreamAccess } from "@/lib/club";
import { notify } from "@/lib/account";
import { savePost, startLive, useMyClub, useMyLive } from "@/lib/studio";
import { StreamBadges } from "@/components/club/stream/StreamView";
import { Field, ImagePicker, SAMPLE_IMAGES, Section, Segmented, Toggle, ghostBtn, inputCls, primaryBtn } from "./ui";

/** Efirni sozlash: kirish (bepul / a'zolar / chipta), yozuv, chat, donat, danmaku; hozir yoki rejalashtirib */
export function LiveSetup() {
    const club = useMyClub()!;
    const live = useMyLive();
    const router = useRouter();

    const [title, setTitle] = useState("");
    const [cover, setCover] = useState<string[]>([club.banner ?? SAMPLE_IMAGES[0]]);
    const [access, setAccess] = useState<StreamAccess>("free");
    const [tier, setTier] = useState<string | null>(club.tiers[0]?.id ?? null);
    const [price, setPrice] = useState(15000);
    const [record, setRecord] = useState(true);
    const [recordAccess, setRecordAccess] = useState<"same" | "public">("same");
    const [chat, setChat] = useState<ChatMode>("all");
    const [donations, setDonations] = useState(true);
    const [danmaku, setDanmaku] = useState(true);
    const [when, setWhen] = useState<"now" | "later">("now");
    const [at, setAt] = useState("");

    if (live) {
        return (
            <div className="max-w-lg">
                <h1 className="text-2xl font-black text-text-main mb-5">Efir</h1>
                <div className="p-5 rounded-2xl bg-[#ff3b5c]/[0.08] border border-[#ff3b5c]/25">
                    <p className="flex items-center gap-2 font-black text-text-main">
                        <span className="live-dot" /> Siz efirdasiz
                    </p>
                    <p className="mt-1 text-sm text-text-muted">{live.title}</p>
                    <StreamBadges c={club} live={live} />
                    <Link href={`/${club.id}/live`} className={`${primaryBtn} mt-4`}>
                        Efirga o&apos;tish
                    </Link>
                </div>
            </div>
        );
    }

    const settings: Omit<LiveStream, "viewers" | "startedMin" | "startedAt"> = {
        title: title.trim() || "Jonli efir",
        cover: cover[0],
        access,
        tier: access === "free" ? null : tier,
        price: access === "ticket" ? price : undefined,
        record,
        recordAccess: record ? recordAccess : undefined,
        chat,
        donations,
        danmaku,
    };
    const valid = title.trim().length >= 3 && (when === "now" || !!at);

    const go = () => {
        if (when === "now") {
            startLive(settings);
            router.push(`/${club.id}/live`);
            return;
        }
        const d = new Date(at);
        const label = d.toLocaleString("uz-UZ", { weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" });
        const post = savePost({
            kind: "event",
            title: `Efir: ${settings.title}`,
            text: describe(settings, club.tiers.find((t) => t.id === settings.tier)?.name),
            media: settings.cover,
            tier: null,
            event: { when: label, title: settings.title },
        });
        if (post) notify({ kind: "live", title: "Efir rejalashtirildi", text: label, href: `/p/${post.id}`, avatar: club.avatar });
        router.push("/studio/posts");
    };

    const tierOptions = club.tiers.map((t) => ({ value: t.id, label: `${t.name}+` }));

    return (
        <div>
            <h1 className="text-2xl font-black text-text-main mb-5">Efirni sozlash</h1>
            <div className="xl:grid xl:grid-cols-[minmax(0,1fr)_380px] gap-6 items-start">
                <div className="space-y-4">
                    <Section title="Efir">
                        <Field label="Nomi">
                            <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={90} placeholder="Masalan: 7-qism dublyaji, jonli" className={inputCls} />
                        </Field>
                        <div>
                            <span className="block mb-1.5 text-[11px] font-mono font-bold uppercase tracking-wider text-text-muted">Muqova</span>
                            <ImagePicker value={cover} onChange={setCover} />
                        </div>
                    </Section>

                    <Section title="Kim ko'radi" desc="Bepul efir yangi a'zolarni jalb qiladi, yopiq va pullik — daromad keltiradi">
                        <Segmented
                            value={access}
                            onChange={(v) => {
                                setAccess(v);
                                // Chiptada a'zolarga bepul kirish — ixtiyoriy, odatiy o'chiq
                                setTier(v === "members" ? (club.tiers[0]?.id ?? null) : null);
                            }}
                            options={[
                                { value: "free", label: "Bepul", hint: "hamma" },
                                { value: "members", label: "A'zolar", hint: "tarif bo'yicha" },
                                { value: "ticket", label: "Chipta", hint: "bir martalik" },
                            ]}
                        />
                        {access === "members" && (
                            <Field label="Qaysi tarifdan">
                                <Segmented value={tier ?? ""} onChange={(v) => setTier(v)} options={tierOptions} />
                            </Field>
                        )}
                        {access === "ticket" && (
                            <>
                                <Field label="Chipta narxi, so'm">
                                    <input type="number" min={1000} step={1000} value={price} onChange={(e) => setPrice(Math.max(1000, Number(e.target.value) || 0))} className={inputCls} />
                                </Field>
                                <Toggle checked={!!tier} onChange={(v) => setTier(v ? (club.tiers[club.tiers.length - 1]?.id ?? null) : null)} label="A'zolarga bepul" desc="Tanlangan tarif va undan yuqorisi chiptasiz kiradi" />
                                {tier && <Segmented value={tier} onChange={(v) => setTier(v)} options={tierOptions} />}
                            </>
                        )}
                    </Section>

                    <Section title="Yozuv">
                        <Toggle checked={record} onChange={setRecord} label="Efir yozuvini saqlash" desc="Tugagach yozuv klubingizda video post bo'lib chiqadi" />
                        {record && (
                            <Segmented
                                value={recordAccess}
                                onChange={setRecordAccess}
                                options={[
                                    { value: "same", label: "Efir bilan bir xil", hint: access === "free" ? "hamma" : access === "ticket" ? "chipta/a'zolar" : "a'zolar" },
                                    { value: "public", label: "Hamma uchun", hint: "reklama sifatida" },
                                ]}
                            />
                        )}
                        {!record && <p className="text-xs text-text-muted">Yozuvsiz efir — faqat jonli ko&apos;rganlar uchun. Bu efirga kelishga sabab bo&apos;ladi.</p>}
                    </Section>

                    <Section title="Chat va interaktiv">
                        <Segmented
                            value={chat}
                            onChange={setChat}
                            options={[
                                { value: "all", label: "Hamma yozadi" },
                                { value: "members", label: "Faqat a'zolar" },
                                { value: "slow", label: "Sekin rejim", hint: "10 soniya" },
                            ]}
                        />
                        <Toggle checked={donations} onChange={setDonations} label="Donatlar" desc="Tomoshabinlar xabar bilan pul yuborishi mumkin" />
                        <Toggle checked={danmaku} onChange={setDanmaku} label="Uchuvchi xabarlar (danmaku)" desc="Chat xabarlari video ustidan uchib o'tadi" />
                    </Section>

                    <Section title="Qachon">
                        <Segmented
                            value={when}
                            onChange={setWhen}
                            options={[
                                { value: "now", label: "Hozir" },
                                { value: "later", label: "Rejalashtirish" },
                            ]}
                        />
                        {when === "later" && (
                            <>
                                <input type="datetime-local" value={at} onChange={(e) => setAt(e.target.value)} className={inputCls} />
                                <p className="text-xs text-text-muted">A&apos;zolarga anons post chiqadi, ular «Eslatish» tugmasini bosishi mumkin.</p>
                            </>
                        )}
                    </Section>

                    <div className="flex gap-2">
                        <button type="button" disabled={!valid} onClick={go} className={`${primaryBtn} flex-1 sm:flex-none ${when === "now" ? "!bg-[#ff3b5c] hover:!bg-[#ff3b5c]/90" : ""}`}>
                            {when === "now" ? <Radio className="w-4 h-4" /> : <CalendarClock className="w-4 h-4" />}
                            {when === "now" ? "Efirni boshlash" : "Rejalashtirish"}
                        </button>
                        <button type="button" onClick={() => router.back()} className={ghostBtn}>
                            Bekor qilish
                        </button>
                    </div>
                </div>

                <aside className="mt-6 xl:mt-0 xl:sticky xl:top-[88px] space-y-3">
                    <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-text-muted">Tomoshabinlar ko&apos;radi</p>
                    <div className="relative aspect-video rounded-2xl overflow-hidden bg-black">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={cover[0]} alt="" className="w-full h-full object-cover opacity-80" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 to-transparent" />
                        <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-[#ff3b5c] text-white text-[10px] font-mono font-bold uppercase">
                            <span className="w-1.5 h-1.5 rounded-full bg-white" /> Jonli
                        </span>
                        <p className="absolute bottom-3 inset-x-3 text-white text-sm font-bold">{settings.title}</p>
                    </div>
                    <StreamBadges c={club} live={{ ...settings, viewers: 0, startedMin: 0 }} />
                    <ul className="space-y-2 text-sm text-text-muted">
                        <li className="flex items-start gap-2">
                            {access === "ticket" ? <Ticket className="w-4 h-4 mt-0.5 shrink-0" /> : <Users className="w-4 h-4 mt-0.5 shrink-0" />}
                            {describeAccess(settings, club.tiers.find((t) => t.id === settings.tier)?.name)}
                        </li>
                        <li className="flex items-start gap-2">
                            <Video className="w-4 h-4 mt-0.5 shrink-0" />
                            {record ? (recordAccess === "public" ? "Yozuv hamma uchun ochiq bo'ladi" : "Yozuv efir kabi yopiq bo'ladi") : "Yozuv saqlanmaydi"}
                        </li>
                    </ul>
                </aside>
            </div>
        </div>
    );
}

function describeAccess(s: Omit<LiveStream, "viewers" | "startedMin" | "startedAt">, tierName?: string) {
    if (s.access === "free") return "Hamma bepul ko'radi";
    if (s.access === "members") return `${tierName ?? "Klub"} va undan yuqori a'zolar ko'radi`;
    return `Chipta ${s.price?.toLocaleString("ru-RU")} so'm${tierName ? `, ${tierName}+ a'zolarga bepul` : ""}`;
}

function describe(s: Omit<LiveStream, "viewers" | "startedMin" | "startedAt">, tierName?: string) {
    return `${describeAccess(s, tierName)}. ${s.record ? "Yozuv saqlanadi." : "Yozuv saqlanmaydi — faqat jonli!"}`;
}
