import type { Metadata } from "next";
import { POSTS } from "@/lib/club";
import { PostView } from "@/components/club/PostView";

export function generateStaticParams() {
    return POSTS.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id } = await params;
    const p = POSTS.find((x) => x.id === id);
    return p ? { title: `${p.title} • Kawaii Club`, description: p.text.slice(0, 160) } : { title: "Post • Kawaii Club" };
}

export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
    return <PostView id={(await params).id} />;
}
