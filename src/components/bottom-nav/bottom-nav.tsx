"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, Menu, Newspaper, Radio } from "lucide-react";
import { MenuSheet } from "./menu-sheet";
import { useLongPress } from "@/hooks/useLongPress";
import { openSites } from "@/components/sites/SitesPanel";

const itemCls = "flex flex-col items-center justify-center gap-1 h-full text-[10px] font-medium transition-colors active:scale-95";

/** Mobil pastki navigatsiya (md'dan kichik ekranlarda) — boshqa kawaii saytlari bilan bir xil uslub. */
export default function BottomNav() {
    const pathname = usePathname();
    const [menuOpen, setMenuOpen] = useState(false);
    const closeMenu = useCallback(() => setMenuOpen(false), []);
    // Logotipni bosib turish — kawaii saytlari paneli
    const logoPress = useLongPress(openSites);

    // Efir va klub chati sahifalarida pastda kiritish paneli turadi — navigatsiya yashiriladi
    if (/^\/[^/]+\/(live|chat)$/.test(pathname)) return null;
    const tone = (active: boolean) => (active ? "text-primary" : "text-text-muted hover:text-text-main");

    return (
        <>
            {/* Navigatsiya balandligicha bo'sh joy — kontent uning ostida qolmasin */}
            <div className="md:hidden h-14" style={{ marginBottom: "env(safe-area-inset-bottom)" }} aria-hidden />
            <nav
                className="md:hidden fixed inset-x-0 bottom-0 z-[998] bg-page-bg theme-transition"
                style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
                aria-label="Asosiy navigatsiya"
            >
                <div className="grid grid-cols-5 items-center h-14 px-1">
                    <Link href="/feed" className={`${itemCls} ${tone(pathname === "/feed")}`}>
                        <Newspaper className="w-5 h-5" strokeWidth={1.75} />
                        Lenta
                    </Link>

                    <Link href="/creators" className={`${itemCls} ${tone(pathname === "/creators")}`}>
                        <Compass className="w-5 h-5" strokeWidth={1.75} />
                        Ijodkorlar
                    </Link>

                    {/* Markazda — logotip (bosh sahifa) */}
                    <Link
                        href="/"
                        aria-label="Bosh sahifa. Bosib turing — kawaii saytlari"
                        {...logoPress}
                        style={{ WebkitTouchCallout: "none" }}
                        className="flex items-center justify-center h-full active:scale-95 transition-transform select-none"
                    >
                        <span
                            className="block w-7 h-8 bg-primary"
                            style={{ mask: "url(/images/logo.svg) center / contain no-repeat", WebkitMask: "url(/images/logo.svg) center / contain no-repeat" }}
                        />
                    </Link>

                    <Link href="/live" className={`${itemCls} ${tone(pathname === "/live")}`}>
                        <Radio className="w-5 h-5" strokeWidth={1.75} />
                        Efirlar
                    </Link>

                    <button type="button" onClick={() => setMenuOpen(true)} aria-haspopup="dialog" aria-expanded={menuOpen} className={`${itemCls} ${tone(menuOpen)}`}>
                        <Menu className="w-5 h-5" strokeWidth={1.75} />
                        Menyu
                    </button>
                </div>
            </nav>
            <MenuSheet open={menuOpen} onClose={closeMenu} />
        </>
    );
}
