import React, { useEffect, useState } from "react";
import axios from "axios";
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer,
    PieChart, Pie, Cell, LineChart, Line, Legend
} from "recharts";

export default function AuditAnalytics() {
    const [trend, setTrend] = useState({ monthly: [], predictedNextMonth: 0 });
    const [bottlenecks, setBottlenecks] = useState({ roles: [], bottleneckRole: null, bottleneckAvgHours: 0 });
    const [riskScores, setRiskScores] = useState([]);
    const [ranking, setRanking] = useState([]);
    const [anomalies, setAnomalies] = useState([]);
    const [loading, setLoading] = useState(true);

    // Global summary values
    const totalWorkflows = Object.keys(trend.monthly).length > 0
        ? trend.monthly.reduce((acc, curr) => acc + curr.count, 0) : 0;

    const overallSlaCompliance = ranking.length > 0
        ? (ranking.reduce((acc, curr) => acc + curr.slaCompliance, 0) / ranking.length * 100).toFixed(1)
        : 0;

    useEffect(() => {
        const base = import.meta.env.VITE_API_URL;
        Promise.all([
            axios.get(`${base}/api/auditor/approval-trend`),
            axios.get(`${base}/api/auditor/bottlenecks`),
            axios.get(`${base}/api/auditor/risk-score`),
            axios.get(`${base}/api/auditor/performance-ranking`),
            axios.get(`${base}/api/auditor/anomalies`)
        ])
            .then(([trendRes, bottleneckRes, riskRes, rankRes, anomalyRes]) => {
                setTrend(trendRes.data || { monthly: [], predictedNextMonth: 0 });
                setBottlenecks(bottleneckRes.data || { roles: [], bottleneckRole: null, bottleneckAvgHours: 0 });
                setRiskScores(riskRes.data || []);
                setRanking(rankRes.data || []);
                setAnomalies(anomalyRes.data || []);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Failed to load analytics", err);
                setLoading(false);
            });
    }, []);

    if (loading) return <div className="loading-state">Loading Analytics Dashboard...</div>;

    const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

    // Formatting Pie Chart Data (SLA Compliance overall)
    const pieData = [
        { name: 'Compliant', value: parseFloat(overallSlaCompliance) },
        { name: 'Breached', value: 100 - parseFloat(overallSlaCompliance) }
    ];

    return (
        <div className="audit-analytics-page">
            {/* 🧠 Summary Cards */}
            <div className="summary-cards">
                <div className="summary-card">
                    <div className="card-title">Completed Workflows (6M)</div>
                    <div className="card-value">{totalWorkflows}</div>
                </div>
                <div className="summary-card">
                    <div className="card-title">Overall SLA Compliance</div>
                    <div className="card-value">{overallSlaCompliance}%</div>
                </div>
                <div className="summary-card">
                    <div className="card-title">Most Delayed Role</div>
                    <div className="card-value bad">{bottlenecks.bottleneckRole || "N/A"}</div>
                    <div className="card-sub">{bottlenecks.bottleneckAvgHours.toFixed(1)} hrs avg</div>
                </div>
                <div className="summary-card">
                    <div className="card-title">Anomalies Detected</div>
                    <div className="card-value warning">{anomalies.length}</div>
                </div>
            </div>

            {/* 📊 Charts Grid */}
            <div className="charts-grid">
                {/* Bar chart: Average approval time per role */}
                <div className="chart-card">
                    <h3>Average Approval Time (hrs) per Role</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={bottlenecks.roles}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis dataKey="role" tick={{ fontSize: 12, fill: '#64748b' }} />
                            <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
                            <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} />
                            <Bar dataKey="avgApprovalHours" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Pie chart: SLA compliance percentage */}
                <div className="chart-card">
                    <h3>SLA Compliance Overall</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                <Cell fill="#10b981" />
                                <Cell fill="#ef4444" />
                            </Pie>
                            <Tooltip />
                            <Legend verticalAlign="bottom" height={36} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Line chart: Monthly workflow volume trend */}
                <div className="chart-card">
                    <h3>Monthly Volume Trend & Prediction</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={trend.monthly}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                            <YAxis tick={{ fontSize: 12 }} />
                            <Tooltip />
                            <Line type="monotone" dataKey="count" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                        </LineChart>
                    </ResponsiveContainer>
                    <div className="prediction-label">Next Month Prediction: <strong>{trend.predictedNextMonth.toFixed(0)}</strong></div>
                </div>

                {/* Bar chart: Rejection rate per department */}
                <div className="chart-card">
                    <h3>Rejection Rate by Department</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={riskScores}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="department" tick={{ fontSize: 12 }} />
                            <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} />
                            <Tooltip formatter={(v) => `${(v * 100).toFixed(1)}%`} />
                            <Bar dataKey="rejectionRate" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Top Risk Users & Anomalies */}
            <div className="bottom-grid">
                <div className="data-card">
                    <h3>Top Risk Approvers</h3>
                    <table className="mini-table">
                        <thead>
                            <tr>
                                <th>Approver ID</th>
                                <th>Avg Time (min)</th>
                                <th>SLA Compliance</th>
                            </tr>
                        </thead>
                        <tbody>
                            {ranking.slice().sort((a, b) => a.slaCompliance - b.slaCompliance).slice(0, 5).map(r => (
                                <tr key={r.approverId}>
                                    <td>User {r.approverId}</td>
                                    <td>{r.avgApprovalMinutes.toFixed(1)}</td>
                                    <td><span className="bad-text">{(r.slaCompliance * 100).toFixed(0)}%</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="data-card anomalies-card">
                    <h3>Suspicious Activity / Anomalies</h3>
                    {anomalies.length === 0 ? (
                        <p className="no-data">No anomalies detected recently.</p>
                    ) : (
                        <div className="anomaly-list">
                            {anomalies.map((a, i) => (
                                <div className="anomaly-item" key={i}>
                                    <div className="anomaly-icon">
                                        {a.type === 'FAST_ACTION' ? '⚡' : '🌙'}
                                    </div>
                                    <div className="anomaly-details">
                                        <div className="anomaly-type">{a.type.replace('_', ' ')}</div>
                                        <div className="anomaly-desc">{a.description} (Req #{a.requestId})</div>
                                        <div className="anomaly-time">{new Date(a.time).toLocaleString()}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <style>{`
        .audit-analytics-page {
          display: flex; flex-direction: column; gap: 24px;
          animation: fadeIn 0.4s ease-out;
        }
        
        .summary-cards {
          display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;
        }
        .summary-card {
          background: white; border-radius: 12px; padding: 20px;
          border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
          display: flex; flex-direction: column; gap: 8px;
        }
        .card-title { font-size: 13px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; }
        .card-value { font-size: 28px; font-weight: 800; color: #0f172a; line-height: 1; }
        .card-value.bad { color: #ef4444; }
        .card-value.warning { color: #f59e0b; }
        .card-sub { font-size: 13px; color: #94a3b8; }

        .charts-grid {
          display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 20px;
        }
        .chart-card {
          background: white; border-radius: 12px; padding: 20px; border: 1px solid #e2e8f0;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
        }
        .chart-card h3 { margin: 0 0 16px 0; font-size: 16px; color: #1e293b; }
        .prediction-label { text-align: center; font-size: 13px; color: #64748b; margin-top: 10px; }

        .bottom-grid {
          display: grid; grid-template-columns: 1fr 1fr; gap: 20px;
        }
        @media (max-width: 900px) { .bottom-grid { grid-template-columns: 1fr; } }
        
        .data-card {
          background: white; border-radius: 12px; padding: 20px; border: 1px solid #e2e8f0;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); overflow: hidden;
        }
        .data-card h3 { margin: 0 0 16px 0; font-size: 16px; color: #1e293b; border-bottom: 1px solid #f1f5f9; padding-bottom: 10px; }
        
        .mini-table { width: 100%; border-collapse: collapse; font-size: 13px; }
        .mini-table th { text-align: left; padding: 8px; border-bottom: 2px solid #e2e8f0; color: #64748b; }
        .mini-table td { padding: 10px 8px; border-bottom: 1px solid #f1f5f9; color: #334155; font-weight: 500;}
        .bad-text { color: #ef4444; font-weight: 700; }

        .anomaly-list { display: flex; flex-direction: column; gap: 12px; max-height: 300px; overflow-y: auto; padding-right: 5px; }
        .anomaly-item {
          display: flex; gap: 15px; padding: 12px; border-radius: 8px;
          background: #fffbeb; border-left: 4px solid #f59e0b;
        }
        .anomaly-icon { font-size: 20px; display: flex; align-items: center; justify-content: center; }
        .anomaly-details { display: flex; flex-direction: column; gap: 4px; }
        .anomaly-type { font-size: 13px; font-weight: 700; color: #92400e; }
        .anomaly-desc { font-size: 13px; color: #b45309; }
        .anomaly-time { font-size: 11px; color: #d97706; }
        
        .no-data { color: #94a3b8; font-style: italic; font-size: 14px; }
        .loading-state { padding: 40px; text-align: center; color: #64748b; font-weight: 500; }

        /* Scrollbar for anomalies */
        .anomaly-list::-webkit-scrollbar { width: 6px; }
        .anomaly-list::-webkit-scrollbar-track { background: transparent; }
        .anomaly-list::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
      `}</style>
        </div>
    );
}
