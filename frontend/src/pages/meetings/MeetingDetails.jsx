import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

export default function MeetingDetails() {
    const { id } = useParams();
    const [meeting, setMeeting] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        loadMeeting();
    }, [id]);

    const loadMeeting = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/meetings/${id}`);
            setMeeting(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        return status === "COMPLETED" ? "#10b981" : "#f59e0b";
    };

    if (loading) return <div style={{ textAlign: "center", padding: "60px", color: "#64748b" }}>Loading details...</div>;
    if (!meeting) return <div style={{ textAlign: "center", padding: "60px", color: "#ef4444" }}>Meeting not found.</div>;

    return (
        <div style={{ minHeight: "100vh", background: "#f8fafc", padding: "40px 5%" }}>
            <div style={{ maxWidth: "900px", margin: "0 auto" }}>

                <button onClick={() => navigate("/meetings")} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", marginBottom: "24px", fontSize: "14px", fontWeight: "600" }}>
                    ← Back to Meetings
                </button>

                <div style={{ background: "white", borderRadius: "24px", padding: "40px", boxShadow: "0 10px 40px rgba(0,0,0,0.05)", border: "1px solid #e2e8f0" }}>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px", paddingBottom: "24px", borderBottom: "1px solid #e2e8f0" }}>
                        <div>
                            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                                <h1 style={{ margin: 0, fontSize: "32px", color: "#1e293b", fontWeight: "800" }}>{meeting.title}</h1>
                                <span style={{ background: meeting.status === "COMPLETED" ? "#d1fae5" : "#fef3c7", color: getStatusColor(meeting.status), padding: "6px 12px", borderRadius: "20px", fontSize: "13px", fontWeight: "700" }}>
                                    {meeting.status}
                                </span>
                            </div>
                            <p style={{ margin: 0, color: "#64748b", fontSize: "15px", display: "flex", gap: "24px" }}>
                                <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>📅 {meeting.meetingDate}</span>
                                <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>⏰ {meeting.meetingTime} ({meeting.durationMinutes} mins)</span>
                            </p>
                        </div>

                        <div style={{ display: "flex", gap: "12px" }}>
                            {meeting.meetingLink && (
                                <a href={meeting.meetingLink} target="_blank" rel="noreferrer" style={{ textDecoration: "none", background: "#10b981", color: "white", padding: "10px 20px", borderRadius: "10px", fontSize: "14px", fontWeight: "600", boxShadow: "0 4px 15px rgba(16, 185, 129, 0.3)" }}>
                                    Join Meeting
                                </a>
                            )}
                            {meeting.status === "UPCOMING" ? (
                                <button onClick={() => navigate(`/meetings/${meeting.id}/mom/create`)} style={{ background: "linear-gradient(135deg, #3b82f6, #2563eb)", color: "white", border: "none", padding: "10px 20px", borderRadius: "10px", fontSize: "14px", fontWeight: "600", cursor: "pointer", boxShadow: "0 4px 15px rgba(59, 130, 246, 0.3)" }}>
                                    📝 Create MOM
                                </button>
                            ) : (
                                <button onClick={() => navigate(`/meetings/${meeting.id}/mom`)} style={{ background: "#f1f5f9", color: "#3b82f6", border: "1px solid #cbd5e1", padding: "10px 20px", borderRadius: "10px", fontSize: "14px", fontWeight: "600", cursor: "pointer" }}>
                                    📄 View MOM
                                </button>
                            )}
                        </div>
                    </div>

                    <div style={{ marginBottom: "32px" }}>
                        <h3 style={{ margin: "0 0 12px 0", fontSize: "18px", color: "#1e293b", fontWeight: "700" }}>Description & Agenda</h3>
                        <div style={{ background: "#f8fafc", padding: "20px", borderRadius: "12px", border: "1px solid #e2e8f0", color: "#475569", lineHeight: "1.6", whiteSpace: "pre-wrap" }}>
                            {meeting.description || "No description provided."}
                        </div>
                    </div>

                    <div>
                        <h3 style={{ margin: "0 0 16px 0", fontSize: "18px", color: "#1e293b", fontWeight: "700", display: "flex", alignItems: "center", gap: "8px" }}>
                            👥 Participants ({meeting.participants?.length || 0})
                        </h3>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "16px" }}>
                            {meeting.participants?.map(p => (
                                <div key={p.id} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px", background: "white", border: "1px solid #e2e8f0", borderRadius: "12px" }}>
                                    <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "#e0e7ff", color: "#4338ca", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", fontWeight: "700" }}>
                                        {p.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p style={{ margin: 0, fontSize: "14px", fontWeight: "600", color: "#1e293b" }}>{p.name}</p>
                                        <p style={{ margin: 0, fontSize: "12px", color: "#64748b" }}>{p.role}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
