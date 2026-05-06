import { notFound } from "next/navigation";
import Navbar from "@/src/components/Navbar";
import StaticBlockRenderer from "@/src/components/StaticBlockRenderer";

async function getBlogPost(id: string) {
    try {
        const res = await fetch(`http://localhost:5000/api/pages/${id}`, {
            cache: 'no-store',
        });

        console.log(res)

        if (!res.ok) return null;
        return res.json();
    } catch (error) {
        console.error("Fetch error:", error);
        return null;
    }
}

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function BlogPage(props: PageProps) {
    const params = await props.params;
    const id = params.id;

    const post = await getBlogPost(id);

    console.log(post)
    console.log(post.title)

    if (!post) {
        notFound();
    }

    return (
        <>
            <Navbar />
            <article className="max-w-4xl mx-auto py-10 px-4">
                <header className="mb-8 border-b pb-8">
                    <h1 className="text-4xl font-bold mb-2">
                        {post.title || "Untitled Post"}
                    </h1>
                    <div className="text-gray-500 text-sm">
                        Published on {new Date(post.updatedAt).toLocaleDateString()}
                    </div>
                </header>

                <div className="prose prose-lg max-w-none">
                    {/* Pass the blocks from the DB directly to your renderer */}
                    <StaticBlockRenderer blocks={post.blocks} />
                </div>
            </article>
        </>
    );
}