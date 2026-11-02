"use client";

import { useState } from "react";
import Link from "next/link";
import { Bell, ChevronDown, ChevronRight, CircleHelp, Compass, Globe, LayoutDashboard, LogIn, Moon, Newspaper, Radio, Palette, Search, Sun, User, WalletCards, X } from "lucide-react";
import { useThemeHook } from "@/components/top-bar/_hooks/top-bar-hooks";
import { SideDrawer } from "@/components/ui/SideDrawer";
import { SITES } from "@/lib/sites";
import { useRouter } from "next/navigation";
import { useAccount } from "@/lib/account";
import { openNotices } from "@/components/club/NotificationsSheet";
import { openLogin } from "@/components/club/sheets";

type Item = { label: string; Icon: typeof Radio; href?: string; current?: boolean; onClick?: () => void };

const SECTIONS: { id: string; title: string; items: Item[] }[] = [
    {
        id: "club",
        title: "Klub",
        items: [
            { label: "Lenta", Icon: Newspaper, href: "/feed" },
            { label: "Ijodkorlar", Icon: Compass, href: "/creators" },
            { label: "Efirlar", Icon: Radio, href: "/live" },
            { label: "Klub kartalarim", Icon: WalletCards, href: "/wallet" },
        ],
    },
    {
        id: "creator",
        title: "Ijodkorlar uchun",
        items: [
            { label: "Ijodkor bo'lish", Icon: Palette, href: "/studio" },
            { label: "Studiya", Icon: LayoutDashboard, href: "/studio" },
        ],
    },
    {
        id: "more",
        title: "Boshqalar",
        items: [
            { label: "Profil", Icon: User, href: "/me" },
            { label: "Bildirishnomalar", Icon: Bell, onClick: openNotices },
            { label: "Yordam", Icon: CircleHelp },
        ],
    },
    {
        id: "sites",
        title: "Saytlar",
        items: SITES.map((site) => ({ label: site.name, Icon: Globe, href: site.url, current: site.current })),
    },
];

/** Bo'lim — bosilganda yumshoq ochilib-yopiladi */
function Section({ title, items, open, onToggle, onNavigate }: { title: string; items: Item[]; open: boolean; onToggle: () => void; onNavigate: () => void }) {
    return (
        <div className={`rounded-xl transition-colors ${open ? "" : "bg-foreground/[0.04]"}`}>
            <button type="button" onClick={onToggle} aria-expanded={open} className="w-full flex items-center justify-between px-3 py-3 text-sm font-bold text-text-main cursor-pointer">
                {title}
                {open ? <ChevronDown className="w-4 h-4 text-text-muted" /> : <ChevronRight className="w-4 h-4 text-text-muted" />}
            </button>
            <div className={`grid transition-[grid-template-rows] duration-300 ease-out ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                <div className="overflow-hidden">
                    <div className="pb-1">
                        {items.map(({ label, Icon, href, current, onClick }) => {
                            const cls = `flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] transition-colors ${
                                current ? "text-primary" : "text-text-muted hover:text-text-main hover:bg-foreground/[0.04]"
                            }`;
                            const body = (
                                <>
                                    <Icon className="w-4 h-4" strokeWidth={1.75} />
                                    {label}
                                </>
                            );
                            return href ? (
                                <Link key={label} href={href} onClick={onNavigate} className={cls}>
                                    {body}
                                </Link>
                            ) : (
                                <button
                                    key={label}
                                    type="button"
                                    onClick={() => {
                                        onNavigate();
                                        onClick?.();
                                    }}
                                    className={`w-full text-left cursor-pointer ${cls}`}
                                >
                                    {body}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}

/** Mobil menyu — o'ngdan chiqadigan panel (kawaii saytlari bilan bir xil uslub). O'ngga svayp bilan yopiladi. */
export function MenuSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
    const { theme, toggleTheme } = useThemeHook();
    const dark = theme === "dark";
    const [expanded, setExpanded] = useState<string | null>("club");
    const router = useRouter();
    const account = useAccount();

    return (
        <SideDrawer
            open={open}
            onClose={onClose}
            label="Menyu"
            wrapperClassName="md:hidden"
            header={(close) => (
                <div className="flex items-center gap-2 px-3 pt-3 pb-3">
                    <button type="button" onClick={toggleTheme} aria-label={dark ? "Yorug' rejim" : "Qorong'i rejim"} className="w-9 h-9 rounded-lg flex items-center justify-center text-text-muted hover:text-text-main cursor-pointer shrink-0">
                        {dark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                    </button>
                    <form
                        className="flex-1 min-w-0 flex items-center gap-2 h-9 px-2.5 rounded-lg bg-foreground/[0.04] text-text-muted"
                        onSubmit={(e) => {
                            e.preventDefault();
                            const q = new FormData(e.currentTarget).get("q")?.toString().trim();
                            router.push(q ? `/search?q=${encodeURIComponent(q)}` : "/search");
                            close();
                        }}
                    >
                        <Search className="w-4 h-4 shrink-0" />
                        <input name="q" placeholder="Qidiruv" aria-label="Qidiruv" enterKeyHint="search" className="w-full min-w-0 bg-transparent text-sm text-text-main placeholder:text-text-muted focus:outline-none" />
                    </form>
                    <button type="button" onClick={close} aria-label="Yopish" className="w-9 h-9 rounded-lg flex items-center justify-center text-text-muted hover:text-text-main cursor-pointer shrink-0">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}
            footer={<p className="py-4 text-center text-[10px] font-mono text-text-muted/70">versiya: 1.0.0</p>}
        >
            <div className="px-3 space-y-2">
                {account ? (
                    <Link href="/me" onClick={onClose} className="w-full flex items-center gap-3 px-3 py-2.5 mb-2 rounded-xl bg-foreground/[0.04]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={account.avatar} alt="" className="w-9 h-9 rounded-lg bg-primary/15 p-1.5 object-contain" />
                        <span className="min-w-0">
                            <span className="block text-sm font-bold text-text-main truncate">{account.name}</span>
                            <span className="block text-[11px] font-mono text-text-muted">Profil</span>
                        </span>
                    </Link>
                ) : (
                    <button
                        type="button"
                        onClick={() => {
                            onClose();
                            openLogin();
                        }}
                        className="w-full flex items-center justify-between px-4 py-3 mb-2 rounded-xl bg-primary hover:bg-primary/90 text-white text-sm font-bold cursor-pointer transition-colors active:scale-[0.98]"
                    >
                        Telegram orqali kirish
                        <LogIn className="w-4 h-4" />
                    </button>
                )}
                {SECTIONS.map((s) => (
                    <Section
                        key={s.id}
                        title={s.title}
                        items={s.items}
                        open={expanded === s.id}
                        onToggle={() => setExpanded((e) => (e === s.id ? null : s.id))}
                        onNavigate={onClose}
                    />
                ))}
            </div>
        </SideDrawer>
    );
}
