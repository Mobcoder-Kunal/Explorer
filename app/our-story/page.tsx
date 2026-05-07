'use client'
import Navbar from '@/src/components/Navbar';

export default function OurStoryPage() {
    return (
        <div className="min-h-screen bg-white">
            <Navbar />

            <main className="max-w-3xl mx-auto py-20 px-6">

                <header className="mb-16">
                    <h1 className="text-5xl md:text-7xl font-serif font-medium tracking-tight mb-8">
                        Every idea starts with a single block.
                    </h1>
                    <p className="text-2xl text-zinc-500 font-light leading-relaxed">
                        Hi, I'm Kunal. I built Explorer because I believe the world
                        needs a quieter place to think, write, and share.
                    </p>
                </header>

                <div className="space-y-12">

                    <div className="w-full h-96 bg-zinc-100 rounded-2xl overflow-hidden shadow-inner">
                        <img
                            src="https://wallpapercave.com/wp/wp6479816.jpg"
                            alt="The creator"
                            className="w-full h-full object-cover"
                        />
                    </div>

                    <section className="prose prose-zinc prose-lg">
                        <h2 className="text-3xl font-serif font-bold text-zinc-900">Why I'm making this</h2>
                        <p className="text-zinc-600 leading-relaxed">
                            Writing should be effortless. I spent weeks refining the
                            editor you see today—the "slash" commands, the block-based
                            logic, and the focus on typography—to ensure that nothing
                            gets between your brain and the digital page.
                        </p>

                        <p className="text-zinc-600 leading-relaxed">
                            Explorer isn't just a coding project; it's a personal mission
                            to create a medium where expertise and stories are the
                            only things that matter. No ads, no noise, just words.
                        </p>
                    </section>

                    <hr className="border-zinc-100" />

                    <footer className="py-10">
                        <p className="text-zinc-400 italic">
                            Thanks for being part of the journey. Keep exploring.
                        </p>
                    </footer>
                </div>
            </main>
        </div>
    );
}