"use client";

import Link from "next/link";
import { Bell, CreditCard, FileText, MessageCircle, Radio, Sparkles } from "lucide-react";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { markAllRead, timeAgo, useNotices, type Notice } from "@/lib/account";
import { createOpener } from "@/lib/store";

const opener = createOpener<null>();
export const openNotices = () => opener.open(null);

const ICON: Record<Notice["kind"], typeof Bell> = { post: FileText, live: Radio, payment: CreditCard, comment: MessageCircle, system: Sparkles };

export function useUnread() {
    return useNotices().filter((n) => !n.read).length;
}

/** Bildirishnomalar: yangi postlar, efirlar, to'lovlar */
export function NotificationsSheet() {
    const { open } = opener.use();
    const list = useNotices();
    const close = () => {
        markAllRead();
        opener.close();
    };

    return (
        <BottomSheet open={open} onClose={close} label="Bildirishnomalar" title={<h2 className="text-lg font-black text-text-main">Bildirishnomalar</h2>}>
            <div className="px-3 pb-4">
                {list.length === 0 && <p className="py-10 text-center text-sm text-text-muted">Hozircha hech narsa yo&apos;q</p>}
                {list.map((n) => {
                    const Icon = ICON[n.kind];
                    const body = (
                        <>
                            <span className="relative shrink-0">
                                {n.avatar ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={n.avatar} alt="" className="w-11 h-11 rounded-xl object-cover" />
                                ) : (
                                    <span className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                                        <Icon className="w-5 h-5" />
                                    </span>
                                )}
                                {n.avatar && (
                                    <span className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center ring-2 ring-card-bg ${n.kind === "live" ? "bg-[#ff3b5c]" : "bg-primary"} text-white`}>
                                        <Icon className="w-3 h-3" />
                                    </span>
                                )}
                            </span>
                            <span className="flex-1 min-w-0">
                                <span className="block text-sm font-bold text-text-main">{n.title}</span>
                                <span className="block text-xs text-text-muted truncate">{n.text}</span>
                            </span>
                            <span className="shrink-0 flex flex-col items-end gap-1">
                                <span className="text-[10px] font-mono text-text-muted">{timeAgo(n.at)}</span>
                                {!n.read && <span className="w-2 h-2 rounded-full bg-primary" />}
                            </span>
                        </>
                    );
                    const cls = "flex items-center gap-3 px-2 py-3 rounded-xl hover:bg-foreground/[0.04] transition-colors";
                    return n.href ? (
                        <Link key={n.id} href={n.href} onClick={close} className={cls}>
                            {body}
                        </Link>
                    ) : (
                        <div key={n.id} className={cls}>
                            {body}
                        </div>
                    );
                })}
            </div>
        </BottomSheet>
    );
}
