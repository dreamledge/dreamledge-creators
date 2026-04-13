import { Link } from "react-router-dom";

const steps = [
  {
    title: "1. Create Your Profile",
    text: "Set up your creator profile and link your social media. This is your home base where people can find you, follow you, and check out your content.",
  },
  {
    title: "2. Discover & Connect",
    text: "Browse creators, join chats, follow people, and start building your network. Dreamledge is built for real interaction-meet creators, support each other, and build your community.",
  },
  {
    title: "3. Watch & Judge Content",
    text: "Creators are matched through our judge-for-judge system. You watch each other's content and give honest feedback based on creativity, impact, and quality. No more guessing-real creators, real opinions.",
  },
  {
    title: "4. Compete & Get Ranked",
    text: "Enter weekly challenges and competitions like Funniest Creator, Best Storytelling, and Most Creative. Earn votes, climb the leaderboard, and build your reputation.",
  },
  {
    title: "5. Join a Crew",
    text: "Team up with other creators and form a crew. Compete in crew tournaments, grow together, and rise through the ranks as a unit.",
  },
  {
    title: "6. Drive Traffic & Grow",
    text: "Every connection you make can turn into real support. Creators can visit your social profiles, engage with your content, and help you grow your audience across platforms.",
  },
];

export function HowItWorksPage() {
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
          <p className="text-[11px] uppercase tracking-[0.3em] text-red-300/80">How It Works</p>
          <h2 className="mt-4 text-4xl font-semibold leading-tight text-white sm:text-5xl">Getting started on Dreamledge is simple.</h2>
          <p className="mt-4 text-base leading-8 text-zinc-300 sm:text-lg">Jump in, connect, and start growing right away.</p>

          <div className="mt-10 space-y-6">
            {steps.map((step) => (
              <div key={step.title} className="rounded-[32px] border border-white/8 bg-white/[0.03] p-5 sm:p-6">
                <h3 className="text-2xl font-semibold text-white">{step.title}</h3>
                <p className="mt-3 text-base leading-8 text-zinc-300">{step.text}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 rounded-[34px] border border-red-400/12 bg-red-500/8 p-6">
            <p className="text-sm uppercase tracking-[0.24em] text-red-300/80">The Result?</p>
            <p className="mt-4 text-2xl font-semibold text-white">You don't just post and hope.</p>
            <p className="mt-3 text-lg leading-8 text-zinc-200">You connect, compete, and grow with purpose.</p>
          </div>
        </section>
      </main>
    </div>
  );
}
