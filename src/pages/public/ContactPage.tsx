import { Link } from "react-router-dom";

const socialLinks = [
  { label: "Instagram", href: "https://www.instagram.com/dreamledge" },
  { label: "X (Twitter)", href: "https://x.com/dreamledge" },
  { label: "TikTok", href: "https://www.tiktok.com/@dream_ledge" },
];

export function ContactPage() {
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
          <p className="text-[11px] uppercase tracking-[0.3em] text-red-300/80">Contact Us</p>
          <h2 className="mt-4 text-4xl font-semibold leading-tight text-white sm:text-5xl">We're here for you.</h2>
          <div className="mt-8 space-y-6 text-base leading-8 text-zinc-300 sm:text-lg">
            <p>
              Whether you have a question, need support, want to give feedback, or just want to connect-reach out anytime. Dreamledge is built for creators, and your voice helps us make it better every day.
            </p>
          </div>

          <div className="mt-10 grid gap-5 lg:grid-cols-2">
            <div className="rounded-[32px] border border-white/8 bg-white/[0.03] p-6">
              <p className="text-sm uppercase tracking-[0.24em] text-red-300/80">Get in Touch</p>
              <p className="mt-4 text-xl font-semibold text-white">Email</p>
              <a href="mailto:dreamledge@gmail.com" className="mt-2 inline-block text-lg text-zinc-200 transition hover:text-white hover:underline">
                dreamledge@gmail.com
              </a>
            </div>

            <div className="rounded-[32px] border border-white/8 bg-white/[0.03] p-6">
              <p className="text-sm uppercase tracking-[0.24em] text-red-300/80">Stay Connected</p>
              <div className="mt-4 space-y-3">
                {socialLinks.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    target="_blank"
                    rel="noreferrer"
                    className="block text-lg text-zinc-200 transition hover:text-white hover:underline"
                  >
                    {item.label}
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-10 rounded-[34px] border border-red-400/12 bg-red-500/8 p-6">
            <p className="text-sm uppercase tracking-[0.24em] text-red-300/80">Need Help Fast?</p>
            <p className="mt-4 text-lg leading-8 text-zinc-200">
              If you're experiencing an issue inside the app, head to the Help/Support section in your profile for quick assistance.
            </p>
            <p className="mt-5 text-base font-medium text-white">
              Dreamledge Creators - built for creators, powered by community. Fire.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
