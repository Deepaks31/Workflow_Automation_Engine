import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function MeetingScheduler() {
    const [form, setForm] = useState({
        title: "",
        description: "",
        meetingDate: "",
        meetingTime: "",
        durationMinutes: 30,
        meetingLink: "",
        participantIds: []
    });
    const [allUsers, setAllUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const creatorId = Number(localStorage.getItem("userId"));
    const navigate = useNavigate();

    useEffect(() => {
        // Fetch all active users to populate participants dropdown/multiselect
        axios.get(`${import.meta.env.VITE_API_URL}/api/admin/users`)
            .then(res => setAllUsers(res.data.filter(u => u.id !== creatorId)))
            .catch(err => console.error("Error fetching users:", err));
    }, [creatorId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleParticipantToggle = (userId) => {
        setForm(prev => {
            const isSelected = prev.participantIds.includes(userId);
            if (isSelected) {
                return { ...prev, participantIds: prev.participantIds.filter(id => id !== userId) };
            } else {
                return { ...prev, participantIds: [...prev.participantIds, userId] };
            }
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.title || !form.meetingDate || !form.meetingTime) {
            setError("Title, Date, and Time are required.");
            return;
        }
        setError("");
        setLoading(true);

        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/api/meetings`, {
                ...form,
                creatorId
            });
            navigate("/meetings");
        } catch (err) {
            console.error(err);
            setError("Failed to schedule meeting. Please try again.");
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: "100vh", background: "#f8fafc", padding: "40px 5%" }}>
            <div style={{ maxWidth: "800px", margin: "0 auto" }}>
                <button onClick={() => navigate("/meetings")} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px", fontSize: "14px", fontWeight: "600" }}>
                    ← Back to Meetings
                </button>

                <div style={{ background: "white", borderRadius: "24px", padding: "40px", boxShadow: "0 10px 40px rgba(0,0,0,0.05)", border: "1px solid #e2e8f0" }}>
                    <h1 style={{ margin: "0 0 32px 0", fontSize: "28px", color: "#1e293b", fontWeight: "800" }}>Schedule a Meeting</h1>

                    {error && <div style={{ background: "#fef2f2", color: "#dc2626", padding: "12px 16px", borderRadius: "8px", marginBottom: "24px", fontSize: "14px", fontWeight: "500", border: "1px solid #fecaca" }}>{error}</div>}

                    <form onSubmit={handleSubmit}>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "24px" }}>
                            <div style={{ gridColumn: "1 / -1" }}>
                                <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "600", color: "#334155" }}>Meeting Title <span style={{ color: "#ef4444" }}>*</span></label>
                                <input required type="text" name="title" value={form.title} onChange={handleChange} placeholder="e.g. Q3 Roadmap Review" style={{ width: "100%", padding: "12px 16px", borderRadius: "10px", border: "1px solid #cbd5e1", fontSize: "15px", boxSizing: "border-box" }} />
                            </div>

                            <div style={{ gridColumn: "1 / -1" }}>
                                <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "600", color: "#334155" }}>Description</label>
                                <textarea name="description" value={form.description} onChange={handleChange} rows="3" placeholder="Brief agenda or summary of the meeting..." style={{ width: "100%", padding: "12px 16px", borderRadius: "10px", border: "1px solid #cbd5e1", fontSize: "15px", fontFamily: "inherit", resize: "vertical", boxSizing: "border-box" }} />
                            </div>

                            <div>
                                <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "600", color: "#334155" }}>Date <span style={{ color: "#ef4444" }}>*</span></label>
                                <input required type="date" name="meetingDate" value={form.meetingDate} onChange={handleChange} style={{ width: "100%", padding: "12px 16px", borderRadius: "10px", border: "1px solid #cbd5e1", fontSize: "15px", boxSizing: "border-box" }} />
                            </div>

                            <div>
                                <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "600", color: "#334155" }}>Time <span style={{ color: "#ef4444" }}>*</span></label>
                                <input required type="time" name="meetingTime" value={form.meetingTime} onChange={handleChange} style={{ width: "100%", padding: "12px 16px", borderRadius: "10px", border: "1px solid #cbd5e1", fontSize: "15px", boxSizing: "border-box" }} />
                            </div>

                            <div>
                                <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "600", color: "#334155" }}>Duration (Minutes)</label>
                                <input type="number" name="durationMinutes" value={form.durationMinutes} onChange={handleChange} min="5" step="5" style={{ width: "100%", padding: "12px 16px", borderRadius: "10px", border: "1px solid #cbd5e1", fontSize: "15px", boxSizing: "border-box" }} />
                            </div>

                            <div>
                                <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "600", color: "#334155" }}>Meeting Link (Zoom / Meet)</label>
                                <input type="url" name="meetingLink" value={form.meetingLink} onChange={handleChange} placeholder="https://..." style={{ width: "100%", padding: "12px 16px", borderRadius: "10px", border: "1px solid #cbd5e1", fontSize: "15px", boxSizing: "border-box" }} />
                            </div>

                            <div style={{ gridColumn: "1 / -1" }}>
                                <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "600", color: "#334155" }}>Invite Participants</label>
                                <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "16px", maxHeight: "200px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "8px" }}>
                                    {allUsers.length === 0 ? (
                                        <p style={{ margin: 0, color: "#94a3b8", fontSize: "14px", fontStyle: "italic" }}>No other users available to invite.</p>
                                    ) : (
                                        allUsers.map(u => (
                                            <label key={u.id} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "8px", background: "white", borderRadius: "8px", border: "1px solid #e2e8f0", cursor: "pointer", transition: "all 0.2s" }} onMouseEnter={e => e.currentTarget.style.borderColor = "#cbd5e1"} onMouseLeave={e => e.currentTarget.style.borderColor = "#e2e8f0"}>
                                                <input
                                                    type="checkbox"
                                                    checked={form.participantIds.includes(u.id)}
                                                    onChange={() => handleParticipantToggle(u.id)}
                                                    style={{ width: "18px", height: "18px", accentColor: "#3b82f6", cursor: "pointer" }}
                                                />
                                                <div>
                                                    <p style={{ margin: 0, fontSize: "14px", fontWeight: "600", color: "#1e293b" }}>{u.name}</p>
                                                    <p style={{ margin: 0, fontSize: "12px", color: "#64748b" }}>{u.role} - {u.email}</p>
                                                </div>
                                            </label>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>

                        <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: "24px", display: "flex", justifyContent: "flex-end", gap: "16px" }}>
                            <button type="button" onClick={() => navigate("/meetings")} style={{ background: "transparent", border: "1px solid #cbd5e1", padding: "12px 24px", borderRadius: "10px", fontSize: "15px", fontWeight: "600", color: "#475569", cursor: "pointer", transition: "all 0.2s" }}>
                                Cancel
                            </button>
                            <button type="submit" disabled={loading} style={{ background: "linear-gradient(135deg, #3b82f6, #2563eb)", border: "none", padding: "12px 32px", borderRadius: "10px", fontSize: "15px", fontWeight: "600", color: "white", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1, boxShadow: "0 4px 15px rgba(59, 130, 246, 0.3)", transition: "all 0.2s" }}>
                                {loading ? "Scheduling..." : "Schedule Meeting"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
