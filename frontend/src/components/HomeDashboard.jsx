import React from "react";
import { useNavigate } from "react-router-dom";

export default function HomeDashboard() {
  const navigate = useNavigate();

  return (
    <>
      <style>{`
        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          font-family: 'Inter', sans-serif;
          background: linear-gradient(135deg, #eef2ff, #f8fafc);
        }

        .navbar {
          position: sticky;
          top: 0;
          z-index: 50;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 18px 40px;
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(10px);
          box-shadow: 0 10px 30px rgba(0,0,0,0.08);
        }

        .brand {
          font-size: 26px;
          font-weight: 800;
          color: #4f46e5;
          letter-spacing: 0.5px;
        }

        .login-btn {
          background: linear-gradient(135deg, #4f46e5, #6366f1);
          color: white;
          border: none;
          padding: 10px 22px;
          border-radius: 999px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .login-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 25px rgba(79,70,229,0.35);
        }

        .hero {
          padding: 100px 40px 80px;
          text-align: center;
        }

        .hero h1 {
          font-size: 48px;
          margin-bottom: 18px;
          color: #111827;
        }

        .hero span {
          color: #4f46e5;
        }

        .hero p {
          font-size: 18px;
          max-width: 720px;
          margin: 0 auto 40px;
          color: #4b5563;
        }

        .hero-actions {
          display: flex;
          justify-content: center;
          gap: 20px;
        }

        .primary-btn {
          background: #4f46e5;
          color: white;
          border: none;
          padding: 14px 28px;
          border-radius: 14px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .primary-btn:hover {
          background: #4338ca;
          box-shadow: 0 15px 35px rgba(79,70,229,0.4);
        }

        .secondary-btn {
          background: white;
          color: #4f46e5;
          border: 2px solid #c7d2fe;
          padding: 14px 28px;
          border-radius: 14px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .secondary-btn:hover {
          background: #eef2ff;
        }

        .features {
          padding: 60px 40px 100px;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 30px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .feature-card {
          background: white;
          border-radius: 18px;
          padding: 28px;
          box-shadow: 0 15px 40px rgba(0,0,0,0.08);
          transition: all 0.35s ease;
        }

        .feature-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 25px 60px rgba(0,0,0,0.12);
        }

        .feature-card h3 {
          margin-bottom: 10px;
          color: #111827;
        }

        .feature-card p {
          font-size: 14px;
          color: #4b5563;
          line-height: 1.6;
        }
      `}</style>

      <div className="navbar">
        <div className="brand">AutomateX</div>
        <button className="login-btn" onClick={() => navigate("/login")}>Login</button>
      </div>

      <section className="hero">
        <h1>
          Enterprise Workflow <span>Automation</span>
        </h1>
        <p>
          Automate approvals, enforce SLAs, enable escalations, and gain full
          visibility into your enterprise workflows — all in one powerful
          automation engine.
        </p>
        <div className="hero-actions">
          <button className="primary-btn" onClick={() => navigate("/login")}>
            Get Started
          </button>
          <button className="secondary-btn">
            View Features
          </button>
        </div>
      </section>

      <section className="features">
        <div className="feature-card">
          <h3>Configurable Workflows</h3>
          <p>
            Design multi-level approval workflows with conditions, roles,
            escalations, and execution tracking.
          </p>
        </div>

        <div className="feature-card">
          <h3>SLA & Escalations</h3>
          <p>
            Automatically escalate requests when SLAs are breached or
            auto-reject when no further approvals exist.
          </p>
        </div>

        <div className="feature-card">
          <h3>Audit & History</h3>
          <p>
            Maintain a complete audit trail of approvals, rejections,
            escalations, and automated decisions.
          </p>
        </div>

        <div className="feature-card">
          <h3>Role-Based Dashboards</h3>
          <p>
            Dedicated views for Admins, Initiators, Managers, and Finance teams
            with real-time updates.
          </p>
        </div>
      </section>
    </>
  );
}
