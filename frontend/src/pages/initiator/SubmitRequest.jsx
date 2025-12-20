import React, { useState } from "react";

export default function SubmitRequest({ onClose }) {
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");

  const submitRequest = () => {
    if (!amount || !reason) {
      alert("Fill all fields");
      return;
    }

    const payload = {
      workflowId: 1,
      initiatorId: 205,
      amount,
      reason,
    };

    console.log("Request Submitted:", payload);
    alert("Request submitted successfully");
    onClose();
  };

  return (
    <>
      <div style={overlay}>
        <div style={modal}>
          <h3>Submit Purchase Request</h3>

          <label>Amount</label>
          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="15000"
          />

          <label>Reason</label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Laptop purchase"
          />

          <div style={actions}>
            <button onClick={onClose}>Cancel</button>
            <button onClick={submitRequest}>Submit</button>
          </div>
        </div>
      </div>
    </>
  );
}

const overlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.4)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const modal = {
  background: "white",
  padding: "20px",
  width: "400px",
  borderRadius: "12px",
};

const actions = {
  display: "flex",
  justifyContent: "flex-end",
  gap: "10px",
  marginTop: "15px",
};
