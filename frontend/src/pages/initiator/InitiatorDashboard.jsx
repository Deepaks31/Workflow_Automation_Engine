// InitiatorDashboard.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import StartRequestModal from "./StartRequestModal";
import UserMenu from "../../components/UserMenu";


export default function InitiatorDashboard() {
  const [workflows, setWorkflows] = useState([]);
  const [requests, setRequests] = useState([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const initiatorId = Number(localStorage.getItem("userId"));

  useEffect(() => {
    axios.get("http://localhost:8080/api/workflows")
      .then(res => setWorkflows(res.data));
  }, []);

  const loadRequests = () => {
  axios
    .get(`http://localhost:8080/api/requests/initiator/${initiatorId}`)
    .then(res => setRequests(res.data));
    };

    useEffect(() => {
      loadRequests();
    }, []);

    const deleteRequest = (requestId) => {
  if (!window.confirm("Are you sure you want to delete this request?")) return;

      axios
        .delete(`http://localhost:8080/api/requests/${requestId}`)
        .then(() => loadRequests())
        .catch(err => console.error(err));
    };




  return (
    <>
      <UserMenu />
      <div className="page">
        <div className="header">
          <h2>Initiator Dashboard</h2>
          <p>Select a workflow to start a request</p>
        </div>

        <div className="grid">
          {workflows.map(w => (
            <div key={w.id} className="card">
              <h3>{w.name}</h3>
              <p>{w.description}</p>
              <p className="condition">
                {w.conditionField} {w.conditionOperator} {w.conditionValue}
              </p>

              <button
                className="start-btn"
                onClick={() => setSelectedWorkflow(w)}
              >
                Start Request →
              </button>
            </div>
          ))}
        </div>
        <h3 style={{ marginTop: "40px" }}>My Submitted Requests</h3>

          <div className="grid">
            {requests.map(r => {
              const wf = workflows.find(w => w.id === r.workflowId);

              return (
                <div key={r.id} className="card">
                  <h3>{wf?.name || "Request"}</h3>
                  <h5>{wf?.description || ""}</h5>
                  <p className="condition">
                      Status: <strong>{r.status}</strong><br /><br />
                      Current Level: <strong>{r.currentLevel}</strong>
                    </p>
                   <button
                    className="delete-btn"
                    onClick={() => deleteRequest(r.id)}
                  >
                    🗑 Delete Request
                  </button>
                </div>
              );
            })}
          </div>

      </div>

      {selectedWorkflow && (
        <StartRequestModal
            workflow={selectedWorkflow}
            onClose={() => {
              setSelectedWorkflow(null);
              loadRequests(); // refresh submitted requests
            }}
        />

      )}

      <style>{`
        .page {
          padding: 32px;
          background: #f4f6fb;
          min-height: 100vh;
          font-family: system-ui, sans-serif;
        }

        .header h2 {
          margin: 0;
          font-size: 26px;
        }

        .header p {
          color: #6b7280;
          margin-top: 6px;
        }

        .grid {
          margin-top: 26px;
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 24px;
        }

        .card {
          background: white;
          padding: 22px;
          border-radius: 18px;
          box-shadow: 0 15px 35px rgba(0,0,0,0.08);
          transition: all .3s ease;
        }

        .card:hover {
          transform: translateY(-6px);
          box-shadow: 0 30px 60px rgba(0,0,0,0.15);
        }

        .card h3 {
          margin-top: 0;
        }

        .condition {
          font-size: 14px;
          color: #374151;
          margin: 10px 0 16px;
        }

        .start-btn {
          background: linear-gradient(135deg, #2563eb, #1e40af);
          color: white;
          border: none;
          padding: 12px 18px;
          border-radius: 12px;
          font-size: 14px;
          cursor: pointer;
          transition: all .25s ease;
        }

        .start-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(37,99,235,0.35);
        }
        .delete-btn {
          margin-top: 12px;
          background: #fee2e2;
          border: 1px solid #fecaca;
          color: #b91c1c;
          padding: 10px 14px;
          border-radius: 10px;
          cursor: pointer;
          font-size: 13px;
        }

        .delete-btn:hover {
          background: #fecaca;
        }
      `}</style>
    </>
  );
}
