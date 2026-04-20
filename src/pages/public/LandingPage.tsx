import { Link } from "react-router-dom";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { mockUsers } from "@/lib/constants/mockData";

const sosaNoir = mockUsers.find((user) => user.username === "sosanoir");

const features = [
  {
    title: "Trusted by creators",
    text: "Featuring creators like Sosa Noir, Way Off Script, and Audioswim.",
    icon: "⚔️",
    image: sosaNoir?.photoUrl ?? "/sosadata.jpg",
  },
  {
    title: "Judge & Get Judged",
    text: "Watch other creators, rate their content, and receive real feedback on yours. Every interaction builds your reputation and visibility.",
    icon: "📈",
    image: "https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=500&q=80",
  },
  {
    title: "Grow Together, Win Together",
    text: "Form a crew, compete in tournaments, and climb the ranks together. Win weekly challenges and build a name as a team.",
    icon: "💰",
    image: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=500&q=80",
  },
];

const categories = ["Funny", "Storytime", "Sports", "Commentary", "Education", "Motivation"];
const footerLinks = [
  { label: "About Us", href: "/about-us", external: false },
  { label: "How It Works", href: "/how-it-works", external: false },
  { label: "Contact", href: "/contact", external: false },
  { label: "FAQ", href: "/faq", external: false },
  { label: "Terms of Service", href: "/terms-of-service", external: false },
  { label: "Privacy Policy", href: "/privacy-policy", external: false },
];

function LandingRevealSection({ children, className = "" }: { children: ReactNode; className?: string }) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.3 },
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div ref={sectionRef} className={`landing-scroll-section ${isVisible ? "is-visible" : ""} ${className}`.trim()}>
      {children}
    </div>
  );
}

