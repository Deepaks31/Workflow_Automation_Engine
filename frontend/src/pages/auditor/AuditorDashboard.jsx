// AuditorDashboard.jsx - LIGHT PROFESSIONAL THEME with BLACK TABLE HEADER
import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";

const AuditTable = ({ requests, onViewDetails, page, totalPages, setPage }) => (
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
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {requests.map((r) => {
          const req = r.request;
          const last = r.lastAction;
          return (
            <tr key={req.id}>
              <td data-label="ID">{req.id}</td>
              <td data-label="Initiator">{req.initiatorId}</td>
              <td data-label="Name" className="name">
                {r.initiatorName}
              </td>
              <td data-label="Status">
                <span
                  className={`status-pill status-${req.status?.toLowerCase()}`}
                >
                  {req.status}
                </span>
              </td>
              <td data-label="Level">{req.currentLevel}</td>
              <td data-label="Approver">{last?.approverId ?? "-"}</td>
              <td data-label="Action Time">
                {last ? new Date(last.actionAt).toLocaleString() : "-"}
              </td>
              <td data-label="Action">
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
  <div className="overlay">
    <div className="modal">
      <div className="modal-header">
        <h3 className="modal-title">Request #{request.id} Details</h3>
        <button className="close-btn" onClick={onClose}>
          ×
        </button>
      </div>
      <div className="modal-content">
        <div className="info-grid">
          <div className="info-item">
            <strong>Status:</strong> {request.status}
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
          <div className="empty-state" style={{ padding: "30px 16px" }}>
            <div style={{ fontSize: "36px", marginBottom: "12px" }}>📋</div>
            <h4>No custom fields</h4>
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
        {requestLogs.length === 0 ? (
          <div className="empty-state" style={{ padding: "30px 16px" }}>
            <div style={{ fontSize: "36px", marginBottom: "12px" }}>⏳</div>
            <h4>No actions yet</h4>
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
                    <span
                      className={`status-pill status-${l.action.toLowerCase()}`}
                    >
                      {l.action}
                    </span>
                  </td>
                  <td>{l.approverId ?? "SYSTEM"}</td>
                  <td className="remarks-col">{l.remarks || "-"}</td>
                  <td>{new Date(l.actionAt).toLocaleString()}</td>
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
      <p
        style={{
          margin: 0,
          color: "#64748b",
          fontSize: "16px",
          fontWeight: "500",
        }}
      >
        Loading audit data...
      </p>
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
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [requestLogs, setRequestLogs] = useState([]);
  const [parsedRequestData, setParsedRequestData] = useState({});
  const [loading, setLoading] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalRequests, setTotalRequests] = useState(0);

  const loadSummary = () => {
    setLoading(true);

    axios
      .get("http://localhost:8080/api/summary", {
        params: {
          page: page,
          size: 10,
        },
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

  // Scroll effect for header
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Body scroll lock - NO PAGE SCROLL
  useEffect(() => {
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    };
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
      .get(`http://localhost:8080/api/audit/request/${req.id}`)
      .then((res) => setRequestLogs(res.data))
      .catch(() => setRequestLogs([]));
  };

  const filteredRequests = requestSummary.filter((r) => {
    if (!searchUserId) return true;
    return (
      String(r.request.initiatorId).includes(searchUserId) ||
      String(r.lastAction?.approverId ?? "").includes(searchUserId)
    );
  });

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
        {/* Premium Header */}
        <header className={`auditor-header ${scrolled ? "scrolled" : ""}`}>
          <div className="header-content">
            <div className="header-left">
              <h1 className="page-title">
                <span className="title-icon">🔍</span>
                Auditor Dashboard
              </h1>
              <p className="page-subtitle">
                Monitor and audit workflow approvals
              </p>
            </div>
            <div className="header-actions">
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-value">{totalRequests}</div>
                  <div className="stat-label">Total Requests</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{filteredRequests.length}</div>
                  <div className="stat-label">Filtered Results</div>
                </div>
              </div>
              <button className="logout-btn" onClick={handleLogout}>
                🚪 Logout
              </button>
            </div>
          </div>
        </header>

        <main className="main-content">
          <section className="content-section">
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
            {filteredRequests.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="audit-table-container">
                <AuditTable
                  requests={filteredRequests}
                  onViewDetails={openDetails}
                  page={page}
                  totalPages={totalPages}
                  setPage={setPage}
                />

                {/* Pagination */}
                <div className="pagination">
                  <button
                    className="page-btn"
                    disabled={page === 0}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    ◀ Prev
                  </button>

                  <span className="page-info">
                    Page {page + 1} of {totalPages}
                  </span>

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

      {/* Audit Details Modal */}
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
        /* LIGHT PROFESSIONAL THEME - NO PAGE SCROLL */
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { 
          height: 100vh !important; 
          overflow: hidden !important; 
          scrollbar-width: none !important; 
          -ms-overflow-style: none !important; 
        }
        body::-webkit-scrollbar { display: none !important; }
        
        body { 
          font-family: system-ui, -apple-system, sans-serif;
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%);
        }

        .auditor-app-wrapper {
          height: 100vh !important; 
          display: flex; 
          flex-direction: column; 
          overflow: hidden !important;
        }

        /* LIGHT PROFESSIONAL Header */
        .auditor-header {
          position: sticky; top: 0; 
          background: rgba(255, 255, 255, 0.98);
          backdrop-filter: blur(20px); 
          border-bottom: 1px solid rgba(59, 130, 246, 0.2);
          z-index: 100; 
          padding: 20px 5%; 
          box-shadow: 0 4px 20px rgba(59, 130, 246, 0.15);
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          animation: slideDown 0.6s cubic-bezier(0.4, 0, 0.2, 1);
          flex-shrink: 0;
        }
        
        @keyframes slideDown {
          from { transform: translateY(-100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        .auditor-header.scrolled { 
          padding: 16px 5%; 
          box-shadow: 0 8px 30px rgba(59, 130, 246, 0.2);
          backdrop-filter: blur(30px);
        }

        .header-content {
          max-width: 1600px; margin: 0 auto; display: flex;
          justify-content: space-between; align-items: center; gap: 32px; width: 100%;
        }

        .header-left h1 {
          margin: 0 0 6px 0; font-size: 32px; font-weight: 800; color: #1e293b;
          display: flex; align-items: center; gap: 12px;
          animation: fadeInUp 0.8s ease-out; 
        }
        
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .title-icon { 
          font-size: 32px; 
          filter: drop-shadow(0 2px 4px rgba(59, 130, 246, 0.3));
          animation: bounce 2s infinite;
        }
        
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-8px); }
          60% { transform: translateY(-4px); }
        }
        
        .page-subtitle { 
          margin: 0; font-size: 16px; color: #475569; font-weight: 500;
          animation: fadeInUp 1s ease-out 0.2s both;
        }

        .header-actions { display: flex; align-items: center; gap: 24px; }
        .stats-grid { display: flex; gap: 16px; }
        .stat-card {
          background: linear-gradient(135deg, rgba(248, 250, 252, 0.9), rgba(241, 245, 249, 0.9));
          padding: 16px 20px; border-radius: 16px; border: 1px solid rgba(59, 130, 246, 0.2);
          text-align: center; min-width: 120px; box-shadow: 0 4px 15px rgba(59, 130, 246, 0.15);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          animation: fadeInUp 1s ease-out 0.4s both;
        }
        .stat-card:hover { 
          transform: translateY(-2px) scale(1.02); 
          box-shadow: 0 8px 25px rgba(59, 130, 246, 0.25); 
        }
        .stat-value { 
          font-size: 24px; font-weight: 800; 
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
          line-height: 1; display: block;
        }
        .stat-label { font-size: 13px; color: #3b82f6; margin-top: 4px; font-weight: 600; }

        .logout-btn {
          background: linear-gradient(135deg, #f8fafc, #f1f5f9); color: #1e293b; border: 1px solid #e2e8f0;
          padding: 12px 24px; border-radius: 12px; font-size: 15px; font-weight: 600;
          cursor: pointer; transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex; align-items: center; gap: 8px; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
          animation: fadeInUp 1s ease-out 0.6s both;
        }
        .logout-btn:hover { 
          background: #e2e8f0; transform: translateY(-2px) scale(1.02);
          box-shadow: 0 8px 20px rgba(59, 130, 246, 0.25); color: #1e293b;
        }

        /* Main Content */
        .main-content { 
          flex: 1; max-width: 1600px; margin: 0 auto; padding: 40px 5%; width: 100%; overflow: hidden;
          height: calc(100vh - 140px);
        }
        .content-section { height: 100%; display: flex; flex-direction: column; margin-bottom: 0; }
        .section-header {
          display: flex; flex-direction: column; gap: 16px; margin-bottom: 24px;
          animation: fadeInUp 1s ease-out; flex-shrink: 0;
        }
        .section-header h3 { margin: 0; font-size: 28px; font-weight: 700; color: #1e293b; letter-spacing: -0.5px; }
        .search-container { width: 100%; max-width: 400px; }
        .search-input {
          width: 100%; padding: 14px 20px; border-radius: 12px; border: 2px solid #e2e8f0;
          font-size: 15px; background: white; color: #1e293b; transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
        }
        .search-input:focus {
          outline: none; border-color: #3b82f6; box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
        }
        .search-input::placeholder { color: #94a3b8; }

        /* TABLE - SIDE SCROLL ONLY */
        .audit-table-container {
          flex: 1; background: white; border-radius: 20px; box-shadow: 0 15px 40px rgba(59, 130, 246, 0.15);
          overflow: hidden; display: flex; flex-direction: column; animation: fadeInUp 0.6s ease-out;
          max-height: 100%; border: 1px solid rgba(59, 130, 246, 0.2);
        }
        .audit-table-wrapper {
          flex: 1; overflow-y: auto; overflow-x: hidden;
          scrollbar-width: thin; scrollbar-color: #93c5fd #f8fafc;
        }
        .audit-table-wrapper::-webkit-scrollbar {
          width: 8px; height: 0 !important;
        }
        .audit-table-wrapper::-webkit-scrollbar-track {
          background: #f8fafc; border-radius: 4px;
        }
        .audit-table-wrapper::-webkit-scrollbar-thumb {
          background: #93c5fd; border-radius: 4px; border: 2px solid #f8fafc;
        }
        .audit-table-wrapper::-webkit-scrollbar-thumb:hover {
          background: #60a5fa;
        }
        .audit-table-wrapper::-webkit-scrollbar-corner {
          display: none !important;
        }

        .audit-table { width: 100%; border-collapse: collapse; min-width: 1200px; font-size: 15px; }
        .audit-table thead th {
          background: linear-gradient(135deg, #000000, #1a1a2e, #2d2d3f);
          color: white; padding: 20px 16px; font-weight: 700; font-size: 14px; 
          text-transform: uppercase; letter-spacing: 0.5px; position: sticky; top: 0; z-index: 10;
          border-bottom: 2px solid #1a1a2e;
        }
        .audit-table tbody td {
          padding: 20px 16px; border-bottom: 1px solid #f1f5f9; font-size: 15px;
          background: white; color: #1e293b; line-height: 1.5;
        }
        .audit-table tbody tr:hover {
          background: linear-gradient(135deg, #f8fafc, #f1f5f9);
          transform: scale(1.002); box-shadow: 0 4px 15px rgba(59, 130, 246, 0.15);
        }
        .name { font-weight: 600; color: #1e293b; }
        .status-pill {
          padding: 6px 16px; border-radius: 20px; font-size: 12px; font-weight: 700;
          display: inline-block; box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .status-approved { background: linear-gradient(135deg, #10b981, #059669); color: white; }
        .status-rejected { background: linear-gradient(135deg, #ef4444, #dc2626); color: white; }
        .status-escalated { background: linear-gradient(135deg, #f59e0b, #d97706); color: white; }
        .status-pending { 
          background: linear-gradient(135deg, #3b82f6, #1d4ed8); 
          color: white; box-shadow: 0 2px 10px rgba(59, 130, 246, 0.3);
        }
        .view-btn {
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          color: white; border: none; padding: 10px 20px; border-radius: 12px; 
          font-weight: 600; cursor: pointer; font-size: 13px; transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3); text-transform: uppercase; letter-spacing: 0.3px;
        }
        .view-btn:hover {
          transform: translateY(-2px); box-shadow: 0 8px 20px rgba(59, 130, 246, 0.4);
          background: linear-gradient(135deg, #1d4ed8, #1e40af);
        }

        /* MEDIUM SIZE MODAL - PROFESSIONAL */
        .overlay {
          position: fixed; inset: 0; background: rgba(0, 0, 0, 0.5); 
          backdrop-filter: blur(6px); display: flex; align-items: center; 
          justify-content: center; z-index: 10000; animation: fadeIn 0.3s ease-out;
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        
        .modal {
          background: white; border-radius: 20px; width: 85%; max-width: 900px; 
          max-height: 85vh; display: flex; flex-direction: column; overflow: hidden;
          box-shadow: 0 25px 50px rgba(59, 130, 246, 0.25);
          animation: slideIn 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          border: 1px solid rgba(59, 130, 246, 0.15);
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(-20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        
        .modal-header {
          padding: 20px 24px 16px; display: flex; justify-content: space-between; 
          align-items: center; flex-shrink: 0; border-bottom: 1px solid #f1f5f9;
          background: linear-gradient(135deg, #f8fafc, #f1f5f9);
        }
        .modal-title { margin: 0; font-size: 20px; font-weight: 700; color: #1e293b; }
        .close-btn {
          background: rgba(59, 130, 246, 0.1); border: none; font-size: 20px; cursor: pointer; 
          color: #3b82f6; width: 36px; height: 36px; border-radius: 50%; display: flex; 
          align-items: center; justify-content: center; transition: all 0.2s ease; flex-shrink: 0;
        }
        .close-btn:hover { background: #3b82f6; color: white; transform: scale(1.05); }
        
        .modal-content { flex: 1; overflow-y: auto; padding: 24px; }
        .info-grid {
          display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px; margin-bottom: 28px;
        }
        .info-item {
          background: linear-gradient(135deg, #f8fafc, #f1f5f9); padding: 16px 20px;
          border-radius: 12px; font-size: 15px; border: 1px solid rgba(59, 130, 246, 0.15);
        }
        .info-item strong { color: #1e293b; font-weight: 600; }
        
        .section-title {
          font-size: 18px; font-weight: 700; color: #1e293b; margin: 24px 0 16px 0;
          padding-bottom: 8px; border-bottom: 2px solid #e2e8f0;
        }
        .data-table, .logs-table {
          width: 100%; border-collapse: collapse; margin-bottom: 24px;
          background: white; border-radius: 12px; overflow: hidden;
          box-shadow: 0 4px 15px rgba(59, 130, 246, 0.1);
          border: 1px solid rgba(59, 130, 246, 0.1);
        }
        .data-table thead th, .logs-table thead th {
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          color: white; padding: 14px 16px; font-weight: 600; font-size: 13px;
        }
        .data-table tbody td, .logs-table tbody td {
          padding: 14px 16px; border-bottom: 1px solid #f1f5f9; color: #1e293b;
        }
        .data-table tbody tr:hover, .logs-table tbody tr:hover {
          background: #f8fafc;
        }
        .key-col { font-weight: 600; width: 30%; color: #1e293b; }
        .value-col { color: #475569; white-space: pre-wrap; word-break: break-word; }
        .remarks-col { 
          max-width: 220px; background: #f8fafc; padding: 12px; border-radius: 8px;
          white-space: pre-wrap; word-break: break-word; line-height: 1.5;
          border: 1px solid rgba(59, 130, 246, 0.15); color: #1e293b;
        }
        .remarks-col:hover { background: #f1f5f9; }
        
        .modal-actions {
          padding: 0 24px 24px; border-top: 1px solid #f1f5f9; flex-shrink: 0;
        }
        .close-modal-btn {
          width: 100%; padding: 14px; background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          color: white; border: none; border-radius: 12px; font-size: 15px; font-weight: 600;
          cursor: pointer; transition: all 0.3s ease; box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
        }
        .close-modal-btn:hover {
          transform: translateY(-2px); box-shadow: 0 8px 25px rgba(59, 130, 246, 0.4);
          background: linear-gradient(135deg, #1d4ed8, #1e40af);
        }

        /* Loading & Empty States */
        .loading-screen { 
          display: flex; align-items: center; justify-content: center; 
          min-height: calc(100vh - 140px); 
        }
        .spinner-container { display: flex; flex-direction: column; align-items: center; gap: 20px; }
        .spinner {
          width: 50px; height: 50px; border: 4px solid #e2e8f0; border-top: 4px solid #3b82f6;
          border-radius: 50%; animation: spin 1s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .empty-state {
          text-align: center; padding: 80px 40px; background: linear-gradient(135deg, #f8fafc, #f1f5f9);
          border-radius: 20px; box-shadow: 0 15px 40px rgba(59, 130, 246, 0.2);
          animation: fadeInUp 1s ease-out; max-width: 500px; margin: 0 auto;
          border: 1px solid rgba(59, 130, 246, 0.15);
        }
        .empty-icon { font-size: 56px; margin-bottom: 20px; animation: pulse 2s infinite; }
        @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
        .empty-state h4 { color: #1e293b; margin: 0 0 12px 0; font-size: 24px; font-weight: 700; }
        .empty-state p { color: #64748b; margin: 0; font-size: 15px; }

        /* Responsive */
        @media (max-width: 768px) {
          .header-content { flex-direction: column; gap: 20px; align-items: stretch; }
          .header-actions { flex-direction: column; gap: 16px; align-items: stretch; }
          .stats-grid { justify-content: center; }
          .main-content { padding: 24px 5%; height: calc(100vh - 120px); }
          .audit-table { min-width: 1000px; }
          .modal { margin: 16px; width: calc(100% - 32px); max-width: calc(100% - 32px); }
          .info-grid { grid-template-columns: 1fr; }
        }
          .pagination {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 18px;
            padding: 18px;
            user-select: none;
          }

          .page-info {
            font-weight: 600;
            font-size: 14px;
            color: #334155;
            min-width: 120px;
            text-align: center;
          }

          .page-btn {
            padding: 8px 18px;
            border-radius: 10px;
            border: 1px solid #cbd5f5;
            background: linear-gradient(180deg, #ffffff, #f1f5f9);
            color: #1e293b;
            font-weight: 600;
            font-size: 13px;
            cursor: pointer;
            transition: all 0.25s ease;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
          }

          /* Hover */
          .page-btn:hover:not(:disabled) {
            transform: translateY(-1px);
            background: linear-gradient(180deg, #f8fafc, #e2e8f0);
            box-shadow: 0 8px 18px rgba(0, 0, 0, 0.12);
          }

          /* Active click */
          .page-btn:active:not(:disabled) {
            transform: translateY(0);
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          }

          /* Disabled state */
          .page-btn:disabled {
            cursor: not-allowed;
            opacity: 0.45;
            background: #f1f5f9;
            box-shadow: none;
          }

      `}</style>
    </>
  );
}
