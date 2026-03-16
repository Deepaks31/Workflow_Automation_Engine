import React, { useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

export default function MomCreator() {
    const { id: meetingId } = useParams();
    const [form, setForm] = useState({
        discussionPoints: "",
        keyDecisions: "",
        actionItems: "",
        summary: ""
    });
    const [useAi, setUseAi] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const creatorId = Number(localStorage.getItem("userId"));
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.discussionPoints) {
            setError("Discussion points are required to create a MOM.");
            return;
        }

        setLoading(true);
        setError("");

        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/api/moms`, {
                meetingId: Number(meetingId),
                createdBy: creatorId,
                discussionPoints: form.discussionPoints,
                keyDecisions: form.keyDecisions,
                actionItems: form.actionItems,
                summary: form.summary,
                generateWithAi: useAi
            });
            navigate(`/meetings/${meetingId}/mom`);
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || "Failed to create MOM.");
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: "100vh", background: "#f8fafc", padding: "40px 5%" }}>
            <div style={{ maxWidth: "800px", margin: "0 auto" }}>

                <button onClick={() => navigate(`/meetings/${meetingId}`)} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", marginBottom: "24px", fontSize: "14px", fontWeight: "600" }}>
                    ← Back to Meeting
                </button>

                <div style={{ background: "white", borderRadius: "24px", padding: "40px", boxShadow: "0 10px 40px rgba(0,0,0,0.05)", border: "1px solid #e2e8f0" }}>
                    <h1 style={{ margin: "0 0 8px 0", fontSize: "28px", color: "#1e293b", fontWeight: "800", display: "flex", alignItems: "center", gap: "12px" }}>
                        📝 Draft Minutes of Meeting
                    </h1>
                    <p style={{ margin: "0 0 32px 0", color: "#64748b", fontSize: "15px" }}>Log the discussion, decisions, and outcomes.</p>

                    {error && <div style={{ background: "#fef2f2", color: "#dc2626", padding: "12px 16px", borderRadius: "8px", marginBottom: "24px", fontSize: "14px", fontWeight: "500", border: "1px solid #fecaca" }}>{error}</div>}

                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: "24px" }}>
                            <label style={{ display: "block", marginBottom: "8px", fontSize: "15px", fontWeight: "600", color: "#334155" }}>Raw Discussion Notes <span style={{ color: "#ef4444" }}>*</span></label>
                            <textarea
                                required
                                name="discussionPoints"
                                value={form.discussionPoints}
                                onChange={handleChange}
                                rows="6"
                                placeholder="What was discussed? Paste transcript or raw notes here..."
                                style={{ width: "100%", padding: "16px", borderRadius: "12px", border: "1px solid #cbd5e1", fontSize: "15px", fontFamily: "inherit", resize: "vertical", boxSizing: "border-box", background: "#f8fafc" }}
                            />
                        </div>

                        <div style={{ background: "linear-gradient(to right, #e0e7ff, #f3e8ff)", padding: "20px", borderRadius: "16px", marginBottom: "32px", border: "1px dashed #a855f7", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <div>
                                <h4 style={{ margin: "0 0 4px 0", color: "#4c1d95", fontSize: "16px", fontWeight: "700", display: "flex", alignItems: "center", gap: "8px" }}>✨ Auto-Generate with AI</h4>
                                <p style={{ margin: 0, color: "#5b21b6", fontSize: "13px" }}>Let Groq AI automatically extract the summary, decisions, and action items from your discussion notes above.</p>
                            </div>
                            <label style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
                                <input
                                    type="checkbox"
                                    checked={useAi}
                                    onChange={(e) => setUseAi(e.target.checked)}
                                    style={{ width: "24px", height: "24px", accentColor: "#9333ea", cursor: "pointer" }}
                                />
                            </label>
                        </div>

                        {!useAi && (
                            <div style={{ display: "grid", gap: "24px", marginBottom: "32px" }}>
                                <div style={{ padding: "24px", background: "#f8fafc", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
                                    <h4 style={{ margin: "0 0 16px 0", color: "#1e293b", fontSize: "16px" }}>Manual Entry</h4>

                                    <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "600", color: "#475569" }}>Executive Summary</label>
                                    <textarea name="summary" value={form.summary} onChange={handleChange} rows="3" placeholder="Brief summary of the meeting..." style={{ width: "100%", padding: "12px 16px", borderRadius: "10px", border: "1px solid #cbd5e1", fontSize: "14px", fontFamily: "inherit", resize: "vertical", boxSizing: "border-box", marginBottom: "20px" }} />

                                    <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "600", color: "#475569" }}>Key Decisions Taken</label>
                                    <textarea name="keyDecisions" value={form.keyDecisions} onChange={handleChange} rows="3" placeholder="- Decided to proceed with Q2 marketing plan..." style={{ width: "100%", padding: "12px 16px", borderRadius: "10px", border: "1px solid #cbd5e1", fontSize: "14px", fontFamily: "inherit", resize: "vertical", boxSizing: "border-box", marginBottom: "20px" }} />

                                    <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "600", color: "#475569" }}>Action Items</label>
                                    <textarea name="actionItems" value={form.actionItems} onChange={handleChange} rows="3" placeholder="- John: Finalize budget by Friday..." style={{ width: "100%", padding: "12px 16px", borderRadius: "10px", border: "1px solid #cbd5e1", fontSize: "14px", fontFamily: "inherit", resize: "vertical", boxSizing: "border-box" }} />
                                </div>
                            </div>
                        )}

                        <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: "24px", display: "flex", justifyContent: "flex-end", gap: "16px" }}>
                            <button type="submit" disabled={loading} style={{ background: useAi ? "linear-gradient(135deg, #a855f7, #7e22ce)" : "linear-gradient(135deg, #3b82f6, #2563eb)", border: "none", padding: "14px 32px", borderRadius: "12px", fontSize: "15px", fontWeight: "600", color: "white", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1, boxShadow: useAi ? "0 4px 15px rgba(168, 85, 247, 0.4)" : "0 4px 15px rgba(59, 130, 246, 0.3)", transition: "all 0.2s" }}>
                                {loading ? "Processing..." : (useAi ? "✨ Generate & Save MOM" : "Save Manual MOM")}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
