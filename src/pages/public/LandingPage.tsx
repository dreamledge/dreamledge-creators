import { Link } from "react-router-dom";
import { mockUsers } from "@/lib/constants/mockData";

const features = [
  {
    title: "Creator Battles",
    text: "Go head-to-head and win through direct creator judging after the required watch time is met.",
    icon: "⚔️",
  },
  {
    title: "Viral Challenges",
    text: "Enter premium contests and themed matchups built to push your content into discovery mode.",
    icon: "📈",
  },
  {
    title: "Monetize & Grow",
    text: "Build your brand, gain followers, and turn attention into real creator momentum.",
    icon: "💰",
  },
];

const categories = ["Funny", "Storytime", "Sports", "Commentary", "Education", "Motivation"];

export function LandingPage() {
  const creatorOne = mockUsers[0];
  const creatorTwo = mockUsers[1];

  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white">
      <div className="fixed inset-0">
        <video
          className="h-full w-full object-cover"
          autoPlay
          loop
          muted
          playsInline
        >
          <source src="/landingpagebackround.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/72" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/10 to-black/85" />
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-0 top-0 h-56 w-full bg-gradient-to-b from-red-500/20 to-transparent" />
          <div className="absolute -right-10 top-28 h-40 w-40 rounded-[999px] bg-red-500/10 blur-3xl" />
          <div className="absolute -left-10 bottom-28 h-40 w-40 rounded-[999px] bg-white/5 blur-3xl" />
        </div>
      </div>

      <div className="relative z-10 min-h-screen w-full pb-10">
        <div className="fixed inset-x-0 top-0 z-40 w-full bg-black/78 shadow-[0_10px_40px_rgba(0,0,0,0.35)] backdrop-blur-xl">
          <div className="mx-auto w-full max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
            <div className="relative mx-auto grid w-full max-w-sm grid-cols-[48px_1fr_auto] items-center gap-3 lg:max-w-none lg:grid-cols-[64px_1fr_140px]">
              <div className="flex h-12 w-12 items-center justify-center rounded-[999px] border border-white/10 bg-white/5 shadow-lg shadow-black/20">
                <div className="flex h-8 w-8 items-center justify-center rounded-[999px] bg-[linear-gradient(180deg,#ff5b5b,#ff2d3d)] text-sm font-bold text-white">D</div>
              </div>
              <div className="min-w-0 justify-self-center text-center">
                <p className="truncate text-[10px] uppercase tracking-[0.32em] text-zinc-500">Dreamledge</p>
                <h1 className="truncate text-xl font-semibold tracking-tight text-white">Creators</h1>
              </div>
              <div className="justify-self-end">
                <Link
                  to="/login"
                  className="shrink-0 rounded-[999px] border border-white/10 bg-white px-5 py-2.5 text-sm font-semibold !text-black shadow-lg shadow-white/10 transition hover:scale-[1.01] hover:bg-zinc-100 hover:!text-black"
                >
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto w-full max-w-7xl px-4 pt-28 sm:px-6 sm:pt-30 lg:px-8">
          <div className="mx-auto w-full max-w-sm lg:max-w-none">

          <div className="mt-10 grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-start lg:gap-8">
            <div className="text-center lg:text-left">
              <h2 className="text-[2rem] font-bold leading-[1.02] tracking-tight text-white sm:text-5xl lg:max-w-[12ch] lg:text-6xl lg:text-left">
                Where creators compete
                <br />
                and culture decides.
              </h2>
              <p className="mt-4 max-w-[32rem] text-sm leading-6 text-zinc-300 sm:mx-auto sm:text-base lg:mx-0">
                Post your content, enter live battles, and grow your audience through real engagement, sharp profile presence, and creator-to-creator judging.
              </p>

              <div className="mt-6 flex gap-3 sm:justify-center lg:justify-start">
                <Link
                  to="/signup"
                  className="flex-1 rounded-[28px] bg-red-500 py-3.5 text-center text-sm font-semibold text-white shadow-lg shadow-red-500/20 transition hover:translate-y-[-1px]"
                >
                  Start Creating
                </Link>
                <Link
                  to="/app/explore"
                  className="flex-1 rounded-[28px] border border-white/15 bg-white/5 py-3.5 text-center text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/10"
                >
                  Explore
                </Link>
              </div>

              <div className="mt-8 lg:hidden">
                <div className="rounded-[32px] border border-white/8 bg-zinc-900/80 p-4 shadow-2xl shadow-black/30 backdrop-blur-md">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-white">Live Battle</p>
                      <p className="mt-1 text-xs text-zinc-500">Best Creator of the Week • Direct Judging</p>
                    </div>
                    <span className="rounded-[999px] border border-red-400/20 bg-red-500/10 px-2.5 py-1 text-[11px] font-semibold text-red-300">
                      LIVE
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="rounded-[28px] border border-white/6 bg-zinc-800/90 p-3">
                      <img src={creatorOne.photoUrl} alt={creatorOne.displayName} className="h-24 w-full rounded-[28px] object-cover" />
                      <p className="mt-3 text-sm font-medium text-white">@{creatorOne.username}</p>
                      <p className="mt-1 text-xs text-zinc-500">{creatorOne.followerCount / 1000}K followers</p>
                    </div>
                    <div className="rounded-[28px] border border-white/6 bg-zinc-800/90 p-3">
                      <img src={creatorTwo.photoUrl} alt={creatorTwo.displayName} className="h-24 w-full rounded-[28px] object-cover" />
                      <p className="mt-3 text-sm font-medium text-white">@{creatorTwo.username}</p>
                      <p className="mt-1 text-xs text-zinc-500">{creatorTwo.followerCount / 1000}K followers</p>
                    </div>
                  </div>

                  <div className="mt-4 rounded-[28px] bg-black/20 p-3">
                    <div className="flex items-center justify-between text-xs text-zinc-500">
                      <span>Judge unlock progress</span>
                      <span>10s required</span>
                    </div>
                    <div className="mt-2 h-2 overflow-hidden rounded-[999px] bg-zinc-800">
                      <div className="h-full w-[60%] rounded-[999px] bg-gradient-to-r from-red-500 to-red-400" />
                    </div>
                    <div className="mt-3 grid grid-cols-3 gap-2 text-[11px] text-zinc-400">
                      <div className="rounded-[28px] border border-white/6 bg-zinc-900/70 px-2 py-2 text-center">Originality</div>
                      <div className="rounded-[28px] border border-white/6 bg-zinc-900/70 px-2 py-2 text-center">Quality</div>
                      <div className="rounded-[28px] border border-white/6 bg-zinc-900/70 px-2 py-2 text-center">Creativity</div>
                    </div>
                  </div>
                </div>

                <div className="mt-3 grid gap-3">
                {features.map((feature) => (
                  <div
                    key={feature.title}
                    className="flex gap-3 rounded-[30px] border border-white/8 bg-zinc-900/75 p-4 shadow-lg shadow-black/20 backdrop-blur-md"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[28px] bg-white/5 text-xl ring-1 ring-white/8">
                      {feature.icon}
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-white">{feature.title}</h3>
                      <p className="mt-1 text-xs leading-5 text-zinc-400">{feature.text}</p>
                    </div>
                  </div>
                ))}
                </div>
              </div>
            </div>

            <div className="hidden rounded-[32px] border border-white/8 bg-zinc-900/80 p-4 shadow-2xl shadow-black/30 backdrop-blur-md lg:block">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-white">Live Battle</p>
                  <p className="mt-1 text-xs text-zinc-500">Best Creator of the Week • Direct Judging</p>
                </div>
                <span className="rounded-[999px] border border-red-400/20 bg-red-500/10 px-2.5 py-1 text-[11px] font-semibold text-red-300">
                  LIVE
                </span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-[28px] border border-white/6 bg-zinc-800/90 p-3">
                  <img src={creatorOne.photoUrl} alt={creatorOne.displayName} className="h-24 w-full rounded-xl object-cover" />
                  <p className="mt-3 text-sm font-medium text-white">@{creatorOne.username}</p>
                  <p className="mt-1 text-xs text-zinc-500">{creatorOne.followerCount / 1000}K followers</p>
                </div>
                <div className="rounded-[28px] border border-white/6 bg-zinc-800/90 p-3">
                  <img src={creatorTwo.photoUrl} alt={creatorTwo.displayName} className="h-24 w-full rounded-xl object-cover" />
                  <p className="mt-3 text-sm font-medium text-white">@{creatorTwo.username}</p>
                  <p className="mt-1 text-xs text-zinc-500">{creatorTwo.followerCount / 1000}K followers</p>
                </div>
              </div>

              <div className="mt-4 rounded-[28px] bg-black/20 p-3">
                <div className="flex items-center justify-between text-xs text-zinc-500">
                  <span>Judge unlock progress</span>
                  <span>10s required</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-[999px] bg-zinc-800">
                  <div className="h-full w-[60%] rounded-[999px] bg-gradient-to-r from-red-500 to-red-400" />
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2 text-[11px] text-zinc-400">
                  <div className="rounded-xl border border-white/6 bg-zinc-900/70 px-2 py-2 text-center">Originality</div>
                  <div className="rounded-xl border border-white/6 bg-zinc-900/70 px-2 py-2 text-center">Quality</div>
                  <div className="rounded-xl border border-white/6 bg-zinc-900/70 px-2 py-2 text-center">Creativity</div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 hidden gap-3 lg:grid lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="flex gap-3 rounded-[30px] border border-white/8 bg-zinc-900/75 p-4 shadow-lg shadow-black/20 backdrop-blur-md"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[28px] bg-white/5 text-xl ring-1 ring-white/8">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">{feature.title}</h3>
                  <p className="mt-1 text-xs leading-5 text-zinc-400">{feature.text}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 lg:grid lg:grid-cols-[1.05fr_0.95fr] lg:gap-8">
            <div>
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-white">Categories</p>
                <button className="text-xs font-medium text-red-300">View all</button>
              </div>
              <div className="mt-3 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:flex-wrap lg:overflow-visible">
                {categories.map((category) => (
                  <span
                    key={category}
                    className="whitespace-nowrap rounded-[999px] border border-white/8 bg-zinc-900/80 px-3.5 py-2 text-xs text-zinc-300 backdrop-blur-sm"
                  >
                    {category}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-8 lg:mt-0">
              <div className="rounded-[34px] bg-white p-5 text-black shadow-2xl shadow-black/30">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-500">Join Dreamledge</p>
                <h3 className="mt-2 text-2xl font-bold tracking-tight">Build your audience and compete for attention.</h3>
                <p className="mt-2 text-sm leading-6 text-zinc-600">
                  Start creating, enter battles, and turn your content into momentum with a platform built around rank, discovery, and creator presence.
                </p>
                <Link
                  to="/signup"
                  className="mt-5 flex w-full items-center justify-center rounded-[28px] bg-black px-4 py-3.5 text-center text-sm font-semibold !text-white shadow-lg transition hover:opacity-95"
                >
                  Create account
                </Link>
              </div>
            </div>
          </div>

        </div>
        </div>
      </div>
    </div>
  );
}
