import React, { useEffect, useState } from "react";
import axios from "axios";
import UserMenu from "../../components/UserMenu";

export default function AuditorDashboard() {
  const [requestSummary, setRequestSummary] = useState([]);
  const [searchUserId, setSearchUserId] = useState("");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [requestLogs, setRequestLogs] = useState([]);
  const [parsedRequestData, setParsedRequestData] = useState({});

  // 🔹 Load requests with audit summary
  useEffect(() => {
    axios.get("http://localhost:8080/api/requests/summary")
      .then(res => setRequestSummary(res.data))
      .catch(console.error);
  }, []);

  const openDetails = (request) => {
    setSelectedRequest(request.request);

    try {
      setParsedRequestData(request.request.requestData ? JSON.parse(request.request.requestData) : {});
    } catch {
      setParsedRequestData({});
    }

    axios.get(`http://localhost:8080/api/audit/request/${request.request.id}`)
      .then(res => setRequestLogs(res.data))
      .catch(console.error);
  };

  // Filter by initiator or approver ID
 const filteredRequests = Array.isArray(requestSummary)
  ? requestSummary.filter(r => {
      const inInitiator = searchUserId === "" || String(r.request.initiatorId).includes(searchUserId);
      const inApprover = r.lastAction && String(r.lastAction.approverId ?? "").includes(searchUserId);
      return inInitiator || inApprover;
    })
  : [];


  return (
    <>
      <UserMenu />
      <div className="page">
        <div className="top-bar">
          <h2>Auditor Dashboard</h2>
          <input
            className="search"
            placeholder="Search by Initiator or Approver ID"
            value={searchUserId}
            onChange={(e) => setSearchUserId(e.target.value)}
          />
        </div>

        <table className="request-table">
          <thead>
            <tr>
              <th>Request ID</th>
              <th>Initiator ID</th>
              <th>Initiator</th>
              <th>Status</th>
              <th>Approval Level</th>
              <th>Approver ID</th>
              <th>Approver</th>
              <th>Last Action Time</th>
              <th>View</th>
            </tr>
          </thead>
          <tbody>
            {filteredRequests.map(r => {
              const req = r.request;
              const totalApprovals = r.totalApprovals;
              const lastAction = r.lastAction;
              return (
                <tr key={req.id} className="hover-row">
                  <td>{req.id}</td>
                  <td>{req.initiatorId}</td>
                  <td>{r.initiatorName}</td>
                  <td className={`status ${req.status?.toLowerCase()}`}>{req.status}</td>
                  <td>{req.currentLevel}</td>
                  <td>{lastAction?.approverId ?? "-"}</td>
                  <td>{lastAction?.approverName ?? "-"}</td>
                  <td>{lastAction ? new Date(lastAction.actionAt).toLocaleString() : "-"}</td>
                  <td>
                    <button className="view-btn" onClick={() => openDetails(r)}>👁️ View</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* 🔹 Modal */}
        {selectedRequest && (
          <div className="overlay">
            <div className="modal">
              <h3>Request Details</h3>
              <div className="section">
                <p><strong>ID:</strong> {selectedRequest.id}</p>
                <p><strong>Initiator:</strong> {selectedRequest.initiatorId}</p>
                <p><strong>Status:</strong> {selectedRequest.status}</p>
                <p><strong>Current Level:</strong> {selectedRequest.currentLevel}</p>
                <p><strong>Created At:</strong> {new Date(selectedRequest.createdAt).toLocaleString()}</p>
                <p><strong>Last Action:</strong> {new Date(selectedRequest.lastActionAt).toLocaleString()}</p>
              </div>

              <hr />

              <h4>Dynamic Request Data</h4>
              {Object.keys(parsedRequestData).length === 0 ? (
                <p className="muted">No custom fields</p>
              ) : (
                <table className="data-table">
                  <tbody>
                    {Object.entries(parsedRequestData).map(([key, value]) => (
                      <tr key={key}>
                        <td className="key">{key}</td>
                        <td>{String(value)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              <hr />

              <h4>Approval Timeline</h4>
              {requestLogs.length === 0 ? <p>No approvals yet</p> :
                <div className="timeline">
                  {requestLogs.map((log) => (
                    <div key={log.id} className="timeline-item">
                      <div className={`circle ${log.action.toLowerCase()}`}></div>
                      <div className="content">
                        <p><strong>Level {log.levelNo}</strong> - {log.role}</p>
                        <p>Action: <span className={log.action.toLowerCase()}>{log.action}</span></p>
                        <p>By: {log.approverId ?? "SYSTEM"}</p>
                        <p>Previous Status: {log.previousStatus}</p>
                        <p>New Status: {log.newStatus}</p>
                        <p>Remarks: {log.remarks || "-"}</p>
                        <p>Time: {new Date(log.actionAt).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              }

              <button className="close-btn" onClick={() => {
                setSelectedRequest(null);
                setRequestLogs([]);
                setParsedRequestData({});
              }}>Close</button>
            </div>
          </div>
        )}

        <style>{`
          .page { padding: 30px; font-family: system-ui; background: #f4f6f8; min-height: 100vh; }
          .top-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
          .search { padding: 10px 14px; border-radius: 10px; border: 1px solid #ccc; width: 250px; position:fixed; top: 25px; right: 100px; }
          .request-table { width: 100%; border-collapse: collapse; margin-top: 10px; background: white; border-radius: 8px; overflow: hidden; }
          th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb; }
          th { background: #1e293b; color: white; }
          .hover-row:hover { background: #f1f5f9; cursor: pointer; }
          .view-btn { background: #3b82f6; color: white; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; }
          .status.approved { color: green; font-weight: bold; }
          .status.rejected { color: red; font-weight: bold; }
          .status.escalated { color: orange; font-weight: bold; }

          .overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 10; }
          .modal { background: white; padding: 24px; border-radius: 12px; width: 750px; max-height: 80vh; overflow-y: auto; box-shadow: 0 5px 15px rgba(0,0,0,0.3); }
          .close-btn { margin-top: 20px; background: #2563eb; color: white; border: none; padding: 10px; border-radius: 6px; width: 100%; cursor: pointer; }

          .data-table { width: 100%; margin-top: 10px; }
          .data-table td { padding: 8px; }
          .key { font-weight: 600; color: #475569; width: 40%; }
          .muted { color: #64748b; }

          .timeline { border-left: 3px solid #d1d5db; margin-left: 10px; padding-left: 15px; }
          .timeline-item { position: relative; margin-bottom: 20px; }
          .timeline-item .circle { width: 14px; height: 14px; border-radius: 50%; position: absolute; left: -10px; top: 5px; border: 3px solid white; }
          .circle.approved { background: green; }
          .circle.rejected { background: red; }
          .circle.escalated { background: orange; }
          .timeline-item .content { background: #f1f5f9; padding: 10px 12px; border-radius: 8px; }
          .timeline-item p { margin: 3px 0; }
        `}</style>
      </div>
    </>
  );
}
