import React, { useCallback, useState } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  addEdge,
  useEdgesState,
  useNodesState,
} from "reactflow";
import "reactflow/dist/style.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const initialNodes = [
  {
    id: "start",
    type: "input",
    position: { x: 0, y: 100 },
    data: { label: "Start" },
  },
  {
    id: "end",
    type: "output",
    position: { x: 600, y: 100 },
    data: { label: "End" },
  },
];

const initialEdges = [
  {
    id: "e-start-end",
    source: "start",
    target: "end",
    label: "Default path",
    data: { condition: "" },
  },
];

const ROLE_OPTIONS = ["Manager", "Finance"];

export default function WorkflowDesigner() {
  const navigate = useNavigate();

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const [selectedEdgeId, setSelectedEdgeId] = useState(null);
  const [workflowName, setWorkflowName] = useState("");
  const [workflowDescription, setWorkflowDescription] = useState("");

  // Interactive workflow details
  const [conditionField, setConditionField] = useState("amount");
  const [conditionOperator, setConditionOperator] = useState(">");
  const [amount, setAmount] = useState("");
  const [escalation, setEscalation] = useState("");
  const [approvals, setApprovals] = useState([
    { id: crypto.randomUUID(), role: ROLE_OPTIONS[0] },
  ]);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [sidebarExpanded, setSidebarExpanded] = useState(true);

  const onConnect = useCallback(
    (params) =>
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            label: "New path",
            data: { condition: "" },
          },
          eds
        )
      ),
    [setEdges]
  );

  const addRoleNode = (roleLabel) => {
    const id = `${roleLabel.toLowerCase()}-${nodes.length + 1}`;
    const yOffset = nodes.length * 60;
    setNodes((nds) => [
      ...nds,
      {
        id,
        position: { x: 250, y: 40 + yOffset },
        data: { label: roleLabel },
      },
    ]);
  };

  const ensureApprovalForRole = (roleLabel) => {
    setApprovals((prev) => {
      const exists = prev.some(
        (a) => a.role.toLowerCase() === roleLabel.toLowerCase()
      );
      if (exists) return prev;
      return [...prev, { id: crypto.randomUUID(), role: roleLabel }];
    });
  };

  const handleAddRoleClick = (roleLabel) => {
    const alreadyInApprovals = approvals.some(
      (a) => a.role.toLowerCase() === roleLabel.toLowerCase()
    );
    const nodeExists = nodes.some(
      (n) => n.data?.label?.toLowerCase() === roleLabel.toLowerCase()
    );

    if (!nodeExists) {
      addRoleNode(roleLabel);
    }
    if (!alreadyInApprovals) {
      ensureApprovalForRole(roleLabel);
    }
  };

  const addApprovalLevel = () => {
    setApprovals((prev) => {
      const used = prev.map((a) => a.role);
      const nextRole = ROLE_OPTIONS.find((r) => !used.includes(r));
      if (!nextRole) return prev;
      return [...prev, { id: crypto.randomUUID(), role: nextRole }];
    });
  };

  const updateApprovalRole = (id, role) => {
    setApprovals((prev) =>
      prev.map((a) => (a.id === id ? { ...a, role } : a))
    );
  };

  const removeApprovalLevel = (id) => {
    setApprovals((prev) => {
      if (prev.length === 1) return prev;

      const levelToRemove = prev.find((a) => a.id === id);

      if (levelToRemove) {
        setNodes((nds) =>
          nds.filter((n) => {
            const label = n.data?.label;
            if (n.id === "start" || n.id === "end") return true;
            return label !== levelToRemove.role;
          })
        );
      }

      return prev.filter((a) => a.id !== id);
    });
  };

  const handleEdgeClick = (_, edge) => {
    setSelectedEdgeId(edge.id);
  };

  const selectedEdge = edges.find((e) => e.id === selectedEdgeId);

  const handleConditionChange = (e) => {
    const value = e.target.value;
    setEdges((eds) =>
      eds.map((edge) =>
        edge.id === selectedEdgeId
          ? {
              ...edge,
              label: value || "Default path",
              data: {
                ...(edge.data || {}),
                condition: value,
              },
            }
          : edge
      )
    );
  };

  const handleSave = async () => {
    setError("");
    setSuccessMessage("");

    if (!workflowName.trim()) {
      setError("Please provide a workflow name.");
      return;
    }

    if (!conditionField.trim() || !amount.trim() || !escalation.trim()) {
      setError("Please fill condition field, value and escalation hours.");
      return;
    }

    const numericAmount = parseFloat(amount);
    const field = (conditionField || "").toLowerCase();
    let riskScore = 20;
    if (!Number.isNaN(numericAmount)) {
      if (numericAmount >= 50000) riskScore += 50;
      else if (numericAmount >= 20000) riskScore += 30;
      else if (numericAmount <= 5000) riskScore -= 10;
    }
    if (field.includes("travel") || field.includes("expense")) riskScore += 10;
    if (field.includes("capex") || field.includes("asset")) riskScore += 20;
    riskScore = Math.max(0, Math.min(100, riskScore));
    const priority = riskScore >= 70 ? "HIGH" : riskScore >= 40 ? "MEDIUM" : "LOW";

    const payload = {
      name: workflowName.trim(),
      description: workflowDescription.trim(),
      conditionField: conditionField.trim(),
      conditionOperator,
      conditionValue: Number.isNaN(numericAmount) ? null : numericAmount,
      escalationHours: Number(escalation),
      createdBy: "Admin",
      riskScore,
      priority,
      approvalLevels: approvals.map((a, index) => ({
        levelNo: index + 1,
        role: a.role,
      })),
      designerJson: JSON.stringify({
        nodes,
        edges,
      }),
    };

    try {
      setSaving(true);
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/workflows`,
        payload
      );

      setSuccessMessage("Workflow saved successfully!");

      setTimeout(() => {
        navigate("/admin");
      }, 800);

      return res.data;
    } catch (err) {
      console.error(err);
      setError("Failed to save workflow. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="designer-page">
      <header className="designer-header">
        <div className="designer-header-left">
          <button className="back-btn" onClick={() => navigate("/admin")}>
            ← Back to Admin
          </button>
          <div>
            <h1 className="designer-title">Workflow Designer</h1>
            <p className="designer-subtitle">
              Visually design approval flows like Start → Manager → Finance → Auditor → End
            </p>
          </div>
        </div>
        <div className="designer-header-right">
          <button
            className="sidebar-toggle-btn"
            type="button"
            onClick={() => setSidebarExpanded((v) => !v)}
          >
            {sidebarExpanded ? "⟷ Compact" : "⟷ Expand"}
          </button>
          <button
            className="primary-btn"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Workflow"}
          </button>
        </div>
      </header>

      <div className="designer-container">
        <aside 
          className={`designer-sidebar ${sidebarExpanded ? 'expanded' : 'collapsed'}`}
          style={{ width: sidebarExpanded ? '420px' : '320px' }}
        >
          <div className="sidebar-scroller">
            <div className="sidebar-content">
              <section className="designer-section">
                <h2>Workflow Details</h2>
                <div className="form-group">
                  <label>Name</label>
                  <input
                    type="text"
                    value={workflowName}
                    placeholder="e.g. High Value PO Approval"
                    onChange={(e) => setWorkflowName(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    rows={2}
                    value={workflowDescription}
                    placeholder="Short description of this workflow"
                    onChange={(e) => setWorkflowDescription(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Condition</label>
                  <div className="designer-condition compact">
                    <div className="condition-field-row">
                      <input
                        type="text"
                        value={conditionField}
                        onChange={(e) => setConditionField(e.target.value)}
                        placeholder="amount"
                        className="condition-field"
                      />
                      <select
                        value={conditionOperator}
                        onChange={(e) => setConditionOperator(e.target.value)}
                        className="condition-operator"
                      >
                        <option value=">">&gt;</option>
                        <option value="<">&lt;</option>
                        <option value="==">==</option>
                        <option value=">=">&gt;=</option>
                        <option value="<=">&lt;=</option>
                      </select>
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="50000"
                        className="condition-value"
                      />
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label>Escalation (hours)</label>
                  <input
                    type="number"
                    min={1}
                    value={escalation}
                    onChange={(e) => setEscalation(e.target.value)}
                    placeholder="24"
                  />
                </div>
              </section>

              <section className="designer-section">
                <h2>Approval Roles</h2>
                <p className="helper-text">
                  Click to add nodes to canvas
                </p>
                <div className="pill-grid">
                  {ROLE_OPTIONS.map((role) => (
                    <button
                      key={role}
                      className="pill-btn"
                      onClick={() => handleAddRoleClick(role)}
                    >
                      {role}
                    </button>
                  ))}
                </div>

                <div className="approvals-list">
                  {approvals.map((level, index) => (
                    <div className="approval-row" key={level.id}>
                      <span className="approval-label">Level {index + 1}</span>
                      {(() => {
                        const usedRoles = approvals
                          .filter((a) => a.id !== level.id)
                          .map((a) => a.role);
                        return (
                          <select
                            value={level.role}
                            onChange={(e) =>
                              updateApprovalRole(level.id, e.target.value)
                            }
                          >
                            {ROLE_OPTIONS.map((role) => (
                              <option
                                key={role}
                                value={role}
                                disabled={usedRoles.includes(role)}
                              >
                                {role}
                              </option>
                            ))}
                          </select>
                        );
                      })()}
                      {approvals.length > 1 && (
                        <button
                          type="button"
                          className="remove-approval-btn"
                          onClick={() => removeApprovalLevel(level.id)}
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    className="add-approval-btn"
                    onClick={addApprovalLevel}
                  >
                    + Add Level
                  </button>
                </div>
              </section>

              <section className="designer-section">
                <h2>Edge Condition</h2>
                {selectedEdge ? (
                  <div className="form-group">
                    <label>Expression</label>
                    <input
                      type="text"
                      placeholder="amount > 50000"
                      value={selectedEdge.data?.condition || ""}
                      onChange={handleConditionChange}
                    />
                  </div>
                ) : (
                  <p className="helper-text">Click an arrow to edit</p>
                )}
              </section>

              {error && <div className="alert error-alert">{error}</div>}
              {successMessage && (
                <div className="alert success-alert">{successMessage}</div>
              )}
            </div>
          </div>
        </aside>

        <section className="designer-canvas">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onEdgeClick={handleEdgeClick}
            fitView
            minZoom={0.1}
            maxZoom={2}
          >
            <Background gap={16} size={1} />
            <Controls 
              showZoom={true}
              showFitView={true}
              showInteractive={true}
              position="bottom-right"
            />
            <MiniMap 
              nodeColor={(node) => {
                switch (node.type) {
                  case 'input': return '#3b82f6';
                  case 'output': return '#10b981';
                  default: return '#8b5cf6';
                }
              }}
              maskColor="rgba(0,0,0,0.2)"
              miniMapColor="rgba(255,255,255,0.8)"
            />
          </ReactFlow>
        </section>
      </div>

      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-5px); }
        }

        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.3); }
          50% { box-shadow: 0 0 40px rgba(59, 130, 246, 0.6); }
        }

        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }

        * {
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }

        .designer-page {
          display: flex;
          flex-direction: column;
          height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          background-size: 400% 400%;
          animation: shimmer 8s ease infinite;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          overflow: hidden;
        }

        .designer-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 28px;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px) saturate(180%);
          border-bottom: 1px solid rgba(148, 163, 184, 0.2);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
          z-index: 10;
          position: sticky;
          top: 0;
        }

        .designer-header:hover {
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
        }

        .designer-header-left {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .designer-header-right {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .sidebar-toggle-btn {
          border-radius: 20px;
          border: 1px solid #e5e7eb;
          padding: 8px 14px;
          font-size: 12px;
          font-weight: 600;
          background: #f9fafb;
          color: #4b5563;
          cursor: pointer;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.06);
        }

        .sidebar-toggle-btn:hover {
          background: #e5e7eb;
        }

        .designer-title {
          margin: 0 0 2px 0;
          font-size: 28px;
          font-weight: 800;
          background: linear-gradient(135deg, #1e40af, #3b82f6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          letter-spacing: -0.5px;
        }

        .designer-subtitle {
          margin: 0;
          font-size: 14px;
          color: #64748b;
          font-weight: 500;
        }

        .back-btn, .primary-btn {
          border-radius: 25px;
          padding: 14px 28px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          border: none;
        }

        .back-btn {
          border: 2px solid transparent;
          background: linear-gradient(white, white) padding-box,
                      linear-gradient(135deg, #3b82f6, #1d4ed8) border-box;
          color: #1e40af;
          box-shadow: 0 8px 25px rgba(59, 130, 246, 0.3);
        }

        .back-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 15px 35px rgba(59, 130, 246, 0.4);
        }

        .primary-btn {
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          color: white;
          box-shadow: 0 15px 35px rgba(59, 130, 246, 0.4);
        }

        .primary-btn:hover:not(:disabled) {
          transform: translateY(-3px) scale(1.02);
          box-shadow: 0 25px 50px rgba(59, 130, 246, 0.5);
        }

        .primary-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          box-shadow: none;
          transform: none;
        }

        .designer-container {
          flex: 1;
          display: flex;
          overflow: hidden;
          height: calc(100vh - 80px);
        }

        .designer-sidebar {
          background: rgba(255, 255, 255, 0.97);
          backdrop-filter: blur(20px);
          border-right: 1px solid rgba(148, 163, 184, 0.2);
          box-shadow: 2px 0 20px rgba(0, 0, 0, 0.05);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .designer-sidebar.expanded {
          width: 420px !important;
        }

        .designer-sidebar.collapsed {
          width: 320px !important;
        }

        /* FIXED: Proper scrolling container with no visible scrollbar */
        .sidebar-scroller {
          flex: 1;
          overflow: hidden;
          padding: 24px;
          height: 100%;
        }

        .sidebar-content {
          height: 100%;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        /* PERFECT SCROLLBAR SOLUTION - No visible scrollbar, content fits perfectly */
        .sidebar-scroller {
          -ms-overflow-style: none;
          scrollbar-width: none;
          overflow-y: auto;
          overflow-x: hidden;
        }

        .sidebar-scroller::-webkit-scrollbar {
          display: none;
          width: 0;
          height: 0;
        }

        .sidebar-scroller *::-webkit-scrollbar {
          display: none !important;
          width: 0 !important;
          height: 0 !important;
        }

        .designer-section {
          flex-shrink: 0;
        }

        .designer-section + .designer-section {
          padding-top: 20px;
          border-top: 1px solid rgba(148, 163, 184, 0.1);
        }

        .designer-section:last-child {
          margin-bottom: 20px;
        }

        .designer-section h2 {
          font-size: 15px;
          font-weight: 800;
          margin: 0 0 14px 0;
          color: #1e293b;
          position: relative;
        }

        .designer-section h2::after {
          content: '';
          position: absolute;
          bottom: -4px;
          left: 0;
          width: 40px;
          height: 3px;
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          border-radius: 2px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 16px;
          flex-shrink: 0;
        }

        .form-group label {
          font-size: 13px;
          font-weight: 700;
          color: #374151;
        }

        .form-group input,
        .form-group textarea,
        .form-group select {
          border-radius: 12px;
          border: 2px solid #e5e7eb;
          padding: 12px 16px;
          font-size: 14px;
          outline: none;
          background: white;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
          transition: all 0.3s ease;
          flex-shrink: 0;
          width: 100%;
          box-sizing: border-box;
        }

        .form-group input:focus,
        .form-group textarea:focus,
        .form-group select:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
          transform: translateY(-1px);
        }

        .condition-field-row {
          display: grid;
          grid-template-columns: 1.2fr 0.8fr 1.2fr;
          gap: 8px;
          align-items: center;
        }

        .condition-field {
          background: linear-gradient(135deg, #eff6ff, #dbeafe);
          font-weight: 600;
          color: #1e40af;
        }

        .condition-operator {
          text-align: center;
          font-weight: 700;
          background: linear-gradient(135deg, #eff6ff, #dbeafe);
          border: 2px solid #bfdbfe;
          color: #1e40af;
          font-size: 15px;
          padding: 12px 8px;
        }

        .condition-value {
          text-align: right;
          font-weight: 600;
          font-family: 'SF Mono', Monaco, monospace;
        }

        .helper-text {
          font-size: 12px;
          color: #6b7280;
          margin: 0 0 14px 0;
          line-height: 1.4;
        }

        .pill-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-bottom: 16px;
        }

        .pill-btn {
          border-radius: 20px;
          border: 2px solid #e5e7eb;
          background: white;
          padding: 10px 18px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          color: #374151;
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
          flex: 1;
          min-width: 90px;
        }

        .pill-btn:hover {
          transform: translateY(-2px);
          border-color: #3b82f6;
          box-shadow: 0 12px 30px rgba(59, 130, 246, 0.3);
          color: #1e40af;
        }

        .approvals-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-top: 8px;
          flex-shrink: 0;
        }

        .approval-row {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: rgba(59, 130, 246, 0.05);
          border-radius: 12px;
          border: 2px solid transparent;
        }

        .approval-row:hover {
          border-color: rgba(59, 130, 246, 0.2);
          transform: translateX(2px);
        }

        .approval-label {
          font-size: 12px;
          color: #64748b;
          font-weight: 700;
          min-width: 60px;
        }

        .approval-row select {
          flex: 1;
          border-radius: 10px;
          border: 2px solid #e5e7eb;
          padding: 10px 14px;
          font-size: 14px;
          background: white;
          font-weight: 600;
        }

        .remove-approval-btn {
          border-radius: 50%;
          border: none;
          width: 28px;
          height: 28px;
          padding: 0;
          font-size: 14px;
          font-weight: bold;
          cursor: pointer;
          background: linear-gradient(135deg, #fee2e2, #fecaca);
          color: #dc2626;
          box-shadow: 0 4px 15px rgba(220, 38, 38, 0.3);
        }

        .remove-approval-btn:hover {
          transform: scale(1.1);
          box-shadow: 0 6px 20px rgba(220, 38, 38, 0.4);
        }

        .add-approval-btn {
          width: 100%;
          border-radius: 12px;
          border: 2px dashed #93c5fd;
          background: linear-gradient(135deg, #eff6ff, #dbeafe);
          padding: 12px;
          font-size: 13px;
          font-weight: 700;
          color: #1d4ed8;
          cursor: pointer;
        }

        .add-approval-btn:hover {
          border-color: #3b82f6;
          background: linear-gradient(135deg, #dbeafe, #bfdbfe);
          box-shadow: 0 8px 25px rgba(59, 130, 246, 0.3);
        }

        .alert {
          padding: 12px 16px;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 600;
          margin-top: 12px;
          flex-shrink: 0;
        }

        .error-alert {
          background: linear-gradient(135deg, #fee2e2, #fecaca);
          color: #dc2626;
          border: 2px solid #fca5a5;
        }

        .success-alert {
          background: linear-gradient(135deg, #dcfce7, #bbf7d0);
          color: #166534;
          border: 2px solid #86efac;
          animation: pulse-glow 2s infinite;
        }

        .designer-canvas {
          flex: 1;
          position: relative;
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
          overflow: hidden;
        }

        /* React Flow Overrides - FIXED MiniMap position */
        .react-flow {
          height: 100%;
          width: 100%;
          background: transparent;
        }

        .react-flow__viewport {
          transform-origin: 0 0;
        }

        /* FIXED: Controls positioned bottom-right */
        .react-flow__controls {
          position: absolute !important;
          bottom: 20px !important;
          right: 20px !important;
          left: auto !important;
          z-index: 100;
          background: rgba(255, 255, 255, 0.95) !important;
          backdrop-filter: blur(20px) !important;
          border-radius: 12px !important;
          border: 1px solid rgba(148, 163, 184, 0.2) !important;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15) !important;
          padding: 8px !important;
        }

        .react-flow__controls-button {
          width: 32px !important;
          height: 32px !important;
          margin: 4px !important;
          border-radius: 8px !important;
          background: rgba(255, 255, 255, 0.9) !important;
          border: 1px solid rgba(148, 163, 184, 0.3) !important;
          cursor: pointer !important;
          transition: all 0.2s ease !important;
        }

        .react-flow__controls-button:hover {
          background: #3b82f6 !important;
          border-color: #1d4ed8 !important;
          transform: scale(1.05) !important;
        }

        .react-flow__controls-button:active {
          transform: scale(0.98) !important;
        }

        /* FIXED: MiniMap positioned top-right, smaller and fixed */
        .react-flow__minimap {
          position: absolute !important;
          top: 20px !important;
          right: 20px !important;
          z-index: 100 !important;
          background: rgba(255, 255, 255, 0.95) !important;
          backdrop-filter: blur(20px) !important;
          border-radius: 12px !important;
          border: 1px solid rgba(148, 163, 184, 0.2) !important;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15) !important;
          overflow: hidden !important;
          width: 180px !important;
          height: 120px !important;
          pointer-events: auto !important;
        }

        .react-flow__minimap-bg {
          fill: rgba(240, 246, 252, 0.8) !important;
        }

        .react-flow__minimap-mask {
          fill: rgba(0, 0, 0, 0.3) !important;
        }

        /* Background grid */
        .react-flow__background {
          background: transparent !important;
        }

        /* Nodes styling */
        .react-flow__node {
          border-radius: 12px !important;
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15) !important;
          border: 2px solid transparent !important;
          font-weight: 600 !important;
          font-size: 14px !important;
        }

        .react-flow__node-default {
          background: linear-gradient(135deg, #3b82f6, #1d4ed8) !important;
          color: white !important;
        }

        .react-flow__node-input {
          background: linear-gradient(135deg, #10b981, #059669) !important;
          color: white !important;
        }

        .react-flow__node-output {
          background: linear-gradient(135deg, #f59e0b, #d97706) !important;
          color: white !important;
        }

        .react-flow__edge-path {
          stroke-width: 2px !important;
        }

        .react-flow__edge-label {
          background: rgba(255, 255, 255, 0.9) !important;
          backdrop-filter: blur(10px) !important;
          border-radius: 8px !important;
          padding: 4px 8px !important;
          font-size: 12px !important;
          font-weight: 600 !important;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
        }

        @media (max-width: 1024px) {
          .designer-sidebar {
            width: 380px !important;
          }
          .designer-sidebar.expanded {
            width: 380px !important;
          }
        }

        @media (max-width: 768px) {
          .designer-container {
            flex-direction: column;
          }
          .designer-sidebar {
            width: 100% !important;
            height: 40% !important;
            order: 2;
          }
          .designer-canvas {
            height: 60% !important;
            order: 1;
          }
          .react-flow__minimap {
            width: 140px !important;
            height: 100px !important;
          }
        }
      `}</style>
    </div>
  );
}
