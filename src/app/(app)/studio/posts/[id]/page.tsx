import { PostEditor } from "@/components/studio/PostEditor";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    return <PostEditor id={(await params).id} />;
}
