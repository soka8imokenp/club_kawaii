import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CREATORS, creatorById } from "@/lib/club";
import { CreatorView } from "@/components/club/CreatorView";

export function generateStaticParams() {
    return CREATORS.map((c) => ({ creator: c.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ creator: string }> }): Promise<Metadata> {
    const c = creatorById((await params).creator);
    return c ? { title: `${c.name} • Kawaii Club`, description: c.tagline } : {};
}

export default async function CreatorPage({ params }: { params: Promise<{ creator: string }> }) {
    const c = creatorById((await params).creator);
    if (!c) notFound();
    return <CreatorView id={c.id} />;
}
