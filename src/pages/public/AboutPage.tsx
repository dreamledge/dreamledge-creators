import { Link } from "react-router-dom";

const highlights = [
  { value: "2.4k+", label: "Creators active" },
  { value: "50k+", label: "Weekly ratings" },
  { value: "120+", label: "Crews competing" },
];

const storyBlocks = [
  {
    title: "Why we built Dreamledge",
    text: "Dreamledge Creators started with a simple idea: creators deserve a place where their work is seen, judged fairly, and used to help them grow. We were tired of posting into the void with no real feedback and no real connection.",
  },
  {
    title: "How it is different",
    text: "Dreamledge is more than a platform. It is a community where creators can meet, chat, follow each other, and build real relationships. With our judge-for-judge system, people actively support each other through honest ratings and feedback.",
  },
  {
    title: "Growth that leaves the app",
    text: "We designed Dreamledge to drive traffic directly to your social profiles so your momentum turns into real fans, real engagement, and real visibility across TikTok, Instagram, YouTube, and more.",
  },
  {
    title: "Compete as a creator and as a team",
    text: "Join a crew, enter weekly challenges, and rise through the ranks together. Whether your strength is humor, storytelling, or pure creativity, there is always a lane to stand out and win.",
  },
];

const values = [
  "Real feedback over empty views",
  "Community before vanity metrics",
  "Creator growth that compounds",
];

export function AboutPage() {
  return (
    <div className="min-h-screen app-backdrop page-grid text-white">
      <div className="public-page-topbar fixed inset-x-0 top-0 z-50">
        <div className="mx-auto flex h-[70px] w-full max-w-7xl items-center px-5 sm:px-6 lg:px-8">
          <div className="grid w-full grid-cols-[48px_1fr_auto] items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-[999px] border border-white/8 bg-white/[0.04]">
              <div className="flex h-7 w-7 items-center justify-center rounded-[999px] bg-[linear-gradient(180deg,rgba(255,91,91,0.92),rgba(255,45,61,0.92))] text-sm font-bold text-[#F5F5F7]">D</div>
            </div>
            <div className="min-w-0 text-center">
              <p className="truncate text-[10px] uppercase tracking-[0.34em] text-[#F5F5F7]/55">Dreamledge</p>
              <h1 className="truncate text-[1.05rem] font-semibold tracking-tight text-[#F5F5F7]">Creators</h1>
            </div>
            <Link to="/" className="public-page-back-btn justify-self-end rounded-[999px] border border-white/8 bg-[#F1F1F3] px-5 py-2.5 text-sm font-semibold transition hover:bg-[#e7e7ea]">Back</Link>
          </div>
        </div>
      </div>

      <main className="mx-auto w-full max-w-6xl px-5 pb-16 pt-24 sm:px-6 lg:px-8">
        <section className="bubble-card overflow-hidden rounded-[40px] border border-red-400/10 bg-[linear-gradient(180deg,rgba(20,20,26,0.96),rgba(10,10,14,0.98))] p-6 sm:p-8 lg:p-10">
          <div className="rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top_right,rgba(255,45,61,0.22),transparent_42%),linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))] p-6 sm:p-8">
            <p className="text-[11px] uppercase tracking-[0.3em] text-red-300/80">About Dreamledge Creators</p>
            <h2 className="mt-4 text-4xl font-semibold leading-tight text-white sm:text-5xl">Community, connection, and creators helping creators win.</h2>
            <p className="mt-5 max-w-3xl text-base leading-8 text-zinc-300 sm:text-lg">
              Dreamledge exists to make creator growth feel earned, visible, and collaborative. We combine community, feedback, and competition so every post can lead to momentum.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {highlights.map((item) => (
                <article key={item.label} className="rounded-[20px] border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-2xl font-semibold text-white">{item.value}</p>
                  <p className="mt-1 text-sm text-zinc-300">{item.label}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            {storyBlocks.map((block) => (
              <article key={block.title} className="rounded-[26px] border border-white/10 bg-white/[0.02] p-5 sm:p-6">
                <h3 className="text-xl font-semibold text-white">{block.title}</h3>
                <p className="mt-3 text-base leading-8 text-zinc-300">{block.text}</p>
              </article>
            ))}
          </div>

          <div className="mt-8 rounded-[26px] border border-red-400/20 bg-red-500/8 p-6 sm:p-7">
            <p className="text-[11px] uppercase tracking-[0.24em] text-red-300/80">What we stand for</p>
            <div className="mt-4 grid gap-2 text-zinc-100 sm:grid-cols-3 sm:gap-3">
              {values.map((value) => (
                <p key={value} className="rounded-[14px] border border-white/10 bg-black/20 px-3 py-2 text-sm leading-6">
                  {value}
                </p>
              ))}
            </div>
            <p className="mt-5 text-lg font-semibold text-white">This is your ledge. Step up.</p>
          </div>
        </section>
      </main>
    </div>
  );
}
