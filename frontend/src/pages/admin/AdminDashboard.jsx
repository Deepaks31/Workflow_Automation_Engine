import React, { useState, useEffect } from "react";
import axios from "axios";
import CreateWorkflow from "./CreateWorkflow";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [showCreate, setShowCreate] = useState(false);
  const [workflows, setWorkflows] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("workflows");  
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    if (activeTab === "workflows") {
      loadWorkflows();
    } else {
      loadUsers();
    }
  }, [activeTab]);

  const loadWorkflows = () => {
    setLoading(true);
    axios
      .get(`${import.meta.env.VITE_API_URL}/api/workflows`)
      .then((res) => {
        const formatted = res.data.map((wf) => ({
          ...wf,
          approvals: wf.approvalLevels?.map((a) => a.role) || [],
          condition: wf.conditionField
            ? `${wf.conditionField} ${wf.conditionOperator} ${wf.conditionValue}`
            : "",
        }));
        setWorkflows(formatted);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  const loadUsers = () => {
    setLoading(true);
    axios
      .get(`${import.meta.env.VITE_API_URL}/api/admin/users`)
      .then((res) => {
        setUsers(res.data.users || res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownOpen && !event.target.closest('.dropdown-container')) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen]);

  const addWorkflow = (workflow) => {
    axios
      .post(`${import.meta.env.VITE_API_URL}/api/workflows`, workflow)
      .then((res) => {
        const wf = {
          ...res.data,
          approvals: res.data.approvalLevels?.map((a) => a.role) || [],
          condition: res.data.conditionField
            ? `${res.data.conditionField} ${res.data.conditionOperator} ${res.data.conditionValue}`
            : "",
        };
        setWorkflows([wf, ...workflows]);
        setShowCreate(false);
      })
      .catch((err) => console.error(err));
  };

  const deleteWorkflow = (id) => {
    if (!window.confirm("Are you sure you want to delete this workflow?")) return;
    setWorkflows(workflows.filter((wf) => wf.id !== id));
    axios
      .delete(`${import.meta.env.VITE_API_URL}/api/workflows/${id}`)
      .catch((err) => console.error(err));
  };

  const updateWorkflow = (workflow) => {
    axios
      .put(`${import.meta.env.VITE_API_URL}/api/workflows/${workflow.id}`, workflow)
      .then((res) => {
        const updated = {
          ...res.data,
          approvals: res.data.approvalLevels?.map((a) => a.role) || [],
          condition: res.data.conditionField
            ? `${res.data.conditionField} ${res.data.conditionOperator} ${res.data.conditionValue}`
            : "",
        };
        setWorkflows(workflows.map((wf) => (wf.id === updated.id ? updated : wf)));
        setSelectedWorkflow(null);
        setShowCreate(false);
      })
      .catch((err) => console.error(err));
  };

  const revokeAccess = (id) => {
    if (!window.confirm("Remove user access?")) return;
    setUsers(users.filter((u) => u.id !== id));
    axios
      .put(`${import.meta.env.VITE_API_URL}/api/admin/users/${id}/revoke`)
      .catch(console.error);
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
  };

  return (
    <>
      <div className="admin-layout">
        <div className="admin-app-wrapper">
          <header className={`admin-header ${scrolled ? 'scrolled' : ''}`}>
            <div className="header-content">
              <div className="header-left">
                <h1 className="page-title">
                  <span className="title-icon">⚙️</span>
                  Admin Dashboard
                </h1>
                <p className="page-subtitle">
                  {activeTab === "workflows" 
                    ? "Manage workflows and approval processes" 
                    : `Manage user access and permissions (${users.length} users)`
                  }
                </p>
              </div>
              <div className="header-actions">
                <div className="dropdown-container">
                  <button 
                    className="dropdown-toggle"
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                  >
                    <span className={`dropdown-icon ${activeTab === "workflows" ? "workflow-icon" : "user-icon"}`}>
                      {activeTab === "workflows" ? "⚙️" : "👤"}
                    </span>
                    {activeTab === "workflows" ? "Workflows" : "Users"}
                    <span className={`dropdown-arrow ${dropdownOpen ? 'open' : ''}`}>▼</span>
                  </button>
                  
                  {dropdownOpen && (
                    <div className="dropdown-menu">
                      <button 
                        className={`dropdown-item ${activeTab === "workflows" ? "active" : ""}`}
                        onClick={() => {
                          setActiveTab("workflows");
                          setDropdownOpen(false);
                        }}
                      >
                        <span className="workflow-icon">⚙️</span> Workflows
                      </button>
                      <button 
                        className={`dropdown-item ${activeTab === "users" ? "active" : ""}`}
                        onClick={() => {
                          setActiveTab("users");
                          setDropdownOpen(false);
                        }}
                      >
                        <span className="user-icon">👤</span> Users
                      </button>
                    </div>
                  )}
                </div>

                <div className="stats-grid">
                  <div className="stat-card">
                    <div className="stat-value">
                      {activeTab === "workflows" ? workflows.length : users.length}
                    </div>
                    <div className="stat-label">
                      {activeTab === "workflows" ? "Total Workflows" : "Total Users"}
                    </div>
                  </div>
                </div>
                <div className="header-buttons">
                  {activeTab === "workflows" && (
                    <>
                      <button className="create-btn" onClick={() => setShowCreate(true)}>
                        <span className="btn-icon">+</span>
                        Create Workflow
                      </button>
                      <button
                        className="designer-btn"
                        onClick={() => navigate("/admin/workflow-designer")}
                      >
                        🧩 Visual Designer
                      </button>
                    </>
                  )}
                  <button className="logout-btn" onClick={handleLogout}>
                    🚪 Logout
                  </button>
                </div>
              </div>
            </div>
          </header>
          
          <main className="main-content">
            <section className="content-section">
              <div className="section-header">
                <h2>{activeTab === "workflows" ? "All Workflows" : "Active Users"}</h2>
                <div className="section-badge">
                  {activeTab === "workflows" ? "Manage & Configure" : "Access Control"}
                </div>
              </div>
              
              {loading ? (
                <LoadingSpinner />
              ) : activeTab === "workflows" ? (
                workflows.length === 0 ? (
                  <EmptyState />
                ) : (
                  <div className="workflows-grid">
                    {workflows.map((wf, index) => (
                      <WorkflowCard
                        key={wf.id ?? `workflow-${index}`}
                        workflow={wf}
                        onEdit={() => {
                          setSelectedWorkflow(wf);
                          setShowCreate(true);
                        }}
                        onDelete={() => deleteWorkflow(wf.id)}
                      />
                    ))}
                  </div>
                )
              ) : (
                <UsersTable 
                  users={users} 
                  onRevoke={revokeAccess}
                />
              )}
            </section>
          </main>
        </div>
      </div>

      {showCreate && (
        <CreateWorkflow
          onClose={() => {
            setShowCreate(false);
            setSelectedWorkflow(null);
          }}
          onCreate={selectedWorkflow ? updateWorkflow : addWorkflow}
          workflow={selectedWorkflow}
        />
      )}

      <style>{`
        * { 
          box-sizing: border-box; 
          margin: 0;
          padding: 0;
        }
        
        html, body {
          height: 100%;
          overflow-x: hidden;
        }

        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
        }

        .admin-layout {
          min-height: 100vh;
        }

        .admin-app-wrapper {
          min-height: 100vh;
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
          display: flex;
          flex-direction: column;
        }

        .admin-header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          background: rgba(255, 255, 255, 0.98);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(0,0,0,0.08);
          z-index: 1000;
          padding: 20px 5%;
          box-shadow: 0 4px 30px rgba(0,0,0,0.1);
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          animation: slideDown 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        @keyframes slideDown {
          from { transform: translateY(-100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        .admin-header.scrolled { 
          padding: 16px 5%; 
          box-shadow: 0 10px 40px rgba(0,0,0,0.15);
          backdrop-filter: blur(30px);
        }

        .header-content {
          max-width: 1400px; 
          margin: 0 auto; 
          display: flex;
          justify-content: space-between; 
          align-items: center; 
          gap: 32px;
          width: 100%;
        }

        .header-left h1 {
          margin: 0 0 6px 0; 
          font-size: 28px; 
          font-weight: 800; 
          color: #1e293b;
          display: flex; 
          align-items: center; 
          gap: 12px;
          animation: fadeInUp 0.6s ease-out;
        }
        
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .title-icon { 
          font-size: 24px; 
          animation: bounce 2s infinite;
        }
        
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-8px); }
          60% { transform: translateY(-4px); }
        }
        
        .page-subtitle { 
          margin: 0; 
          font-size: 16px; 
          color: #64748b; 
          font-weight: 500;
          animation: fadeInUp 0.8s ease-out 0.2s both;
        }

        .header-actions { 
          display: flex; 
          align-items: center; 
          gap: 24px; 
        }

        .dropdown-container {
          position: relative;
        }

        .dropdown-toggle {
          padding: 12px 24px;
          background: linear-gradient(135deg, rgba(255,255,255,0.9), rgba(248,250,252,0.9));
          border: 1px solid rgba(0,0,0,0.08);
          border-radius: 16px;
          font-size: 15px;
          font-weight: 600;
          color: #1e293b;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 12px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 4px 20px rgba(0,0,0,0.08);
          position: relative;
          overflow: hidden;
          min-height: 52px;
        }

        .dropdown-toggle:hover {
          background: linear-gradient(135deg, #f8fafc, #f1f5f9);
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.15);
          border-color: rgba(59,130,246,0.2);
        }

        .dropdown-icon {
          font-size: 18px;
        }

        .dropdown-arrow {
          font-size: 12px;
          font-weight: 800;
          transition: transform 0.3s ease;
          margin-left: auto;
        }

        .dropdown-arrow.open {
          transform: rotate(180deg);
        }

        .dropdown-menu {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: white;
          border-radius: 16px;
          box-shadow: 0 20px 50px rgba(0,0,0,0.15);
          border: 1px solid rgba(0,0,0,0.08);
          margin-top: 8px;
          overflow: hidden;
          animation: dropdownSlide 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 1001;
        }

        @keyframes dropdownSlide {
          from {
            opacity: 0;
            transform: translateY(-10px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .dropdown-item {
          width: 100%;
          padding: 16px 20px;
          background: none;
          border: none;
          text-align: left;
          font-size: 15px;
          font-weight: 600;
          color: #475569;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 12px;
          transition: all 0.3s ease;
          border-bottom: 1px solid rgba(0,0,0,0.05);
        }

        .dropdown-item:last-child {
          border-bottom: none;
        }

        .dropdown-item:hover {
          background: linear-gradient(135deg, #f8fafc, #f1f5f9);
          color: #1e293b;
          padding-left: 28px;
        }

        .dropdown-item.active {
          background: linear-gradient(135deg, #3b82f6, #1d4ed8) !important;
          color: white !important;
        }

        .stats-grid { 
          display: flex; 
          gap: 16px; 
        }
        
        .stat-card {
          background: linear-gradient(135deg, rgba(255,255,255,0.9), rgba(248,250,252,0.9));
          padding: 16px 20px; 
          border-radius: 16px; 
          border: 1px solid rgba(0,0,0,0.06);
          text-align: center; 
          min-width: 110px; 
          box-shadow: 0 4px 20px rgba(0,0,0,0.08);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          animation: fadeInUp 1s ease-out 0.4s both;
        }
        
        .stat-card:hover {
          transform: translateY(-4px) scale(1.02);
          box-shadow: 0 12px 40px rgba(0,0,0,0.15);
        }
        
        .stat-value { 
          font-size: 24px; 
          font-weight: 800; 
          color: #3b82f6; 
          line-height: 1;
          transition: all 0.3s ease;
        }
        
        .stat-label { 
          font-size: 13px; 
          color: #64748b; 
          margin-top: 4px; 
          font-weight: 600;
        }

        .header-buttons { 
          display: flex; 
          gap: 12px; 
          align-items: center; 
        }
        
        .create-btn, .logout-btn, .designer-btn {
          padding: 12px 24px; 
          border-radius: 12px; 
          font-size: 15px; 
          font-weight: 600;
          cursor: pointer; 
          border: none;
          display: flex;
          align-items: center; 
          gap: 8px;
          transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }
        
        .create-btn {
          background: linear-gradient(135deg, #3b82f6, #1d4ed8); 
          color: white;
          box-shadow: 0 6px 25px rgba(59, 130, 246, 0.4);
        }
        
        .create-btn:hover { 
          transform: translateY(-3px) scale(1.05); 
          box-shadow: 0 15px 35px rgba(59, 130, 246, 0.5);
        }
        
        .logout-btn {
          background: linear-gradient(135deg, #f8fafc, #f1f5f9);
          color: #64748b; 
          border: 1px solid #e2e8f0;
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }
        
        .logout-btn:hover { 
          background: #e2e8f0; 
          transform: translateY(-2px) scale(1.02);
          box-shadow: 0 8px 25px rgba(0,0,0,0.15);
          color: #475569;
        }

        .designer-btn {
          background: linear-gradient(135deg, #f97316, #ea580c);
          color: white;
          box-shadow: 0 6px 20px rgba(234, 88, 12, 0.35);
        }

        .designer-btn:hover {
          transform: translateY(-3px) scale(1.05);
          box-shadow: 0 14px 30px rgba(234, 88, 12, 0.45);
        }

        .main-content { 
          flex: 1;
          max-width: 1400px; 
          margin: 140px auto 0; 
          padding: 40px 5%; 
          width: 100%;
        }
        
        .content-section { 
          margin-bottom: 64px; 
        }
        
        .section-header {
          display: flex; 
          justify-content: space-between; 
          align-items: center; 
          margin-bottom: 32px;
          animation: fadeInUp 1s ease-out;
        }
        
        .section-header h2 { 
          margin: 0; 
          font-size: 24px; 
          font-weight: 700; 
          color: #1e293b;
          letter-spacing: -0.5px;
        }
        
        .section-badge {
          padding: 8px 16px; 
          border-radius: 20px; 
          font-size: 13px; 
          font-weight: 600;
          background: linear-gradient(135deg, #10b981, #059669); 
          color: white;
          box-shadow: 0 4px 15px rgba(16,185,129,0.3);
          transition: all 0.3s ease;
        }
        
        .section-badge:hover {
          transform: scale(1.05);
        }

        .workflows-grid {
          display: grid; 
          grid-template-columns: repeat(auto-fill, minmax(380px, 1fr)); 
          gap: 24px;
          width: 100%;
        }

        .workflow-card {
          background: white; 
          border-radius: 20px; 
          box-shadow: 0 8px 35px rgba(0,0,0,0.1);
          border: 1px solid rgba(0,0,0,0.06); 
          height: 100%; 
          display: flex; 
          flex-direction: column;
          overflow: hidden; 
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          max-height: 320px;
          animation: cardSlideIn 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
          opacity: 0;
          transform: translateY(30px);
        }
        
        @keyframes cardSlideIn {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .workflow-card:hover { 
          transform: translateY(-8px) scale(1.02) !important; 
          box-shadow: 0 25px 50px rgba(0,0,0,0.2);
        }

        .card-content { 
          padding: 24px; 
          flex: 1; 
          display: flex; 
          flex-direction: column; 
        }
        
        .card-footer {
          padding: 0 24px 24px; 
          border-top: 1px solid #f1f5f9; 
          display: flex; 
          gap: 12px;
        }
        
        .card-header { 
          display: flex; 
          justify-content: space-between; 
          align-items: flex-start; 
          margin-bottom: 16px; 
        }
        
        .workflow-title {
          font-size: 20px; 
          font-weight: 700; 
          color: #1e293b; 
          margin: 0 0 6px 0; 
          line-height: 1.3;
          transition: all 0.3s ease;
        }
        
        .workflow-title:hover {
          color: #3b82f6;
        }
        
        .status-badge {
          padding: 6px 16px; 
          border-radius: 20px; 
          font-size: 12px; 
          font-weight: 600;
          background: linear-gradient(135deg, #10b981, #059669); 
          color: white;
          box-shadow: 0 2px 10px rgba(16,185,129,0.3);
        }

        .workflow-description {
          color: #64748b; 
          font-size: 15px; 
          line-height: 1.6; 
          margin-bottom: 20px; 
          flex: 1;
          display: -webkit-box; 
          -webkit-line-clamp: 2; 
          -webkit-box-orient: vertical;
          overflow: hidden; 
          cursor: pointer; 
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
        }
        
        .workflow-description:hover {
          -webkit-line-clamp: unset; 
          background: rgba(59,130,246,0.08);
          padding: 8px 12px; 
          border-radius: 8px;
          color: #475569;
        }

        .workflow-meta { 
          display: flex; 
          flex-direction: column; 
          gap: 12px; 
          margin-bottom: 20px; 
        }
        
        .meta-row { 
          display: flex; 
          justify-content: space-between; 
          font-size: 14px; 
        }
        
        .meta-label { 
          color: #64748b; 
          font-weight: 500; 
        }
        
        .meta-value { 
          color: #1e293b; 
          font-weight: 600; 
        }

        .action-btn {
          flex: 1; 
          padding: 12px 16px; 
          border-radius: 12px; 
          border: none; 
          font-size: 14px;
          font-weight: 600; 
          cursor: pointer; 
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); 
          display: flex;
          align-items: center; 
          justify-content: center; 
          gap: 8px; 
          min-height: 48px;
          position: relative;
          overflow: hidden;
        }
        
        .edit-btn {
          background: linear-gradient(135deg, #f8fafc, #f1f5f9); 
          color: #475569; 
          border: 1px solid #e2e8f0;
        }
        
        .edit-btn:hover { 
          background: linear-gradient(135deg, #e2e8f0, #cbd5e1);
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.15);
        }
        
        .delete-btn {
          background: linear-gradient(135deg, #fee2e2, #fecaca); 
          color: #dc2626; 
          border: 1px solid #fecaca;
        }
        
        .delete-btn:hover { 
          background: #fecaca;
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(220,38,38,0.3);
        }

        .users-table-container {
          background: white;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 12px 40px rgba(0,0,0,0.1);
          border: 1px solid rgba(0,0,0,0.06);
          animation: fadeInUp 0.3s ease-out 0.3s both;


        }

        .users-table-wrapper {
          overflow-x: auto;
        }

        .users-table {
          width: 100%;
          min-width: 800px;
        }

        .users-table thead {
          background: linear-gradient(135deg, #f8fafc, #f1f5f9);
          position: sticky;
          top: 0;
          z-index: 10;
        }

        .users-table th {
          padding: 20px 24px;
          font-weight: 700;
          color: #1e293b;
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border-bottom: 2px solid #e2e8f0;
          text-align: left;
        }

        .users-table td {
          padding: 20px 24px;
          border-bottom: 1px solid #f1f5f9;
          vertical-align: middle;
        }

        .users-table tr:hover {
          background: rgba(59,130,246,0.04);
        }

        .user-name {
          font-weight: 600;
          color: #1e293b;
          font-size: 16px;
        }

        .user-email {
          color: #64748b;
          font-size: 15px;
        }

        .user-role {
          padding: 6px 16px;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 600;
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          color: white;
          min-width: 50px;
          text-align: center;
        }

        .revoke-btn {
          padding: 6px 12px;
          background: linear-gradient(135deg, #fee2e2, #fecaca);
          color: #dc2626;
          border: 1px solid #fecaca;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          align-items: center;
          gap: 4px;
          min-height: 32px;
          width: auto;
          justify-content: center;
        }

        .revoke-btn:hover {
          background: #fecaca;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(220,38,38,0.3);
        }

        .empty-state {
          text-align: center; 
          padding: 80px 40px; 
          background: white; 
          border-radius: 24px;
          border: 2px dashed #e2e8f0; 
          box-shadow: 0 12px 40px rgba(0,0,0,0.1);
          animation: fadeInUp 1s ease-out;
          transform: scale(0.95);
          transition: all 0.4s ease;
        }
        
        .empty-state:hover {
          transform: scale(1);
        }
        
        .empty-state h3 { 
          color: #1e293b; 
          margin: 0 0 12px 0; 
          font-size: 24px; 
          font-weight: 700; 
        }
        
        .empty-state p { 
          color: #64748b; 
          margin: 0 0 32px 0; 
          font-size: 16px; 
        }
        
        .empty-icon { 
          font-size: 64px; 
          margin-bottom: 24px;
          animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }

        .loading-screen {
          display: flex; 
          align-items: center; 
          justify-content: center; 
          min-height: 60vh;
          height: 100%;
        }
        
        .spinner-container { 
          display: flex; 
          flex-direction: column; 
          align-items: center; 
          gap: 20px; 
        }
        
        .spinner {
          width: 52px; 
          height: 52px; 
          border: 4px solid #e2e8f0; 
          border-top: 4px solid #3b82f6;
          border-radius: 50%; 
          animation: spin 1s cubic-bezier(0.4, 0, 0.2, 1) infinite,
                            pulse 2s infinite;
        }
        
        @keyframes spin { 
          to { transform: rotate(360deg); } 
        }

        @media (max-width: 1200px) {
          .stats-grid {
            display: none;
          }
        }

        @media (max-width: 768px) {
          .admin-header {
            padding: 16px 24px;
          }
          .header-content { 
            flex-direction: column; 
            gap: 24px; 
            align-items: stretch; 
          }
          .header-actions { 
            flex-direction: column; 
            gap: 20px; 
            width: 100%;
          }
          .header-buttons { 
            flex-direction: row; 
            gap: 12px; 
            width: 100%; 
            justify-content: center;
          }
          .main-content { 
            margin-top: 120px;
            padding: 24px 5%; 
          }
          .workflows-grid { 
            grid-template-columns: 1fr; 
            gap: 20px;
          }
        }

        @media (max-width: 480px) {
          .header-buttons {
            flex-direction: column;
            gap: 12px;
          }
          .dropdown-toggle {
            width: 100%;
            justify-content: space-between;
          }
        }
      `}</style>
    </>
  );
}

const WorkflowCard = ({ workflow, onEdit, onDelete }) => (
  <div className="workflow-card" style={{ animationDelay: `${Math.random() * 0.2}s` }}>
    <div className="card-content">
      <div className="card-header">
        <div>
          <h3 className="workflow-title">{workflow.name}</h3>
        </div>
        <div className="status-badge">{workflow.status || 'ACTIVE'}</div>
      </div>
      <p className="workflow-description" title={workflow.description}>
        {workflow.description}
      </p>
      <div className="workflow-meta">
        <div className="meta-row">
          <span className="meta-label">Condition:</span>
          <span className="meta-value">{workflow.condition || 'No condition'}</span>
        </div>
        <div className="meta-row">
          <span className="meta-label">Approval Levels:</span>
          <span className="meta-value">
            {workflow.approvals?.length > 0 
              ? workflow.approvals.join(' → ') 
              : 'Direct approval'
            }
          </span>
        </div>
      </div>
    </div>
    <div className="card-footer">
      <button className="action-btn edit-btn" onClick={onEdit}>
        ✏️ Edit
      </button>
      <button className="action-btn delete-btn" onClick={onDelete}>
        🗑 Delete
      </button>
    </div>
  </div>
);

const UsersTable = ({ users, onRevoke }) => (
  <div className="users-table-container">
    <div className="users-table-wrapper">
      <table className="users-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {users.length === 0 ? (
            <tr>
              <td colSpan="4" style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>
                No active users found
              </td>
            </tr>
          ) : (
            users.map((user) => (
              <tr key={user.id}>
                <td>
                  <div className="user-name">{user.name}</div>
                </td>
                <td>
                  <div className="user-email">{user.email}</div>
                </td>
                <td>
                  <div className="user-role">{user.role}</div>
                </td>
                <td>
                  <button 
                    className="revoke-btn" 
                    onClick={() => onRevoke(user.id)}
                  >
                    ❌ Revoke
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  </div>
);

const LoadingSpinner = () => (
  <div className="loading-screen">
    <div className="spinner-container">
      <div className="spinner"></div>
      <p style={{ margin: 0, color: '#64748b', fontSize: '16px', fontWeight: '500' }}>
        Loading...
      </p>
    </div>
  </div>
);

const EmptyState = () => (
  <div className="empty-state">
    <div className="empty-icon">📋</div>
    <h3>No workflows yet</h3>
    <p>Create your first workflow to get started with the approval process</p>
    <button 
      className="create-btn" 
      style={{ 
        margin: '0 auto', 
        background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
        color: 'white', 
        padding: '14px 32px', 
        fontSize: '15px',
        fontWeight: '600',
        borderRadius: '12px',
        border: 'none',
        cursor: 'pointer'
      }}
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
    >
      + Create First Workflow
    </button>
  </div>
);
