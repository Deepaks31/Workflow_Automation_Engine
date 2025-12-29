// FinanceDashboard.jsx - COMPLETE PREMIUM VERSION (Matching Previous Style)
import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";

export default function FinanceDashboard() {
  const [requests, setRequests] = useState([]);
  const [activeRequest, setActiveRequest] = useState(null);
  const [remarks, setRemarks] = useState("");
  const [showRejectBox, setShowRejectBox] = useState(false);
  const [loading, setLoading] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const financeApproverId = Number(localStorage.getItem("userId"));

  // Load requests with auto-refresh
  const loadRequests = useCallback(() => {
    setLoading(true);
    axios
      .get(`http://localhost:8080/api/requests/pending/finance/${financeApproverId}/view`)
      .then((res) => {
        setRequests(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [financeApproverId]);

  useEffect(() => {
    loadRequests();
    const interval = setInterval(loadRequests, 30000); // Auto-refresh every 30s
    return () => clearInterval(interval);
  }, [loadRequests]);

  // Scroll effect for header
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Body scroll lock
  useEffect(() => {
    document.body.style.overflow = activeRequest ? "hidden" : "auto";
    return () => (document.body.style.overflow = "auto");
  }, [activeRequest]);

  const approveRequest = async () => {
    await axios.put(`http://localhost:8080/api/requests/${activeRequest.id}/approve`, { approverId: financeApproverId });
    alert("✅ Request APPROVED");
    closeModal();
  };

  const rejectRequest = async () => {
    if (!remarks.trim()) {
      alert("❌ Remarks are required for rejection");
      return;
    }
    await axios.put(`http://localhost:8080/api/requests/${activeRequest.id}/reject`, {
      approverId: financeApproverId,
      remarks,
    });
    alert("❌ Request REJECTED");
    closeModal();
  };

  const closeModal = () => {
    setActiveRequest(null);
    setRemarks("");
    setShowRejectBox(false);
    loadRequests();
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      window.location.href = '/login';
    }
  };

  if (loading && requests.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <div className="finance-app-wrapper">
        {/* Premium Header */}
        <header className={`finance-header ${scrolled ? 'scrolled' : ''}`}>
          <div className="header-content">
            <div className="header-left">
              <h1 className="page-title">
                <span className="title-icon">💰</span>
                Finance Dashboard
              </h1>
              <p className="page-subtitle">Review finance approval requests</p>
            </div>
            <div className="header-actions">
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-value">{requests.length}</div>
                  <div className="stat-label">Pending Requests</div>
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
              <h3>Finance Approvals</h3>
              <p className="section-subtitle">Auto-refreshes every 30 seconds</p>
            </div>
            {requests.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="grid">
                {requests.map((r) => {
                  const req = r.request;
                  const data = JSON.parse(req.requestData);
                  return (
                    <RequestCard
                      key={req.id}
                      request={req}
                      initiatorName={r.initiatorName}
                      data={data}
                      isEscalated={req.status?.startsWith("ESCALATED")}
                      onClick={() => setActiveRequest({
                        ...req,
                        initiatorName: r.initiatorName,
                      })}
                    />
                  );
                })}
              </div>
            )}
          </section>
        </main>
      </div>

      {/* Request Review Modal */}
      {activeRequest && (
        <RequestReviewModal
          request={activeRequest}
          remarks={remarks}
          showRejectBox={showRejectBox}
          onApprove={approveRequest}
          onReject={rejectRequest}
          onClose={closeModal}
          onToggleReject={() => setShowRejectBox(!showRejectBox)}
          onRemarksChange={setRemarks}
        />
      )}

      <style>{`
        /* Full Page Setup */
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { height: 100%; overflow-x: hidden; }
        body { 
          font-family: system-ui, -apple-system, sans-serif;
          background: linear-gradient(135deg, #f4f6fb 0%, #e8f0fe 100%);
        }

        .finance-app-wrapper {
          min-height: 100vh; height: 100%; display: flex; flex-direction: column;
        }

        /* Premium Header */
        .finance-header {
          position: sticky; top: 0; background: rgba(255, 255, 255, 0.98);
          backdrop-filter: blur(20px); border-bottom: 1px solid rgba(0,0,0,0.08);
          z-index: 100; padding: 20px 5%; box-shadow: 0 4px 30px rgba(0,0,0,0.1);
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          animation: slideDown 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        @keyframes slideDown {
          from { transform: translateY(-100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        .finance-header.scrolled { 
          padding: 16px 5%; box-shadow: 0 10px 40px rgba(0,0,0,0.15);
          backdrop-filter: blur(30px);
        }

        .header-content {
          max-width: 1400px; margin: 0 auto; display: flex;
          justify-content: space-between; align-items: center; gap: 32px; width: 100%;
        }

        .header-left h1 {
          margin: 0 0 6px 0; font-size: 28px; font-weight: 800; color: #1e293b;
          display: flex; align-items: center; gap: 12px;
          animation: fadeInUp 0.8s ease-out; text-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .title-icon { 
          font-size: 28px; 
          filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
          animation: bounce 2s infinite;
        }
        
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-8px); }
          60% { transform: translateY(-4px); }
        }
        
        .page-subtitle { 
          margin: 0; font-size: 16px; color: #64748b; font-weight: 500;
          animation: fadeInUp 1s ease-out 0.2s both;
        }

        .header-actions { display: flex; align-items: center; gap: 24px; }
        .stats-grid { display: flex; gap: 16px; }
        .stat-card {
          background: linear-gradient(135deg, rgba(255,255,255,0.9), rgba(248,250,252,0.9));
          padding: 16px 20px; border-radius: 16px; border: 1px solid rgba(0,0,0,0.06);
          text-align: center; min-width: 120px; box-shadow: 0 4px 20px rgba(0,0,0,0.08);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          animation: fadeInUp 1s ease-out 0.4s both;
        }
        .stat-card:hover { transform: translateY(-4px) scale(1.02); box-shadow: 0 12px 40px rgba(0,0,0,0.15); }
        .stat-value { 
          font-size: 24px; font-weight: 800; 
          background: linear-gradient(135deg, #f59e0b, #d97706);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
          line-height: 1; display: block;
        }
        .stat-label { font-size: 13px; color: #64748b; margin-top: 4px; font-weight: 600; }

        .logout-btn {
          background: linear-gradient(135deg, #f8fafc, #f1f5f9); color: #64748b; border: 1px solid #e2e8f0;
          padding: 12px 24px; border-radius: 12px; font-size: 15px; font-weight: 600;
          cursor: pointer; transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex; align-items: center; gap: 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);
          animation: fadeInUp 1s ease-out 0.6s both;
        }
        .logout-btn:hover { 
          background: #e2e8f0; transform: translateY(-2px) scale(1.02);
          box-shadow: 0 8px 25px rgba(0,0,0,0.15); color: #475569;
        }

        /* Main Content */
        .main-content { flex: 1; max-width: 1400px; margin: 0 auto; padding: 40px 5%; width: 100%; }
        .content-section { margin-bottom: 64px; }
        .section-header {
          display: flex; flex-direction: column; gap: 8px; margin-bottom: 32px;
          animation: fadeInUp 1s ease-out;
        }
        .section-header h3 { margin: 0; font-size: 24px; font-weight: 700; color: #1f2937; letter-spacing: -0.5px; }
        .section-subtitle { font-size: 15px; color: #64748b; font-weight: 500; }

        /* Grid */
        .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(360px, 1fr)); gap: 24px; width: 100%; }

        /* RequestCard */
        .request-card {
          cursor: pointer; position: relative; overflow: hidden;
          animation: fadeInUp 0.6s ease-out; transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          display: flex; flex-direction: column; height: 100%;
        }
        .request-card:hover { transform: translateY(-12px) scale(1.02); box-shadow: 0 25px 50px rgba(0,0,0,0.15); }
        .card { background: white; padding: 24px; border-radius: 20px; box-shadow: 0 15px 35px rgba(0,0,0,0.08); transition: all 0.3s ease; display: flex; flex-direction: column; height: 100%; }
        .card-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; }
        .status-indicator { width: 8px; height: 8px; background: #f59e0b; border-radius: 50%; animation: pulse 2s infinite; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: .5; } }
        .workflow-id { font-size: 18px; font-weight: 700; color: #1f2937; margin-bottom: 8px; }
        .initiator-info { font-size: 14px; color: #374151; margin-bottom: 16px; }
        .badge.escalated {
          display: inline-block; background: linear-gradient(135deg, #ef4444, #dc2626);
          color: white; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;
          animation: pulse 2s infinite;
        }
        .hint { margin-top: auto; font-size: 13px; color: #9ca3af; text-align: center; padding-top: 16px; border-top: 1px solid #f1f5f9; }

        /* FIXED Modal - NO OVERLAP */
        .overlay {
          position: fixed; inset: 0; background: rgba(0, 0, 0, 0.6); backdrop-filter: blur(8px);
          display: flex; align-items: center; justify-content: center; z-index: 10000;
          animation: fadeIn 0.3s ease-out;
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        
        .modal {
          background: white; border-radius: 24px; width: 90%; max-width: 500px; 
          max-height: 85vh; display: flex; flex-direction: column; overflow: hidden;
          box-shadow: 0 30px 60px rgba(0, 0, 0, 0.3);
          animation: slideIn 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(-30px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        
        .modal-header {
          padding: 24px 24px 16px 24px; display: flex; justify-content: space-between; 
          align-items: center; flex-shrink: 0; border-bottom: 1px solid #f1f5f9;
        }
        
        .modal-title { margin: 0; font-size: 20px; font-weight: 700; color: #1f2937; }
        .close-btn {
          background: none; border: none; font-size: 24px; cursor: pointer; color: #6b7280;
          width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center;
          justify-content: center; transition: all 0.2s ease; flex-shrink: 0;
        }
        .close-btn:hover { background: #f3f4f6; color: #374151; }
        
        .modal-content {
          padding: 24px; flex: 1; overflow-y: auto; max-height: 400px;
        }
        
        .detail {
          display: flex; justify-content: space-between; align-items: flex-start;
          margin-bottom: 16px; font-size: 15px; padding: 12px 0; border-bottom: 1px solid #f1f5f9;
        }
        .detail:last-child { border-bottom: none; margin-bottom: 0; }
        .detail span { color: #64748b; font-weight: 500; min-width: 100px; }
        .detail strong { color: #1f2937; font-weight: 600; }
        
        .reason-box {
          max-width: 65%; max-height: 120px; overflow-y: auto; padding: 12px;
          background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 10px;
          font-size: 14px; line-height: 1.5; color: #374151;
          white-space: pre-wrap; word-break: break-word;
        }
        
        .remarks-section {
          margin-top: 20px; padding-top: 20px; border-top: 1px solid #f1f5f9;
          animation: fadeSlideIn 0.25s ease;
        }
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .remarks-label {
          font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 8px; display: block;
        }
        .remarks-textarea {
          width: 100%; min-height: 80px; max-height: 160px; resize: vertical;
          padding: 12px; border-radius: 12px; border: 1.5px solid #d1d5db;
          font-family: inherit; font-size: 14px; line-height: 1.5;
          background: #f9fafb; transition: all 0.2s ease; box-sizing: border-box;
        }
        .remarks-textarea:focus {
          outline: none; border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }
        
        .modal-actions {
          padding: 20px 24px 24px; display: flex; gap: 12px; justify-content: flex-end;
          border-top: 1px solid #f1f5f9; flex-shrink: 0;
        }
        .action-btn {
          padding: 12px 24px; border-radius: 12px; border: none; font-size: 14px;
          font-weight: 600; cursor: pointer; transition: all 0.3s ease; min-width: 100px;
        }
        .approve-btn { 
          background: linear-gradient(135deg, #16a34a, #15803d); color: white; 
        }
        .approve-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(22, 163, 74, 0.4); }
        .reject-btn { 
          background: linear-gradient(135deg, #dc2626, #b91c1c); color: white; 
        }
        .reject-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(220, 38, 38, 0.4); }
        .cancel-btn { 
          background: #f8fafc; color: #475569; border: 1px solid #e2e8f0; 
        }
        .cancel-btn:hover { background: #f1f5f9; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,0,0,0.15); }

        /* Loading & Empty States */
        .loading-screen { display: flex; align-items: center; justify-content: center; min-height: 60vh; }
        .spinner-container { display: flex; flex-direction: column; align-items: center; gap: 20px; }
        .spinner {
          width: 52px; height: 52px; border: 4px solid #e5e7eb; border-top: 4px solid #f59e0b;
          border-radius: 50%; animation: spin 1s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .empty-state {
          text-align: center; padding: 80px 40px; background: white; border-radius: 24px;
          box-shadow: 0 12px 40px rgba(0,0,0,0.1); animation: fadeInUp 1s ease-out;
        }
        .empty-icon { font-size: 64px; margin-bottom: 24px; animation: pulse 2s infinite; }
        @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.1); } }
        .empty-state h4 { color: #1f2937; margin: 0 0 12px 0; font-size: 24px; font-weight: 700; }
        .empty-state p { color: #6b7280; margin: 0; font-size: 16px; }

        /* Responsive */
        @media (max-width: 768px) {
          .header-content { flex-direction: column; gap: 24px; align-items: stretch; }
          .header-actions { flex-direction: column; gap: 20px; align-items: stretch; }
          .stats-grid { justify-content: center; }
          .grid { grid-template-columns: 1fr; gap: 20px; }
          .main-content { padding: 24px 5%; }
          .modal { margin: 20px; width: calc(100% - 40px); max-width: calc(100% - 40px); }
          .modal-actions { flex-direction: column; }
        }
      `}</style>
    </>
  );
}

// Components
const RequestCard = ({ request, initiatorName, data, isEscalated, onClick }) => (
  <div className="card request-card" onClick={onClick}>
    <div className="card-header">
      <h3 className="workflow-id">Workflow #{request.workflowId}</h3>
      <div className="status-indicator"></div>
    </div>
    <div className="initiator-info">
      <div>Initiator ID: <strong>{request.initiatorId}</strong></div>
      <div>Initiator: <strong>{initiatorName}</strong></div>
    </div>
    {isEscalated && <div className="badge escalated">ESCALATED</div>}
    <div className="hint">Click to review →</div>
  </div>
);

const RequestReviewModal = ({ request, remarks, showRejectBox, onApprove, onReject, onClose, onToggleReject, onRemarksChange }) => {
  const data = JSON.parse(request.requestData);
  return (
    <div className="overlay">
      <div className="modal">
        <div className="modal-header">
          <h3 className="modal-title">Request Details</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <div className="modal-content">
          <div className="detail">
            <span>Workflow</span>
            <strong>#{request.workflowId}</strong>
          </div>
          <div className="detail">
            <span>Initiator ID</span>
            <strong>{request.initiatorId}</strong>
          </div>
          <div className="detail">
            <span>Initiator Name</span>
            <strong>{request.initiatorName}</strong>
          </div>
          {data.amount && (
            <div className="detail">
              <span>Amount</span>
              <strong>₹ {data.amount.toLocaleString()}</strong>
            </div>
          )}
          {data.leaveDays && (
            <div className="detail">
              <span>Leave Days</span>
              <strong>{data.leaveDays}</strong>
            </div>
          )}
          {data.fromDate && (
            <div className="detail">
              <span>From Date</span>
              <strong>{data.fromDate}</strong>
            </div>
          )}
          {data.reason && (
            <div className="detail reason-detail">
              <span>Reason</span>
              <div className="reason-box">{data.reason}</div>
            </div>
          )}
          
          {showRejectBox && (
            <div className="remarks-section">
              <label className="remarks-label">Rejection Remarks *</label>
              <textarea
                className="remarks-textarea"
                autoFocus
                value={remarks}
                onChange={(e) => {
                  onRemarksChange(e.target.value);
                  e.target.style.height = "auto";
                  e.target.style.height = e.target.scrollHeight + "px";
                }}
                placeholder="Clearly mention the reason for rejection..."
              />
            </div>
          )}
        </div>
        <div className="modal-actions">
          <button className="action-btn cancel-btn" onClick={onClose}>Close</button>
          {!showRejectBox ? (
            <>
              <button className="action-btn reject-btn" onClick={onToggleReject}>Reject</button>
              <button className="action-btn approve-btn" onClick={onApprove}>Approve</button>
            </>
          ) : (
            <>
              <button className="action-btn reject-btn" onClick={onReject}>Confirm Reject</button>
              <button className="action-btn cancel-btn" onClick={onToggleReject}>Cancel</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const LoadingSpinner = () => (
  <div className="loading-screen">
    <div className="spinner-container">
      <div className="spinner"></div>
      <p style={{ margin: 0, color: '#64748b', fontSize: '16px', fontWeight: '500' }}>
        Loading finance requests...
      </p>
    </div>
  </div>
);

const EmptyState = () => (
  <div className="empty-state">
    <div className="empty-icon">💰</div>
    <h4>No pending finance requests</h4>
    <p>All finance requests have been processed.</p>
  </div>
);