export function LandingPage() {
  return (
    <div className="relative -mt-[60px] min-h-screen overflow-hidden bg-black text-white">
      <div className="fixed inset-0 z-0">
        <video
          className="h-full w-full object-cover"
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
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

      <div className="relative z-10 min-h-screen w-full overflow-visible pb-10">
        <div className="landing-topbar fixed inset-x-0 top-0 z-50 w-full">
          <div className="mx-auto flex h-[70px] w-full max-w-7xl items-center px-5 sm:px-6 lg:px-8">
            <div className="relative mx-auto grid w-full max-w-sm grid-cols-[48px_1fr_auto] items-center gap-4 lg:max-w-none lg:grid-cols-[48px_1fr_auto]">
              <div className="flex h-11 w-11 items-center justify-center rounded-[999px] border border-white/8 bg-white/[0.04]">
                <div className="flex h-7 w-7 items-center justify-center rounded-[999px] bg-[linear-gradient(180deg,rgba(255,91,91,0.92),rgba(255,45,61,0.92))] text-sm font-bold text-[#F5F5F7]">D</div>
              </div>
              <div className="min-w-0 justify-self-center text-center">
                <p className="truncate text-[10px] uppercase tracking-[0.34em] text-[#F5F5F7]/55">Dreamledge</p>
                <h1 className="truncate text-[1.05rem] font-semibold tracking-tight text-[#F5F5F7]">Creators</h1>
              </div>
              <div className="justify-self-end">
                <Link to="/login" className="dreamledge-nav-signin-wrapper" aria-label="Sign In">
                  <span className="dreamledge-nav-signin-btn">
                    <span className="dreamledge-nav-signin-letter">S</span>
                    <span className="dreamledge-nav-signin-letter">I</span>
                    <span className="dreamledge-nav-signin-letter">G</span>
                    <span className="dreamledge-nav-signin-letter">N</span>
                    <span className="dreamledge-nav-signin-letter">-</span>
                    <span className="dreamledge-nav-signin-letter">I</span>
                    <span className="dreamledge-nav-signin-letter">N</span>
                    <span className="dreamledge-nav-signin-shutter-wrapper">
                      <span className="dreamledge-nav-signin-shutter s-1" />
                      <span className="dreamledge-nav-signin-shutter s-2" />
                      <span className="dreamledge-nav-signin-shutter s-3" />
                      <span className="dreamledge-nav-signin-shutter s-4" />
                      <span className="dreamledge-nav-signin-shutter s-5" />
                      <span className="dreamledge-nav-signin-shutter s-6" />
                    </span>
                  </span>
                  <span className="dreamledge-nav-signin-flash" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto w-full max-w-7xl px-4 pt-28 sm:px-6 sm:pt-30 lg:px-8">
          <div className="mx-auto w-full max-w-sm lg:max-w-none">

          <LandingRevealSection className="landing-hero-reveal mt-10">
            <div className="text-center lg:text-left">
              <h2 className="landing-reveal-item text-[2rem] font-bold leading-[0.96] tracking-tight text-white sm:text-5xl lg:max-w-[13ch] lg:text-6xl lg:text-left">
                <span className="block text-white/88">The Platform for</span>
                <span className="block text-white">Creators to</span>
                <span className="block text-red-400">Compete, Connect, and Grow.</span>
              </h2>
              <div className="landing-reveal-item mt-4 max-w-[32rem] space-y-2 text-sm leading-6 text-zinc-300 sm:mx-auto sm:text-base lg:mx-0">
                <p>Post your content and get real feedback.</p>
                <p>Join a crew and compete in tournaments.</p>
                <p>Win weekly challenges and grow faster.</p>
              </div>

              <div className="landing-reveal-item mt-6 flex gap-3 sm:justify-center lg:justify-start">
                <Link
                  to="/signup"
                  className="landing-cta-button landing-cta-primary w-full"
                >
                  <span className="landing-cta-text">Sign up</span>
                  <span className="landing-cta-svg" aria-hidden="true">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 38 15" fill="none">
                      <path
                        fill="white"
                        d="M10 7.519l-.939-.344h0l.939.344zm14.386-1.205l-.981-.192.981.192zm1.276 5.509l.537.843.148-.094.107-.139-.792-.611zm4.819-4.304l-.385-.923h0l.385.923zm7.227.707a1 1 0 0 0 0-1.414L31.343.448a1 1 0 0 0-1.414 0 1 1 0 0 0 0 1.414l5.657 5.657-5.657 5.657a1 1 0 0 0 1.414 1.414l6.364-6.364zM1 7.519l.554.833.029-.019.094-.061.361-.23 1.277-.77c1.054-.609 2.397-1.32 3.629-1.787.617-.234 1.17-.392 1.623-.455.477-.066.707-.008.788.034.025.013.031.021.039.034a.56.56 0 0 1 .058.235c.029.327-.047.906-.39 1.842l1.878.689c.383-1.044.571-1.949.505-2.705-.072-.815-.45-1.493-1.16-1.865-.627-.329-1.358-.332-1.993-.244-.659.092-1.367.305-2.056.566-1.381.523-2.833 1.297-3.921 1.925l-1.341.808-.385.245-.104.068-.028.018c-.011.007-.011.007.543.84zm8.061-.344c-.198.54-.328 1.038-.36 1.484-.032.441.024.94.325 1.364.319.45.786.64 1.21.697.403.054.824-.001 1.21-.09.775-.179 1.694-.566 2.633-1.014l3.023-1.554c2.115-1.122 4.107-2.168 5.476-2.524.329-.086.573-.117.742-.115s.195.038.161.014c-.15-.105.085-.139-.076.685l1.963.384c.192-.98.152-2.083-.74-2.707-.405-.283-.868-.37-1.28-.376s-.849.069-1.274.179c-1.65.43-3.888 1.621-5.909 2.693l-2.948 1.517c-.92.439-1.673.743-2.221.87-.276.064-.429.065-.492.057-.043-.006.066.003.155.127.07.099.024.131.038-.063.014-.187.078-.49.243-.94l-1.878-.689zm14.343-1.053c-.361 1.844-.474 3.185-.413 4.161.059.95.294 1.72.811 2.215.567.544 1.242.546 1.664.459a2.34 2.34 0 0 0 .502-.167l.15-.076.049-.028.018-.011c.013-.008.013-.008-.524-.852l-.536-.844.019-.012c-.038.018-.064.027-.084.032-.037.008.053-.013.125.056.021.02-.151-.135-.198-.895-.046-.734.034-1.887.38-3.652l-1.963-.384zm2.257 5.701l.791.611.024-.031.08-.101.311-.377 1.093-1.213c.922-.954 2.005-1.894 2.904-2.27l-.771-1.846c-1.31.547-2.637 1.758-3.572 2.725l-1.184 1.314-.341.414-.093.117-.025.032c-.01.013-.01.013.781.624zm5.204-3.381c.989-.413 1.791-.42 2.697-.307.871.108 2.083.385 3.437.385v-2c-1.197 0-2.041-.226-3.19-.369-1.114-.139-2.297-.146-3.715.447l.771 1.846z"
                      />
                    </svg>
                  </span>
                </Link>
              </div>
            </div>
          </LandingRevealSection>

          <LandingRevealSection className="landing-features-reveal mt-8">
            <div className="grid gap-3 lg:hidden">
              {features.map((feature, index) => (
                <div
                  key={feature.title}
                  className="landing-feature-card landing-reveal-item"
                  style={{ transitionDelay: `${index * 120}ms` }}
                >
                  <div className="landing-feature-card__body">
                    <div data-position="top" className="landing-feature-card__carousel">
                      <span className="landing-feature-card__carousel-text">
                        dreamledge creators • dreamledge creators • dreamledge creators • dreamledge creators •
                      </span>
                    </div>
                    <div className="landing-feature-card__content">
                      <div className="landing-feature-card__icon">{feature.icon}</div>
                      <div className="landing-feature-card__copy">
                        <h3 className="landing-feature-card__title">{feature.title}</h3>
                        <p className="landing-feature-card__text">{feature.text}</p>
                      </div>
                    </div>
                    <img src={feature.image} alt={feature.title} className="landing-feature-card__image" />
                    <div data-position="bottom" data-direction="right" className="landing-feature-card__carousel">
                      <span className="landing-feature-card__carousel-text">
                        dreamledge creators • dreamledge creators • dreamledge creators • dreamledge creators •
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="hidden gap-3 lg:grid lg:grid-cols-3">
              {features.map((feature, index) => (
                <div
                  key={feature.title}
                  className="landing-feature-card landing-reveal-item"
                  style={{ transitionDelay: `${index * 120}ms` }}
                >
                  <div className="landing-feature-card__body">
                    <div data-position="top" className="landing-feature-card__carousel">
                      <span className="landing-feature-card__carousel-text">
                        dreamledge creators • dreamledge creators • dreamledge creators • dreamledge creators •
                      </span>
                    </div>
                    <div className="landing-feature-card__content">
                      <div className="landing-feature-card__icon">{feature.icon}</div>
                      <div className="landing-feature-card__copy">
                        <h3 className="landing-feature-card__title">{feature.title}</h3>
                        <p className="landing-feature-card__text">{feature.text}</p>
                      </div>
                    </div>
                    <img src={feature.image} alt={feature.title} className="landing-feature-card__image" />
                    <div data-position="bottom" data-direction="right" className="landing-feature-card__carousel">
                      <span className="landing-feature-card__carousel-text">
                        dreamledge creators • dreamledge creators • dreamledge creators • dreamledge creators •
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </LandingRevealSection>

          <LandingRevealSection className="landing-lower-reveal mt-8">
            <div className="landing-reveal-item lg:grid lg:grid-cols-[1.05fr_0.95fr] lg:gap-8">
              <div>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-white">Categories</p>
                  <button className="text-xs font-medium text-red-300">View all</button>
                </div>
                <div className="mt-3 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:flex-wrap lg:overflow-visible">
                  {categories.map((category, index) => (
                    <span
                      key={category}
                      className="landing-category-chip landing-reveal-item whitespace-nowrap rounded-[999px] border border-white/8 bg-zinc-900/80 px-3.5 py-2 text-xs text-zinc-300 backdrop-blur-sm"
                      style={{ transitionDelay: `${index * 70}ms` }}
                    >
                      {category}
                    </span>
                  ))}
                </div>
              </div>

              <div className="landing-reveal-item mt-8 lg:mt-0">
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

            <footer className="landing-reveal-item mt-14 pt-8">
              <div>
                <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:flex-wrap sm:justify-center sm:gap-x-8 sm:gap-y-4">
                  {footerLinks.map((link) =>
                    link.external ? (
                      <a key={link.label} href={link.href} className="footer-link text-sm text-white/58 transition duration-300 hover:text-white">
                        {link.label}
                      </a>
                    ) : (
                      <Link key={link.label} to={link.href} className="footer-link text-sm text-white/58 transition duration-300 hover:text-white">
                        {link.label}
                      </Link>
                    ),
                  )}
                </div>
                <p className="mt-8 pb-2 text-center text-xs tracking-[0.18em] text-white/38">
                  © 2026 Dreamledge. All rights reserved.
                </p>
              </div>
            </footer>
          </LandingRevealSection>

        </div>
        </div>
      </div>
    </div>
  );
}
