import { useState, useEffect, useRef } from "react";
import { loginUser } from "../api/authApi";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const bgRef = useRef(null);

  /* 🌊 Subtle interactive background */
  useEffect(() => {
    const moveBg = (e) => {
      const x = (e.clientX / window.innerWidth) * 100;
      const y = (e.clientY / window.innerHeight) * 100;
      if (bgRef.current) {
        bgRef.current.style.background = `
          radial-gradient(circle at ${x}% ${y}%,
          rgba(99,102,241,0.15),
          rgba(241,245,249,0.95) 55%)
        `;
      }
    };
    window.addEventListener("mousemove", moveBg);
    return () => window.removeEventListener("mousemove", moveBg);
  }, []);

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

      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("role", user.role);
      localStorage.setItem("userId", user.id);

      switch (user.role) {
        case "ADMIN": navigate("/admin"); break;
        case "INITIATOR": navigate("/initiator"); break;
        case "MANAGER": navigate("/manager"); break;
        case "FINANCE": navigate("/finance"); break;
        case "AUDITOR": navigate("/auditor"); break;
        default: navigate("/");
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
          font-family: "Inter", system-ui, sans-serif;
        }

        body {
          background: #f1f5f9;
        }

        /* 🌌 Background */
        .bg {
          position: fixed;
          inset: 0;
          z-index: -1;
          transition: background 0.4s ease;
        }

        /* 🔷 Brand */
        .brand-top {
          position: fixed;
          top: 24px;
          left: 32px;
          font-size: 26px;
          font-weight: 900;
          background: linear-gradient(90deg,#4f46e5,#6366f1,#4f46e5);
          background-size: 200%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          cursor: pointer;
          animation: brandWave 4s linear infinite, brandPulse 3s ease-in-out infinite;
        }

        @keyframes brandWave {
          0% { background-position: 0%; }
          100% { background-position: 200%; }
        }

        @keyframes brandPulse {
          0%,100% { transform: scale(1); text-shadow: none; }
          50% { transform: scale(1.01); text-shadow: 0 0 12px rgba(79,70,229,0.35); }
        }

        /* 🔐 Auth Layout */
        .auth {
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .auth-card {
          width: 360px;
          background: #ffffff;
          padding: 2.6rem 2.4rem;
          border-radius: 18px;
          box-shadow: 0 25px 60px rgba(0,0,0,0.15);
          animation: floatCard 6s ease-in-out infinite;
        }

        @keyframes floatCard {
          0%,100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }

        .auth-card h2 {
          text-align: center;
          margin-bottom: 2rem;
          font-weight: 700;
          color: #1e293b;
        }

        /* 🧾 Inputs */
        .input-group {
          margin-bottom: 1.3rem;
        }

        .input-group label {
          font-size: 13px;
          margin-bottom: 6px;
          display: block;
          color: #475569;
        }

        .input-group input {
          width: 100%;
          padding: 12px 14px;
          border-radius: 10px;
          border: 1px solid #c7d2fe;
          font-size: 14px;
          transition: border 0.3s, box-shadow 0.3s;
        }

        .input-group input:focus {
          outline: none;
          border-color: #6366f1;
          box-shadow: 0 0 0 3px rgba(99,102,241,0.15);
        }

        .password-box {
          position: relative;
        }

        .password-box span {
          position: absolute;
          right: 14px;
          top: 36px;
          font-size: 13px;
          cursor: pointer;
          color: #64748b;
          transition: color 0.2s;
        }

        .password-box span:hover {
          color: #4f46e5;
        }

        /* ❌ Error */
        .error {
          background: #fee2e2;
          color: #991b1b;
          padding: 10px;
          border-radius: 10px;
          font-size: 13px;
          margin-bottom: 1.2rem;
          text-align: center;
        }

        /* 🚀 Button */
        .btn-primary {
          width: 100%;
          padding: 14px;
          border-radius: 12px;
          border: none;
          background: linear-gradient(135deg,#6366f1,#4f46e5);
          color: white;
          font-size: 15px;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          transition: transform 0.3s, box-shadow 0.3s;
        }

        .btn-primary::after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(120deg, transparent, rgba(255,255,255,0.4), transparent);
          transform: translateX(-100%);
          transition: transform 0.6s;
        }

        .btn-primary:hover::after {
          transform: translateX(100%);
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 14px 30px rgba(79,70,229,0.35);
        }

        .btn-primary:disabled {
          background: #a5b4fc;
          cursor: not-allowed;
        }

        /* 🔗 Footer */
        .footer-text {
          margin-top: 1.6rem;
          text-align: center;
          font-size: 14px;
          color: #475569;
        }

        .footer-text a {
          color: #4f46e5;
          font-weight: 500;
          text-decoration: none;
        }
      `}</style>

      {/* Background */}
      <div ref={bgRef} className="bg"></div>

      {/* Brand */}
      <div className="brand-top" onClick={() => navigate("/")}>
        AutomateX
      </div>

      {/* Login */}
      <div className="auth">
        <form className="auth-card" onSubmit={submit}>
          <h2>Welcome Back</h2>

          {error && <div className="error">{error}</div>}

          <div className="input-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="input-group password-box">
            <label>Password</label>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
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
