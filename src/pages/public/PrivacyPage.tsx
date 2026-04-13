import { Link } from "react-router-dom";

const sections = [
  {
    title: "What we collect",
    body:
      "Dreamledge may collect account details, profile information, social links, and platform activity needed to provide creator features like profiles, sessions, chats, and challenges.",
  },
  {
    title: "How we use it",
    body:
      "We use your information to run the platform, help creators connect, improve the experience, and support features like discovery, reviews, and communication.",
  },
  {
    title: "Your content and links",
    body:
      "If you submit content links or social handles, they may be shown to other creators so they can view your work and connect with you across platforms.",
  },
  {
    title: "Community safety",
    body:
      "We may review reports, moderation issues, and harmful activity to help keep Dreamledge safe and fair for creators.",
  },
  {
    title: "Your control",
    body:
      "You can update your profile information and social links as the platform evolves. If you have privacy concerns, contact us directly.",
  },
  {
    title: "Contact",
    body:
      "For privacy questions, reach us at dreamledge@gmail.com.",
  },
];

export function PrivacyPage() {
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
          <p className="text-[11px] uppercase tracking-[0.3em] text-red-300/80">Privacy Policy</p>
          <h2 className="mt-4 text-4xl font-semibold leading-tight text-white sm:text-5xl">Your creator identity deserves clarity and respect.</h2>
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
