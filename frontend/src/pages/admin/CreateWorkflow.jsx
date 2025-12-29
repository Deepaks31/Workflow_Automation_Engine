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
    } else {
      setName("");
      setDescription("");
      setConditionField("amount");
      setConditionOperator(">");
      setAmount("");
      setEscalation("");
      setApprovals([{ id: crypto.randomUUID(), role: "Manager" }]);
    }
  }, [workflow]);

  const addApprovalLevel = () => {
    if (approvals.length < 2) {
      setApprovals([...approvals, { id: crypto.randomUUID(), role: "Finance" }]);
    }
  };

  const handleApprovalChange = (id, value) => {
    setApprovals(approvals.map(a => a.id === id ? { ...a, role: value } : a));
  };

  const submit = () => {
    if (!name || !conditionField || !amount || !escalation) {
      alert("Please fill all required fields");
      return;
    }

    const payload = {
      ...workflow,
      name,
      description,
      conditionField,
      conditionOperator,
      conditionValue: parseFloat(amount),
      escalationHours: Number(escalation),
      createdBy: "Admin",
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
                  <option value="Director">Director</option>
                </select>
              </div>
            ))}
            {approvals.length < 2 && (
              <button className="add-btn" onClick={addApprovalLevel}>+ Add Approval Level</button>
            )}
          </div>

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
