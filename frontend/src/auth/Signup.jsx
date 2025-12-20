import { useState } from "react";
import { signupUser } from "../api/authApi";
import { useNavigate, Link } from "react-router-dom";

export default function Signup() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "INITIATOR",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.name || !form.email || !form.password) {
      setError("All fields are required");
      return;
    }

    if (form.role === "ADMIN") {
      setError("Admin role cannot be self-registered");
      return;
    }

    try {
      setLoading(true);
      const res = await signupUser(form);

      setSuccess(
        "Signup successful! Awaiting admin approval. You can login after approval."
      );

      setTimeout(() => navigate("/login"), 2500);
    } catch (err) {
      setError(
        err?.response?.data || "Signup failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        * {
          box-sizing: border-box;
          font-family: "Inter", "Segoe UI", sans-serif;
        }

        .auth {
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          background: linear-gradient(135deg, #f8fafc, #e2e8f0, #c7d2fe);
        }

        .auth-card {
          width: 380px;
          background: #ffffff;
          padding: 2.5rem 2.2rem;
          border-radius: 14px;
          box-shadow: 0 25px 60px rgba(0, 0, 0, 0.15);
        }

        .auth-card h2 {
          text-align: center;
          margin-bottom: 1.8rem;
          color: #1e293b;
          font-weight: 600;
        }

        .input-group {
          margin-bottom: 1.2rem;
        }

        .input-group label {
          display: block;
          margin-bottom: 6px;
          font-size: 13px;
          color: #475569;
        }

        .input-group input,
        .input-group select {
          width: 100%;
          padding: 12px 14px;
          border-radius: 8px;
          border: 1px solid #cbd5f5;
          font-size: 14px;
        }

        .password-box {
          position: relative;
        }

        .password-box span {
          position: absolute;
          right: 12px;
          top: 36px;
          cursor: pointer;
          font-size: 13px;
          color: #64748b;
        }

        .error {
          background: #fee2e2;
          color: #991b1b;
          padding: 10px;
          border-radius: 8px;
          font-size: 13px;
          margin-bottom: 1rem;
          text-align: center;
        }

        .success {
          background: #dcfce7;
          color: #166534;
          padding: 10px;
          border-radius: 8px;
          font-size: 13px;
          margin-bottom: 1rem;
          text-align: center;
        }

        .btn-primary {
          width: 100%;
          padding: 12px;
          border-radius: 8px;
          border: none;
          background: linear-gradient(135deg, #6366f1, #4f46e5);
          color: #fff;
          font-size: 15px;
          cursor: pointer;
        }

        .btn-primary:disabled {
          background: #a5b4fc;
          cursor: not-allowed;
        }

        .footer-text {
          text-align: center;
          margin-top: 1.4rem;
          font-size: 14px;
        }

        .footer-text a {
          color: #4f46e5;
          text-decoration: none;
          font-weight: 500;
        }
      `}</style>

      <div className="auth">
        <form className="auth-card" onSubmit={submit}>
          <h2>Create Account</h2>

          {error && <div className="error">{error}</div>}
          {success && <div className="success">{success}</div>}

          <div className="input-group">
            <label>Full Name</label>
            <input
              value={form.name}
              placeholder="Jhon Doe"
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
            />
          </div>

          <div className="input-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="your@gmail.com"
              value={form.email}
              onChange={(e) =>
                setForm({ ...form, email: e.target.value })
              }
            />
          </div>

          <div className="input-group password-box">
            <label>Password</label>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="*********"
              value={form.password}
              onChange={(e) =>
                setForm({ ...form, password: e.target.value })
              }
            />
            <span onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? "Hide" : "Show"}
            </span>
          </div>

          <div className="input-group">
            <label>Role</label>
            <select
              value={form.role}
              disabled={loading}
              onChange={(e) =>
                setForm({ ...form, role: e.target.value })
              }
            >
              <option value="INITIATOR">Initiator</option>
              <option value="MANAGER">Manager</option>
              <option value="FINANCE">Finance</option>
              <option value="AUDITOR">Auditor</option>
            </select>
          </div>

          <button className="btn-primary" disabled={loading}>
            {loading ? "Creating account..." : "Sign Up"}
          </button>

          <div className="footer-text">
            Already registered? <Link to="/login">Login</Link>
          </div>
        </form>
      </div>
    </>
  );
}
