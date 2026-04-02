import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const API_URL = "https://taskweave-backend.onrender.com";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/manager/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: fullName, email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Registration failed");
        setLoading(false);
        return;
      }

      alert("Manager account created ✅");
      navigate("/login");
    } catch (err) {
      console.error(err);
      setError("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          font-family: 'Plus Jakarta Sans', sans-serif;
          background: #f4f5f7;
          color: #111827;
          min-height: 100vh;
        }

        .auth-page {
          min-height: 100vh;
          display: grid;
          grid-template-columns: 1fr 1fr;
        }

        @media (max-width: 768px) {
          .auth-page { grid-template-columns: 1fr; }
          .auth-side { display: none; }
        }

        .auth-side {
          background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 48px;
          position: relative;
          overflow: hidden;
        }

        .auth-side::before {
          content: '';
          position: absolute;
          width: 400px; height: 400px; border-radius: 50%;
          background: rgba(255,255,255,0.06);
          top: -100px; left: -100px;
        }

        .auth-side::after {
          content: '';
          position: absolute;
          width: 300px; height: 300px; border-radius: 50%;
          background: rgba(255,255,255,0.05);
          bottom: -80px; right: -80px;
        }

        .side-brand {
          display: flex; align-items: center; gap: 10px;
          position: relative; z-index: 1;
        }

        .side-brand-mark {
          width: 38px; height: 38px;
          background: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.3);
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center; font-size: 18px;
        }

        .side-brand-name { font-size: 18px; font-weight: 700; color: #fff; letter-spacing: -0.02em; }

        .side-content { position: relative; z-index: 1; }

        .side-headline {
          font-size: 32px; font-weight: 700; color: #fff;
          letter-spacing: -0.03em; line-height: 1.2; margin-bottom: 14px;
        }

        .side-sub { font-size: 15px; color: rgba(255,255,255,0.65); line-height: 1.6; }

        .side-checklist { list-style: none; position: relative; z-index: 1; display: flex; flex-direction: column; gap: 12px; }

        .side-checklist li {
          display: flex; align-items: center; gap: 10px;
          font-size: 14px; color: rgba(255,255,255,0.85);
        }

        .check-icon {
          width: 22px; height: 22px; border-radius: 6px;
          background: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.25);
          display: flex; align-items: center; justify-content: center;
          font-size: 11px; flex-shrink: 0;
        }

        .auth-form-panel {
          display: flex; align-items: center; justify-content: center;
          padding: 48px 40px; background: #f4f5f7;
        }

        .auth-card { width: 100%; max-width: 400px; }

        .auth-logo {
          display: flex; align-items: center; gap: 9px; margin-bottom: 32px;
        }

        .auth-logo-mark {
          width: 34px; height: 34px;
          background: linear-gradient(135deg, #4f46e5, #7c3aed);
          border-radius: 9px;
          display: flex; align-items: center; justify-content: center; font-size: 16px;
        }

        .auth-logo-text { font-size: 16px; font-weight: 700; color: #111827; letter-spacing: -0.02em; }

        .auth-heading { font-size: 24px; font-weight: 700; color: #111827; letter-spacing: -0.02em; margin-bottom: 6px; }
        .auth-subheading { font-size: 13px; color: #6b7280; margin-bottom: 28px; }

        .error-box {
          display: flex; align-items: center; gap: 8px;
          padding: 11px 13px;
          background: #fef2f2; border: 1px solid #fecaca; border-radius: 9px;
          font-size: 13px; color: #b91c1c; font-weight: 500; margin-bottom: 18px;
        }

        .field { margin-bottom: 16px; }

        .field label {
          display: block; font-size: 12px; font-weight: 600; color: #374151; margin-bottom: 6px;
        }

        .field input {
          width: 100%; padding: 10px 13px;
          background: #fff; border: 1px solid #e5e7eb; border-radius: 9px;
          font-family: 'Plus Jakarta Sans', sans-serif; font-size: 13px; color: #111827;
          outline: none; transition: border-color 0.15s, box-shadow 0.15s;
        }

        .field input::placeholder { color: #9ca3af; }

        .field input:focus {
          border-color: #4f46e5;
          box-shadow: 0 0 0 3px rgba(79,70,229,0.08);
        }

        .manager-badge {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 6px 12px;
          background: #eef2ff; border: 1px solid #c7d2fe; border-radius: 8px;
          font-size: 12px; font-weight: 600; color: #4f46e5;
          margin-bottom: 20px;
        }

        .submit-btn {
          width: 100%; padding: 11px;
          background: linear-gradient(135deg, #4f46e5, #7c3aed);
          color: #fff; border: none; border-radius: 9px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 14px; font-weight: 600; cursor: pointer;
          box-shadow: 0 2px 8px rgba(79,70,229,0.3);
          transition: opacity 0.15s, transform 0.1s;
          margin-top: 6px;
        }

        .submit-btn:hover { opacity: 0.92; }
        .submit-btn:active { transform: scale(0.99); }
        .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        .auth-footer { text-align: center; margin-top: 20px; font-size: 13px; color: #6b7280; }
        .auth-footer a { color: #4f46e5; font-weight: 600; text-decoration: none; }
        .auth-footer a:hover { text-decoration: underline; }
      `}</style>

      <div className="auth-page">

        {/* Left panel */}
        <div className="auth-side">
          <div className="side-brand">
            <div className="side-brand-mark">⚡</div>
            <span className="side-brand-name">TaskWeave</span>
          </div>

          <div className="side-content">
            <div className="side-headline">Set up your<br />workspace today.</div>
            <div className="side-sub">Create a manager account and start building your team in minutes.</div>
          </div>

          <ul className="side-checklist">
            <li><span className="check-icon">✓</span> AI-powered task assignment</li>
            <li><span className="check-icon">✓</span> Real-time workload tracking</li>
            <li><span className="check-icon">✓</span> Team skill matching</li>
            <li><span className="check-icon">✓</span> Live status updates</li>
          </ul>
        </div>

        {/* Right panel */}
        <div className="auth-form-panel">
          <div className="auth-card">

            <div className="auth-logo">
              <div className="auth-logo-mark">⚡</div>
              <span className="auth-logo-text">TaskWeave</span>
            </div>

            <div className="auth-heading">Create your account</div>
            <div className="auth-subheading">Start managing your team smarter.</div>

            <div className="manager-badge">
              🛡 Manager account
            </div>

            {error && <div className="error-box">⚠ {error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="field">
                <label>Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  placeholder="John Doe"
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>

              <div className="field">
                <label>Email</label>
                <input
                  type="email"
                  value={email}
                  placeholder="you@example.com"
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="field">
                <label>Password</label>
                <input
                  type="password"
                  value={password}
                  placeholder="••••••••"
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? "Creating account…" : "Create Manager Account →"}
              </button>
            </form>

            <p className="auth-footer">
              Already have an account?{" "}
              <a href="/login">Sign in</a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}