"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useThemeHook } from "./_hooks/top-bar-hooks";
import { useLongPress } from "@/hooks/useLongPress";
import { openSites } from "@/components/sites/SitesPanel";
import { usePathname } from "next/navigation";
import { Bell, Compass, Moon, Newspaper, Radio, Search, Sun, WalletCards } from "lucide-react";
import { useAccount } from "@/lib/account";
import { openNotices, useUnread } from "@/components/club/NotificationsSheet";
import { openLogin } from "@/components/club/sheets";

const NAV = [
    { href: "/feed", label: "Lenta", Icon: Newspaper },
    { href: "/creators", label: "Ijodkorlar", Icon: Compass },
    { href: "/live", label: "Efirlar", Icon: Radio },
    { href: "/wallet", label: "Kartalarim", Icon: WalletCards },
];

export default function TopBar() {
    const { theme, toggleTheme } = useThemeHook();
    const pathname = usePathname();
    const account = useAccount();
    const unread = useUnread();
    const [isFlipped, setIsFlipped] = useState(false);
    // Logotipni bosib turish — kawaii saytlari paneli
    const logoPress = useLongPress(openSites);

    useEffect(() => {
        const interval = setInterval(() => {
            setIsFlipped((prev) => !prev);
        }, 60000);
        return () => clearInterval(interval);
    }, [isFlipped]);

    return (
        <nav className="sticky top-0 h-16 w-full border-b border-border-sep bg-background/95 backdrop-blur-md select-none z-[999] overflow-hidden theme-transition">
            <div className="flex items-center justify-between w-full max-w-[1240px] mx-auto px-4 sm:px-6 h-full">
                {/* Logo */}
                <Link
                    href="/"
                    onClick={() => setIsFlipped((prev) => !prev)}
                    {...logoPress}
                    title="Bosib turing — kawaii saytlari"
                    style={{ WebkitTouchCallout: "none" }}
                    className="flex items-center gap-2 cursor-pointer transform-gpu will-change-transform transition-all duration-300 active:scale-95 group"
                >
                    <span className="font-bold text-2xl font-mono tracking-tight text-text-main group-hover:tracking-[0.08em] transition-all duration-300 leading-none flex items-center">
                        Kawaii
                    </span>
                    <div className="relative w-[24px] h-[24px] select-none" style={{ perspective: "1000px" }}>
                        <motion.div
                            animate={{ rotateY: isFlipped ? 180 : 0 }}
                            transition={{ duration: 0.6, ease: "easeInOut" }}
                            className="w-full h-full relative"
                            style={{ transformStyle: "preserve-3d" }}
                        >
                            {/* Old tomoni (CLUB) */}
                            <div
                                className="absolute inset-0 bg-primary rounded-[4px] flex items-center justify-center shadow-sm border border-primary/20"
                                style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}
                            >
                                <span className="text-[6.5px] font-sans font-extrabold text-white tracking-wide leading-none">
                                    CLUB
                                </span>
                            </div>

                            {/* Задняя сторона (logo.svg) */}
                            <div
                                className="absolute inset-0 bg-primary rounded-[4px] flex items-center justify-center shadow-sm border border-primary/20"
                                style={{
                                    transform: "rotateY(180deg)",
                                    backfaceVisibility: "hidden",
                                    WebkitBackfaceVisibility: "hidden",
                                }}
                            >
                                <div className="relative w-3.5 h-3.5">
                                    <Image
                                        src="/images/logo.svg"
                                        alt="logo"
                                        fill
                                        className="object-contain filter invert brightness-[100]"
                                        unoptimized
                                    />
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </Link>

                {/* Navigatsiya havolalari */}
                <div className="hidden md:flex items-center justify-center text-text-main h-full gap-1 lg:gap-3 font-mono">
                    {NAV.map(({ href, label, Icon }) => {
                        const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
                        return (
                            <Link
                                key={href}
                                href={href}
                                className={`flex items-center justify-center h-8 py-1 px-2.5 gap-1.5 rounded-sm transition-all duration-200 cursor-pointer hover:bg-foreground/5 active:scale-95 ${
                                    active ? "text-primary font-bold" : "text-text-muted hover:text-text-main"
                                }`}
                            >
                                <Icon className="w-3.5 h-3.5" />
                                <span className="font-medium text-xs uppercase tracking-wider">{label}</span>
                            </Link>
                        );
                    })}
                </div>

                {/* Правая панель действий (на мобильном — в меню нижней навигации) */}
                <div className="hidden md:flex items-center justify-end gap-2.5 sm:gap-3.5">
                    {/* Переключатель темы */}
                    <button
                        className="flex items-center justify-center w-8 h-8 rounded-sm transition-all duration-200 cursor-pointer text-text-main hover:bg-foreground/5 active:scale-95"
                        onClick={toggleTheme}
                        aria-label="Toggle Theme"
                    >
                        {theme === "light" ? (
                            <Moon className="w-4 h-4 text-text-main" />
                        ) : (
                            <Sun className="w-4 h-4 text-text-main" />
                        )}
                    </button>

                    {/* Qidiruv */}
                    <Link href="/search" aria-label="Qidiruv" className="flex items-center justify-center w-8 h-8 rounded-sm transition-all duration-200 cursor-pointer text-text-main hover:bg-foreground/5 active:scale-95">
                        <Search className="w-4 h-4" />
                    </Link>

                    {/* Bildirishnomalar */}
                    <button type="button" onClick={openNotices} aria-label="Bildirishnomalar" className="relative flex items-center justify-center w-8 h-8 rounded-sm transition-all duration-200 cursor-pointer text-text-main hover:bg-foreground/5 active:scale-95">
                        <Bell className="w-4 h-4 text-text-main" />
                        {unread > 0 && <span className="absolute top-0.5 right-0.5 min-w-4 h-4 px-1 rounded-full bg-primary text-white text-[9px] font-bold flex items-center justify-center">{unread}</span>}
                    </button>

                    {/* Profil yoki kirish */}
                    {account ? (
                        <Link href="/me" aria-label="Profil" className="flex shrink-0 h-9 w-9 rounded-sm border border-border-sep bg-primary/15 p-1.5 overflow-hidden active:scale-95 transition-transform">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={account.avatar} alt="" className="w-full h-full object-contain" />
                        </Link>
                    ) : (
                        <button type="button" onClick={openLogin} className="h-9 px-3.5 rounded-sm bg-primary hover:bg-primary/90 text-white text-xs font-mono font-bold uppercase tracking-wider cursor-pointer active:scale-95 transition-all">
                            Kirish
                        </button>
                    )}
                </div>
            </div>
        </nav>
    );
}
