// AuditorDashboard.jsx - LIGHT PROFESSIONAL THEME
import React, { useEffect, useState } from "react";
import axios from "axios";

function getStatusMeta(status) {
  const s = String(status || "");
  if (s.startsWith("PENDING_ESCALATED")) {
    return { label: "ESCALATED", cls: "escalated" };
  }
  if (s.startsWith("ESCALATED_")) {
    return { label: "ESCALATED", cls: "escalated" };
  }
  if (s === "AUTO_REJECTED" || s === "zREJECTED") {
    return { label: "AUTO_REJECTED", cls: "auto_rejected" };
  }
  if (s === "PENDING") return { label: "PENDING", cls: "pending" };
  if (s === "APPROVED") return { label: "APPROVED", cls: "approved" };
  if (s === "REJECTED") return { label: "REJECTED", cls: "rejected" };
  return { label: s || "-", cls: "pending" };
}

const AuditTable = ({ requests, onViewDetails }) => (
  <div className="audit-table-wrapper">
    <table className="audit-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Initiator</th>
          <th>Name</th>
          <th>Status</th>
          <th>Level</th>
          <th>Approver</th>
          <th>Action Time</th>
          <th className="action-col">Action</th>
        </tr>
      </thead>
      <tbody>
        {requests.map((r, index) => {
          const req = r.request;
          const last = r.lastAction;
          return (
            <tr key={req.id} style={{ animationDelay: `${index * 0.03}s` }}>
              <td data-label="ID"><strong>{req.id}</strong></td>
              <td data-label="Initiator">{req.initiatorId}</td>
              <td data-label="Name" className="name">
                {r.initiatorName}
              </td>
              <td data-label="Status">
                {(() => {
                  const meta = getStatusMeta(req.status);
                  return (
                    <span className={`status-pill status-${meta.cls}`}>
                      {meta.label}
                    </span>
                  );
                })()}
              </td>
              <td data-label="Level">
                <span className="level-badge">{req.currentLevel}</span>
              </td>
              <td data-label="Approver">{last?.approverId ?? "-"}</td>
              <td data-label="Action Time">
                {last ? new Date(last.actionAt).toLocaleString() : "-"}
              </td>
              <td data-label="Action" className="action-col">
                <button className="view-btn" onClick={() => onViewDetails(r)}>
                  View Details
                </button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
);

const AuditDetailsModal = ({ request, parsedData, requestLogs, onClose }) => (
  <div className="overlay" onClick={onClose}>
    <div className="modal" onClick={(e) => e.stopPropagation()}>
      <div className="modal-header">
        <h3 className="modal-title">Request #{request.id} Details</h3>
        <button className="close-btn" onClick={onClose}>
          ×
        </button>
      </div>
      <div className="modal-content">
        <div className="info-grid">
          <div className="info-item">
            <strong>Status:</strong>{" "}
            {(() => {
              const meta = getStatusMeta(request.status);
              return (
                <span className={`status-pill status-${meta.cls}`}>
                  {meta.label}
                </span>
              );
            })()}
          </div>
          <div className="info-item">
            <strong>Initiator ID:</strong> {request.initiatorId}
          </div>
          <div className="info-item">
            <strong>Current Level:</strong> {request.currentLevel}
          </div>
          <div className="info-item">
            <strong>Created:</strong>{" "}
            {new Date(request.createdAt).toLocaleString()}
          </div>
        </div>

        <h4 className="section-title">Request Data</h4>
        {Object.keys(parsedData).length === 0 ? (
          <div className="empty-state-small">
            <span className="empty-emoji">📋</span> No custom fields found.
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Field</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(parsedData).map(([k, v]) => (
                <tr key={k}>
                  <td className="key-col">{k}</td>
                  <td className="value-col">{String(v)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <h4 className="section-title">Approval Logs</h4>
        {(!Array.isArray(requestLogs) || requestLogs.length === 0) ? (
          <div className="empty-state-small">
            <span className="empty-emoji">⏳</span> No actions recorded yet.
          </div>
        ) : (
          <table className="logs-table">
            <thead>
              <tr>
                <th>Level</th>
                <th>Role</th>
                <th>Action</th>
                <th>Approver</th>
                <th>Remarks</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {requestLogs.map((l) => (
                <tr key={l.id}>
                  <td>{l.levelNo}</td>
                  <td>{l.role}</td>
                  <td>
                    <span className={`status-pill status-${String(l.action || 'unknown').toLowerCase()}`}>
                      {l.action || 'UNKNOWN'}
                    </span>
                  </td>
                  <td>{l.approverId ?? "SYSTEM"}</td>
                  <td className="remarks-col">{l.remarks || "-"}</td>
                  <td>{l.actionAt ? new Date(l.actionAt).toLocaleString() : "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  </div>
);

const LoadingSpinner = () => (
  <div className="loading-screen">
    <div className="spinner-container">
      <div className="spinner"></div>
      <p>Loading audit data...</p>
    </div>
  </div>
);

const EmptyState = () => (
  <div className="empty-state">
    <div className="empty-icon">🔍</div>
    <h4>No audit requests found</h4>
    <p>Try adjusting your search or wait for new activity.</p>
  </div>
);

export default function AuditorDashboard() {
  const [requestSummary, setRequestSummary] = useState([]);
  const [searchUserId, setSearchUserId] = useState("");
  const [globalStats, setGlobalStats] = useState({ total: 0, pending: 0, completed: 0 });
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [requestLogs, setRequestLogs] = useState([]);
  const [parsedRequestData, setParsedRequestData] = useState({});
  const [loading, setLoading] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalRequests, setTotalRequests] = useState(0);

  // AI analytics state
  const [trend, setTrend] = useState({ monthly: [], predictedNextMonth: 0 });
  const [bottlenecks, setBottlenecks] = useState({
    roles: [],
    bottleneckRole: null,
    bottleneckAvgHours: 0,
  });
  const [riskScores, setRiskScores] = useState([]);
  const [ranking, setRanking] = useState([]);

  const loadSummary = () => {
    setLoading(true);
    axios
      .get(`${import.meta.env.VITE_API_URL}/api/summary`, {
        params: { page: page, size: 10 },
      })
      .then((res) => {
        setRequestSummary(res.data.data);
        setTotalPages(res.data.totalPages);
        setTotalRequests(res.data.totalElements);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadSummary();
  }, [page]);

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_URL}/api/requests`)
      .then(res => {
        const reqs = res.data || [];
        setGlobalStats({
          total: reqs.length,
          pending: reqs.filter(r => String(r.status).startsWith('PENDING') || String(r.status).startsWith('ESCALATED')).length,
          completed: reqs.filter(r => ['APPROVED', 'REJECTED', 'AUTO_REJECTED', 'zREJECTED'].includes(String(r.status))).length
        });
      })
      .catch(err => console.error("Failed to fetch global stats", err));
  }, []);

  useEffect(() => {
    const base = import.meta.env.VITE_API_URL;
    Promise.all([
      axios.get(`${base}/api/auditor/approval-trend`),
      axios.get(`${base}/api/auditor/bottlenecks`),
      axios.get(`${base}/api/auditor/risk-score`),
      axios.get(`${base}/api/auditor/performance-ranking`),
    ])
      .then(([trendRes, bottleneckRes, riskRes, rankRes]) => {
        setTrend(trendRes.data || { monthly: [], predictedNextMonth: 0 });
        setBottlenecks(
          bottleneckRes.data || {
            roles: [],
            bottleneckRole: null,
            bottleneckAvgHours: 0,
          }
        );
        setRiskScores(riskRes.data || []);
        setRanking(rankRes.data || []);
      })
      .catch((err) => console.error("Failed to load auditor analytics", err));
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Ensure full page scrolling is permitted
  useEffect(() => {
    document.body.style.overflow = "auto";
    document.documentElement.style.overflow = "auto";
  }, []);

  const openDetails = (r) => {
    const req = r?.request;
    if (!req) return;
    setSelectedRequest(req);
    try {
      setParsedRequestData(req.requestData ? JSON.parse(req.requestData) : {});
    } catch {
      setParsedRequestData({});
    }
    axios
      .get(`${import.meta.env.VITE_API_URL}/api/audit/request/${req.id}`)
      .then((res) => setRequestLogs(res.data))
      .catch(() => setRequestLogs([]));
  };

  const filteredRequests = Array.isArray(requestSummary) ? requestSummary.filter((r) => {
    if (!searchUserId) return true;
    return (
      String(r.request.initiatorId).includes(searchUserId) ||
      String(r.lastAction?.approverId ?? "").includes(searchUserId)
    );
  }) : [];

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
                <span className="title-icon">🔍</span> Auditor Dashboard
              </h1>
              <p className="page-subtitle">Monitor and audit workflow approvals</p>
            </div>
            <div className="header-actions">
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-value">{globalStats.total}</div>
                  <div className="stat-label">Total Requests</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{globalStats.pending}</div>
                  <div className="stat-label">Pending Approval</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{globalStats.completed}</div>
                  <div className="stat-label">Completed</div>
                </div>
              </div>
              <button className="logout-btn" onClick={handleLogout}>
                🚪 Logout
              </button>
            </div>
          </div>
        </header>

        <main className="main-content">
          <section className="content-section analytics-section">
            <div className="analytics-grid">
              <div className="analytics-card">
                <h3>Approval Trend (Last 6 Months)</h3>
                {(!Array.isArray(trend?.monthly) || trend.monthly.length === 0) ? (
                  <p className="analytics-empty">No data yet.</p>
                ) : (
                  <ul className="analytics-list">
                    {trend.monthly.map((m) => (
                      <li key={m.month}>
                        <span>{m.month}</span>
                        <strong>{m.count}</strong>
                      </li>
                    ))}
                  </ul>
                )}
                <div className="analytics-footer">
                  Predicted next month: <strong>{trend.predictedNextMonth.toFixed(1)}</strong>
                </div>
              </div>

              <div className="analytics-card">
                <h3>Bottleneck Role</h3>
                {bottlenecks.bottleneckRole ? (
                  <>
                    <p>Role: <strong>{bottlenecks.bottleneckRole}</strong></p>
                    <p>Avg Time: <strong>{bottlenecks.bottleneckAvgHours.toFixed(1)} hrs</strong></p>
                  </>
                ) : (
                  <p className="analytics-empty">No clear bottleneck detected.</p>
                )}
              </div>

              <div className="analytics-card">
                <h3>Top Risk Departments</h3>
                {(!Array.isArray(riskScores) || riskScores.length === 0) ? (
                  <p className="analytics-empty">No department data yet.</p>
                ) : (
                  <ul className="analytics-list">
                    {riskScores
                      .slice()
                      .sort((a, b) => b.riskScore - a.riskScore)
                      .slice(0, 3)
                      .map((d) => (
                        <li key={d.department}>
                          <span>{d.department}</span>
                          <strong>{d.riskScore.toFixed(2)}</strong>
                        </li>
                      ))}
                  </ul>
                )}
              </div>

              <div className="analytics-card">
                <h3>Approver Performance</h3>
                {(!Array.isArray(ranking) || ranking.length === 0) ? (
                  <p className="analytics-empty">No approvals yet.</p>
                ) : (
                  <table className="analytics-table">
                    <thead>
                      <tr>
                        <th>Approver ID</th>
                        <th>Avg (min)</th>
                        <th>SLA %</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ranking.slice(0, 5).map((r) => (
                        <tr key={r.approverId}>
                          <td>{r.approverId}</td>
                          <td>{r.avgApprovalMinutes.toFixed(1)}</td>
                          <td>{(r.slaCompliance * 100).toFixed(0)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </section>

          <section className="content-section audit-section">
            <div className="section-header">
              <h3>Audit Requests</h3>
              <div className="search-container">
                <input
                  className="search-input"
                  placeholder="Search Initiator / Approver ID..."
                  value={searchUserId}
                  onChange={(e) => setSearchUserId(e.target.value)}
                />
              </div>
            </div>

            {loading ? (
              <LoadingSpinner />
            ) : filteredRequests.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="audit-table-container">
                <AuditTable requests={filteredRequests} onViewDetails={openDetails} />

                {/* Pagination fixed to the bottom of the container */}
                <div className="pagination">
                  <button
                    className="page-btn"
                    disabled={page === 0}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    ◀ Prev
                  </button>
                  <span className="page-info">Page {page + 1} of {totalPages}</span>
                  <button
                    className="page-btn"
                    disabled={page + 1 >= totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next ▶
                  </button>
                </div>
              </div>
            )}
          </section>
        </main>
      </div>

      {selectedRequest && (
        <AuditDetailsModal
          request={selectedRequest}
          parsedData={parsedRequestData}
          requestLogs={requestLogs}
          onClose={() => {
            setSelectedRequest(null);
            setRequestLogs([]);
            setParsedRequestData({});
          }}
        />
      )}

      <style>{`
        /* RESET & BASE */
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { 
          min-height: 100vh;
          font-family: system-ui, -apple-system, sans-serif;
          background: #f1f5f9;
        }

        .auditor-app-wrapper {
          min-height: 100vh; 
          display: flex; 
          flex-direction: column; 
        }

        /* HEADER */
        .auditor-header {
          position: sticky; top: 0; 
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(12px); 
          border-bottom: 1px solid #e2e8f0;
          z-index: 100; 
          padding: 20px 5%; 
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
          transition: all 0.3s ease;
        }
        .auditor-header.scrolled { padding: 12px 5%; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); }
        .header-content {
          max-width: 1600px; margin: 0 auto; display: flex;
          justify-content: space-between; align-items: center; gap: 24px; width: 100%;
        }
        .header-left h1 { margin: 0 0 4px 0; font-size: 28px; font-weight: 800; color: #0f172a; display: flex; align-items: center; gap: 10px; }
        .title-icon { font-size: 24px; }
        .page-subtitle { margin: 0; font-size: 15px; color: #64748b; font-weight: 500; }
        .header-actions { display: flex; align-items: center; gap: 20px; }
        .stats-grid { display: flex; gap: 12px; }
        
        .stat-card {
          background: #f8fafc; padding: 10px 16px; border-radius: 10px; border: 1px solid #e2e8f0;
          text-align: center; min-width: 100px;
        }
        .stat-value { font-size: 20px; font-weight: 800; color: #2563eb; line-height: 1; }
        .stat-label { font-size: 12px; color: #64748b; margin-top: 4px; font-weight: 600; }

        .logout-btn {
          background: white; color: #0f172a; border: 1px solid #cbd5e1;
          padding: 10px 18px; border-radius: 8px; font-size: 14px; font-weight: 600;
          cursor: pointer; transition: all 0.2s ease; box-shadow: 0 1px 2px rgba(0,0,0,0.05);
        }
        .logout-btn:hover { background: #fef2f2; color: #ef4444; border-color: #fca5a5; }

        /* MAIN CONTENT LAYOUT */
        .main-content { 
          flex: 1; max-width: 1600px; margin: 0 auto; 
          padding: 30px 5% 60px; width: 100%; 
          display: flex; flex-direction: column;
          min-width: 0; /* Flexbox containment fix */
        }
        
        .content-section { 
          display: flex; flex-direction: column; width: 100%; min-width: 0; 
        }

        /* ANALYTICS */
        .analytics-grid {
          display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 20px; margin-bottom: 30px;
        }
        .analytics-card {
          background: white; border-radius: 12px; padding: 20px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1); border: 1px solid #e2e8f0;
        }
        .analytics-card h3 { margin: 0 0 12px 0; font-size: 16px; font-weight: 700; color: #0f172a; }
        .analytics-list { list-style: none; padding: 0; margin: 0; font-size: 14px; color: #334155; }
        .analytics-list li { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #f1f5f9; }
        .analytics-list li:last-child { border-bottom: none; }
        .analytics-footer { margin-top: 12px; font-size: 13px; color: #64748b; background: #f8fafc; padding: 8px; border-radius: 6px; text-align: center; }
        .analytics-empty { font-size: 14px; color: #94a3b8; font-style: italic; }
        .analytics-table { width: 100%; border-collapse: collapse; font-size: 13px; }
        .analytics-table th, .analytics-table td { padding: 8px; border-bottom: 1px solid #f1f5f9; text-align: left; color: #334155; }

        /* TABLE SECTION HEADERS */
        .section-header {
          display: flex; justify-content: space-between; align-items: center; gap: 16px; margin-bottom: 16px; flex-wrap: wrap;
        }
        .section-header h3 { margin: 0; font-size: 22px; font-weight: 700; color: #0f172a; }
        .search-container { width: 100%; max-width: 320px; }
        .search-input {
          width: 100%; padding: 10px 16px; border-radius: 8px; border: 1px solid #cbd5e1;
          font-size: 14px; transition: border-color 0.2s;
        }
        .search-input:focus { outline: none; border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1); }

        /* PROPER SCROLLING TABLE CONTAINER */
        .audit-table-container {
          width: 100%; background: white; border-radius: 16px; 
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          border: 1px solid #e2e8f0;
          overflow: hidden; /* Prevents rounded corner breakout */
          display: flex; flex-direction: column;
        }
        
        /* THIS IS THE MAGIC WRAPPER - IT HANDLES BOTH X & Y SCROLL */
        .audit-table-wrapper {
          width: 100%;
          min-height: 400px;
          max-height: 75vh; /* Allows up to 75% of viewport height before scrolling internally */
          overflow: auto; /* Adds scrollbars ONLY when needed */
        }
        
        /* Stylish Scrollbars */
        .audit-table-wrapper::-webkit-scrollbar { width: 8px; height: 10px; }
        .audit-table-wrapper::-webkit-scrollbar-track { background: #f8fafc; }
        .audit-table-wrapper::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; border: 2px solid #f8fafc; }
        .audit-table-wrapper::-webkit-scrollbar-thumb:hover { background: #94a3b8; }

        .audit-table { 
          width: 100%; border-collapse: separate; border-spacing: 0; 
          min-width: 1050px; /* Forces horizontal scroll on small screens */
          font-size: 14px; 
        }
        
        /* STICKY HEADER FIXED RELATIVE TO WRAPPER */
        .audit-table thead th {
          position: sticky; top: 0; z-index: 20;
          background: #0f172a; /* Solid dark color so rows don't show through */
          color: white; padding: 16px; font-weight: 600; font-size: 13px; 
          text-transform: uppercase; letter-spacing: 0.5px; 
          text-align: left;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        /* Right align action column */
        .action-col { text-align: right !important; }

        .audit-table tbody tr { transition: background 0.2s; }
        .audit-table tbody td {
          padding: 16px; border-bottom: 1px solid #e2e8f0; color: #334155; vertical-align: middle;
          background: white; /* Important for scroll overlaps */
        }
        .audit-table tbody tr:hover td { background: #f8fafc; color: #0f172a; }

        .level-badge { background: #f1f5f9; color: #475569; padding: 4px 8px; border-radius: 6px; font-weight: 600; font-size: 12px; }
        .name { font-weight: 600; color: #0f172a; }
        
        .status-pill {
          padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 700; display: inline-block;
        }
        .status-approved { background: #d1fae5; color: #065f46; }
        .status-rejected { background: #fee2e2; color: #991b1b; }
        .status-escalated { background: #ffedd5; color: #9a3412; }
        .status-auto_rejected { background: #7f1d1d; color: white; }
        .status-pending { background: #dbeafe; color: #1e40af; }
        
        .view-btn {
          background: white; color: #2563eb; border: 1px solid #bfdbfe; 
          padding: 6px 14px; border-radius: 6px; font-weight: 600; cursor: pointer; 
          font-size: 13px; transition: all 0.2s;
        }
        .view-btn:hover { background: #eff6ff; border-color: #93c5fd; }

        /* PAGINATION STYLES */
        .pagination {
          display: flex; justify-content: space-between; align-items: center;
          padding: 16px 24px; background: white; border-top: 1px solid #e2e8f0;
          z-index: 10;
        }
        .page-info { font-weight: 600; font-size: 14px; color: #475569; }
        .page-btn {
          padding: 8px 16px; border-radius: 6px; border: 1px solid #cbd5e1;
          background: white; color: #0f172a; font-weight: 600; font-size: 13px;
          cursor: pointer; transition: all 0.2s;
        }
        .page-btn:hover:not(:disabled) { background: #f8fafc; border-color: #94a3b8; }
        .page-btn:disabled { cursor: not-allowed; opacity: 0.5; background: #f1f5f9; }

        /* MODAL STYLES */
        .overlay {
          position: fixed; inset: 0; background: rgba(15, 23, 42, 0.6); 
          backdrop-filter: blur(4px); display: flex; align-items: center; 
          justify-content: center; z-index: 1000;
        }
        .modal {
          background: white; border-radius: 16px; width: 90%; max-width: 800px; 
          max-height: 85vh; display: flex; flex-direction: column; overflow: hidden;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        }
        .modal-header {
          padding: 20px 24px; display: flex; justify-content: space-between; 
          align-items: center; border-bottom: 1px solid #e2e8f0; background: #f8fafc;
        }
        .modal-title { margin: 0; font-size: 18px; font-weight: 700; color: #0f172a; }
        .close-btn { background: none; border: none; font-size: 24px; color: #64748b; cursor: pointer; line-height: 1;}
        .close-btn:hover { color: #ef4444; }
        
        .modal-content { flex: 1; overflow-y: auto; padding: 24px; }
        .info-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; margin-bottom: 24px; }
        .info-item { background: #f8fafc; padding: 12px 16px; border-radius: 8px; font-size: 14px; border: 1px solid #e2e8f0; }
        .info-item strong { color: #475569; display: block; margin-bottom: 4px; font-size: 12px; text-transform: uppercase; }
        
        .section-title { font-size: 16px; font-weight: 700; color: #0f172a; margin: 0 0 12px 0; border-bottom: 2px solid #f1f5f9; padding-bottom: 8px;}
        
        .data-table, .logs-table { width: 100%; border-collapse: collapse; margin-bottom: 24px; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; }
        .data-table th, .logs-table th { background: #f8fafc; color: #475569; padding: 10px 14px; font-size: 13px; text-transform: uppercase; text-align: left; border-bottom: 1px solid #e2e8f0; }
        .data-table td, .logs-table td { padding: 12px 14px; border-bottom: 1px solid #f1f5f9; font-size: 14px; color: #334155; }
        .key-col { font-weight: 600; width: 30%; background: #fafaf9; }
        .remarks-col { max-width: 250px; font-style: italic; color: #64748b; }
        .empty-state-small { padding: 20px; text-align: center; color: #64748b; font-size: 14px; background: #f8fafc; border-radius: 8px; margin-bottom: 24px; border: 1px dashed #cbd5e1; }

        /* LOADING & EMPTY STATES */
        .loading-screen { padding: 60px; display: flex; justify-content: center; align-items: center; }
        .spinner { width: 40px; height: 40px; border: 3px solid #e2e8f0; border-top-color: #2563eb; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 16px;}
        @keyframes spin { to { transform: rotate(360deg); } }
        .spinner-container p { color: #64748b; font-weight: 500; margin: 0;}
        
        .empty-state { text-align: center; padding: 60px 20px; }
        .empty-icon { font-size: 48px; opacity: 0.5; margin-bottom: 16px; }
        .empty-state h4 { margin: 0 0 8px 0; font-size: 18px; color: #0f172a; }
        .empty-state p { margin: 0; color: #64748b; font-size: 14px; }

        /* RESPONSIVE */
        @media (max-width: 768px) {
          .header-content { flex-direction: column; align-items: flex-start; gap: 16px; }
          .header-actions { width: 100%; justify-content: space-between; }
          .main-content { padding: 20px 5%; }
          .search-container { max-width: 100%; }
        }
      `}</style>
    </>
  );
}