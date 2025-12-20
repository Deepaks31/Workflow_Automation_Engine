import React, { useState, useEffect } from "react";
import axios from "axios";
import CreateWorkflow from "./CreateWorkflow";
import UserMenu from "../../components/UserMenu";

export default function AdminDashboard() {
  const [showCreate, setShowCreate] = useState(false);
  const [workflows, setWorkflows] = useState([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);


  // Fetch workflows from backend
  useEffect(() => {
    axios
      .get("http://localhost:8080/api/workflows")
      .then((res) => {
        // Map approvalLevels to approvals array of strings
        const formatted = res.data.map((wf) => ({
          ...wf,
          approvals: wf.approvalLevels?.map((a) => a.role) || [],
          condition: wf.conditionField
            ? `${wf.conditionField} ${wf.conditionOperator} ${wf.conditionValue}`
            : "",
        }));
        setWorkflows(formatted);
      })
      .catch((err) => console.error(err));
  }, []);

  // Add a new workflow
  const addWorkflow = (workflow) => {
    axios
      .post("http://localhost:8080/api/workflows", workflow)
      .then((res) => {
        const wf = {
          ...res.data,
          approvals: res.data.approvalLevels?.map((a) => a.role) || [],
          condition: res.data.conditionField
            ? `${res.data.conditionField} ${res.data.conditionOperator} ${res.data.conditionValue}`
            : "",
        };
        setWorkflows([wf, ...workflows]);
      })
      .catch((err) => console.error(err));
  };

  const deleteWorkflow = (id) => {
  if (!window.confirm("Are you sure you want to delete this workflow?")) return;

  axios
    .delete(`http://localhost:8080/api/workflows/${id}`)
    .then(() => {
      setWorkflows(workflows.filter((wf) => wf.id !== id));
    })
    .catch((err) => console.error(err));
  };

  const updateWorkflow = (workflow) => {
  axios
    .put(`http://localhost:8080/api/workflows/${workflow.id}`, workflow)
    .then((res) => {
      const updated = {
        ...res.data,
        approvals: res.data.approvalLevels?.map((a) => a.role) || [],
        condition: `${res.data.conditionField} ${res.data.conditionOperator} ${res.data.conditionValue}`,
      };

      setWorkflows(
        workflows.map((wf) => (wf.id === updated.id ? updated : wf))
      );
      setSelectedWorkflow(null);
    })
    .catch((err) => console.error(err));
    };



  return (
    <>
      <style>{`
        body {
          margin: 0;
          font-family: "Inter", sans-serif;
          background: #f4f6f9;
        }

        .container {
          padding: 32px;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .header h1 {
          margin: 0;
          font-size: 26px;
        }

        .header p {
          margin: 6px 0 0;
          color: #6b7280;
        }

        .create-btn {
          background: #4f46e5;
          color: white;
          border: none;
          padding: 12px 18px;
          border-radius: 10px;
          font-size: 14px;
          cursor: pointer;
          position: relative;
          right: 60px; 
          bottom: 6px;
          transition: all 0.3s ease;
        }

        .create-btn:hover {
          background: #4338ca;
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(79,70,229,0.25);
        }

        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 24px;
        }

        .card {
          background: white;
          border-radius: 14px;
          padding: 20px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.08);
          transition: all 0.3s ease;
        }

        .card:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.15);
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .status {
          background: #16a34a;
          color: white;
          font-size: 12px;
          padding: 4px 10px;
          border-radius: 20px;
        }

        .card p {
          font-size: 14px;
          color: #374151;
          margin: 8px 0;
        }
          .card-actions {
            display: flex;
            justify-content: flex-end;
            gap: 10px;
            margin-top: 12px;
          }

          .edit-btn {
            background: #eef2ff;
            border: 1px solid #c7d2fe;
            padding: 6px 12px;
            border-radius: 8px;
            cursor: pointer;
          }

          .delete-btn {
            background: #fee2e2;
            border: 1px solid #fecaca;
            color: #b91c1c;
            padding: 6px 12px;
            border-radius: 8px;
            cursor: pointer;
          }

      `}</style>
         <UserMenu />
      <div className="container">
        <div className="header">
          <div>
            <h1>Admin Dashboard</h1>
            <p>Recent Workflows</p>
          </div>
          <button
            className="create-btn"
            onClick={() => setShowCreate(true)}
          >
            + Create Workflow
          </button>
        </div>

        <div className="grid">
          {workflows.map((wf, index) => (
            <div key={wf.id ?? `workflow-${index}`} className="card">
              <div className="card-header">
                <h3>{wf.name}</h3>
                <span className="status">{wf.status}</span>
              </div>
              <p>{wf.description}</p>
              <p>
                <strong>Condition:</strong> {wf.condition || "N/A"}
              </p>
              <p>
                <strong>Approvals:</strong>{" "}
                {wf.approvals?.length > 0
                  ? wf.approvals.join(" → ")
                  : "No approvals"}
              </p>
              <div className="card-actions">
                <button
                  className="edit-btn"
                  onClick={() => {
                    setSelectedWorkflow(wf);
                    setShowCreate(true);
                  }}
                >
                  ✏️ Edit
                </button>

                <button
                  className="delete-btn"
                  onClick={() => deleteWorkflow(wf.id)}
                >
                  🗑 Delete
                </button>
              </div>

            </div>
            
          ))}
          
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

      </div>
      
    </>
  );
}
