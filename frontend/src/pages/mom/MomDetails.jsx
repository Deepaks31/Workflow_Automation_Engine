import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

export default function MomDetails() {
    const { id: meetingId } = useParams();
    const [mom, setMom] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        loadMom();
    }, [meetingId]);

    const loadMom = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/moms/meeting/${meetingId}`);
            setMom(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    if (loading) return <div style={{ textAlign: "center", padding: "60px", color: "#64748b" }}>Loading MOM...</div>;

    if (!mom) return (
        <div style={{ textAlign: "center", padding: "60px" }}>
            <h3 style={{ color: "#1e293b", marginBottom: "16px" }}>No Minutes of Meeting found</h3>
            <p style={{ color: "#64748b", marginBottom: "24px" }}>This meeting hasn't been documented yet.</p>
            <button onClick={() => navigate(`/meetings/${meetingId}`)} style={{ background: "#f1f5f9", color: "#3b82f6", border: "1px solid #cbd5e1", padding: "10px 20px", borderRadius: "8px", fontWeight: "600", cursor: "pointer" }}>
                Back to Meeting
            </button>
        </div>
    );

    return (
        <>
            {/* Hide specific UI elements during print using CSS */}
            <style>{`
        @media print {
          .no-print { display: none !important; }
          .print-area { padding: 0 !important; margin: 0 !important; background: white !important; box-shadow: none !important; border: none !important; }
          body { background: white; }
        }
      `}</style>

            <div className="print-area" style={{ minHeight: "100vh", background: "#f8fafc", padding: "40px 5%" }}>
                <div style={{ maxWidth: "900px", margin: "0 auto" }}>

                    <div className="no-print" style={{ display: "flex", justifyContent: "space-between", marginBottom: "24px" }}>
                        <button onClick={() => navigate(`/meetings/${meetingId}`)} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", fontWeight: "600" }}>
                            ← Back to Meeting
                        </button>
                        <button onClick={handlePrint} style={{ background: "white", color: "#1e293b", border: "1px solid #cbd5e1", padding: "8px 16px", borderRadius: "8px", fontSize: "14px", fontWeight: "600", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", boxShadow: "0 2px 5px rgba(0,0,0,0.05)" }}>
                            🖨️ Export PDF / Print
                        </button>
                    </div>

                    <div style={{ background: "white", borderRadius: "24px", padding: "48px", boxShadow: "0 10px 40px rgba(0,0,0,0.05)", border: "1px solid #e2e8f0" }}>

                        {/* Header */}
                        <div style={{ borderBottom: "2px solid #e2e8f0", paddingBottom: "24px", marginBottom: "32px", textAlign: "center" }}>
                            <h1 style={{ margin: "0 0 8px 0", fontSize: "36px", color: "#1e293b", fontWeight: "800", letterSpacing: "-1px" }}>Minutes of Meeting</h1>
                            <h2 style={{ margin: "0 0 16px 0", fontSize: "20px", color: "#3b82f6", fontWeight: "600" }}>{mom.meeting?.title}</h2>
                            <div style={{ display: "flex", justifyContent: "center", gap: "24px", color: "#64748b", fontSize: "14px", fontWeight: "500" }}>
                                <span>📅 Date: {mom.meeting?.meetingDate}</span>
                                <span>⏰ Time: {mom.meeting?.meetingTime}</span>
                                <span>👤 Prepared By: {mom.createdBy?.name || 'System'}</span>
                            </div>
                        </div>

                        {/* Content Sections */}
                        <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>

                            <section>
                                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                                    <span style={{ width: "32px", height: "32px", background: "#e0e7ff", color: "#4338ca", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px" }}>📋</span>
                                    <h3 style={{ margin: 0, fontSize: "20px", color: "#1e293b", fontWeight: "700" }}>Executive Summary</h3>
                                </div>
                                <div style={{ padding: "24px", background: "#f8fafc", borderRadius: "16px", color: "#334155", fontSize: "15px", lineHeight: "1.7", whiteSpace: "pre-wrap" }}>
                                    {mom.summary || "No summary available."}
                                </div>
                            </section>

                            <section>
                                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                                    <span style={{ width: "32px", height: "32px", background: "#ecfccb", color: "#4d7c0f", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px" }}>✅</span>
                                    <h3 style={{ margin: 0, fontSize: "20px", color: "#1e293b", fontWeight: "700" }}>Key Decisions Taken</h3>
                                </div>
                                <div style={{ padding: "24px", background: "white", border: "1px solid #e2e8f0", borderRadius: "16px", color: "#334155", fontSize: "15px", lineHeight: "1.7", whiteSpace: "pre-wrap" }}>
                                    {mom.keyDecisions || "No decisions recorded."}
                                </div>
                            </section>

                            <section>
                                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                                    <span style={{ width: "32px", height: "32px", background: "#fee2e2", color: "#b91c1c", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px" }}>🎯</span>
                                    <h3 style={{ margin: 0, fontSize: "20px", color: "#1e293b", fontWeight: "700" }}>Action Items</h3>
                                </div>
                                <div style={{ padding: "24px", background: "white", border: "1px solid #e2e8f0", borderRadius: "16px", color: "#334155", fontSize: "15px", lineHeight: "1.7", whiteSpace: "pre-wrap" }}>
                                    {mom.actionItems || "No action items recorded."}
                                </div>
                            </section>

                            <section>
                                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                                    <span style={{ width: "32px", height: "32px", background: "#f3f4f6", color: "#374151", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px" }}>💬</span>
                                    <h3 style={{ margin: 0, fontSize: "20px", color: "#1e293b", fontWeight: "700" }}>Raw Discussion Notes</h3>
                                </div>
                                <div style={{ padding: "24px", background: "#f8fafc", borderRadius: "16px", color: "#64748b", fontSize: "14px", lineHeight: "1.6", whiteSpace: "pre-wrap", borderLeft: "4px solid #cbd5e1" }}>
                                    {mom.discussionPoints || "No raw notes available."}
                                </div>
                            </section>

                        </div>

                        {/* Footer */}
                        <div style={{ marginTop: "48px", paddingTop: "24px", borderTop: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", color: "#94a3b8", fontSize: "12px" }}>
                            <span>Generated on: {new Date(mom.createdAt).toLocaleString()}</span>
                            <span>Workflow Engine - MOM Module</span>
                        </div>

                    </div>
                </div>
            </div>
        </>
    );
}
