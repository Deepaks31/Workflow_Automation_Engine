import React, { useState, useEffect } from "react";

function CreateWorkflow({ onClose, onCreate, workflow }) {
  const isEdit = Boolean(workflow);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [conditionField, setConditionField] = useState("amount");
  const [conditionOperator, setConditionOperator] = useState(">");
  const [escalation, setEscalation] = useState("");
  const [approvals, setApprovals] = useState([
    { id: crypto.randomUUID(), role: "Manager" }
  ]);

  // Intelligent Recommendation Engine state
  const [riskScore, setRiskScore] = useState(null);
  const [recommendedEscalation, setRecommendedEscalation] = useState(null);
  const [recommendedApprovals, setRecommendedApprovals] = useState([]);
  const [showRecommendations, setShowRecommendations] = useState(false);

  // Prefill for edit
  useEffect(() => {
    if (workflow) {
      setName(workflow.name || "");
      setDescription(workflow.description || "");
      setConditionField(workflow.conditionField || "amount");
      setConditionOperator(workflow.conditionOperator || ">");
      setAmount(workflow.conditionValue ?? "");
      setEscalation(workflow.escalationHours ?? "");
      setApprovals(
        workflow.approvalLevels?.length
          ? workflow.approvalLevels.map((a) => ({
              id: crypto.randomUUID(),
              role: a.role
            }))
          : [{ id: crypto.randomUUID(), role: "Manager" }]
      );
      setRiskScore(null);
      setRecommendedEscalation(null);
      setRecommendedApprovals([]);
      setShowRecommendations(false);
    } else {
      setName("");
      setDescription("");
      setConditionField("amount");
      setConditionOperator(">");
      setAmount("");
      setEscalation("");
      setApprovals([{ id: crypto.randomUUID(), role: "Manager" }]);
      setRiskScore(null);
      setRecommendedEscalation(null);
      setRecommendedApprovals([]);
      setShowRecommendations(false);
    }
  }, [workflow]);

  // Simple rule-based "AI" engine based on amount & request type (conditionField)
  const generateRecommendations = () => {
    const numericAmount = parseFloat(amount || "0");
    let score = 20;
    let suggestedEscalation = 24;
    let suggestedApprovals = ["Manager"];

    const field = (conditionField || "").toLowerCase();

    // Base on amount
    if (!isNaN(numericAmount)) {
      if (numericAmount >= 50000) {
        score += 50;
        suggestedEscalation = 12;
        if (!suggestedApprovals.includes("Finance")) {
          suggestedApprovals.push("Finance");
        }
      } else if (numericAmount >= 20000) {
        score += 30;
        suggestedEscalation = 18;
      } else if (numericAmount <= 5000) {
        score -= 10;
        suggestedEscalation = 36;
      }
    }

    // Based on request "type" if admin uses a field like requestType
    if (field.includes("travel") || field.includes("expense")) {
      score += 10;
    }
    if (field.includes("capex") || field.includes("asset")) {
      score += 20;
      if (!suggestedApprovals.includes("Finance")) {
        suggestedApprovals.push("Finance");
      }
    }

    // Clamp score
    if (score < 0) score = 0;
    if (score > 100) score = 100;

    setRiskScore(score);
    setRecommendedEscalation(suggestedEscalation);
    setRecommendedApprovals(suggestedApprovals);
    setShowRecommendations(true);
  };

  const applyRecommendations = () => {
    if (recommendedEscalation != null) {
      setEscalation(String(recommendedEscalation));
    }
    if (recommendedApprovals.length) {
      setApprovals(
        recommendedApprovals.map((role) => ({
          id: crypto.randomUUID(),
          role
        }))
      );
    }
  };

  const addApprovalLevel = () => {
    if (approvals.length < 2) {
      setApprovals([...approvals, { id: crypto.randomUUID(), role: "Finance" }]);
    }
  };

  const handleApprovalChange = (id, value) => {
    setApprovals(approvals.map(a => a.id === id ? { ...a, role: value } : a));
  };

  const getPriorityFromScore = (score) => {
    if (score == null) return "MEDIUM";
    if (score >= 70) return "HIGH";
    if (score >= 40) return "MEDIUM";
    return "LOW";
  };

  const submit = () => {
    if (!name || !conditionField || !amount || !escalation) {
      alert("Please fill all required fields");
      return;
    }

    const numericAmount = parseFloat(amount);
    const field = (conditionField || "").toLowerCase();
    let computedScore = 20;
    if (!isNaN(numericAmount)) {
      if (numericAmount >= 50000) computedScore += 50;
      else if (numericAmount >= 20000) computedScore += 30;
      else if (numericAmount <= 5000) computedScore -= 10;
    }
    if (field.includes("travel") || field.includes("expense")) computedScore += 10;
    if (field.includes("capex") || field.includes("asset")) computedScore += 20;
    computedScore = Math.max(0, Math.min(100, computedScore));
    const scoreToSave = riskScore != null ? riskScore : computedScore;
    const priorityToSave = getPriorityFromScore(scoreToSave);

    const payload = {
      ...workflow,
      name,
      description,
      conditionField,
      conditionOperator,
      conditionValue: numericAmount,
      escalationHours: Number(escalation),
      createdBy: "Admin",
      riskScore: scoreToSave,
      priority: priorityToSave,
      approvalLevels: approvals.map((a, index) => ({
        levelNo: index + 1,
        role: a.role
      }))
    };

    onCreate(payload);
  };

  return (
    <>
      <div className="overlay">
        <div className="modal">
          <div className="modal-header">
            <h2>{isEdit ? "Edit Workflow" : "Create Workflow"}</h2>
            <p className="subtitle">Set up workflow conditions and approvals</p>
            <button className="close-btn" onClick={onClose}>×</button>
          </div>

          {/* AI Recommendation banner */}
          <div className="ai-banner">
            <div>
              <div className="ai-title">Intelligent Workflow Recommendation Engine</div>
              <div className="ai-subtitle">
                Uses past patterns (amount & request profile) to suggest approval levels, escalation hours, and risk score.
              </div>
            </div>
            <button className="ai-btn" type="button" onClick={generateRecommendations}>
              ⚡ AI Recommendation
            </button>
          </div>

          {/* Workflow Name */}
          <div className="field">
            <label>Workflow Name *</label>
            <input 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="Enter workflow name"
            />
          </div>

          {/* Description */}
          <div className="field">
            <label>Description</label>
            <textarea 
              value={description} 
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter workflow description"
              rows="3"
            />
          </div>

          {/* Condition */}
          <div className="field">
            <label>Condition *</label>
            <div className="condition">
              <input 
                value={conditionField} 
                onChange={(e) => setConditionField(e.target.value)}
                placeholder="Field"
              />
              <select value={conditionOperator} onChange={(e) => setConditionOperator(e.target.value)}>
                <option value=">">&gt;</option>
                <option value="<">&lt;</option>
                <option value="==">==</option>
              </select>
              <input 
                type="number" 
                value={amount} 
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Value"
              />
            </div>
          </div>

          {/* Escalation */}
          <div className="field">
            <label>Escalation Period (Hours) *</label>
            <input 
              type="number" 
              value={escalation} 
              onChange={(e) => setEscalation(e.target.value)}
              placeholder="24"
            />
          </div>

          {/* Approvals */}
          <div className="field">
            <label>Approval Levels</label>
            {approvals.map((level, index) => (
              <div className="approval-row" key={level.id}>
                <span>Level {index + 1}</span>
                <select 
                  value={level.role} 
                  onChange={(e) => handleApprovalChange(level.id, e.target.value)}
                >
                  <option value="">Select Role</option>
                  <option value="Manager">Manager</option>
                  <option value="Finance">Finance</option>
                </select>
              </div>
            ))}
            {approvals.length < 2 && (
              <button className="add-btn" onClick={addApprovalLevel}>+ Add Approval Level</button>
            )}
          </div>

          {/* AI Suggestions Panel */}
          {showRecommendations && (
            <div className="field ai-panel">
              <div className="ai-panel-header">
                <span className="ai-panel-title">AI Suggestions</span>
                {riskScore != null && (
                  <span className="ai-badge">
                    Risk Score: {riskScore}/100
                  </span>
                )}
              </div>
              <ul className="ai-list">
                {recommendedApprovals.length > 0 && (
                  <li>
                    ✅ Recommended approval levels:{" "}
                    <strong>{recommendedApprovals.join(" → ")}</strong>
                    {recommendedApprovals.includes("Finance") && (
                      <span className="ai-hint">
                        &nbsp;– High amount or financial impact detected, adding Finance approval.
                      </span>
                    )}
                  </li>
                )}
                {recommendedEscalation != null && (
                  <li>
                    ✅ Suggested escalation window:{" "}
                    <strong>{recommendedEscalation} hours</strong>
                  </li>
                )}
                {riskScore != null && (
                  <li>
                    ✅ Overall workflow risk:{" "}
                    <strong>
                      {riskScore >= 70
                        ? "High"
                        : riskScore >= 40
                        ? "Medium"
                        : "Low"}
                    </strong>{" "}
                    ({riskScore}/100)
                  </li>
                )}
              </ul>
              <button
                type="button"
                className="ai-apply-btn"
                onClick={applyRecommendations}
              >
                Apply Suggestions
              </button>
            </div>
          )}

          {/* Actions */}
          <div className="actions">
            <button className="cancel" onClick={onClose}>Cancel</button>
            <button className="submit" onClick={submit}>
              {isEdit ? "Update Workflow" : "Create Workflow"}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        * { box-sizing: border-box; font-family: system-ui, sans-serif; }

        .overlay {
          position: fixed; inset: 0; background: rgba(30,30,30,0.6);
          display: flex; align-items: center; justify-content: center; z-index: 1000;
          padding: 16px; animation: fadeIn 0.3s ease;
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

        .modal {
          background: #ffffff; width: 100%; max-width: 520px; /* Reduced from 640px */
          border-radius: 16px; padding: 0; box-shadow: 0 25px 50px rgba(0,0,0,0.25);
          animation: slideIn 0.4s ease forwards; max-height: 90vh; overflow-y: auto;
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .modal-header {
          padding: 20px 20px 0; position: relative; border-bottom: 1px solid #f1f5f9;
        }
        .modal-header h2 {
          margin: 0 0 2px 0; font-size: 20px; /* Reduced from 24px */
        }
        .subtitle {
          font-size: 13px; color: #6b7280; margin: 0 0 20px 0;
        }
        .close-btn {
          position: absolute; top: 16px; right: 20px; background: none; border: none;
          font-size: 24px; cursor: pointer; color: #9ca3af; padding: 0;
        }
        .close-btn:hover { color: #6b7280; }

        .ai-banner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 12px 20px 12px;
          background: radial-gradient(circle at left, #eff6ff, #fdf2f8);
          border-bottom: 1px solid #e5e7eb;
        }
        .ai-title {
          font-size: 13px;
          font-weight: 700;
          color: #111827;
        }
        .ai-subtitle {
          font-size: 11px;
          color: #6b7280;
        }
        .ai-btn {
          border-radius: 999px;
          border: none;
          padding: 8px 14px;
          font-size: 12px;
          font-weight: 600;
          background: linear-gradient(135deg, #22c55e, #16a34a);
          color: white;
          cursor: pointer;
          box-shadow: 0 4px 10px rgba(22, 163, 74, 0.4);
        }
        .ai-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 14px rgba(22, 163, 74, 0.45);
        }

        .field { margin-bottom: 16px; padding: 0 20px; }
        .field:last-child { margin-bottom: 0; }
        .field label { 
          font-size: 13px; font-weight: 500; display: block; margin-bottom: 6px; 
          color: #374151;
        }
        .field input, .field textarea, .field select {
          width: 100%; padding: 10px 12px; border-radius: 8px; border: 1px solid #d1d5db;
          font-size: 14px; transition: all 0.2s ease; background: white;
        }
        .field input:focus, .field textarea:focus, .field select:focus {
          border-color: #3b82f6; outline: none; box-shadow: 0 0 0 3px rgba(59,130,246,0.1);
        }
        .field textarea { resize: vertical; min-height: 72px; max-height: 120px; }

        .condition { 
          display: grid; grid-template-columns: 1.2fr 0.8fr 1fr; gap: 8px; align-items: center; 
        }
        .condition input:first-child { background: #f9fafb; font-weight: 500; }
        .condition select { 
          text-align: center; font-weight: 600; background: #eff6ff; 
          border: 1px solid #bfdbfe; color: #1e40af;
        }
        .condition input:last-child { text-align: right; }
        @media (max-width: 520px) { .condition { grid-template-columns: 1fr; gap: 8px; } }

        .approval-row { 
          display: flex; align-items: center; gap: 12px; margin-top: 12px; 
        }
        .approval-row span { 
          width: 64px; font-size: 13px; color: #6b7280; font-weight: 500;
        }
        .approval-row select { flex: 1; }

        .add-btn { 
          margin-top: 12px; background: #eff6ff; border: 1px solid #bfdbfe; 
          color: #1e40af; padding: 8px 16px; border-radius: 8px; cursor: pointer; 
          font-size: 13px; font-weight: 500; transition: all 0.2s ease; width: 100%;
        }
        .add-btn:hover { background: #dbeafe; transform: translateY(-1px); }

        .ai-panel {
          background: #f8fafc;
          border-radius: 12px;
          padding-top: 12px;
          padding-bottom: 16px;
          margin-top: 4px;
          border: 1px dashed #bfdbfe;
        }
        .ai-panel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }
        .ai-panel-title {
          font-size: 13px;
          font-weight: 600;
          color: #0f172a;
        }
        .ai-badge {
          font-size: 11px;
          padding: 4px 8px;
          border-radius: 999px;
          background: #eef2ff;
          color: #4338ca;
          font-weight: 600;
        }
        .ai-list {
          list-style: none;
          padding-left: 0;
          margin: 0 0 10px 0;
          font-size: 12px;
          color: #374151;
        }
        .ai-list li + li {
          margin-top: 4px;
        }
        .ai-hint {
          font-size: 11px;
          color: #6b7280;
        }
        .ai-apply-btn {
          width: 100%;
          border-radius: 999px;
          border: 1px solid #3b82f6;
          background: white;
          color: #1d4ed8;
          font-size: 12px;
          font-weight: 600;
          padding: 8px 0;
          cursor: pointer;
        }
        .ai-apply-btn:hover {
          background: #eff6ff;
        }

        .actions { 
          display: flex; justify-content: flex-end; gap: 12px; 
          padding: 20px; border-top: 1px solid #f1f5f9; margin-top: 16px;
        }
        .cancel { 
          background: #f9fafb; border: 1px solid #e5e7eb; color: #6b7280;
          padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: 500;
          transition: all 0.2s ease; font-size: 14px;
        }
        .cancel:hover { background: #f3f4f6; }
        .submit { 
          background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; 
          border: none; padding: 10px 24px; border-radius: 8px; cursor: pointer;
          font-weight: 600; font-size: 14px; transition: all 0.2s ease;
          box-shadow: 0 2px 8px rgba(59,130,246,0.3);
        }
        .submit:hover { 
          transform: translateY(-1px); box-shadow: 0 4px 12px rgba(59,130,246,0.4);
          background: linear-gradient(135deg, #2563eb, #1e40af);
        }

        /* Scrollbar */
        .modal::-webkit-scrollbar { width: 6px; }
        .modal::-webkit-scrollbar-track { background: #f1f5f9; }
        .modal::-webkit-scrollbar-thumb { 
          background: #cbd5e1; border-radius: 3px; 
        }
        .modal::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}</style>
    </>
  );
}

export default CreateWorkflow;
