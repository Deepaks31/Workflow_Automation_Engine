import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function NotificationCenter() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("ALL"); // ALL, MEETING, MOM, WORKFLOW
    const userId = localStorage.getItem("userId");
    const navigate = useNavigate();

    useEffect(() => {
        loadNotifications();
    }, []);

    const loadNotifications = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/notifications/user/${userId}`);
            setNotifications(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id) => {
        try {
            await axios.put(`${import.meta.env.VITE_API_URL}/api/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, status: "READ" } : n));
        } catch (err) {
            console.error(err);
        }
    };

    const markAllAsRead = async () => {
        try {
            await axios.put(`${import.meta.env.VITE_API_URL}/api/notifications/user/${userId}/read-all`);
            setNotifications(prev => prev.map(n => ({ ...n, status: "READ" })));
        } catch (err) {
            console.error(err);
        }
    };

    const handleActionClick = (n) => {
        if (n.status === "UNREAD") markAsRead(n.id);
        if (n.type === "MEETING") navigate(`/meetings/${n.referenceId}`);
        if (n.type === "MOM") navigate(`/meetings/${n.referenceId}/mom`);
    };

    const filteredNotifications = notifications.filter(n => filter === "ALL" || n.type === filter);

    return (
        <div style={{ minHeight: "100vh", background: "#f8fafc", padding: "40px 5%" }}>
            <div style={{ maxWidth: "800px", margin: "0 auto" }}>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                    <div>
                        <button onClick={() => navigate(-1)} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px", fontSize: "14px", fontWeight: "600" }}>
                            ← Back
                        </button>
                        <h1 style={{ margin: 0, fontSize: "28px", color: "#1e293b", fontWeight: "800" }}>Notification Center</h1>
                    </div>

                    <button
                        onClick={markAllAsRead}
                        disabled={notifications.every(n => n.status === "READ")}
                        style={{
                            background: "white", border: "1px solid #cbd5e1", padding: "10px 16px",
                            borderRadius: "8px", color: "#475569", fontWeight: "600", cursor: "pointer",
                            opacity: notifications.every(n => n.status === "READ") ? "0.5" : "1"
                        }}
                    >
                        ✓ Mark All as Read
                    </button>
                </div>

                <div style={{ display: "flex", gap: "12px", marginBottom: "24px" }}>
                    {["ALL", "MEETING", "MOM", "WORKFLOW"].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            style={{
                                background: filter === f ? "#e0e7ff" : "white",
                                color: filter === f ? "#4338ca" : "#64748b",
                                border: `1px solid ${filter === f ? "#c7d2fe" : "#e2e8f0"}`,
                                padding: "8px 16px", borderRadius: "20px", fontSize: "14px", fontWeight: "600",
                                cursor: "pointer", transition: "all 0.2s"
                            }}
                        >
                            {f === "ALL" ? "All" : f}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <p style={{ textAlign: "center", color: "#64748b", padding: "40px" }}>Loading notifications...</p>
                ) : filteredNotifications.length === 0 ? (
                    <div style={{ background: "white", padding: "48px", borderRadius: "16px", textAlign: "center", border: "1px solid #e2e8f0" }}>
                        <div style={{ fontSize: "40px", marginBottom: "16px" }}>📭</div>
                        <h3 style={{ margin: "0 0 8px 0", color: "#1e293b" }}>You're all caught up!</h3>
                        <p style={{ margin: 0, color: "#64748b" }}>No notifications match your current filter.</p>
                    </div>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "16px", maxHeight: "65vh", overflowY: "auto", paddingRight: "8px" }}>
                        {filteredNotifications.map(n => (
                            <div
                                key={n.id}
                                style={{
                                    background: "white", border: "1px solid #e2e8f0", borderRadius: "16px",
                                    padding: "20px", display: "flex", gap: "16px", alignItems: "flex-start",
                                    boxShadow: n.status === "UNREAD" ? "0 4px 20px rgba(59, 130, 246, 0.08)" : "none",
                                    borderLeft: n.status === "UNREAD" ? "4px solid #3b82f6" : "1px solid #e2e8f0",
                                    transition: "all 0.2s"
                                }}
                            >
                                <div style={{
                                    width: "48px", height: "48px", borderRadius: "12px", display: "flex",
                                    alignItems: "center", justifyContent: "center", fontSize: "20px",
                                    background: n.type === "MEETING" ? "#dbeafe" : n.type === "MOM" ? "#fce7f3" : "#fef3c7",
                                    color: n.type === "MEETING" ? "#1e40af" : n.type === "MOM" ? "#be185d" : "#b45309",
                                    flexShrink: 0
                                }}>
                                    {n.type === "MEETING" ? "📅" : n.type === "MOM" ? "📝" : "🔔"}
                                </div>

                                <div style={{ flex: 1 }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                                        <h4 style={{ margin: 0, fontSize: "16px", color: n.status === "UNREAD" ? "#1e293b" : "#475569" }}>
                                            {n.title}
                                        </h4>
                                        <span style={{ fontSize: "12px", color: "#94a3b8" }}>
                                            {new Date(n.createdAt).toLocaleString()}
                                        </span>
                                    </div>
                                    <p style={{ margin: "0 0 16px 0", color: "#475569", fontSize: "14px", lineHeight: "1.5" }}>{n.message}</p>

                                    <div style={{ display: "flex", gap: "12px" }}>
                                        <button
                                            onClick={() => handleActionClick(n)}
                                            style={{
                                                background: "#3b82f6", color: "white", border: "none", padding: "8px 16px",
                                                borderRadius: "8px", fontSize: "13px", fontWeight: "600", cursor: "pointer"
                                            }}
                                        >
                                            View Details
                                        </button>
                                        {n.status === "UNREAD" && (
                                            <button
                                                onClick={() => markAsRead(n.id)}
                                                style={{
                                                    background: "white", color: "#64748b", border: "1px solid #cbd5e1", padding: "8px 16px",
                                                    borderRadius: "8px", fontSize: "13px", fontWeight: "600", cursor: "pointer"
                                                }}
                                            >
                                                Mark as Read
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

            </div>
        </div>
    );
}
