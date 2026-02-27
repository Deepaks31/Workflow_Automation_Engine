import React, { useState, useEffect } from "react";
import AuditLogsTable from "./AuditLogsTable";
import AuditAnalytics from "./AuditAnalytics";

export default function AuditorDashboard() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [scrolled, setScrolled] = useState(false);

  // Swipe Navigation Logic - High Threshold to avoid accidental trigger
  const [touchStart, setTouchStart] = useState({ x: 0, y: 0 });
  const [touchEnd, setTouchEnd] = useState({ x: 0, y: 0 });

  const handleTouchStart = (e) => {
    // Ignore swipe if touching a chart or input
    if (e.target.closest('.recharts-wrapper') || e.target.closest('input') || e.target.closest('select')) return;
    setTouchStart({ x: e.targetTouches[0].clientX, y: e.targetTouches[0].clientY });
  };

  const handleTouchMove = (e) => {
    if (!touchStart.x) return;
    setTouchEnd({ x: e.targetTouches[0].clientX, y: e.targetTouches[0].clientY });
  };

  const handleTouchEnd = () => {
    if (!touchStart.x || !touchEnd.x) return;

    const diffX = touchStart.x - touchEnd.x;
    const diffY = touchStart.y - touchEnd.y;

    // Only swipe if movement is primarily horizontal and crosses a high threshold
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 120) {
      if (diffX > 0 && activeIndex === 0) setActiveIndex(1); // Swipe left
      if (diffX < 0 && activeIndex === 1) setActiveIndex(0); // Swipe right
    }
    setTouchStart({ x: 0, y: 0 });
    setTouchEnd({ x: 0, y: 0 });
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      window.location.href = "/login";
    }
  };

  return (
    <>
      <div className="auditor-app-wrapper">
        <header className={`auditor-header ${scrolled ? "scrolled" : ""}`}>
          <div className="header-content">
            <div className="header-left">
              <h1 className="page-title">
                <span className="title-icon">🔍</span> Audit System
              </h1>
              <p className="page-subtitle">Intelligent Monitoring & Analytics</p>
            </div>

            <div className="tab-indicator">
              <button
                className={`tab-btn ${activeIndex === 0 ? "active" : ""}`}
                onClick={() => setActiveIndex(0)}>
                📋 Logs
              </button>
              <button
                className={`tab-btn ${activeIndex === 1 ? "active" : ""}`}
                onClick={() => setActiveIndex(1)}>
                📊 Analytics
              </button>
              <div className="tab-bg" style={{ transform: `translateX(${activeIndex * 100}%)` }}></div>
            </div>

            <button className="logout-btn" onClick={handleLogout}>🚪 Logout</button>
          </div>
        </header>

        <main className="main-content">
          <div
            className="swipe-container"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{
              transform: `translateX(-${activeIndex * 50}%)`,
              width: "200%"
            }}
          >
            <div className="swipe-page">
              <AuditLogsTable />
            </div>
            <div className="swipe-page">
              <AuditAnalytics />
            </div>
          </div>
        </main>
      </div>

      <style>{`
        /* RESET & BASE */
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { 
          min-height: 100vh;
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
          background: #f1f5f9;
        }

        .auditor-app-wrapper {
          min-height: 100vh; display: flex; flex-direction: column; overflow-x: hidden;
        }

        /* HEADER */
        .auditor-header {
          position: sticky; top: 0; 
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(12px); 
          border-bottom: 1px solid #e2e8f0;
          z-index: 100; padding: 16px 5%; 
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
          transition: all 0.3s ease;
        }
        .auditor-header.scrolled { padding: 10px 5%; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); }
        .header-content {
          max-width: 1600px; margin: 0 auto; display: flex;
          justify-content: space-between; align-items: center; gap: 24px; width: 100%;
        }
        .header-left h1 { margin: 0 0 4px 0; font-size: 24px; font-weight: 800; color: #0f172a; display: flex; align-items: center; gap: 10px; }
        .page-subtitle { margin: 0; font-size: 14px; color: #64748b; font-weight: 500; }

        /* TABS */
        .tab-indicator {
          display: flex; position: relative; background: #f1f5f9; padding: 4px;
          border-radius: 12px; border: 1px solid #e2e8f0; width: 280px;
        }
        .tab-btn {
          flex: 1; padding: 10px 0; text-align: center; background: transparent; border: none;
          font-weight: 600; font-size: 14px; color: #64748b; cursor: pointer; z-index: 2;
          transition: 0.3s;
        }
        .tab-btn.active { color: #0f172a; }
        .tab-bg {
          position: absolute; top: 4px; left: 4px; bottom: 4px; width: calc(50% - 4px);
          background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);
          transition: transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1); z-index: 1;
        }

        .logout-btn {
          background: white; color: #0f172a; border: 1px solid #cbd5e1;
          padding: 10px 18px; border-radius: 8px; font-size: 14px; font-weight: 600;
          cursor: pointer; transition: all 0.2s ease; box-shadow: 0 1px 2px rgba(0,0,0,0.05);
        }
        .logout-btn:hover { background: #fef2f2; color: #ef4444; border-color: #fca5a5; }

        /* SWIPE SYSTEM */
        .main-content { 
          flex: 1; width: 100%; overflow: hidden; position: relative;
        }
        .swipe-container {
          display: flex; width: 200%; height: 100%;
          transition: transform 0.5s cubic-bezier(0.25, 0.8, 0.25, 1);
        }
        .swipe-page {
          width: 50%; padding: 30px 5% 60px; max-width: 1600px; margin: 0 auto;
          min-height: calc(100vh - 85px);
        }

        @media (max-width: 768px) {
          .header-content { flex-direction: column; align-items: stretch; gap: 16px; }
          .tab-indicator { width: 100%; }
          .header-left { text-align: center; }
          .header-left h1 { justify-content: center; }
        }
      `}</style>
    </>
  );
}