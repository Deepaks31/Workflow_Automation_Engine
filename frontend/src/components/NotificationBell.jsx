import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function NotificationBell() {
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [recentNotifications, setRecentNotifications] = useState([]);
    const navigate = useNavigate();
    const userId = localStorage.getItem("userId");

    useEffect(() => {
        if (!userId) return;
        const fetchUnread = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/notifications/user/${userId}/unread`);
                setUnreadCount(res.data.length);
                setRecentNotifications(res.data.slice(0, 5)); // show top 5 unread in dropdown
            } catch (err) {
                console.error("Failed to fetch notifications", err);
            }
        };
        fetchUnread();

        // Poll every 15 seconds
        const interval = setInterval(fetchUnread, 15000);
        return () => clearInterval(interval);
    }, [userId]);

    const markAsRead = async (id, e) => {
        e.stopPropagation();
        try {
            await axios.put(`${import.meta.env.VITE_API_URL}/api/notifications/${id}/read`);
            setUnreadCount((prev) => Math.max(0, prev - 1));
            setRecentNotifications(recentNotifications.filter(n => n.id !== id));
        } catch (err) {
            console.error(err);
        }
    };

    const handleNotificationClick = (n) => {
        if (n.status === "UNREAD") {
            axios.put(`${import.meta.env.VITE_API_URL}/api/notifications/${n.id}/read`).catch(console.error);
        }
        setIsOpen(false);

        // Navigate based on type
        if (n.type === "MEETING") {
            navigate(`/meetings/${n.referenceId}`);
        } else if (n.type === "MOM") {
            navigate(`/meetings/${n.referenceId}/mom`);
        } else {
            navigate("/notifications");
        }
    };

    return (
        <div className="notification-bell-wrapper" style={{ position: "relative" }}>
            <button
                className="bell-btn"
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    background: "transparent", border: "none", fontSize: "24px",
                    cursor: "pointer", position: "relative", padding: "8px"
                }}
            >
                🔔
                {unreadCount > 0 && (
                    <span
                        className="badge"
                        style={{
                            position: "absolute", top: "0", right: "0", background: "#ef4444",
                            color: "white", fontSize: "12px", fontWeight: "bold", padding: "2px 6px",
                            borderRadius: "50%", border: "2px solid white"
                        }}
                    >
                        {unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div
                    className="dropdown-menu"
                    style={{
                        position: "absolute", right: "0", top: "100%", width: "320px",
                        background: "white", borderRadius: "12px", boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
                        padding: "16px", zIndex: 1000, border: "1px solid rgba(0,0,0,0.05)"
                    }}
                >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                        <h4 style={{ margin: 0, fontSize: "16px", color: "#1f2937" }}>Notifications</h4>
                        <button
                            onClick={() => { setIsOpen(false); navigate("/notifications"); }}
                            style={{ background: "none", border: "none", color: "#3b82f6", cursor: "pointer", fontSize: "13px", fontWeight: "600" }}
                        >
                            View All
                        </button>
                    </div>

                    <div style={{ maxHeight: "300px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "8px" }}>
                        {recentNotifications.length === 0 ? (
                            <p style={{ color: "#6b7280", fontSize: "14px", textAlign: "center", margin: "20px 0" }}>No new notifications.</p>
                        ) : (
                            recentNotifications.map(n => (
                                <div
                                    key={n.id}
                                    onClick={() => handleNotificationClick(n)}
                                    style={{
                                        padding: "12px", borderRadius: "8px", background: "#f8fafc",
                                        cursor: "pointer", transition: "background 0.2s", borderLeft: "4px solid #3b82f6"
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = "#f1f5f9"}
                                    onMouseLeave={(e) => e.currentTarget.style.background = "#f8fafc"}
                                >
                                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                                        <strong style={{ fontSize: "13px", color: "#1e293b" }}>{n.title}</strong>
                                        <button
                                            onClick={(e) => markAsRead(n.id, e)}
                                            style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: "16px" }}
                                            title="Mark as read"
                                        >×</button>
                                    </div>
                                    <p style={{ margin: 0, fontSize: "12px", color: "#475569", lineHeight: "1.4" }}>
                                        {n.message.length > 60 ? n.message.substring(0, 60) + "..." : n.message}
                                    </p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
