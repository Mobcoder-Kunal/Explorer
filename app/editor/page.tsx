import EditorHeader from "@/src/components/EditorHeader";
import BlockRenderer from "@/src/components/BlockRenderer";
import Navbar from "@/src/components/Navbar";

export default function EditorPage() {
    return (
        <div className="min-h-screen bg-white">
            <Navbar />
            <EditorHeader />
            <main className="max-w-3xl mx-auto py-10 px-6">
                <BlockRenderer />
            </main>
        </div>
    );
}