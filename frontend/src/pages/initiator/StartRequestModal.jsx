import React, { useState, useEffect } from "react";
import axios from "axios";

export default function StartRequestModal({ workflow, onClose }) {
  const condition = workflow.conditionField?.toLowerCase();

  const isPurchase = condition === "amount";
  const isLeave = condition === "leavedays" || condition === "leave";

  const [form, setForm] = useState({});
  const [error, setError] = useState("");
  const [roleUsers, setRoleUsers] = useState({});
  const [assignees, setAssignees] = useState({});

  const initiatorId = Number(localStorage.getItem("userId"));
  const maxLimit = Number(workflow?.conditionValue) || null;

  useEffect(() => {
    const fetchUsersForRoles = async () => {
      const roles = [...new Set(workflow.approvalLevels?.map(l => l.role) || [])];
      const usersData = {};
      for (const role of roles) {
        try {
          const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/users/role/${role}`);
          usersData[role] = res.data;
        } catch (err) {
          console.error("Error fetching users for role", role, err);
        }
      }
      setRoleUsers(usersData);
    };
    fetchUsersForRoles();
  }, [workflow]);

  const handleAssigneeChange = (levelNo, userId) => {
    setAssignees({ ...assignees, [levelNo]: Number(userId) });
    setError(""); // Clear error when assignee is selected
  };

  console.log(workflow)

  const handleChange = (field, value) => {
    setForm({ ...form, [field]: value });

    if (field === "amount" || field === "leaveDays") {
      const numericValue = Number(value);

      if (!value) {
        setError(`${field === "amount" ? "Amount" : "Leave days"} is required`);
      } else if (maxLimit && numericValue > maxLimit) {
        setError(
          `Maximum allowed ${field === "amount" ? "amount" : "leave days"} is ${maxLimit}`
        );
      } else {
        setError("");
      }
    }
  };

  const submit = async () => {
    const valueToCheck = isPurchase ? form.amount : form.leaveDays;
    if (!valueToCheck) {
      setError(`${isPurchase ? "Amount" : "Leave days"} is required`);
      return;
    }

    if (maxLimit && Number(valueToCheck) > maxLimit) {
      setError(
        `Maximum allowed ${isPurchase ? "amount" : "leave days"} is ${maxLimit}`
      );
      return;
    }

    // Validate assignees
    if (workflow.approvalLevels?.length > 0) {
      for (const level of workflow.approvalLevels) {
        if (!assignees[level.levelNo]) {
          setError(`Please select an approver for Level ${level.levelNo} (${level.role})`);
          return;
        }
      }
    }

    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/requests`, {
        workflowId: workflow.id,
        initiatorId,
        data: form,
        assignees: assignees
      });

      alert("Request Submitted Successfully");
      onClose();
    } catch (err) {
      console.error(err);
      alert("Something went wrong while submitting request.");
    }
  };

  return (
    <>
      <div className="overlay">
        <div className="modal">
          <h3>{workflow.name} Request</h3>

          {isPurchase && (
            <>
              <div className="field">
                <label>Amount (Max: {maxLimit})</label>
                <input
                  type="number"
                  value={form.amount || ""}
                  onChange={(e) => handleChange("amount", e.target.value)}
                  placeholder="Enter amount"
                />
              </div>

              <div className="field">
                <label>Reason</label>
                <textarea
                  value={form.reason || ""}
                  onChange={(e) => handleChange("reason", e.target.value)}
                  placeholder="Enter reason"
                />
              </div>
            </>
          )}

          {isLeave && (
            <>
              <div className="field">
                <label>Leave Days (Max: {maxLimit})</label>
                <input
                  type="number"
                  value={form.leaveDays || ""}
                  onChange={(e) => handleChange("leaveDays", e.target.value)}
                  placeholder="No of days"
                />
              </div>

              <div className="field">
                <label>From Date</label>
                <input
                  type="date"
                  value={form.fromDate || ""}
                  onChange={(e) => handleChange("fromDate", e.target.value)}
                />
              </div>

              <div className="field">
                <label>Reason</label>
                <textarea
                  value={form.reason || ""}
                  onChange={(e) => handleChange("reason", e.target.value)}
                  placeholder="Reason for leave"
                />
              </div>
            </>
          )}

          {workflow.approvalLevels?.length > 0 && (
            <div className="approval-levels-section" style={{ marginTop: '16px', marginBottom: '16px' }}>
              <h4 style={{ marginBottom: '10px', fontSize: '15px', color: '#1f2937' }}>Assign Approvers</h4>
              {workflow.approvalLevels.map(level => (
                <div key={level.levelNo} className="field">
                  <label>Level {level.levelNo} ({level.role})</label>
                  <select
                    value={assignees[level.levelNo] || ""}
                    onChange={e => handleAssigneeChange(level.levelNo, e.target.value)}
                  >
                    <option value="">-- Select Approver --</option>
                    {Array.isArray(roleUsers[level.role]) && roleUsers[level.role].map((user) => (
                      <option key={user.id} value={user.id}>{user.name} ({user.email})</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          )}

          {error && <p className="error">{error}</p>}

          <div className="actions">
            <button className="cancel" onClick={onClose}>
              Cancel
            </button>
            <button className="submit" onClick={submit} disabled={!!error}>
              Submit Request
            </button>
          </div>
        </div>
      </div>

      <style>{`
        * { box-sizing: border-box; }

        .overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal {
          background: white;
          width: 100%;
          max-width: 460px;
          padding: 26px;
          border-radius: 18px;
          box-shadow: 0 40px 80px rgba(0,0,0,0.25);
          animation: pop 0.25s ease;
        }

        @keyframes pop {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }

        h3 { margin-top: 0; margin-bottom: 18px; }
        .field { margin-bottom: 14px; }

        label {
          font-size: 14px;
          font-weight: 500;
          display: block;
          margin-bottom: 6px;
        }

        input, textarea, select {
          width: 100%;
          padding: 10px 12px;
          border-radius: 10px;
          border: 1px solid #d1d5db;
          font-size: 14px;
          transition: all .2s ease;
        }

        input:focus, textarea:focus, select:focus {
          border-color: #2563eb;
          outline: none;
          box-shadow: 0 0 0 3px rgba(37,99,235,0.15);
        }

        textarea { resize: none; height: 90px; }

        .actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 22px; }

        .cancel {
          background: #e5e7eb;
          border: none;
          padding: 10px 16px;
          border-radius: 10px;
          cursor: pointer;
        }

        .submit {
          background: #2563eb;
          color: white;
          border: none;
          padding: 10px 18px;
          border-radius: 10px;
          cursor: pointer;
        }

        .submit:hover { background: #1e40af; }
        .submit:disabled { opacity: 0.5; cursor: not-allowed; }

        .error { color: #dc2626; font-size: 14px; margin-top: 10px; }
      `}</style>
    </>
  );
}
