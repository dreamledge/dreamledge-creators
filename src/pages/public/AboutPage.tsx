import { Link } from "react-router-dom";

const paragraphs = [
  "Dreamledge Creators started with a simple idea:",
  "Creators deserve a place where their work is actually seen, judged fairly, and helps them grow-together.",
  "We've all posted content and felt like it disappeared into the void. No real feedback. No real connection. Just algorithms. That didn't sit right with us.",
  "So we built something different.",
  "Dreamledge is more than a platform-it's a community. A place where creators can meet, chat, follow each other, and build real relationships. You're not just uploading content-you're connecting with people who are on the same journey as you.",
  "With our judge-for-judge system, creators actively support each other by watching, rating, and giving feedback. It turns passive scrolling into real interaction, where every view actually matters.",
  "And we made sure your growth doesn't stay inside the app.",
  "Dreamledge is designed to drive traffic directly to your social media, helping you gain real fans, real engagement, and real visibility across platforms like TikTok, Instagram, YouTube, and more.",
  "You can also join a crew, build with your people, compete in weekly challenges, and rise through the ranks together. Whether it's funniest content, best storytelling, or pure creativity-there's always a lane for you to stand out.",
  "At the end of the day, Dreamledge isn't just about competition.",
  "It's about community, connection, and creators helping creators win.",
  "This is your ledge. Step up.",
];

export function AboutPage() {
  return (
    <div className="min-h-screen app-backdrop page-grid text-white">
      <div className="mx-auto flex h-[70px] w-full max-w-7xl items-center px-5 sm:px-6 lg:px-8">
        <div className="grid w-full grid-cols-[48px_1fr_auto] items-center gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-[999px] border border-white/8 bg-white/[0.04]">
            <div className="flex h-7 w-7 items-center justify-center rounded-[999px] bg-[linear-gradient(180deg,rgba(255,91,91,0.92),rgba(255,45,61,0.92))] text-sm font-bold text-[#F5F5F7]">D</div>
          </div>
          <div className="min-w-0 text-center">
            <p className="truncate text-[10px] uppercase tracking-[0.34em] text-[#F5F5F7]/55">Dreamledge</p>
            <h1 className="truncate text-[1.05rem] font-semibold tracking-tight text-[#F5F5F7]">Creators</h1>
          </div>
          <Link to="/" className="justify-self-end rounded-[999px] border border-white/8 bg-[#F1F1F3] px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-[#e7e7ea]">Back</Link>
        </div>
      </div>

      <main className="mx-auto w-full max-w-5xl px-5 pb-16 pt-8 sm:px-6 lg:px-8">
        <section className="bubble-card rounded-[40px] p-6 sm:p-8 lg:p-10">
          <p className="text-[11px] uppercase tracking-[0.3em] text-red-300/80">About Us - Dreamledge Creators</p>
          <h2 className="mt-4 text-4xl font-semibold leading-tight text-white sm:text-5xl">Community, connection, and creators helping creators win.</h2>
          <div className="mt-8 space-y-5 text-base leading-8 text-zinc-300 sm:text-lg">
            {paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
