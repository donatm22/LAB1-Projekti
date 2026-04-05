import { useState } from "react";

const NAV_LINKS = ["Explore", "Events", "Create", "Help"];

export default function Home() {
  const [active, setActive] = useState("Explore");
  const [hoverBtn, setHoverBtn] = useState(false);

  return (
    <div
      className="min-h-screen w-full overflow-hidden relative flex flex-col"
      style={{
        background:
          "radial-gradient(ellipse at 70% 50%, rgba(180,40,0,0.55) 0%, rgba(100,10,80,0.45) 40%, rgba(10,5,20,1) 80%)",
        backgroundColor: "#0a0510",
        fontFamily: "'Segoe UI', sans-serif",
      }}
    >
      {/* Ambient blobs */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: "10%",
          left: "30%",
          width: 600,
          height: 400,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(160,20,120,0.18) 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />
      <div
        className="absolute pointer-events-none"
        style={{
          top: "20%",
          right: "5%",
          width: 380,
          height: 380,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(220,80,0,0.28) 0%, transparent 70%)",
          filter: "blur(50px)",
        }}
      />

      {/* NAVBAR */}
      <nav
        className="relative z-20 flex items-center justify-between px-10 py-5"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        {/* Logo */}
        <span
          className="text-3xl font-extrabold italic select-none"
          style={{
            background: "linear-gradient(90deg, #e040fb, #ff6d00)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            letterSpacing: "-1px",
          }}
        >
          Logo
        </span>

        {/* Nav links */}
        <ul className="flex gap-10 list-none m-0 p-0">
          {NAV_LINKS.map((link) => (
            <li key={link}>
              <button
                onClick={() => setActive(link)}
                className="relative text-white text-base font-medium bg-transparent border-0 cursor-pointer pb-1 transition-all"
                style={{ opacity: active === link ? 1 : 0.7 }}
              >
                {link}
                <span
                  className="absolute bottom-0 left-0 w-full"
                  style={{
                    height: 2,
                    borderRadius: 2,
                    background:
                      active === link
                        ? "linear-gradient(90deg,#e040fb,#ff6d00)"
                        : "transparent",
                    transition: "background 0.3s",
                  }}
                />
              </button>
            </li>
          ))}
        </ul>

        {/* Profile icon */}
        <div
          className="flex items-center justify-center rounded-full cursor-pointer"
          style={{
            width: 46,
            height: 46,
            border: "2.5px solid #ff6d00",
          }}
        >
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
            <circle cx="12" cy="8" r="4" fill="#ff6d00" />
            <path
              d="M4 20c0-4 3.6-7 8-7s8 3 8 7"
              stroke="#ff6d00"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </nav>

      {/* HERO */}
      <main className="relative z-10 flex flex-1 items-center justify-between px-16 py-12">
        {/* Left: Text + CTA */}
        <div className="flex flex-col gap-6" style={{ maxWidth: 560 }}>
          <h1
            className="m-0 leading-none select-none"
            style={{
              fontSize: "clamp(60px, 8vw, 110px)",
              fontWeight: 900,
              letterSpacing: "-2px",
              lineHeight: 1.0,
              fontFamily: "'Arial Black', 'Impact', sans-serif",
              textTransform: "uppercase",
            }}
          >
            <span style={{ color: "#ffffff" }}>FEEL THE</span>
            <br />
            <span
              style={{
                background: "linear-gradient(90deg, #ff6d00 0%, #e040fb 60%, #ff6d00 100%)",
                backgroundSize: "200% auto",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                fontStyle: "italic",
                animation: "shimmer 3s linear infinite",
              }}
            >
              ELECTRIC
            </span>
            <br />
            <span style={{ color: "#ffffff" }}>BEAT</span>
          </h1>

          {/* Join Now button */}
          <button
            onMouseEnter={() => setHoverBtn(true)}
            onMouseLeave={() => setHoverBtn(false)}
            className="mt-4 cursor-pointer border-0 text-white font-extrabold uppercase"
            style={{
              width: 280,
              height: 64,
              borderRadius: 999,
              background: hoverBtn
                ? "linear-gradient(90deg, #e040fb, #ff6d00)"
                : "linear-gradient(90deg, #ff6d00, #e040fb)",
              fontSize: 22,
              letterSpacing: 3,
              fontFamily: "'Arial Black', sans-serif",
              boxShadow: hoverBtn
                ? "0 0 40px rgba(224,64,251,0.6), 0 0 80px rgba(255,109,0,0.3)"
                : "0 0 24px rgba(255,109,0,0.4)",
              transition: "all 0.3s ease",
              transform: hoverBtn ? "scale(1.04)" : "scale(1)",
            }}
          >
            JOIN NOW
          </button>
        </div>

        {/* Right: Concert image */}
        <div className="relative flex-shrink-0" style={{ width: 380 }}>
          {/* Glow behind image */}
          <div
            className="absolute inset-0 rounded-2xl"
            style={{
              background: "rgba(220,80,0,0.25)",
              filter: "blur(30px)",
              transform: "scale(1.1)",
            }}
          />

          <img
            src="https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=700&q=80"
            alt="Concert crowd with stage lights"
            className="relative rounded-2xl w-full object-cover"
            style={{
              height: 420,
              boxShadow: "0 8px 60px rgba(0,0,0,0.7)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          />

          {/* Guest Service pill */}
          <div
            className="absolute flex items-center gap-2 cursor-pointer"
            style={{
              bottom: 24,
              right: -28,
              background: "linear-gradient(90deg, #e040fb, #ff6d00)",
              borderRadius: 999,
              padding: "10px 18px 10px 12px",
              boxShadow: "0 4px 20px rgba(224,64,251,0.5)",
            }}
          >
            <div
              className="flex items-center justify-center rounded-full bg-white"
              style={{ width: 28, height: 28 }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path
                  d="M7 1v12M1 7h12"
                  stroke="#e040fb"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <span
              className="text-white font-bold text-sm"
              style={{ letterSpacing: 0.5 }}
            >
              Guest Service
            </span>
          </div>
        </div>
      </main>

      {/* Shimmer keyframe */}
      <style>{`
        @keyframes shimmer {
          0% { background-position: 0% center; }
          100% { background-position: 200% center; }
        }
      `}</style>
    </div>
  );
}