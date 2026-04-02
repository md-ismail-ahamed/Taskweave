import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer
} from "recharts";

interface Task {
  _id: string;
  title: string;
  description: string;
  requiredSkills: string[];
  estimatedHours: number;
  status: string;
  projectLink?: string;
}

export default function TeamMemberDashboard() {

  const navigate = useNavigate();
  const API_URL = "https://taskweave-backend.onrender.com";

  const [tasks, setTasks] = useState<Task[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const[loading,setLoading] = useState(true);

  useEffect(() => {
    const storedToken = sessionStorage.getItem("token");
    if (!storedToken) { 
      navigate("/login");
    }
    else {
      setLoading(false);
    }
  }, []);

 
  const memberName = sessionStorage.getItem("name") || "Team Member";
  const memberInitials = memberName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  useEffect(() => {
    loadTasks();
    const interval = setInterval(() => { loadTasks(); }, 3000);
    return () => clearInterval(interval);
  }, []);

  const logout = () => {
    sessionStorage.clear();
    navigate("/login");
  };

  const loadTasks = async () => {
    const response = await fetch(`${API_URL}/api/task`, {
      headers: { Authorization: sessionStorage.getItem("token") || "" }
    });
    const data = await response.json();
    setTasks(Array.isArray(data) ? data : []);
  };

  const markComplete = async (taskId: string) => {
    await fetch(`${API_URL}/api/task/update-status/${taskId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: sessionStorage.getItem("token") || "" },
      body: JSON.stringify({ status: "completed" })
    });
    await loadTasks();
  };

  const getProgressData = () => {
    const completed = tasks.filter(t => t.status === "completed").length;
    const pending = tasks.filter(t => t.status !== "completed").length;
    return [
      { name: "Completed", value: completed },
      { name: "Pending", value: pending }
    ];
  };

  const totalHours = tasks.reduce((sum, t) => sum + t.estimatedHours, 0);
  const completedCount = tasks.filter(t => t.status === "completed").length;
  const pendingCount = tasks.filter(t => t.status !== "completed").length;
  const progressPct = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

if(loading) return null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          font-family: 'Plus Jakarta Sans', sans-serif;
          background: #f4f5f7; color: #111827; min-height: 100vh;
        }

        /* ─── NAVBAR ─── */
        .navbar {
          position: sticky; top: 0; z-index: 200; height: 62px;
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 28px; background: #fff;
          border-bottom: 1px solid #e5e7eb; box-shadow: 0 1px 3px rgba(0,0,0,0.06);
        }

        .navbar-brand { display: flex; align-items: center; gap: 10px; }

        .brand-mark {
          width: 34px; height: 34px;
          background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
          border-radius: 9px;
          display: flex; align-items: center; justify-content: center;
          color: #fff; font-size: 16px; flex-shrink: 0;
        }

        .brand-text { font-size: 15px; font-weight: 700; color: #111827; letter-spacing: -0.02em; }
        .brand-sub { font-size: 11px; font-weight: 400; color: #9ca3af; }

        .navbar-right { display: flex; align-items: center; gap: 10px; position: relative; }

        .notif-btn {
          width: 34px; height: 34px; border-radius: 8px;
          border: 1px solid #e5e7eb; background: #fff;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; font-size: 15px;
          transition: background 0.15s, border-color 0.15s;
        }

        .notif-btn:hover { background: #f9fafb; border-color: #d1d5db; }

        .profile-trigger {
          display: flex; align-items: center; gap: 8px;
          padding: 5px 10px 5px 5px;
          border: 1px solid #e5e7eb; border-radius: 9px; background: #fff;
          cursor: pointer; font-family: 'Plus Jakarta Sans', sans-serif;
          transition: background 0.15s, border-color 0.15s;
        }

        .profile-trigger:hover { background: #f9fafb; border-color: #d1d5db; }

        .profile-avatar {
          width: 28px; height: 28px; border-radius: 7px;
          background: linear-gradient(135deg, #4f46e5, #7c3aed);
          display: flex; align-items: center; justify-content: center;
          font-size: 11px; font-weight: 700; color: #fff; flex-shrink: 0;
        }

        .pt-name { font-size: 13px; font-weight: 500; color: #374151; }
        .pt-role { font-size: 11px; color: #9ca3af; }
        .chevron { font-size: 10px; color: #9ca3af; margin-left: 2px; }

        .dropdown {
          position: absolute; top: calc(100% + 8px); right: 0;
          width: 190px; background: #fff;
          border: 1px solid #e5e7eb; border-radius: 12px; padding: 6px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.1);
          animation: fadeDown 0.14s ease;
        }

        @keyframes fadeDown {
          from { opacity: 0; transform: translateY(-5px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .dropdown-header { padding: 8px 11px 6px; border-bottom: 1px solid #f3f4f6; margin-bottom: 4px; }
        .dh-name { font-size: 13px; font-weight: 600; color: #111827; }
        .dh-role { font-size: 11px; color: #9ca3af; margin-top: 1px; }

        .dropdown-item {
          display: flex; align-items: center; gap: 8px; width: 100%;
          padding: 8px 11px; background: none; border: none; border-radius: 7px;
          font-family: 'Plus Jakarta Sans', sans-serif; font-size: 13px; font-weight: 500;
          color: #374151; cursor: pointer; text-align: left; transition: background 0.13s;
        }

        .dropdown-item:hover { background: #f3f4f6; }
        .dropdown-divider { height: 1px; background: #f3f4f6; margin: 4px 0; }
        .dropdown-item.danger { color: #ef4444; }
        .dropdown-item.danger:hover { background: #fef2f2; }

        /* ─── PAGE ─── */
        .dashboard-container { min-height: 100vh; }
        .page-body { padding: 24px 28px; }

        .page-header { margin-bottom: 22px; }
        .page-header h1 { font-size: 20px; font-weight: 700; color: #111827; letter-spacing: -0.02em; }
        .page-header p { font-size: 13px; color: #6b7280; margin-top: 2px; }

        /* ─── STAT CARDS ROW ─── */
        .stats-row {
          display: grid; grid-template-columns: repeat(4, 1fr);
          gap: 14px; margin-bottom: 20px;
        }

        @media (max-width: 900px) { .stats-row { grid-template-columns: 1fr 1fr; } }

        .stat-card {
          background: #fff; border: 1px solid #e5e7eb; border-radius: 13px;
          padding: 16px 18px;
          display: flex; align-items: center; gap: 14px;
        }

        .stat-icon {
          width: 40px; height: 40px; border-radius: 10px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center; font-size: 18px;
        }

        .stat-icon.purple { background: #eef2ff; }
        .stat-icon.green  { background: #f0fdf4; }
        .stat-icon.yellow { background: #fefce8; }
        .stat-icon.blue   { background: #eff6ff; }

        .stat-val { font-size: 22px; font-weight: 700; color: #111827; line-height: 1; }
        .stat-label { font-size: 11px; font-weight: 500; color: #9ca3af; margin-top: 3px; text-transform: uppercase; letter-spacing: 0.04em; }

        /* ─── CHARTS ROW ─── */
        .charts-row {
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 18px; margin-bottom: 20px;
        }

        @media (max-width: 900px) { .charts-row { grid-template-columns: 1fr; } }

        .card {
          background: #fff; border: 1px solid #e5e7eb; border-radius: 14px; padding: 22px;
        }

        .card-header { margin-bottom: 18px; }
        .card-title { font-size: 11px; font-weight: 700; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.06em; }

        /* ─── PROGRESS BAR ─── */
        .progress-section { display: flex; flex-direction: column; justify-content: center; gap: 20px; }

        .progress-item {}

        .progress-item-header {
          display: flex; justify-content: space-between; align-items: center; margin-bottom: 7px;
        }

        .progress-item-label { font-size: 13px; font-weight: 500; color: #374151; }
        .progress-item-val { font-size: 13px; font-weight: 700; color: #111827; }

        .progress-track {
          height: 8px; background: #f3f4f6; border-radius: 999px; overflow: hidden;
        }

        .progress-fill { height: 100%; border-radius: 999px; transition: width 0.5s ease; }

        /* ─── TABLE ─── */
        .table-card { background: #fff; border: 1px solid #e5e7eb; border-radius: 14px; overflow: hidden; }

        .table-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 16px 22px; border-bottom: 1px solid #f3f4f6;
        }

        .table-title { font-size: 11px; font-weight: 700; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.06em; }

        .task-count {
          font-size: 12px; font-weight: 600; color: #4f46e5;
          background: #eef2ff; padding: 3px 9px; border-radius: 999px;
        }

        .tasks-table { width: 100%; border-collapse: collapse; }

        .tasks-table thead th {
          padding: 10px 22px; font-size: 11px; font-weight: 600;
          text-transform: uppercase; letter-spacing: 0.06em; color: #9ca3af;
          text-align: left; background: #fafafa; border-bottom: 1px solid #f3f4f6;
        }

        .tasks-table tbody tr { border-bottom: 1px solid #f9fafb; transition: background 0.12s; }
        .tasks-table tbody tr:last-child { border-bottom: none; }
        .tasks-table tbody tr:hover { background: #fafafa; }

        .tasks-table td {
          padding: 12px 22px; font-size: 13px; color: #374151; vertical-align: middle;
        }

        .task-title-cell { font-weight: 600; color: #111827; max-width: 200px; }

        .task-desc {
          font-size: 12px; color: #6b7280; max-width: 220px;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }

        .skill-chip {
          display: inline-block; padding: 2px 8px;
          background: #f3f4f6; color: #374151; border-radius: 5px;
          font-size: 11px; font-weight: 500; margin-right: 4px; margin-bottom: 2px;
        }

        .hours-badge { font-size: 12px; font-weight: 600; color: #6b7280; }

        .status-badge {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 3px 10px; border-radius: 999px; font-size: 11px; font-weight: 600;
        }

        .status-badge::before {
          content: ''; width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0;
        }

        .status-pending { background: #fef9c3; color: #854d0e; }
        .status-pending::before { background: #ca8a04; }
        .status-completed { background: #dcfce7; color: #14532d; }
        .status-completed::before { background: #16a34a; }
        .status-in_progress { background: #dbeafe; color: #1e3a8a; }
        .status-in_progress::before { background: #3b82f6; }

        .action-btns { display: flex; gap: 7px; }

        .btn-start {
          padding: 6px 13px;
          background: #eef2ff; color: #4f46e5; border: 1px solid #c7d2fe;
          border-radius: 7px; font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 12px; font-weight: 600; cursor: pointer;
          transition: background 0.15s;
          white-space: nowrap;
        }

        .btn-start:hover { background: #e0e7ff; }

        .btn-complete {
          padding: 6px 13px;
          background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0;
          border-radius: 7px; font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 12px; font-weight: 600; cursor: pointer;
          transition: background 0.15s;
          white-space: nowrap;
        }

        .btn-complete:hover { background: #dcfce7; }

        .empty-state { padding: 48px; text-align: center; color: #9ca3af; font-size: 14px; }
      `}</style>

      <div className="dashboard-container">

        {/* ── NAVBAR ── */}
        <nav className="navbar">
          <div className="navbar-brand">
            <div className="brand-mark">⚡</div>
            <div>
              <div className="brand-text">TaskWeave</div>
              <div className="brand-sub">Team Member</div>
            </div>
          </div>

          <div className="navbar-right">
            <button className="notif-btn">🔔</button>

            <button className="profile-trigger" onClick={() => setShowDropdown(!showDropdown)}>
              <div className="profile-avatar">{memberInitials}</div>
              <div>
                <div className="pt-name">{memberName}</div>
                <div className="pt-role">Team Member</div>
              </div>
              <span className="chevron">▾</span>
            </button>

            {showDropdown && (
              <div className="dropdown">
                <div className="dropdown-header">
                  <div className="dh-name">{memberName}</div>
                  <div className="dh-role">Team Member</div>
                </div>
                <button className="dropdown-item">👤 My Profile</button>
                <div className="dropdown-divider" />
                <button className="dropdown-item danger" onClick={logout}>🚪 Logout</button>
              </div>
            )}
          </div>
        </nav>

        <div className="page-body">

          <div className="page-header">
            <h1>Good morning, {memberName.split(" ")[0]} 👋</h1>
            <p>Here's your task workload for today.</p>
          </div>

          {/* ── STAT CARDS ── */}
          <div className="stats-row">
            <div className="stat-card">
              <div className="stat-icon purple">📋</div>
              <div>
                <div className="stat-val">{tasks.length}</div>
                <div className="stat-label">Total Tasks</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon green">✅</div>
              <div>
                <div className="stat-val">{completedCount}</div>
                <div className="stat-label">Completed</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon yellow">⏳</div>
              <div>
                <div className="stat-val">{pendingCount}</div>
                <div className="stat-label">Pending</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon blue">🕐</div>
              <div>
                <div className="stat-val">{totalHours}h</div>
                <div className="stat-label">Total Hours</div>
              </div>
            </div>
          </div>

          {/* ── CHARTS ROW ── */}
          <div className="charts-row">
            <div className="card">
              <div className="card-header">
                <div className="card-title">Task Progress</div>
              </div>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={getProgressData()}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={4}
                    label
                  >
                    <Cell fill="#22c55e" />
                    <Cell fill="#3b82f6" />  
                    <Cell fill="#facc15" />
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #e5e7eb", fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="card">
              <div className="card-header">
                <div className="card-title">Workload Overview</div>
              </div>
              <div className="progress-section">
                <div className="progress-item">
                  <div className="progress-item-header">
                    <span className="progress-item-label">Overall Completion</span>
                    <span className="progress-item-val">{progressPct}%</span>
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill" style={{ width: `${progressPct}%`, background: "#4f46e5" }} />
                  </div>
                </div>

                <div className="progress-item">
                  <div className="progress-item-header">
                    <span className="progress-item-label">Completed Tasks</span>
                    <span className="progress-item-val">{completedCount} / {tasks.length}</span>
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill" style={{ width: tasks.length ? `${(completedCount / tasks.length) * 100}%` : "0%", background: "#22c55e" }} />
                  </div>
                </div>

                <div className="progress-item">
                  <div className="progress-item-header">
                    <span className="progress-item-label">Hours Assigned</span>
                    <span className="progress-item-val">{totalHours}h</span>
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill" style={{ width: `${Math.min((totalHours / 40) * 100, 100)}%`, background: totalHours > 32 ? "#ef4444" : totalHours > 20 ? "#facc15" : "#22c55e" }} />
                  </div>
                </div>

                <div className="progress-item">
                  <div className="progress-item-header">
                    <span className="progress-item-label">Pending Tasks</span>
                    <span className="progress-item-val">{pendingCount}</span>
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill" style={{ width: tasks.length ? `${(pendingCount / tasks.length) * 100}%` : "0%", background: "#facc15" }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── TASKS TABLE ── */}
          <div className="table-card">
            <div className="table-header">
              <div className="table-title">My Tasks</div>
              <span className="task-count">{tasks.length} total</span>
            </div>

            <table className="tasks-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Description</th>
                  <th>Skills</th>
                  <th>Hours</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tasks.length === 0 && (
                  <tr><td colSpan={6}><div className="empty-state">No tasks assigned yet.</div></td></tr>
                )}
                {tasks.map(task => (
                  <tr key={task._id}>
                    <td className="task-title-cell">{task.title}</td>
                    <td><div className="task-desc">{task.description}</div></td>
                    <td>
                      {task.requiredSkills?.map((s, i) => (
                        <span key={i} className="skill-chip">{s}</span>
                      ))}
                    </td>
                    <td><span className="hours-badge">{task.estimatedHours}h</span></td>
                    <td>
                      <span className={`status-badge ${
                        task.status === "completed" ? "status-completed"
                        : task.status === "in-progress" ? "status-in_progress"
                        : "status-pending"
                      }`}>
                        {task.status}
                      </span>
                    </td>
                    <td>
                      {task.status !== "completed" && (
                        <div className="action-btns">
                          <button
                            className="btn-start"
                            onClick={async () => {
                              await fetch(`${API_URL}/api/task/update-status/${task._id}`, {
                                method: "PUT",
                                headers: { "Content-Type": "application/json", Authorization: sessionStorage.getItem("token") || "" },
                                body: JSON.stringify({ status: "in-progress" })
                              });
                              if (task.projectLink) window.open(task.projectLink, "_blank");
                              await loadTasks();
                            }}
                          >
                            ▶ Start
                          </button>
                          <button className="btn-complete" onClick={() => markComplete(task._id)}>
                            ✓ Done
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </>
  );
}