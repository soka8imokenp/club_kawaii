"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, BarChart3, ExternalLink, FileText, Layers, Radio, Settings, Sparkles, Wallet } from "lucide-react";
import { CATEGORIES, type CategoryId } from "@/lib/club";
import { useAccount } from "@/lib/account";
import { createClub, useMyClub, useMyLive } from "@/lib/studio";
import { LoginPrompt } from "@/components/club/sheets";
import { ClubCard } from "@/components/club/ClubCard";
import { Field, ImagePicker, SAMPLE_IMAGES, inputCls, primaryBtn } from "./ui";

const NAV = [
    { href: "/studio", label: "Umumiy", Icon: BarChart3 },
    { href: "/studio/posts", label: "Postlar", Icon: FileText },
    { href: "/studio/tiers", label: "Tariflar", Icon: Layers },
    { href: "/studio/live", label: "Efir", Icon: Radio },
    { href: "/studio/payouts", label: "Daromad", Icon: Wallet },
    { href: "/studio/settings", label: "Sozlamalar", Icon: Settings },
];

/** Studiya qobig'i: kirish → klub ochish → yon menyu + bo'limlar */
export function StudioShell({ children }: { children: React.ReactNode }) {
    const account = useAccount();
    const club = useMyClub();
    const live = useMyLive();
    const pathname = usePathname();

    if (!account) {
        return (
            <div className="max-w-md mx-auto w-full mt-10 bg-card-bg dark:bg-[#0a0a0a] rounded-3xl border border-border-sep card-shadow">
                <LoginPrompt text="Studiyaga kirish uchun akkauntga kiring" />
            </div>
        );
    }
    if (!club) return <Onboarding />;

    return (
        <div className="pb-10 lg:grid lg:grid-cols-[230px_minmax(0,1fr)] gap-8 items-start">
            <aside className="lg:sticky lg:top-[88px]">
                <Link href={`/${club.id}`} className="hidden lg:flex items-center gap-3 p-2 mb-3 rounded-xl hover:bg-foreground/[0.04] transition-colors">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={club.avatar} alt="" className="w-10 h-10 rounded-xl object-cover" />
                    <span className="min-w-0 flex-1">
                        <span className="block text-sm font-black text-text-main truncate">{club.name}</span>
                        <span className="flex items-center gap-1 text-[11px] font-mono text-text-muted">
                            Klubni ko&apos;rish <ExternalLink className="w-3 h-3" />
                        </span>
                    </span>
                </Link>
                <nav className="flex lg:flex-col gap-1 overflow-x-auto no-scrollbar -mx-3 px-3 lg:mx-0 lg:px-0 mb-5 lg:mb-0">
                    {NAV.map(({ href, label, Icon }) => {
                        const on = href === "/studio" ? pathname === href : pathname.startsWith(href) || (href === "/studio/posts" && pathname === "/studio/new");
                        return (
                            <Link
                                key={href}
                                href={href}
                                className={`shrink-0 flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-bold transition-colors ${on ? "bg-primary/10 text-primary" : "text-text-muted hover:text-text-main hover:bg-foreground/[0.04]"}`}
                            >
                                <Icon className="w-4 h-4" />
                                {label}
                                {href === "/studio/live" && live && <span className="live-dot ml-auto" />}
                            </Link>
                        );
                    })}
                </nav>
            </aside>
            <div className="min-w-0">{children}</div>
        </div>
    );
}

const HUES = [295, 345, 20, 75, 160, 220, 250];

