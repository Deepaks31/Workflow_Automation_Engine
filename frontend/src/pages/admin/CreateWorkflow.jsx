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


  /* 🔥 PREFILL DATA WHEN EDITING */
  useEffect(() => {
    if (workflow) {
      setName(workflow.name || "");
      setDescription(workflow.description || "");
      setConditionField(workflow.conditionField || "amount");
      setConditionOperator(workflow.conditionOperator || ">");
      setAmount(workflow.conditionValue ?? "");
      setEscalation(workflow.escalation || "");

      setApprovals(
          workflow.approvalLevels?.length
            ? workflow.approvalLevels.map((a) => ({
                id: crypto.randomUUID(),
                role: a.role,
              }))
            : [{ id: crypto.randomUUID(), role: "Manager" }]
        );

    } else {
      // Reset for Create
      setName("");
      setDescription("");
      setConditionField("amount");
      setConditionOperator(">");
      setAmount("");
      setEscalation("");

      // ✅ CHANGE ONLY THIS LINE
      setApprovals([{ id: crypto.randomUUID(), role: "Manager" }]);
    }
  }, [workflow]);

 const addApprovalLevel = () => {
      setApprovals([
        ...approvals,
        { id: crypto.randomUUID(), role: "" },
      ]);
    };


  const handleApprovalChange = (id, value) => {
      setApprovals(
        approvals.map((a) =>
          a.id === id ? { ...a, role: value } : a
        )
      );
    };


  const submit = () => {
    if (!name || !conditionField || !amount || !escalation) {
      alert("Please fill all required fields");
      return;
    }

    const payload = {
      ...workflow, // 🔥 keeps ID during edit
      name,
      description,
      conditionField,
      conditionOperator,
      conditionValue: parseFloat(amount),
      escalation,
      createdBy: "Admin",
      approvalLevels: approvals.map((a, index) => ({
        levelNo: index + 1,
        role: a.role,
      })),

    };

    onCreate(payload);
    onClose();
  };

  return (
    <>
      <div className="overlay">
        <div className="modal">
          <h2>{isEdit ? "Edit Workflow" : "Create Workflow"}</h2>

          {/* Name */}
          <div className="field">
            <label>Workflow Name *</label>
            <input value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          {/* Description */}
          <div className="field">
            <label>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Condition */}
          <div className="field">
            <label>Condition *</label>
            <div className="condition">
              <input
                value={conditionField}
                onChange={(e) => setConditionField(e.target.value)}
              />
              <select
                value={conditionOperator}
                onChange={(e) => setConditionOperator(e.target.value)}
              >
                <option value=">">&gt;</option>
                <option value="<">&lt;</option>
                <option value="==">==</option>
              </select>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
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
                  onChange={(e) =>
                    handleApprovalChange(level.id, e.target.value)
                  }
                >
                  <option value="">Select Role</option>
                  <option value="Manager">Manager</option>
                  <option value="Finance">Finance</option>
                </select>
              </div>
            ))}
            <button className="add-btn" onClick={addApprovalLevel}>
              + Add Approval Level
            </button>
          </div>

          {/* Actions */}
          <div className="actions">
            <button className="cancel" onClick={onClose}>
              Cancel
            </button>
            <button className="submit" onClick={submit}>
              {isEdit ? "Update Workflow" : "Create Workflow"}
            </button>
          </div>
        </div>
      </div>

      {/* Internal CSS */}
      <style>{`
        * {
          box-sizing: border-box;
          font-family: system-ui, sans-serif;
        }

        .overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.45);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 100;
          padding: 20px;
        }

        .modal {
          background: white;
          width: 100%;
          max-width: 620px;
          border-radius: 18px;
          padding: 24px;
          box-shadow: 0 30px 60px rgba(0, 0, 0, 0.25);
          animation: slideIn 0.3s ease;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .modal h2 {
          margin-top: 0;
          margin-bottom: 20px;
        }

        .field {
          margin-bottom: 16px;
          width: 100%;
        }

        .field label {
          font-size: 14px;
          font-weight: 500;
          display: block;
          margin-bottom: 6px;
        }

        .field input,
        .field textarea,
        .field select {
          width: 100%;
          padding: 10px 12px;
          border-radius: 8px;
          border: 1px solid #d1d5db;
          font-size: 14px;
        }

        .field input:focus,
        .field textarea:focus,
        .field select:focus {
          border-color: #4f46e5;
          outline: none;
          box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.15);
        }

        .field textarea {
          resize: none;
          height: 90px;
        }

        /* Condition Container */
          .condition {
            display: grid;
            grid-template-columns: 1.2fr 0.8fr 1fr;
            gap: 10px;
            align-items: center;
          }

          /* Condition Field Input (amount / leaveDays etc.) */
          .condition input:first-child {
            background: #f9fafb;
            font-weight: 500;
          }

          /* Operator Dropdown */
          .condition select {
            text-align: center;
            font-weight: 600;
            background: #eef2ff;
            border: 1px solid #c7d2fe;
          }

          /* Value Input */
          .condition input:last-child {
            text-align: right;
          }

          /* Focus Styling */
          .condition input:focus,
          .condition select:focus {
            border-color: #4f46e5;
            outline: none;
            box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.15);
          }

          /* Mobile Responsive */
          @media (max-width: 640px) {
            .condition {
              grid-template-columns: 1fr;
            }
          }


        .approval-row {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-top: 10px;
        }

        .approval-row span {
          width: 70px;
          font-size: 14px;
        }

        .approval-row select {
          flex: 1;
        }

        .add-btn {
          margin-top: 10px;
          background: #e5e7eb;
          border: none;
          padding: 8px 12px;
          border-radius: 8px;
          cursor: pointer;
        }

        .add-btn:hover {
          background: #d1d5db;
        }

        .actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 20px;
        }

        .cancel {
          background: #e5e7eb;
          border: none;
          padding: 10px 16px;
          border-radius: 8px;
          cursor: pointer;
        }

        .submit {
          background: #4f46e5;
          color: white;
          border: none;
          padding: 10px 18px;
          border-radius: 8px;
          cursor: pointer;
        }

        .submit:hover {
          background: #4338ca;
        }
      `}</style>
    </>
  );
}

export default CreateWorkflow;
