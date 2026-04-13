import { Link } from "react-router-dom";

const sections = [
  {
    title: "Using Dreamledge",
    body:
      "By using Dreamledge Creators, you agree to use the platform respectfully, honestly, and in a way that supports creators and community safety.",
  },
  {
    title: "Creator Content",
    body:
      "You are responsible for the content and links you submit. Make sure you have the right to share what you post and that your submissions do not violate laws or platform rules.",
  },
  {
    title: "Community Standards",
    body:
      "Harassment, abuse, spam, impersonation, and malicious behavior are not allowed. Dreamledge may remove content or accounts that harm the experience for others.",
  },
  {
    title: "Platform Features",
    body:
      "Features such as review sessions, crews, chats, and weekly challenges may evolve over time. We may update, remove, or improve features to keep the experience strong.",
  },
  {
    title: "Fair Use",
    body:
      "Do not attempt to exploit feedback systems, bypass watch requirements, or manipulate rankings. Dreamledge is built around fairness and real participation.",
  },
  {
    title: "Questions",
    body:
      "If you have questions about these terms, contact us at dreamledge@gmail.com.",
  },
];

export function TermsPage() {
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
          <p className="text-[11px] uppercase tracking-[0.3em] text-red-300/80">Terms of Service</p>
          <h2 className="mt-4 text-4xl font-semibold leading-tight text-white sm:text-5xl">Simple terms for a creator-first platform.</h2>
          <div className="mt-10 space-y-5">
            {sections.map((section) => (
              <div key={section.title} className="rounded-[32px] border border-white/8 bg-white/[0.03] p-5 sm:p-6">
                <h3 className="text-2xl font-semibold text-white">{section.title}</h3>
                <p className="mt-3 text-base leading-8 text-zinc-300">{section.body}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
