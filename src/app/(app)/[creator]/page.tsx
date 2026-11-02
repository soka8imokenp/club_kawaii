import type { Metadata } from "next";
import { CREATORS, creatorById } from "@/lib/club";
import { CreatorView } from "@/components/club/CreatorView";

export function generateStaticParams() {
    return CREATORS.map((c) => ({ creator: c.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ creator: string }> }): Promise<Metadata> {
    const c = creatorById((await params).creator);
    return c ? { title: `${c.name} • Kawaii Club`, description: c.tagline } : { title: "Klub • Kawaii Club" };
}

// Studiyada ochilgan klublar hozircha brauzerda — topilmasa, sahifaning o'zi xabar beradi
export default async function CreatorPage({ params }: { params: Promise<{ creator: string }> }) {
    return <CreatorView id={(await params).creator} />;
}
