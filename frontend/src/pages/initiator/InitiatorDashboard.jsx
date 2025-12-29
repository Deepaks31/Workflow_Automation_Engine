// InitiatorDashboard.jsx - COMPLETE FIXED CODE (Remarks box NO OVERLAP)
import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import StartRequestModal from "./StartRequestModal";

export default function InitiatorDashboard() {
  const [workflows, setWorkflows] = useState([]);
  const [requests, setRequests] = useState([]);
  const [viewRemarks, setViewRemarks] = useState(null);
  const [viewWorkflow, setViewWorkflow] = useState(null);
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const initiatorId = Number(localStorage.getItem("userId"));

  // Status color utility function
  const getStatusColor = (status) => {
    const colors = {
      PENDING: '#f59e0b',
      APPROVED: '#10b981',
      REJECTED: '#ef4444',
      COMPLETED: '#3b82f6'
    };
    return colors[status] || '#6b7280';
  };

  // Load workflows
  const loadWorkflows = useCallback(() => {
    setLoading(true);
    axios
      .get("http://localhost:8080/api/workflows")
      .then((res) => {
        setWorkflows(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  // Load requests
  const loadRequests = useCallback(() => {
    setLoadingRequests(true);
    axios
      .get(`http://localhost:8080/api/requests/initiator/${initiatorId}`)
      .then((res) => {
        setRequests(res.data);
        setLoadingRequests(false);
      })
      .catch((err) => {
        console.error(err);
        setLoadingRequests(false);
      });
  }, [initiatorId]);

  useEffect(() => {
    loadWorkflows();
    loadRequests();
  }, [loadWorkflows, loadRequests]);

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
    document.body.style.overflow = (viewRemarks || viewWorkflow || selectedWorkflow) ? "hidden" : "auto";
    return () => (document.body.style.overflow = "auto");
  }, [viewRemarks, viewWorkflow, selectedWorkflow]);

  const deleteRequest = (requestId) => {
    if (!window.confirm("Are you sure you want to delete this request?")) return;
    setRequests(prev => prev.filter(r => r.id !== requestId));
    axios
      .delete(`http://localhost:8080/api/requests/${requestId}`)
      .catch((err) => {
        console.error(err);
        loadRequests();
      });
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      window.location.href = '/login';
    }
  };

  if (loading && workflows.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <div className="initiator-app-wrapper">
        {/* Premium Header */}
        <header className={`initiator-header ${scrolled ? 'scrolled' : ''}`}>
          <div className="header-content">
            <div className="header-left">
              <h1 className="page-title">
                <span className="title-icon">📋</span>
                Initiator Dashboard
              </h1>
              <p className="page-subtitle">Select a workflow to start a request</p>
            </div>
            <div className="header-actions">
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-value">{workflows.length}</div>
                  <div className="stat-label">Available Workflows</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{requests.length}</div>
                  <div className="stat-label">My Requests</div>
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
              <h3>Available Workflows</h3>
            </div>
            <div className="grid">
              {workflows.map((w) => (
                <WorkflowCard
                  key={w.id}
                  workflow={w}
                  isHovered={hoveredCard === w.id}
                  onHover={setHoveredCard}
                  onWorkflowView={() => setViewWorkflow(w)}
                  onStartRequest={() => setSelectedWorkflow(w)}
                />
              ))}
            </div>
          </section>

          <section className="content-section">
            <div className="section-header">
              <h3>My Submitted Requests</h3>
            </div>
            {loadingRequests ? (
              <div className="loading-grid">
                <LoadingCard />
                <LoadingCard />
              </div>
            ) : requests.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="grid">
                {requests.map((r) => {
                  const wf = workflows.find((w) => w.id === r.workflowId);
                  return (
                    <RequestCard
                      key={r.id}
                      request={r}
                      workflow={wf}
                      getStatusColor={getStatusColor}
                      onViewRemarks={() => setViewRemarks(r.remarks)}
                      onDelete={() => deleteRequest(r.id)}
                    />
                  );
                })}
              </div>
            )}
          </section>
        </main>
      </div>

      {selectedWorkflow && (
        <StartRequestModal
          workflow={selectedWorkflow}
          onClose={() => {
            setSelectedWorkflow(null);
            loadRequests();
          }}
        />
      )}

      {viewRemarks && (
        <RemarksModal remarks={viewRemarks} onClose={() => setViewRemarks(null)} />
      )}

      {viewWorkflow && (
        <WorkflowModal 
          workflow={viewWorkflow} 
          getStatusColor={getStatusColor}
          onClose={() => setViewWorkflow(null)}
          onStartRequest={() => {
            setSelectedWorkflow(viewWorkflow);
            setViewWorkflow(null);
          }}
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

        .initiator-app-wrapper {
          min-height: 100vh; height: 100%; display: flex; flex-direction: column;
        }

        /* Premium Header - FIXED LOGO VISIBILITY */
        .initiator-header {
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
        
        .initiator-header.scrolled { 
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
          background: linear-gradient(135deg, #3b82f6, #1e40af);
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
          display: flex; align-items: center; gap: 12px; margin-bottom: 32px;
          animation: fadeInUp 1s ease-out;
        }
        .section-header h3 { margin: 0; font-size: 24px; font-weight: 700; color: #1f2937; letter-spacing: -0.5px; }

        /* Grid */
        .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(360px, 1fr)); gap: 24px; width: 100%; }
        .loading-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(360px, 1fr)); gap: 24px; min-height: 300px; }

        /* WorkflowCard Styles */
        .workflow-card {
          cursor: pointer; position: relative; overflow: hidden;
          animation: fadeInUp 0.6s ease-out; transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          display: flex; flex-direction: column; height: 100%;
        }
        .workflow-card.hovered { transform: translateY(-12px) scale(1.02); box-shadow: 0 25px 50px rgba(0,0,0,0.15); }
        .card { background: white; padding: 24px; border-radius: 20px; box-shadow: 0 15px 35px rgba(0,0,0,0.08); transition: all 0.3s ease; display: flex; flex-direction: column; height: 100%; }
        .card-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; }
        .status-indicator { width: 8px; height: 8px; background: #10b981; border-radius: 50%; animation: pulse 2s infinite; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: .5; } }
        .description { font-size: 14px; color: #374151; margin: 8px 0 16px 0; line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
        .condition { font-size: 14px; color: #374151; margin-bottom: 24px; }
        .condition .label { font-weight: 600; color: #1f2937; }
        .condition code { background: #f3f4f6; padding: 2px 6px; border-radius: 4px; font-size: 13px; }
        .start-btn { 
          width: 100%; background: linear-gradient(135deg, #2563eb, #1e40af); color: white; border: none;
          padding: 14px 20px; border-radius: 12px; font-size: 14px; font-weight: 600; cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); margin-top: auto;
        }
        .start-btn:hover { transform: translateY(-2px); box-shadow: 0 10px 25px rgba(37,99,235,0.35); }
        @keyframes pulse-animation { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }

        /* RequestCard Styles - FIXED BUTTONS SIDE-BY-SIDE */
        .request-card { animation: fadeInUp 0.5s ease-out; display: flex; flex-direction: column; height: 100%; }
        .status-badge {
          padding: 6px 14px; border-radius: 20px; font-size: 13px; font-weight: 600;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .request-details { margin: 20px 0; flex: 1; }
        .detail-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px; color: #6b7280; }
        .card-actions { margin-top: auto; padding-top: 20px; border-top: 1px solid #f1f5f9; }
        .action-buttons-row { display: flex; gap: 12px; flex-wrap: wrap; }
        .action-btn {
          flex: 1; padding: 12px 16px; border-radius: 12px; border: none; font-size: 14px;
          cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); font-weight: 600;
          min-height: 48px; display: flex; align-items: center; justify-content: center;
        }
        .remarks-btn { background: linear-gradient(135deg, #fef3c7, #fde68a); color: #92400e; border: 1px solid #f59e0b; }
        .remarks-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(245, 158, 11, 0.3); }
        .delete-btn { background: linear-gradient(135deg, #fee2e2, #fecaca); color: #dc2626; border: 1px solid #fecaca; }
        .delete-btn:hover { background: #fecaca; transform: translateY(-2px); box-shadow: 0 8px 25px rgba(220,38,38,0.3); }

        /* ✅ FIXED MODAL - NO OVERLAP GUARANTEED */
        .overlay {
          position: fixed; inset: 0; background: rgba(0, 0, 0, 0.6); backdrop-filter: blur(8px);
          display: flex; align-items: center; justify-content: center; z-index: 10000;
          animation: fadeIn 0.3s ease-out;
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        
        .modal {
          background: white; border-radius: 24px; width: 90%; max-width: 500px; 
          max-height: 80vh; display: flex; flex-direction: column; overflow: hidden;
          box-shadow: 0 30px 60px rgba(0, 0, 0, 0.3);
          animation: slideIn 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(-30px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        
        .modal-header {
          padding: 24px 24px 16px 24px; display: flex; justify-content: space-between; 
          align-items: center; flex-shrink: 0;
        }
        
        .remarks-modal .modal-header h3 {
          margin: 0; font-size: 20px; font-weight: 700; color: #1f2937;
        }
        
        .close-btn {
          background: none; border: none; font-size: 24px; cursor: pointer; color: #6b7280;
          width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center;
          justify-content: center; transition: all 0.2s ease; flex-shrink: 0;
        }
        .close-btn:hover { background: #f3f4f6; color: #374151; }
        
        /* ✅ FIXED REMARKS BOX - PERFECTLY CONTAINED */
        .remarks-box {
          margin: 0 24px 20px 24px; padding: 20px; max-height: 300px; min-height: 120px;
          overflow-y: auto; background: linear-gradient(135deg, #fdf2f8, #fce7f3);
          border: 2px solid #f8d7f2; border-radius: 16px; line-height: 1.7;
          white-space: pre-wrap; word-break: break-word; font-size: 16px; 
          color: #7c2d9e !important; font-weight: 500;
          box-shadow: inset 0 2px 8px rgba(0,0,0,0.05); box-sizing: border-box;
          flex-shrink: 0;
        }
        
        .workflow-content { padding: 0 28px 28px; max-height: 60vh; overflow-y: auto; flex: 1; }
        .modal-section { margin-bottom: 28px; }
        .modal-section h4 { margin: 0 0 16px 0; color: #1f2937; font-size: 18px; font-weight: 600; }
        .scrollable-content, .condition-display {
          max-height: 140px; overflow-y: auto; padding: 16px; background: #f9fafb;
          border-radius: 12px; border: 1px solid #e5e7eb; line-height: 1.6;
          white-space: pre-wrap; word-break: break-word;
        }
        .approval-list { display: flex; flex-direction: column; gap: 12px; }
        .approval-level { display: flex; align-items: center; gap: 16px; }
        .level-number {
          width: 28px; height: 28px; background: linear-gradient(135deg, #3b82f6, #1e40af);
          color: white; border-radius: 50%; display: flex; align-items: center;
          justify-content: center; font-size: 13px; font-weight: 600;
        }
        .escalation {
          padding: 16px; background: #ecfdf5; border: 1px solid #bbf7d0;
          border-radius: 12px; font-size: 15px; font-weight: 500;
        }
        .modal-actions {
          padding: 0 24px 24px 24px; display: flex; gap: 16px; justify-content: flex-end;
          border-top: 1px solid #f1f5f9; margin-top: auto; flex-shrink: 0;
        }
        .cancel-btn, .start-btn {
          padding: 14px 29px; border-radius: 14px; border: none; font-size: 15px; margin-top: 20px;
          font-weight: 600; cursor: pointer; transition: all 0.3s ease; min-width: 120px;
        }
        .cancel-btn { background: #f8fafc; color: #475569; border: 1px solid #e2e8f0; }
        .cancel-btn:hover { background: #f1f5f9; transform: translateY(-1px); box-shadow: 0 6px 20px rgba(0,0,0,0.1); }
        .start-btn { background: linear-gradient(135deg, #2563eb, #1e40af); color: white; }
        .start-btn:hover { transform: translateY(-2px); box-shadow: 0 12px 30px rgba(37,99,235,0.4); }

        /* Loading & Empty States */
        .loading-screen { display: flex; align-items: center; justify-content: center; min-height: 60vh; }
        .spinner-container { display: flex; flex-direction: column; align-items: center; gap: 20px; }
        .spinner {
          width: 52px; height: 52px; border: 4px solid #e5e7eb; border-top: 4px solid #3b82f6;
          border-radius: 50%; animation: spin 1s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .loading-card { position: relative; overflow: hidden; }
        .skeleton {
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%; animation: loading 1.5s infinite; border-radius: 8px;
        }
        .skeleton-title { height: 20px; width: 70%; margin-bottom: 12px; }
        .skeleton-text { height: 16px; width: 90%; margin-bottom: 8px; }
        .skeleton-text-small { height: 14px; width: 60%; }
        .skeleton-button { height: 40px; width: 120px; margin-top: 16px; }
        @keyframes loading { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
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
          .grid, .loading-grid { grid-template-columns: 1fr; gap: 20px; }
          .main-content { padding: 24px 5%; }
          .modal { margin: 20px; width: calc(100% - 40px); max-width: calc(100% - 40px); }
        }
      `}</style>
    </>
  );
}

// All Components
const WorkflowCard = ({ workflow, isHovered, onHover, onWorkflowView, onStartRequest }) => (
  <div 
    className={`card workflow-card ${isHovered ? 'hovered' : ''}`}
    onMouseEnter={() => onHover(workflow.id)}
    onMouseLeave={() => onHover(null)}
    onClick={onWorkflowView}
  >
    <div className="card-header">
      <h3>{workflow.name}</h3>
      <div className="status-indicator"></div>
    </div>
    <p className="description" title={workflow.description}>{workflow.description}</p>
    <div className="condition">
      <span className="label">Condition:</span>
      <code>{workflow.conditionField} {workflow.conditionOperator} {workflow.conditionValue}</code>
    </div>
    <button 
      className="start-btn pulse-animation"
      onClick={(e) => { e.stopPropagation(); onStartRequest(); }}
    >
      Start Request →
    </button>
  </div>
);

const RequestCard = ({ request, workflow, getStatusColor, onViewRemarks, onDelete }) => (
  <div className="card request-card">
    <div className="card-header">
      <h3>{workflow?.name || "Request"}</h3>
      <div 
        className="status-badge"
        style={{ 
          '--status-color': getStatusColor(request.status),
          backgroundColor: 'hsl(var(--status-color), 60%, 90%)',
          color: 'hsl(var(--status-color), 70%, 25%)'
        }}
      >
        {request.status}
      </div>
    </div>
    <div className="request-details">
      <div className="detail-row">
        <span>Current Level:</span>
        <strong>{request.currentLevel}</strong>
      </div>
    </div>
    <div className="card-actions">
      <div className="action-buttons-row">
        {request.status === "REJECTED" && request.remarks && (
          <button className="action-btn remarks-btn" onClick={onViewRemarks}>
            📝 View Rejection Reason
          </button>
        )}
        <button className="action-btn delete-btn" onClick={onDelete}>
          🗑 Delete Request
        </button>
      </div>
    </div>
  </div>
);

const WorkflowModal = ({ workflow, getStatusColor, onClose, onStartRequest }) => (
  <div className="overlay">
    <div className="modal">
      <div className="modal-header">
        <h2>{workflow.name}</h2>
        <button className="close-btn" onClick={onClose}>×</button>
      </div>
      <div className="workflow-content">
        <section className="modal-section">
          <h4>Description</h4>
          <div className="scrollable-content">{workflow.description}</div>
        </section>
        <section className="modal-section">
          <h4>Condition</h4>
          <div className="condition-display">
            {workflow.conditionField} {workflow.conditionOperator} {workflow.conditionValue || "—"}
          </div>
        </section>
        <section className="modal-section">
          <h4>Approval Flow</h4>
          <div className="approval-list">
            {workflow.approvalLevels?.map((level, i) => (
              <div key={i} className="approval-level">
                <span className="level-number">{i + 1}</span>
                <span>{level.role}</span>
              </div>
            ))}
          </div>
        </section>
        <section className="modal-section">
          <div className="escalation">
            <strong>Escalation:</strong> {workflow.escalationHours || "Not Set"} hours
          </div>
        </section>
      </div>
      <div className="modal-actions">
        <button className="cancel-btn" onClick={onClose}>Close</button>
        <button className="start-btn" onClick={onStartRequest}>Start Request →</button>
      </div>
    </div>
  </div>
);

const RemarksModal = ({ remarks, onClose }) => (
  <div className="overlay">
    <div className="modal remarks-modal">
      <div className="modal-header">
        <h3>Rejection Reason</h3>
        <button className="close-btn" onClick={onClose}>×</button>
      </div>
      <div className="remarks-box">{remarks}</div>
      <div className="modal-actions">
        <button className="cancel-btn" onClick={onClose}>Close</button>
      </div>
    </div>
  </div>
);

const LoadingSpinner = () => (
  <div className="loading-screen">
    <div className="spinner-container">
      <div className="spinner"></div>
      <p style={{ margin: 0, color: '#64748b', fontSize: '16px', fontWeight: '500' }}>
        Loading dashboard...
      </p>
    </div>
  </div>
);

const LoadingCard = () => (
  <div className="card loading-card">
    <div className="skeleton skeleton-title"></div>
    <div className="skeleton skeleton-text"></div>
    <div className="skeleton skeleton-text-small"></div>
    <div className="skeleton skeleton-button"></div>
  </div>
);

const EmptyState = () => (
  <div className="empty-state">
    <div className="empty-icon">📋</div>
    <h4>No requests yet</h4>
    <p>Start a new request from available workflows above</p>
  </div>
);
