import { useState } from "react";
import { loginUser } from "../api/authApi";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }

    try {
      setLoading(true);
      const res = await loginUser({ email, password });

      const user = res.data;

      // Save logged-in user
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("role", user.role);
      localStorage.setItem("userId", user.id);



      // Role-based navigation
      switch (user.role) {
        case "ADMIN":
          navigate("/admin");
          break;
        case "INITIATOR":
          navigate("/initiator");
          break;
        case "MANAGER":
          navigate("/manager");
          break;
        case "FINANCE":
          navigate("/finance");
          break;
        case "AUDITOR":
          navigate("/auditor");
          break;
        default:
          navigate("/");
      }
    } catch (err) {
      setError(
        err?.response?.data ||
          "Login failed. Please check credentials or approval status."
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
          background: linear-gradient(
            135deg,
            #f8fafc,
            #e2e8f0,
            #c7d2fe
          );
        }

        .auth-card {
          width: 360px;
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

        .input-group input {
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
          margin-bottom: 1.2rem;
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
          margin-top: 1.6rem;
          font-size: 14px;
          color: #475569;
        }

        .footer-text a {
          color: #4f46e5;
          text-decoration: none;
          font-weight: 500;
        }
      `}</style>

      <div className="auth">
        <form className="auth-card" onSubmit={submit}>
          <h2>Welcome Back</h2>

          {error && <div className="error">{error}</div>}

          <div className="input-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              placeholder="your@gmail.com"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="input-group password-box">
            <label>Password</label>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <span onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? "Hide" : "Show"}
            </span>
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </button>

          <div className="footer-text">
            New user? <Link to="/signup">Create an account</Link>
          </div>
        </form>
      </div>
    </>
  );
}
