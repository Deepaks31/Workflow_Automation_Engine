import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import NotificationBell from "../../components/NotificationBell";

export default function MeetingList() {
    const [meetings, setMeetings] = useState([]);
    const [loading, setLoading] = useState(true);
    const userId = localStorage.getItem("userId");
    const userRole = localStorage.getItem("role") || "UNKNOWN";
    const navigate = useNavigate();

    useEffect(() => {
        loadMeetings();
    }, []);

    const loadMeetings = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/meetings/user/${userId}`);
            setMeetings(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        return status === "COMPLETED" ? "#10b981" : "#f59e0b"; // green for completed, yellow for upcoming
    };

    const canCreateMeeting = userRole !== "INITIATOR";

    return (
        <div style={{ minHeight: "100vh", background: "#f8fafc", padding: "40px 5%" }}>
            <div style={{ maxWidth: "1200px", margin: "0 auto" }}>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
                    <div>
                        <button
                            onClick={() => {
                                const role = localStorage.getItem("role");
                                if (role) {
                                    navigate(`/${role.toLowerCase()}`);
                                } else {
                                    navigate("/");
                                }
                            }}
                            style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px", fontSize: "14px", fontWeight: "600" }}
                        >
                            ← Dashboard
                        </button>
                        <h1 style={{ margin: 0, fontSize: "32px", color: "#1e293b", fontWeight: "800", display: "flex", alignItems: "center", gap: "12px" }}>
                            📅 Meeting Center
                        </h1>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
                        <NotificationBell />
                        {canCreateMeeting && (
                            <button
                                onClick={() => navigate("/meetings/create")}
                                style={{
                                    background: "linear-gradient(135deg, #3b82f6, #2563eb)", color: "white",
                                    border: "none", padding: "12px 24px", borderRadius: "12px",
                                    fontSize: "15px", fontWeight: "600", cursor: "pointer", boxShadow: "0 4px 15px rgba(59, 130, 246, 0.3)",
                                    transition: "transform 0.2s"
                                }}
                                onMouseOver={(e) => e.currentTarget.style.transform = "translateY(-2px)"}
                                onMouseOut={(e) => e.currentTarget.style.transform = "translateY(0)"}
                            >
                                + Schedule Meeting
                            </button>
                        )}
                    </div>
                </div>

                {loading ? (
                    <div style={{ textAlign: "center", padding: "60px", color: "#64748b" }}>Loading your meetings...</div>
                ) : meetings.length === 0 ? (
                    <div style={{ background: "white", padding: "60px", borderRadius: "24px", textAlign: "center", border: "1px solid #e2e8f0", boxShadow: "0 10px 30px rgba(0,0,0,0.05)" }}>
                        <div style={{ fontSize: "56px", marginBottom: "24px" }}>🗓️</div>
                        <h3 style={{ margin: "0 0 12px 0", color: "#1e293b", fontSize: "24px" }}>No Meetings Scheduled</h3>
                        <p style={{ margin: "0 0 24px 0", color: "#64748b", fontSize: "16px" }}>You haven't been invited to any meetings yet.</p>
                        {canCreateMeeting && (
                            <button onClick={() => navigate("/meetings/create")} style={{ background: "#f1f5f9", color: "#3b82f6", border: "1px solid #cbd5e1", padding: "10px 20px", borderRadius: "8px", fontWeight: "600", cursor: "pointer" }}>
                                Schedule your first meeting
                            </button>
                        )}
                    </div>
                ) : (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "24px" }}>
                        {meetings.map((m) => (
                            <div
                                key={m.id}
                                className="meeting-card"
                                onClick={() => navigate(`/meetings/${m.id}`)}
                                style={{
                                    background: "white", borderRadius: "20px", padding: "24px",
                                    border: "1px solid #e2e8f0", cursor: "pointer", transition: "all 0.3s",
                                    boxShadow: "0 4px 15px rgba(0,0,0,0.03)", display: "flex", flexDirection: "column"
                                }}
                                onMouseOver={(e) => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 15px 35px rgba(0,0,0,0.1)"; }}
                                onMouseOut={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 15px rgba(0,0,0,0.03)"; }}
                            >
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                                    <h3 style={{ margin: 0, fontSize: "18px", color: "#1e293b", fontWeight: "700", lineHeight: "1.3", flex: 1 }}>{m.title}</h3>
                                    <span style={{
                                        background: m.status === "COMPLETED" ? "#d1fae5" : "#fef3c7",
                                        color: getStatusColor(m.status), padding: "4px 10px", borderRadius: "20px",
                                        fontSize: "12px", fontWeight: "700", marginLeft: "12px"
                                    }}>
                                        {m.status}
                                    </span>
                                </div>

                                <div style={{ flex: 1 }}>
                                    <p style={{ margin: "0 0 20px 0", color: "#64748b", fontSize: "14px", lineHeight: "1.5", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                                        {m.description}
                                    </p>

                                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px", color: "#475569", fontSize: "14px", fontWeight: "500" }}>
                                        <span style={{ width: "20px" }}>📅</span> {m.meetingDate}
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px", color: "#475569", fontSize: "14px", fontWeight: "500" }}>
                                        <span style={{ width: "20px" }}>⏰</span> {m.meetingTime} ({m.durationMinutes} mins)
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#475569", fontSize: "14px", fontWeight: "500" }}>
                                        <span style={{ width: "20px" }}>👥</span> {m.participants?.length || 0} Participants
                                    </div>
                                </div>

                                <div style={{ marginTop: "24px", paddingTop: "16px", borderTop: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <span style={{ color: "#3b82f6", fontSize: "14px", fontWeight: "600" }}>View Details →</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
