import { Link } from "react-router-dom";

const socialLinks = [
  { label: "Instagram", href: "https://www.instagram.com/dreamledge" },
  { label: "X (Twitter)", href: "https://x.com/dreamledge" },
  { label: "TikTok", href: "https://www.tiktok.com/@dream_ledge" },
];

export function ContactPage() {
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
            <p className="text-[11px] uppercase tracking-[0.3em] text-red-300/80">Contact Us</p>
            <h2 className="mt-4 text-4xl font-semibold leading-tight text-white sm:text-5xl">We are here to help creators move faster.</h2>
            <p className="mt-4 max-w-3xl text-base leading-8 text-zinc-300 sm:text-lg">
              Whether you need support, want to share feedback, or are interested in partnerships, the Dreamledge team is ready to connect.
            </p>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            <article className="rounded-[26px] border border-white/10 bg-white/[0.03] p-6">
              <p className="text-sm uppercase tracking-[0.24em] text-red-300/80">Primary Contact</p>
              <p className="mt-3 text-xl font-semibold text-white">Email Support</p>
              <a href="mailto:dreamledge@gmail.com" className="mt-2 inline-block text-lg font-medium text-zinc-100 transition hover:text-white hover:underline">
                dreamledge@gmail.com
              </a>
              <p className="mt-3 text-sm leading-7 text-zinc-300">Best for account support, creator questions, feedback, and technical issues.</p>
            </article>

            <article className="rounded-[26px] border border-white/10 bg-white/[0.03] p-6">
              <p className="text-sm uppercase tracking-[0.24em] text-red-300/80">Social Channels</p>
              <p className="mt-3 text-xl font-semibold text-white">Stay Connected</p>
              <div className="mt-3 space-y-2">
                {socialLinks.map((item) => (
                  <a key={item.label} href={item.href} target="_blank" rel="noreferrer" className="block text-base text-zinc-100 transition hover:text-white hover:underline">
                    {item.label}
                  </a>
                ))}
              </div>
              <p className="mt-3 text-sm leading-7 text-zinc-300">Follow Dreamledge for updates, creator spotlights, and product announcements.</p>
            </article>
          </div>

          <div className="mt-8 rounded-[26px] border border-red-400/20 bg-red-500/8 p-6 sm:p-7">
            <p className="text-sm uppercase tracking-[0.24em] text-red-300/80">Need Help Fast?</p>
            <p className="mt-4 text-lg leading-8 text-zinc-200">
              If you're experiencing an issue inside the app, head to the Help/Support section in your profile for quick assistance.
            </p>
            <p className="mt-5 text-base font-medium text-white">Dreamledge Creators - built for creators, powered by community.</p>
          </div>
        </section>
      </main>
    </div>
  );
}
