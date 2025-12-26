import React, { useEffect, useState } from "react";
import axios from "axios";
import UserMenu from "../../components/UserMenu";

export default function ApproverDashboard() {
  const [requests, setRequests] = useState([]);
  const [activeRequest, setActiveRequest] = useState(null);
  const [remarks, setRemarks] = useState("");
  const [showRejectBox, setShowRejectBox] = useState(false);

  const approverId = Number(localStorage.getItem("userId"));

  useEffect(() => {
    loadRequests();
  }, []);

  useEffect(() => {
    loadRequests();

    const interval = setInterval(loadRequests, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadRequests = () => {
    axios
      .get(
        `http://localhost:8080/api/requests/pending/manager/${approverId}/view`
      )
      .then((res) => setRequests(res.data))
      .catch(console.error);
  };

  const approveRequest = async () => {
    await axios.put(
      `http://localhost:8080/api/requests/${activeRequest.id}/approve`,
      { approverId }
    );

    alert("Request APPROVED");
    closeModal();
  };

  const rejectRequest = async () => {
    if (!remarks.trim()) {
      alert("Remarks are required");
      return;
    }

    await axios.put(
      `http://localhost:8080/api/requests/${activeRequest.id}/reject`,
      {
        approverId,
        remarks,
      }
    );

    alert("Request REJECTED");
    closeModal();
  };

  const closeModal = () => {
    setActiveRequest(null);
    setRemarks("");
    setShowRejectBox(false);
    loadRequests();
  };

  return (
    <>
      <div className="page">
        <h2>Manager Dashboard</h2>
        <p>Pending requests for approval</p>

        <div className="grid">
          {requests.map((item) => {
            const r = item.request;
            const data = JSON.parse(r.requestData);

            return (
              <div
                key={r.id}
                className="card"
                onClick={() =>
                  setActiveRequest({
                    ...item.request,
                    initiatorName: item.initiatorName,
                  })
                }
              >
                <h3>Workflow #{r.workflowId}</h3>
                <p className="condition">
                  Initiator ID: <strong>{r.initiatorId}</strong>
                </p>
                <p className="condition">
                  Initiator Name: <strong>{item.initiatorName}</strong>
                </p>

                <p className="status">Status: {r.status}</p>

                <p className="hint">Click to review</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* POPUP PREVIEW */}
      {activeRequest &&
        (() => {
          const data = JSON.parse(activeRequest.requestData);

          return (
            <div className="overlay">
              <div className="modal">
                <h3>Request Details</h3>

                <div className="detail">
                  <span>Workflow</span>
                  <strong>{activeRequest.workflowId}</strong>
                </div>

                <div className="detail">
                  <span>Initiator ID</span>
                  <strong>{activeRequest.initiatorId}</strong>
                </div>

                <div className="detail">
                  <span>Initiator Name</span>
                  <strong>{activeRequest.initiatorName}</strong>
                </div>

                {data.amount && (
                  <div className="detail">
                    <span>Amount</span>
                    <strong>₹ {data.amount}</strong>
                  </div>
                )}

                {data.leaveDays && (
                  <div className="detail">
                    <span>Leave Days</span>
                    <strong>{data.leaveDays}</strong>
                  </div>
                )}

                {data.fromDate && (
                  <div className="detail">
                    <span>From Date</span>
                    <strong>{data.fromDate}</strong>
                  </div>
                )}

                {data.reason && (
                  <div className="detail">
                    <span>Reason</span>
                    <strong>{data.reason}</strong>
                  </div>
                )}

                {showRejectBox && (
                  <div
                    style={{
                      marginTop: "14px",
                      animation: "fadeSlideIn 0.25s ease",
                    }}
                  >
                    <label
                      style={{
                        fontSize: "13px",
                        fontWeight: 600,
                        color: "#374151",
                        display: "block",
                        marginBottom: "6px",
                      }}
                    >
                      Rejection Remarks
                    </label>

                    <textarea
                      autoFocus
                      value={remarks}
                      onChange={(e) => {
                        setRemarks(e.target.value);
                        e.target.style.height = "auto";
                        e.target.style.height = e.target.scrollHeight + "px";
                      }}
                      placeholder="Clearly mention the reason for rejection..."
                      style={{
                        width: "90%",
                        minHeight: "70px",
                        maxHeight: "160px",
                        resize: "none",
                        padding: "12px",
                        borderRadius: "12px",
                        border: "1.5px solid #d1d5db",
                        fontFamily: "inherit",
                        fontSize: "14px",
                        lineHeight: "1.5",
                        background: "#f9fafb",
                        transition: "all 0.2s ease",
                        outline: "none",
                      }}
                      onFocus={(e) =>
                        (e.target.style.border = "1.5px solid #2563eb")
                      }
                      onBlur={(e) =>
                        (e.target.style.border = "1.5px solid #d1d5db")
                      }
                    />
                  </div>
                )}

                <div className="actions">
                  <button className="approve" onClick={approveRequest}>
                    Approve
                  </button>

                  {!showRejectBox && (
                    <button
                      className="reject"
                      onClick={() => setShowRejectBox(true)}
                    >
                      Reject
                    </button>
                  )}

                  {showRejectBox && (
                    <button className="reject" onClick={rejectRequest}>
                      Confirm Reject
                    </button>
                  )}

                  <button className="cancel" onClick={closeModal}>
                    Close
                  </button>
                </div>
              </div>
            </div>
          );
        })()}

      <style>{`
        .page {
          padding: 32px;
          background: #f4f6fb;
          min-height: 100vh;
          font-family: system-ui, sans-serif;
        }

        .grid {
          margin-top: 24px;
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 22px;
        }

        .card {
          background: white;
          padding: 22px;
          border-radius: 18px;
          box-shadow: 0 15px 35px rgba(0,0,0,0.08);
          cursor: pointer;
          transition: all .3s ease;
        }

        .card:hover {
          transform: translateY(-8px) scale(1.03);
          box-shadow: 0 35px 70px rgba(0,0,0,0.2);
        }

        .condition {
          font-size: 14px;
          color: #4b5563;
        }

        .status {
          margin-top: 8px;
          font-weight: 600;
          color: #2563eb;
        }

        .hint {
          margin-top: 14px;
          font-size: 13px;
          color: #9ca3af;
        }

        /* MODAL */
        .overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.55);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal {
          background: white;
          width: 100%;
          max-width: 480px;
          padding: 26px;
          border-radius: 20px;
          box-shadow: 0 40px 80px rgba(0,0,0,0.3);
          animation: pop .25s ease;
        }

        @keyframes pop {
          from { transform: scale(.92); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }

        .detail {
          display: flex;
          justify-content: space-between;
          margin-bottom: 12px;
          font-size: 15px;
        }

        .actions {
          display: flex;
          gap: 10px;
          justify-content: flex-end;
          margin-top: 20px;
        }

        .approve {
          background: #16a34a;
          color: white;
          border: none;
          padding: 10px 16px;
          border-radius: 10px;
          cursor: pointer;
        }

        .reject {
          background: #dc2626;
          color: white;
          border: none;
          padding: 10px 16px;
          border-radius: 10px;
          cursor: pointer;
        }

        .cancel {
          background: #e5e7eb;
          border: none;
          padding: 10px 16px;
          border-radius: 10px;
          cursor: pointer;
        }
        .badge.escalated {
            display: inline-block;
            margin-top: 8px;
            background: #dc2626;
            color: white;
            padding: 4px 10px;
            border-radius: 8px;
            font-size: 12px;
            font-weight: 600;
          }
      `}</style>
      <UserMenu />
    </>
  );
}
