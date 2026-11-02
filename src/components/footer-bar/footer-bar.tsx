"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

export default function FooterBar() {
    const [isFlipped, setIsFlipped] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            setIsFlipped((prev) => !prev);
        }, 60000);
        return () => clearInterval(interval);
    }, [isFlipped]);

    return (
        <footer className="w-full border-t border-border-sep bg-background select-none theme-transition font-mono relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-[1240px] mx-auto py-10 px-6">
                {/* Brand Column */}
                <div className="flex flex-col gap-3">
                    <Link
                        href="/"
                        onClick={() => setIsFlipped((prev) => !prev)}
                        className="flex items-center gap-2 cursor-pointer transform-gpu will-change-transform transition-all duration-300 active:scale-95 group w-fit"
                    >
                        <span className="font-bold text-2xl font-mono tracking-tight text-text-main group-hover:tracking-[0.08em] transition-all duration-300 leading-none flex items-center">
                            Kawaii
                        </span>
                        <div className="relative w-[22px] h-[22px] select-none" style={{ perspective: "1000px" }}>
                            <motion.div
                                animate={{ rotateY: isFlipped ? 180 : 0 }}
                                transition={{ duration: 0.6, ease: "easeInOut" }}
                                className="w-full h-full relative"
                                style={{ transformStyle: "preserve-3d" }}
                            >
                                <div
                                    className="absolute inset-0 bg-primary rounded-[4px] flex items-center justify-center shadow-sm border border-primary/20"
                                    style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}
                                >
                                    <span className="text-[6.5px] font-sans font-extrabold text-white tracking-wide leading-none">
                                        CLUB
                                    </span>
                                </div>
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
                    <p className="text-text-muted text-xs leading-relaxed max-w-xs">
                        Anime ijodkorlari klublari: klub kartalari, yopiq postlar, a&apos;zolar efirlari va ijodkor bilan yaqin aloqa.
                    </p>
                </div>

                {/* Navigation Column */}
                <div className="flex flex-col gap-2">
                    <span className="font-bold text-text-main text-sm uppercase mb-1">Navigatsiya</span>
                    <Link href="/" className="text-text-muted hover:text-primary text-xs uppercase transition-colors w-fit">Asosiy</Link>
                    <Link href="/feed" className="text-text-muted hover:text-primary text-xs uppercase transition-colors w-fit">Lenta</Link>
                    <Link href="/creators" className="text-text-muted hover:text-primary text-xs uppercase transition-colors w-fit">Ijodkorlar</Link>
                    <Link href="/live" className="text-text-muted hover:text-primary text-xs uppercase transition-colors w-fit">Efirlar</Link>
                </div>

                {/* Support Column */}
                <div className="flex flex-col gap-2">
                    <span className="font-bold text-text-main text-sm uppercase mb-1">Yordam</span>
                    <a href="#" className="text-text-muted hover:text-primary text-xs uppercase transition-colors w-fit">Aloqa</a>
                    <a href="#" className="text-text-muted hover:text-primary text-xs uppercase transition-colors w-fit">Qoidalar</a>
                    <a href="#" className="text-text-muted hover:text-primary text-xs uppercase transition-colors w-fit">F.A.Q.</a>
                    <a href="#" className="text-text-muted hover:text-primary text-xs uppercase transition-colors w-fit">Biz haqimizda</a>
                </div>
            </div>
            <div className="w-full text-center py-4 border-t border-border-sep/40 text-[10px] text-text-muted">
                &copy; {new Date().getFullYear()} Kawaii Club. Barcha huquqlar himoyalangan.
            </div>
        </footer>
    );
}
