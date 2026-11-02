import type { Metadata } from "next";
import { Suspense } from "react";
import { CreatorsBrowser } from "@/components/club/CreatorsBrowser";

export const metadata: Metadata = {
    title: "Ijodkorlar • Kawaii Club",
    description: "Dublyaj, fanart, musiqa, cosplay va manga ijodkorlari klublari.",
};

export default function CreatorsPage() {
    return (
        <div className="pb-10">
            <h1 className="text-2xl sm:text-3xl font-black text-text-main">Ijodkorlar</h1>
            <p className="mt-1 mb-5 text-sm text-text-muted">Klubni tanlang — kartasi sizni kutmoqda</p>
            <Suspense>
                <CreatorsBrowser />
            </Suspense>
        </div>
    );
}
