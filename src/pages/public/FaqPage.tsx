import { Link } from "react-router-dom";

const faqs = [
  {
    question: "What is Dreamledge Creators?",
    answer:
      "Dreamledge Creators is a community-first platform where creators can connect, review each other's content, join crews, enter weekly challenges, and build real visibility.",
  },
  {
    question: "How does the judge-for-judge system work?",
    answer:
      "Two creators are matched together, each submits one video, both must watch at least 15 real seconds, and then both leave feedback using the same scoring categories.",
  },
  {
    question: "Can people visit my social media from Dreamledge?",
    answer:
      "Yes. Your profile and creator session screens can surface your social links so other creators can discover your work beyond the app.",
  },
  {
    question: "Do I need to upload videos directly?",
    answer:
      "No. Dreamledge supports imported content and clip URLs, including social links from platforms like TikTok, YouTube, Instagram, and Facebook.",
  },
  {
    question: "What are crews?",
    answer:
      "Crews are creator teams. You can join forces with other creators, support each other, compete in group challenges, and grow together.",
  },
  {
    question: "Is Dreamledge only about competition?",
    answer:
      "No. Competition is part of the experience, but the bigger focus is connection, feedback, and helping creators grow with purpose.",
  },
];

export function FaqPage() {
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
          <div className="rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top_right,rgba(255,45,61,0.2),transparent_42%),linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))] p-6 sm:p-8">
            <p className="text-[11px] uppercase tracking-[0.3em] text-red-300/80">FAQ</p>
            <h2 className="mt-4 text-4xl font-semibold leading-tight text-white sm:text-5xl">Answers for creators getting started.</h2>
            <p className="mt-4 max-w-3xl text-base leading-8 text-zinc-300 sm:text-lg">Everything you need to understand how Dreamledge works, how creators connect, and how growth happens on the platform.</p>
          </div>

          <div className="mt-8 grid gap-4">
            {faqs.map((item, index) => (
              <article key={item.question} className="rounded-[26px] border border-white/10 bg-white/[0.03] p-5 sm:p-6">
                <p className="text-xs uppercase tracking-[0.22em] text-red-300/80">Question {index + 1}</p>
                <h3 className="mt-2 text-xl font-semibold text-white sm:text-2xl">{item.question}</h3>
                <p className="mt-3 text-base leading-8 text-zinc-300">{item.answer}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
