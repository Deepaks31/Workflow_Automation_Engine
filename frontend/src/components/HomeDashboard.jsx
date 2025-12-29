import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

export default function HomeDashboard() {
  const navigate = useNavigate();
  const cardsRef = useRef([]);
  const bgRef = useRef(null);

  /* ================= EFFECTS ================= */
  useEffect(() => {
    /* Reveal cards */
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) entry.target.classList.add("animate");
        });
      },
      { threshold: 0.15 }
    );
    cardsRef.current.forEach(card => observer.observe(card));

    /* Interactive background */
    const handleMouseMove = e => {
      const x = (e.clientX / window.innerWidth) * 100;
      const y = (e.clientY / window.innerHeight) * 100;
      if (bgRef.current) {
        bgRef.current.style.background = `
          radial-gradient(circle at ${x}% ${y}%,
          rgba(99,102,241,0.18),
          rgba(238,242,255,0.9) 55%)
        `;
      }
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const scrollToFeatures = () => {
    document.querySelector(".features").scrollIntoView({ behavior: "smooth" });
  };

  const title = "Enterprise Workflow Automation";

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin:0; padding:0;  transition-timing-function: ease-out;}
        body {
          font-family: 'Inter', sans-serif;
          background: #eef2ff;
        }

        /* BACKGROUND LAYER */
        .bg {
          position: fixed;
          inset: 0;
          z-index: -1;
          transition: background 0.25s ease;
        }

        /* NAVBAR */
        .navbar {
          position: sticky;
          top: 0;
          z-index: 50;
          padding: 18px 50px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: rgba(255,255,255,0.85);
          backdrop-filter: blur(14px);
          box-shadow: 0 8px 30px rgba(0,0,0,0.08);
        }

        .brand {
          font-size: 28px;
          font-weight: 900;
          background: linear-gradient(90deg,#4f46e5,#6366f1,#4f46e5);
          background-size: 200%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          cursor: pointer;
          animation: 
            brandWave 4s linear infinite,
            brandPulse 2.8s ease-in-out infinite;
        }

        /* Existing gradient wave */
        @keyframes brandWave {
          0% { background-position: 0%; }
          100% { background-position: 200%; }
        }

        /* ✨ New subtle pulse animation */
        @keyframes brandPulse {
          0% {
            text-shadow: 0 0 0 rgba(79,70,229,0);
            transform: scale(1);
          }
          50% {
            text-shadow: 0 0 18px rgba(79,70,229,0.6);
            transform: scale(1.03);
          }
          100% {
            text-shadow: 0 0 0 rgba(79,70,229,0);
            transform: scale(1);
          }
        }


        /* BUTTONS – MAGNETIC + SHINE */
        button {
          position: relative;
          overflow: hidden;
          cursor: pointer;
          font-weight: 600;
        }

        button::before {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(
            120deg,
            transparent,
            rgba(255,255,255,0.5),
            transparent
          );
          transform: translateX(-100%);
          transition: transform 0.6s;
        }

        button:hover::before {
          transform: translateX(100%);
        }

        button:active {
          transform: scale(0.96);
        }

        .login-btn {
          padding: 10px 24px;
          border-radius: 999px;
          background: linear-gradient(135deg,#4f46e5,#6366f1);
          color: white;
          border: none;
          transition: box-shadow 0.3s, transform 0.3s;
        }

        .login-btn:hover {
          transform: translateY(-3px);
          box-shadow: 0 15px 35px rgba(79,70,229,0.5);
        }

        /* HERO */
        .hero {
          padding: 140px 40px 110px;
          text-align: center;
        }

        .hero-title {
          font-size: 56px;
          font-weight: 900;
          display: inline-flex;
          justify-content: center;
          margin-bottom: 26px;
          cursor: default;
        }

        .hero-title span {
          opacity: 0;
          animation: reveal 0.6s forwards;
          transition: text-shadow 0.3s;
        }

        .hero-title:hover span {
          text-shadow: 0 0 18px rgba(99,102,241,0.7);
        }

        @keyframes reveal {
          from { opacity: 0; transform: scale(0.6); }
          to { opacity: 1; transform: scale(1); }
        }

        .hero p {
          max-width: 720px;
          margin: auto;
          margin-bottom: 42px;
          color: #374151;
          font-size: 18px;
          line-height: 1.7;
        }

        .hero-actions {
          display: flex;
          justify-content: center;
          gap: 20px;
        }

        .primary-btn {
          background: linear-gradient(135deg,#4f46e5,#6366f1);
          color: white;
          padding: 16px 36px;
          border-radius: 16px;
          border: none;
          transition: transform 0.3s, box-shadow 0.3s;
        }

        .primary-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 24px rgba(79,70,229,0.25);
        }


        .secondary-btn {
          background: white;
          color: #4f46e5;
          border: 2px solid #c7d2fe;
          padding: 16px 36px;
          border-radius: 16px;
          transition: transform 0.3s;
        }

        .secondary-btn:hover {
          transform: translateY(-1px);
          background: #eef2ff;
        }


        /* FEATURES */
        .features {
          padding: 90px 40px;
          max-width: 1200px;
          margin: auto;
          display: grid;
          grid-template-columns: repeat(auto-fit,minmax(260px,1fr));
          gap: 32px;
        }

        .feature-card {
            background: white;
            padding: 32px;
            border-radius: 22px;
            box-shadow: 0 15px 40px rgba(0,0,0,0.1);
            opacity: 0;
            transform: translateY(40px);
            transition: 
              transform 0.7s ease,
              box-shadow 0.7s ease,
              opacity 0.7s ease;
            position: relative;
          }


        .feature-card::after {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: inherit;
          background: radial-gradient(
            circle at top left,
            rgba(99,102,241,0.25),
            transparent 60%
          );
          opacity: 0;
          transition: opacity 0.3s;
          pointer-events: none;
        }

        .feature-card:hover::after {
          opacity: 0.5;
        }

        .feature-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 18px 36px rgba(79,70,229,0.18);
        }



        .feature-card.animate {
          opacity: 1;
          transform: translateY(0);
        }

        .feature-card h3 {
          font-size: 20px;
          margin-bottom: 12px;
        }

        .feature-card p {
          color: #374151;
          line-height: 1.6;
        }

        /* FOOTER */
        .footer {
          background: #f1f5f9;
          padding: 30px;
          text-align: center;
          font-size: 14px;
          color: #64748b;
        }
      `}</style>

      {/* INTERACTIVE BACKGROUND */}
      <div ref={bgRef} className="bg"></div>

      {/* NAVBAR */}
      <div className="navbar">
        <div className="brand">AutomateX</div>
        <button className="login-btn" onClick={() => navigate("/login")}>
          Login
        </button>
      </div>

      {/* HERO */}
      <section className="hero">
        <h1 className="hero-title">
          {title.split("").map((char, i) => {
            const center = Math.floor(title.length / 2);
            const delay = Math.abs(i - center) * 0.05;
            return (
              <span key={i} style={{ animationDelay: `${delay}s` }}>
                {char === " " ? "\u00A0" : char}
              </span>
            );
          })}
        </h1>

        <p>
          Automate approvals, enforce SLAs, trigger smart escalations,
          and gain real-time visibility into enterprise workflows.
        </p>

        <div className="hero-actions">
          <button className="primary-btn" onClick={() => navigate("/login")}>
            Get Started
          </button>
          <button className="secondary-btn" onClick={scrollToFeatures}>
            View Features
          </button>
        </div>
      </section>

      {/* FEATURES */}
      <section className="features">
        {[
          ["⚙️ Configurable Workflows", "Flexible multi-level approval flows."],
          ["⏱ SLA Monitoring", "Never miss an approval deadline."],
          ["🚨 Smart Escalations", "Automatic escalation logic."],
          ["📜 Audit Trail", "Complete action history."],
          ["📊 Role Dashboards", "Insights for every role."],
          ["🔐 Secure Platform", "Enterprise-grade security."]
        ].map((item, i) => (
          <div
            key={i}
            className="feature-card"
            ref={el => (cardsRef.current[i] = el)}
          >
            <h3>{item[0]}</h3>
            <p>{item[1]}</p>
          </div>
        ))}
      </section>

      {/* FOOTER */}
      <footer className="footer">
        © {new Date().getFullYear()} AutomateX. All rights reserved.
      </footer>
    </>
  );
}
