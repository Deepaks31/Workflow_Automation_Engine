import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import axios from "axios";

export default function AuditLogsTable() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [selectedLog, setSelectedLog] = useState(null);
    const [selectedLogHistory, setSelectedLogHistory] = useState([]);

    useEffect(() => {
        if (selectedLog) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [selectedLog]);

    // Filters
    const [filters, setFilters] = useState({
        startDate: "",
        endDate: "",
        role: "",
        workflowId: "",
        slaRisk: "",
        status: ""
    });

    const [searchQuery, setSearchQuery] = useState("");

    const loadLogs = () => {
        setLoading(true);
        const params = { page: page, size: 10, ...filters };
        // Remove empty filters
        Object.keys(params).forEach(k => {
            if (!params[k]) delete params[k];
        });

        axios.get(`${import.meta.env.VITE_API_URL}/api/auditor/logs`, { params })
            .then(res => {
                setLogs(res.data.data || []);
                setTotalPages(res.data.totalPages || 0);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to load audit logs", err);
                setLoading(false);
            });
    };

    useEffect(() => {
        loadLogs();
    }, [page, filters]);

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
        setPage(0); // reset page on filter
    };

    const exportToCSV = () => {
        const headers = ["Workflow Name", "Request ID", "Initiator Name", "Current Status", "Approval Level", "Assigned Approver", "SLA Deadline", "Actual Completion Time"];
        const rows = logs.map(log => [
            `"${log.workflowName}"`,
            log.requestId,
            `"${log.initiatorName}"`,
            log.currentStatus,
            log.approvalLevel,
            log.assignedApprover || "-",
            log.slaDeadline ? `"${new Date(log.slaDeadline).toLocaleString()}"` : "-",
            log.actualCompletionTime ? `"${new Date(log.actualCompletionTime).toLocaleString()}"` : "-"
        ]);
        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "audit_logs.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Local Search
    const safeLogs = Array.isArray(logs) ? logs : [];
    const filteredLogs = safeLogs.filter(log =>
        String(log.initiatorName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(log.currentStatus || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(log.assignedApprover || "").includes(searchQuery) ||
        String(log.workflowName || "").toLowerCase().includes(searchQuery.toLowerCase())
    );

    const openModal = async (log) => {
        setSelectedLog(log);
        try {
            const res = await axios.get(`http://localhost:8080/api/audit/request/${log.requestId}`);
            setSelectedLogHistory(res.data || []);
        } catch (error) {
            console.error("Failed to load request history", error);
            setSelectedLogHistory([]);
        }
    };

    const closeModal = () => {
        setSelectedLog(null);
        setSelectedLogHistory([]);
    };

    const getStatusClass = (status) => {
        if (!status) return 'pending';
        const s = status.toLowerCase();
        if (s.includes('approved')) return 'approved';
        if (s.includes('rejected')) return 'rejected';
        if (s.includes('escalated')) return 'escalated';
        return 'pending';
    };

    const renderRequestData = (dataStr) => {
        if (!dataStr) return null;
        try {
            const dataObj = JSON.parse(dataStr);
            return (
                <div className="request-data-section">
                    <h3>Payload Content</h3>
                    <div className="request-data-grid">
                        {Object.entries(dataObj).map(([key, value]) => (
                            <div key={key} className="request-data-item">
                                <label>{key.replace(/_/g, ' ')}</label>
                                <span>{String(value)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            );
        } catch (e) {
            return (
                <div className="request-data-section">
                    <h3>Payload Content</h3>
                    <div className="request-data-raw">{dataStr}</div>
                </div>
            );
        }
    };

    return (
        <div className="audit-logs-page">
            <div className="filters-header card">
                <div className="search-export-row">
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Search current page..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button className="export-btn" onClick={exportToCSV}>⬇ Export CSV</button>
                </div>

                <div className="filters-grid">
                    <div className="filter-item">
                        <label>Start Date</label>
                        <input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} onClick={(e) => e.target.showPicker && e.target.showPicker()} />
                    </div>
                    <div className="filter-item">
                        <label>End Date</label>
                        <input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} onClick={(e) => e.target.showPicker && e.target.showPicker()} />
                    </div>
                    <div className="filter-item">
                        <label>Role</label>
                        <input type="text" name="role" placeholder="e.g. MANAGER" value={filters.role} onChange={handleFilterChange} />
                    </div>
                    <div className="filter-item">
                        <label>SLA Breach</label>
                        <select name="slaRisk" value={filters.slaRisk} onChange={handleFilterChange}>
                            <option value="">All</option>
                            <option value="Yes">Yes</option>
                            <option value="No">No</option>
                        </select>
                    </div>
                    <div className="filter-item">
                        <label>Status</label>
                        <select name="status" value={filters.status} onChange={handleFilterChange}>
                            <option value="">All</option>
                            <option value="APPROVED">APPROVED</option>
                            <option value="REJECTED">REJECTED</option>
                            <option value="PENDING">PENDING</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="table-card card">
                <div className="table-wrapper">
                    {loading ? (
                        <div className="loading-state">Loading logs...</div>
                    ) : filteredLogs.length === 0 ? (
                        <div className="empty-state">
                            <span className="empty-state-icon">🔍</span>
                            <span>No audit logs found.</span>
                        </div>
                    ) : (
                        <table className="logs-table">
                            <thead>
                                <tr>
                                    <th>Workflow Name</th>
                                    <th>Req ID</th>
                                    <th>Initiator</th>
                                    <th>Status</th>
                                    <th>Level</th>
                                    <th>Approver</th>
                                    <th>SLA Deadline</th>
                                    <th>Completion Time</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredLogs.map(log => (
                                    <tr key={log.requestId + "-" + log.timestamp}>
                                        <td><strong>{log.workflowName}</strong></td>
                                        <td>{log.requestId}</td>
                                        <td>{log.initiatorName}</td>
                                        <td>
                                            <span className={`status-pill ${getStatusClass(log.currentStatus)}`}>
                                                {log.currentStatus?.toUpperCase().includes('ESCALATED') ? 'SLA BREACHED' : log.currentStatus}
                                            </span>
                                        </td>
                                        <td>{log.approvalLevel}</td>
                                        <td>{log.assignedApprover || "-"}</td>
                                        <td>{log.slaDeadline ? new Date(log.slaDeadline).toLocaleString() : "-"}</td>
                                        <td>{log.actualCompletionTime ? new Date(log.actualCompletionTime).toLocaleString() : "-"}</td>
                                        <td>
                                            <button className="view-btn" onClick={() => openModal(log)}>View Details</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                <div className="pagination">
                    <button disabled={page === 0} onClick={() => setPage(p => p - 1)}>◀ Prev</button>
                    <span>Page {page + 1} of {Math.max(1, totalPages)}</span>
                    <button disabled={page + 1 >= totalPages} onClick={() => setPage(p => p + 1)}>Next ▶</button>
                </div>
            </div>

            {selectedLog && createPortal(
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content card" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Log Details: {selectedLog.workflowName}</h2>
                            <button className="close-btn" onClick={closeModal}>✕</button>
                        </div>
                        <div className="modal-body">

                            {/* Section 1: Basic Information */}
                            <div className="modal-section-card">
                                <h3>🧾 Basic Information</h3>
                                <div className="detail-grid">
                                    <div className="detail-item">
                                        <label>Workflow Name</label>
                                        <span>{selectedLog.workflowName}</span>
                                    </div>
                                    <div className="detail-item">
                                        <label>Request ID</label>
                                        <span>#{selectedLog.requestId}</span>
                                    </div>
                                    <div className="detail-item">
                                        <label>Initiator Name</label>
                                        <span>{selectedLog.initiatorName}</span>
                                    </div>
                                    <div className="detail-item">
                                        <label>Priority</label>
                                        <span>{selectedLog.priority || "Normal"}</span>
                                    </div>
                                    <div className="detail-item">
                                        <label>Current Status</label>
                                        <span className={`status-pill ${getStatusClass(selectedLog.currentStatus)}`}>
                                            {selectedLog.currentStatus}
                                        </span>
                                    </div>
                                    <div className="detail-item">
                                        <label>Created Date</label>
                                        <span>{new Date(selectedLog.timestamp).toLocaleString()}</span>
                                    </div>
                                </div>
                                {renderRequestData(selectedLog.requestData)}
                            </div>

                            {/* Section 2: SLA Information */}
                            <div className="modal-section-card">
                                <h3>⏱ SLA Information</h3>
                                <div className="detail-grid">
                                    <div className="detail-item">
                                        <label>SLA Deadline</label>
                                        <span>{selectedLog.slaDeadline ? new Date(selectedLog.slaDeadline).toLocaleString() : "No Deadline"}</span>
                                    </div>
                                    <div className="detail-item">
                                        <label>Actual Completion Time</label>
                                        <span>{selectedLog.actualCompletionTime ? new Date(selectedLog.actualCompletionTime).toLocaleString() : "Pending"}</span>
                                    </div>
                                    <div className="detail-item">
                                        <label>SLA Breach</label>
                                        <span style={{ color: selectedLog.slaBreach === "Yes" ? "#ef4444" : "#10b981", fontWeight: "bold" }}>
                                            {selectedLog.slaBreach === "Yes" ? "🚨 Breached" : "✅ Met"}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Section 3: Approval Timeline */}
                            <div className="modal-section-card">
                                <h3>🔄 Approval Timeline</h3>
                                {selectedLogHistory.length === 0 ? (
                                    <div className="empty-history">No history found or loading...</div>
                                ) : (
                                    <div className="timeline-container">
                                        {selectedLogHistory.map((h, i) => {
                                            const isEscalated = h.action?.toUpperCase().includes('ESCALATED');
                                            return (
                                                <div key={i} className={`timeline-item ${isEscalated ? 'breached' : ''}`}>
                                                    <div className={`timeline-dot ${isEscalated ? 'breached-dot' : ''}`}></div>
                                                    <div className="timeline-content">
                                                        <div className="timeline-header">
                                                            <div className="timeline-role-info">
                                                                <span className="role-badge">{h.role || 'SYSTEM'}</span>
                                                                <span className={`status-pill ${getStatusClass(h.action)}`}>{h.action}</span>
                                                            </div>
                                                            <span className="timeline-time">{new Date(h.actionAt).toLocaleString()}</span>
                                                        </div>
                                                        <div className="timeline-approver">
                                                            Assigned User: {h.approverId || "System Auto"}
                                                        </div>
                                                        {h.remarks && (
                                                            <div className="timeline-remarks">
                                                                <strong>Comments:</strong> {h.remarks}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* Section 4: Audit Integrity */}
                            <div className="modal-section-card">
                                <h3>🛡 Audit Integrity</h3>
                                <div className="detail-grid" style={{ marginBottom: 0 }}>
                                    <div className="detail-item">
                                        <label>Log Primary ID</label>
                                        <span className="integrity-hash">{selectedLog.requestId}-{new Date(selectedLog.timestamp).getTime()}</span>
                                    </div>
                                    <div className="detail-item">
                                        <label>Last Updated By</label>
                                        <span>SYSTEM</span>
                                    </div>
                                    <div className="detail-item">
                                        <label>Data Integrity</label>
                                        <span style={{ color: "#10b981" }}>🔒 Secured & Verified</span>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>,
                document.body
            )}

            <style>{`
        .audit-logs-page {
          display: flex; flex-direction: column; gap: 20px;
          animation: fadeIn 0.4s ease-out;
        }
        .card {
          background: white; border-radius: 12px; padding: 20px;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;
        }
        .search-export-row {
          display: flex; justify-content: space-between; gap: 16px; margin-bottom: 20px;
        }
        .search-input {
          flex: 1; max-width: 400px; padding: 10px 16px; border: 1px solid #cbd5e1;
          border-radius: 8px; font-size: 14px; outline: none; transition: border 0.3s;
        }
        .search-input:focus { border-color: #3b82f6; }
        .export-btn {
          background: #10b981; color: white; border: none; padding: 10px 20px;
          border-radius: 8px; font-weight: 600; cursor: pointer; transition: 0.2s;
        }
        .export-btn:hover { background: #059669; }
        
        .filters-grid {
          display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 24px; position: relative; z-index: 50;
        }
        .filter-item { display: flex; flex-direction: column; gap: 6px; }
        .filter-item label { font-size: 12px; font-weight: 600; color: #64748b; }
        .filter-item input, .filter-item select {
          width: 100%; box-sizing: border-box; margin: 0;
          padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 6px;
          font-size: 13px; outline: none; background: white;
        }
        .table-card { padding: 0; overflow: hidden; position: relative; z-index: 10; }
        .table-wrapper { width: 100%; overflow-x: auto; min-height: 400px; }
        .logs-table {
          width: 100%; border-collapse: collapse; min-width: 1000px; font-size: 13px;
        }
        .logs-table th {
          background: #f8fafc; color: #475569; font-weight: 600; text-align: left;
          padding: 14px 16px; border-bottom: 2px solid #e2e8f0; white-space: nowrap;
        }
        .logs-table td { padding: 14px 16px; border-bottom: 1px solid #f1f5f9; color: #334155; }
        .logs-table tr:hover { background: #f8fafc; }
        
        .status-pill {
          padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 700;
          background: #e2e8f0; color: #475569;
        }
        .status-pill.approved { background: #d1fae5; color: #065f46; }
        .status-pill.rejected { background: #fee2e2; color: #991b1b; }
        .status-pill.escalated { background: #fef08a; color: #854d0e; }
        
        .breach-pill {
          padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 700;
        }
        .breach-pill.yes { background: #fee2e2; color: #dc2626; }
        .breach-pill.no { background: #d1fae5; color: #10b981; }

        .loading-state {
          display: flex; align-items: center; justify-content: center;
          min-height: 300px; color: #64748b; font-size: 16px; font-weight: 600;
        }
        
        .empty-state {
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          min-height: 250px; color: #64748b; font-size: 16px; font-weight: 600;
          background: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 12px;
          margin: 20px; transition: all 0.3s ease; cursor: default;
        }
        .empty-state:hover {
          background: #ffffff; border-color: #3b82f6; color: #3b82f6;
          transform: translateY(-2px); box-shadow: 0 8px 24px rgba(59, 130, 246, 0.15);
        }
        .empty-state-icon {
          font-size: 36px; margin-bottom: 12px; display: inline-block;
          transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .empty-state:hover .empty-state-icon {
          transform: scale(1.2) rotate(-15deg);
        }

        .pagination {
          display: flex; justify-content: space-between; align-items: center;
          padding: 16px 20px; background: #f8fafc; border-top: 1px solid #e2e8f0;
        }
        .pagination button {
          padding: 8px 16px; background: white; border: 1px solid #cbd5e1;
          border-radius: 6px; cursor: pointer; font-weight: 600; color: #334155;
        }
        .pagination button:disabled { opacity: 0.5; cursor: not-allowed; }
        
        .status-container { display: flex; flex-direction: column; gap: 4px; align-items: flex-start; }
        .breach-badge { font-size: 9px; font-weight: 800; color: white; background: #ef4444; padding: 2px 6px; border-radius: 4px; letter-spacing: 0.5px; }
        
        .view-btn { padding: 6px 12px; background: white; border: 1px solid #3b82f6; color: #3b82f6; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer; transition: 0.2s; }
        .view-btn:hover { background: #eff6ff; }
        
        .modal-overlay { 
            position: fixed; top: 0; left: 0; right: 0; bottom: 0; 
            background: transparent; backdrop-filter: blur(8px); 
            display: flex; justify-content: center; align-items: center; 
            z-index: 99999; animation: fadeIn 0.2s ease-out; margin: 0; padding: 24px; 
            overflow: hidden;
        }
        .modal-content { 
            max-width: 800px; width: 100%; max-height: calc(100vh - 48px); 
            display: flex; flex-direction: column;
            background: white; border-radius: 16px; z-index: 100000;
            box-shadow: 0 25px 50px -12px rgba(0,0,0,0.2); position: relative;
        }
        .modal-header { 
            display: flex; justify-content: space-between; align-items: center; 
            padding: 24px 32px; border-bottom: 1px solid #e2e8f0; flex-shrink: 0;
        }
        .modal-header h2 { margin: 0; font-size: 22px; font-weight: 800; color: #0f172a; }
        .close-btn { background: #f1f5f9; border: none; border-radius: 50%; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; font-size: 18px; color: #64748b; cursor: pointer; transition: all 0.2s; }
        .close-btn:hover { background: #e2e8f0; color: #0f172a; }
        
        .modal-body {
            padding: 32px; overflow-y: auto; flex: 1; display: flex; flex-direction: column; gap: 24px;
        }
        
        .modal-section-card {
            background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.02);
        }
        .modal-section-card h3 {
            font-size: 16px; font-weight: 800; color: #0f172a; margin: 0 0 20px 0;
            display: flex; align-items: center; gap: 8px; border-bottom: 2px solid #f1f5f9; padding-bottom: 12px;
        }
        
        .detail-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 24px; }
        .detail-item { display: flex; flex-direction: column; gap: 6px; }
        .detail-item label { font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; }
        .detail-item span { font-size: 15px; font-weight: 600; color: #0f172a; }

        .request-data-section { padding-top: 20px; margin-top: 24px; border-top: 2px dashed #e2e8f0; }
        .request-data-section h3 { font-size: 14px !important; font-weight: 700; color: #475569 !important; margin-bottom: 16px; letter-spacing: 0.5px; border:none !important; padding:0 !important;}
        .request-data-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; background: #f8fafc; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; }
        .request-data-item { display: flex; flex-direction: column; gap: 6px; }
        .request-data-item label { font-size: 12px; font-weight: 700; color: #64748b; text-transform: capitalize; }
        .request-data-item span { font-size: 15px; color: #0f172a; font-weight: 600; word-break: break-word; }
        .request-data-raw { background: #f8fafc; padding: 20px; border-radius: 12px; font-family: monospace; font-size: 14px; color: #334155; white-space: pre-wrap; word-break: break-word; border: 1px solid #e2e8f0;}
        .integrity-hash { font-family: monospace; background: #f1f5f9; padding: 4px 8px; border-radius: 6px; font-size: 13px; }

        .empty-history { font-size: 14px; color: #64748b; font-style: italic; }
        
        .timeline-container { display: flex; flex-direction: column; gap: 0; position: relative; }
        .timeline-container::before { content: ''; position: absolute; left: 16px; top: 0; bottom: 0; width: 2px; background: #e2e8f0; }
        .timeline-item { position: relative; padding-left: 44px; padding-bottom: 24px; }
        .timeline-item:last-child { padding-bottom: 0; }
        .timeline-dot { position: absolute; left: 9px; top: 4px; width: 16px; height: 16px; border-radius: 50%; background: #3b82f6; border: 3px solid white; box-shadow: 0 0 0 2px #bfdbfe; z-index: 2; }
        .breached-dot { background: #ef4444; box-shadow: 0 0 0 2px #fecaca; }
        
        .timeline-content { background: #f8fafc; padding: 16px; border-radius: 12px; border: 1px solid #e2e8f0; transition: transform 0.2s; }
        .timeline-item.breached .timeline-content { border-color: #fca5a5; background: #fef2f2; }
        .timeline-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; gap: 12px;}
        .timeline-role-info { display: flex; align-items: center; gap: 8px; flex-wrap: wrap;}
        .role-badge { font-size: 11px; font-weight: 800; padding: 4px 8px; background: #1e293b; color: white; border-radius: 6px; letter-spacing: 0.5px;}
        .timeline-time { font-size: 13px; color: #64748b; font-weight: 600; white-space: nowrap; }
        .timeline-approver { font-size: 14px; font-weight: 600; color: #334155; margin-bottom: 8px; }
        .timeline-remarks { font-size: 13px; color: #475569; background: white; padding: 12px; border-radius: 8px; border: 1px dashed #cbd5e1; margin-top: 12px;}

        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
        </div>
    );
}