/** Ijodkor bo'lish: klub nomi, manzili, kategoriya, rasm va karta rangi */
function Onboarding() {
    const account = useAccount();
    const [name, setName] = useState(account?.name ?? "");
    const [handle, setHandle] = useState(account?.handle ?? "");
    const [category, setCategory] = useState<CategoryId>("fanart");
    const [tagline, setTagline] = useState("");
    const [avatar, setAvatar] = useState<string[]>([SAMPLE_IMAGES[6]]);
    const [banner, setBanner] = useState<string[]>([SAMPLE_IMAGES[1]]);
    const [hue, setHue] = useState(295);

    const slug = handle.toLowerCase().replace(/[^a-z0-9_]/g, "").slice(0, 24);
    const ok = name.trim().length >= 2 && slug.length >= 3 && tagline.trim().length >= 5;
    const preview = {
        id: slug || "klub",
        name: name || "Klubingiz",
        category,
        tagline,
        about: tagline,
        avatar: avatar[0],
        banner: banner[0],
        hue,
        members: 0,
        posts: 0,
        tiers: [{ id: "sensei", name: "Sensei", price: 60000, perks: ["Hammasi"], members: 0 }],
    };

    return (
        <div className="pb-10 max-w-5xl mx-auto w-full">
            <p className="flex items-center gap-2 text-[11px] font-mono font-bold uppercase tracking-[0.2em] text-primary">
                <Sparkles className="w-4 h-4" /> Ijodkor bo&apos;lish
            </p>
            <h1 className="mt-2 text-2xl sm:text-4xl font-black text-text-main">O&apos;z klubingizni oching</h1>
            <p className="mt-2 text-sm text-text-muted max-w-xl">Bir daqiqa: nom, manzil va klub kartangiz rangi. Tariflar, postlar va efirlarni keyin studiyada sozlaysiz.</p>

            <div className="mt-8 lg:grid lg:grid-cols-[minmax(0,1fr)_400px] gap-10 items-start">
                <div className="space-y-5">
                    <Field label="Klub nomi">
                        <input value={name} onChange={(e) => setName(e.target.value)} maxLength={32} placeholder="Masalan, Nori Lo-fi" className={inputCls} />
                    </Field>
                    <Field label="Manzil" hint={`club.kawaii.uz/${slug || "manzil"}`}>
                        <input value={handle} onChange={(e) => setHandle(e.target.value)} maxLength={24} placeholder="lotin harflari, raqam, _" className={inputCls} />
                    </Field>
                    <Field label="Qisqa tavsif">
                        <input value={tagline} onChange={(e) => setTagline(e.target.value)} maxLength={90} placeholder="Nima qilasiz va a'zolar nima oladi" className={inputCls} />
                    </Field>
                    <div>
                        <span className="block mb-1.5 text-[11px] font-mono font-bold uppercase tracking-wider text-text-muted">Kategoriya</span>
                        <div className="flex flex-wrap gap-2">
                            {CATEGORIES.map((c) => (
                                <button
                                    key={c.id}
                                    type="button"
                                    onClick={() => setCategory(c.id)}
                                    className={`px-3.5 py-2 rounded-xl text-sm font-bold cursor-pointer transition-colors ${category === c.id ? "bg-primary text-white" : "bg-foreground/[0.05] text-text-muted hover:text-text-main"}`}
                                >
                                    {c.label}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <span className="block mb-1.5 text-[11px] font-mono font-bold uppercase tracking-wider text-text-muted">Avatar</span>
                        <ImagePicker value={avatar} onChange={setAvatar} square />
                    </div>
                    <div>
                        <span className="block mb-1.5 text-[11px] font-mono font-bold uppercase tracking-wider text-text-muted">Banner</span>
                        <ImagePicker value={banner} onChange={setBanner} />
                    </div>
                    <div>
                        <span className="block mb-1.5 text-[11px] font-mono font-bold uppercase tracking-wider text-text-muted">Karta rangi</span>
                        <div className="flex gap-2">
                            {HUES.map((h) => (
                                <button
                                    key={h}
                                    type="button"
                                    onClick={() => setHue(h)}
                                    aria-label={`Rang ${h}`}
                                    className={`w-9 h-9 rounded-full cursor-pointer ring-2 ring-offset-2 ring-offset-page-bg transition-all ${hue === h ? "ring-primary scale-110" : "ring-transparent"}`}
                                    style={{ background: `oklch(0.55 0.16 ${h})` }}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                <div className="mt-8 lg:mt-0 lg:sticky lg:top-[88px]">
                    <p className="mb-3 text-[11px] font-mono font-bold uppercase tracking-wider text-text-muted">Klub kartangiz</p>
                    <ClubCard creator={preview} tier={preview.tiers[0]} />
                    <button
                        type="button"
                        disabled={!ok}
                        onClick={() => createClub({ id: slug, name: name.trim(), category, tagline: tagline.trim(), avatar: avatar[0], banner: banner[0], hue })}
                        className={`${primaryBtn} w-full mt-6`}
                    >
                        Klubni ochish <ArrowRight className="w-4 h-4" />
                    </button>
                    <p className="mt-2 text-center text-[11px] text-text-muted">Komissiya faqat daromaddan olinadi</p>
                </div>
            </div>
        </div>
    );
}
