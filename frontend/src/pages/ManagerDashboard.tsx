import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
//import "../styles/ManagerDashboard.css";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from "recharts";

interface Task {
  _id: string;
  title: string;
  description: string;
  requiredSkills: string[];
  estimatedHours: number;
  assignedTo?: string;
  status: string;
}

interface Member {
  _id: string;
  name: string;
  skills: any[];
  capacityHours: number;
}

type Tab = "overview" | "tasks" | "team";

export default function ManagerDashboard() {

  const navigate = useNavigate();
  const API_URL = "https://taskweave-backend.onrender.com";

  const [tasks, setTasks] = useState<Task[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [skills, setSkills] = useState("");
  const [hours, setHours] = useState("");

  const [recommendedMember, setRecommendedMember] = useState<any>(null);
  const [isRecommending, setIsRecommending] = useState(false);
  const [showRecCard, setShowRecCard] = useState(false);

  const [memberName, setMemberName] = useState("");
const [memberEmail, setMemberEmail] = useState("");
const [memberPassword, setMemberPassword] = useState("");
const [memberSkills, setMemberSkills] = useState("");
const[loading,setLoading] = useState(true);

const[projectLink, setProjectLink] = useState("");
//const [showDropdown, setShowDropdown] = useState(false);

const userName = sessionStorage.getItem("name") || "User";

const initials = userName
  .split(" ")
  .map(n => n[0])
  .join("")
  .toUpperCase()
  .slice(0, 2);

  useEffect(() => {
    const storedToken = sessionStorage.getItem("token");
    if (!storedToken) {
    navigate("/login");
    
  }
  else {
    setLoading(false);
  }
  }, []);

  const managerName = sessionStorage.getItem("name") || "Manager";
  const managerInitials = managerName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  useEffect(() => {
    loadTasks();
    loadMembers();

     const interval = setInterval(() => {
    loadTasks();
    loadMembers();
  }, 3000);

  return () => clearInterval(interval);
  }, []);

  const logout = () => {
    sessionStorage.clear();
    navigate("/login");
  };

 const loadTasks = async () => {
  const res = await fetch(`${API_URL}/api/task`, {
    headers: { Authorization: sessionStorage.getItem("token") || "" }
  });
  const data = await res.json();
  setTasks(Array.isArray(data) ? data : []);
};

const loadMembers = async () => {
  const res = await fetch(`${API_URL}/api/member`, {
    headers: { Authorization: sessionStorage.getItem("token") || "" }
  });
  const data = await res.json();
  setMembers(Array.isArray(data) ? data : []);
};

  const getRecommendation = async () => {
    setIsRecommending(true);
    setShowRecCard(false);
    setRecommendedMember(null);

    const res = await fetch(`${API_URL}/api/task/recommend`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: sessionStorage.getItem("token") || ""
      },
      body: JSON.stringify({
        requiredSkills: skills.split(",").map(s => s.trim())
      })
    });

    const data = await res.json();
    setRecommendedMember(data);
    setIsRecommending(false);
    // small delay so animation triggers after render
    setTimeout(() => setShowRecCard(true), 30);
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch(`${API_URL}/api/task/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: sessionStorage.getItem("token") || ""
      },
      body: JSON.stringify({
        title,
        description,
        requiredSkills: skills.split(",").map(s => s.trim()),
        estimatedHours: Number(hours),
        assignedTo: null
      })
    });
    await loadTasks();
    await loadMembers();
  };

  const handleAssignRecommended = async () => {
    if (!recommendedMember) return;
    const selectedMember = members.find(
      m => m.name.toLowerCase() === recommendedMember.recommendedMember.toLowerCase()
    );
    if (!selectedMember) return;
    await fetch(`${API_URL}/api/task/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: sessionStorage.getItem("token") || ""
      },
      body: JSON.stringify({
        title,
        description,
        requiredSkills: skills.split(",").map(s => s.trim()),
        estimatedHours: Number(hours),
        assignedTo: selectedMember._id,
        projectLink: projectLink
      })
    });
    setShowRecCard(false);
    setRecommendedMember(null);
    await loadTasks();
    await loadMembers();
  };

  const getWorkloadData = () => {
  const MAX = 16;

  return members.map(m => {
    let hrs = 0;

    tasks.forEach(t => {
      if (t.assignedTo === m._id && t.status !== "completed") {
        hrs += t.estimatedHours;
      }
    });

    return {
      name: m.name,
      hours: hrs,
      percentage: Math.min((hrs / MAX) * 100, 100)
    };
  });
};


  const createMember = async () => {
  const token = sessionStorage.getItem("token");



  const res = await fetch(`${API_URL}/api/member/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token || ""
    },
    body: JSON.stringify({
      name: memberName,
      email: memberEmail,
      password: memberPassword,
      skills: memberSkills
        ? memberSkills.split(",").map(s => s.trim())
        : []
    })
  });

  if (res.ok) {
    alert("Member created successfully ✅");

    setMemberName("");
    setMemberEmail("");
    setMemberPassword("");
    setMemberSkills("");

    loadMembers(); // refresh list
  } else {
    alert("Error creating member ❌");
  }
};

 const getMemberTaskCount = (memberId: string) =>
  tasks.filter(t => t.assignedTo === memberId && t.status !== "completed").length;

const getMemberHours = (memberId: string) =>
  tasks
    .filter(t => t.assignedTo === memberId && t.status !== "completed")
    .reduce((sum, t) => sum + t.estimatedHours, 0);

const getWorkloadPercent = (memberId: string) =>
  Math.min((getMemberHours(memberId) / 16) * 100, 100);

// 🔥 FIX TASK STATUS DATA (PIE CHART)

const getTaskStatusData = () => {
  const pending = tasks.filter(t => t.status === "pending").length;
  const inProgress = tasks.filter(t => t.status === "in-progress").length;
  const completed = tasks.filter(t => t.status === "completed").length;

  return [
    { name: "Pending", value: pending },
    { name: "In Progress", value: inProgress },
    { name: "Completed", value: completed }
  ];
};

  const recMemberObj = recommendedMember
    ? members.find(m => m.name.toLowerCase() === recommendedMember.recommendedMember?.toLowerCase())
    : null;

  const recInitials = recommendedMember?.recommendedMember
    ?.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) || "?";

  const recTaskCount = recMemberObj ? getMemberTaskCount(recMemberObj._id) : 0;
  const recHours = recMemberObj ? getMemberHours(recMemberObj._id) : 0;
  const recWorkload = recMemberObj ? getWorkloadPercent(recMemberObj._id) : 0;
  const recSkills = recMemberObj
    ? (Array.isArray(recMemberObj.skills)
        ? recMemberObj.skills.map((s: any) => typeof s === "string" ? s : s?.name || s?.skill || "").filter(Boolean)
        : [])
    : [];

    if(loading) return null;

  return (
    <>
    <style>
      {`
      @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          font-family: 'Plus Jakarta Sans', sans-serif;
          background: #f4f5f7;
          color: #111827;
          min-height: 100vh;
        }

        /* ─── NAVBAR ─── */
        .navbar {
          position: sticky;
          top: 0;
          z-index: 200;
          height: 62px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 28px;
          background: #ffffff;
          border-bottom: 1px solid #e5e7eb;
          box-shadow: 0 1px 3px rgba(0,0,0,0.06);
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

        .navbar-center { display: flex; align-items: center; gap: 2px; }

        .nav-link {
          padding: 6px 16px;
          font-size: 13px; font-weight: 500; color: #6b7280;
          border-radius: 7px; cursor: pointer;
          background: none; border: none;
          font-family: 'Plus Jakarta Sans', sans-serif;
          transition: background 0.15s, color 0.15s;
        }

        .nav-link:hover { background: #f3f4f6; color: #111827; }
        .nav-link.active { background: #eef2ff; color: #4f46e5; font-weight: 600; }

        .nav-count {
          display: inline-flex; align-items: center; justify-content: center;
          margin-left: 6px; padding: 1px 6px;
          border-radius: 999px; font-size: 10px; font-weight: 700;
          vertical-align: middle;
        }

        .nav-link.active .nav-count { background: #4f46e5; color: #fff; }
        .nav-link:not(.active) .nav-count { background: #d1d5db; color: #374151; }

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

        .dropdown-header {
          padding: 8px 11px 6px;
          border-bottom: 1px solid #f3f4f6; margin-bottom: 4px;
        }

        .dh-name { font-size: 13px; font-weight: 600; color: #111827; }
        .dh-role { font-size: 11px; color: #9ca3af; margin-top: 1px; }

        .dropdown-item {
          display: flex; align-items: center; gap: 8px;
          width: 100%; padding: 8px 11px;
          background: none; border: none; border-radius: 7px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 13px; font-weight: 500; color: #374151;
          cursor: pointer; text-align: left; transition: background 0.13s;
        }

        .dropdown-item:hover { background: #f3f4f6; }
        .dropdown-divider { height: 1px; background: #f3f4f6; margin: 4px 0; }
        .dropdown-item.danger { color: #ef4444; }
        .dropdown-item.danger:hover { background: #fef2f2; }

        /* ─── LAYOUT ─── */
        .dashboard-container { min-height: 100vh; }
        .page-body { padding: 24px 28px; }

        .page-header { margin-bottom: 20px; }
        .page-header h1 { font-size: 20px; font-weight: 700; color: #111827; letter-spacing: -0.02em; }
        .page-header p { font-size: 13px; color: #6b7280; margin-top: 2px; }

        .dashboard-grid {
          display: grid;
          grid-template-columns: 340px 1fr 1fr;
          gap: 18px; align-items: start; margin-bottom: 18px;
        }

        @media (max-width: 960px) { .dashboard-grid { grid-template-columns: 1fr; } }

        /* ─── CARD ─── */
        .card {
          background: #ffffff; border: 1px solid #e5e7eb;
          border-radius: 14px; padding: 22px;
        }

        .card h2 {
          font-size: 11px; font-weight: 700; color: #9ca3af;
          text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 18px;
        }

        /* ─── FORM ─── */
        .field { margin-bottom: 13px; }

        .field label {
          display: block; font-size: 12px; font-weight: 600;
          color: #374151; margin-bottom: 5px;
        }

        .field input,
        .field textarea {
          width: 100%; padding: 8px 11px;
          background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px;
          font-family: 'Plus Jakarta Sans', sans-serif; font-size: 13px; color: #111827;
          outline: none; transition: border-color 0.15s, background 0.15s, box-shadow 0.15s;
        }

        .field input::placeholder,
        .field textarea::placeholder { color: #9ca3af; }

        .field input:focus,
        .field textarea:focus {
          border-color: #4f46e5; background: #fff;
          box-shadow: 0 0 0 3px rgba(79,70,229,0.08);
        }

        .field textarea { resize: vertical; min-height: 76px; }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .form-actions { display: flex; gap: 9px; margin-top: 16px; }

        .btn {
          flex: 1; padding: 9px 14px; border-radius: 8px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 13px; font-weight: 600; cursor: pointer; border: none;
          transition: opacity 0.15s, transform 0.1s;
          position: relative; overflow: hidden;
        }

        .btn:active { transform: scale(0.98); }

        .btn-secondary {
          background: #f3f4f6; color: #374151; border: 1px solid #e5e7eb;
        }

        .btn-secondary:hover { background: #e9eaf0; }
        .btn-secondary:disabled { opacity: 0.6; cursor: not-allowed; }

        .btn-primary { background: #4f46e5; color: #fff; box-shadow: 0 1px 3px rgba(79,70,229,0.3); }
        .btn-primary:hover { opacity: 0.9; }

        /* ─── LOADING SPINNER ─── */
        .rec-loading {
          display: flex; flex-direction: column; align-items: center;
          justify-content: center; gap: 14px;
          padding: 28px 0; margin-top: 14px;
        }

        .spinner-ring {
          width: 40px; height: 40px;
          border: 3px solid #e5e7eb;
          border-top-color: #4f46e5;
          border-radius: 50%;
          animation: spin 0.75s linear infinite;
        }

        @keyframes spin { to { transform: rotate(360deg); } }

        .loading-dots {
          display: flex; gap: 5px; align-items: center;
        }

        .loading-dots span {
          width: 6px; height: 6px; border-radius: 50%;
          background: #4f46e5; opacity: 0.3;
          animation: dotPulse 1.2s ease-in-out infinite;
        }

        .loading-dots span:nth-child(2) { animation-delay: 0.2s; }
        .loading-dots span:nth-child(3) { animation-delay: 0.4s; }

        @keyframes dotPulse {
          0%, 80%, 100% { opacity: 0.2; transform: scale(0.85); }
          40% { opacity: 1; transform: scale(1); }
        }

        .loading-text {
          font-size: 13px; font-weight: 500; color: #6b7280;
        }

        /* ─── RECOMMENDATION OVERLAY ─── */
        .rec-overlay {
          position: fixed; inset: 0; z-index: 999;
          background: rgba(0, 0, 0, 0.45);
          display: flex; align-items: center; justify-content: center;
          padding: 24px;
          animation: overlayIn 0.2s ease;
        }

        @keyframes overlayIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }

        .rec-popup {
          background: #fff;
          border-radius: 20px;
          padding: 0;
          width: 100%; max-width: 440px;
          box-shadow: 0 24px 64px rgba(0,0,0,0.2);
          overflow: hidden;
          opacity: 0; transform: translateY(24px) scale(0.97);
          transition: opacity 0.3s cubic-bezier(0.34,1.56,0.64,1),
                      transform 0.3s cubic-bezier(0.34,1.56,0.64,1);
        }

        .rec-popup.visible {
          opacity: 1; transform: translateY(0) scale(1);
        }

        .rec-popup-header {
          background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
          padding: 28px 28px 24px;
          position: relative;
        }

        .rec-close {
          position: absolute; top: 14px; right: 14px;
          width: 28px; height: 28px; border-radius: 8px;
          background: rgba(255,255,255,0.15); border: none;
          color: #fff; font-size: 14px; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: background 0.15s;
        }

        .rec-close:hover { background: rgba(255,255,255,0.25); }

        .rec-ai-badge {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 4px 10px;
          background: rgba(255,255,255,0.15);
          border: 1px solid rgba(255,255,255,0.25);
          border-radius: 999px;
          font-size: 11px; font-weight: 600; color: #fff;
          letter-spacing: 0.04em; text-transform: uppercase;
          margin-bottom: 16px;
        }

        .rec-member-row {
          display: flex; align-items: center; gap: 14px;
        }

        .rec-avatar {
          width: 56px; height: 56px; border-radius: 14px;
          background: rgba(255,255,255,0.2);
          border: 2px solid rgba(255,255,255,0.35);
          display: flex; align-items: center; justify-content: center;
          font-size: 20px; font-weight: 700; color: #fff;
          flex-shrink: 0;
        }

        .rec-member-name {
          font-size: 22px; font-weight: 700; color: #fff;
          letter-spacing: -0.02em; line-height: 1.1;
        }

        .rec-member-sub {
          font-size: 12px; color: rgba(255,255,255,0.65); margin-top: 4px;
        }

        .rec-score-pill {
          margin-left: auto; display: flex; flex-direction: column; align-items: center;
          background: rgba(255,255,255,0.15);
          border: 1px solid rgba(255,255,255,0.25);
          border-radius: 12px; padding: 10px 16px;
        }

        .rec-score-val { font-size: 22px; font-weight: 800; color: #fff; line-height: 1; }
        .rec-score-label { font-size: 10px; color: rgba(255,255,255,0.6); font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; margin-top: 3px; }

        .rec-popup-body { padding: 22px 28px 28px; }

        .rec-stats-row {
          display: grid; grid-template-columns: repeat(3, 1fr);
          gap: 10px; margin-bottom: 20px;
        }

        .rec-stat {
          background: #f9fafb; border: 1px solid #f3f4f6;
          border-radius: 10px; padding: 12px; text-align: center;
        }

        .rec-stat-val { font-size: 18px; font-weight: 700; color: #111827; }
        .rec-stat-label { font-size: 10px; color: #9ca3af; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; margin-top: 3px; }

        .rec-workload-wrap { margin-bottom: 18px; }

        .rec-workload-header {
          display: flex; justify-content: space-between; align-items: center;
          margin-bottom: 7px;
        }

        .rec-workload-label { font-size: 12px; font-weight: 600; color: #374151; }
        .rec-workload-pct { font-size: 12px; font-weight: 700; color: #374151; }

        .rec-workload-track {
          height: 8px; background: #f3f4f6; border-radius: 999px; overflow: hidden;
        }

        .rec-workload-fill {
          height: 100%; border-radius: 999px;
          transition: width 0.6s cubic-bezier(0.4,0,0.2,1);
        }

        .rec-skills-wrap {
          display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 22px;
        }

        .rec-skill-tag {
          padding: 4px 11px;
          background: #eef2ff; color: #4f46e5;
          border-radius: 6px; font-size: 12px; font-weight: 500;
        }

        .rec-no-skills { font-size: 12px; color: #9ca3af; font-style: italic; }

        .rec-why {
          display: flex; align-items: flex-start; gap: 10px;
          padding: 12px 14px;
          background: #f0fdf4; border: 1px solid #bbf7d0;
          border-radius: 10px; margin-bottom: 20px;
        }

        .rec-why-icon { font-size: 16px; flex-shrink: 0; margin-top: 1px; }

        .rec-why-text {
          font-size: 12px; color: #166534; line-height: 1.5;
        }

        .rec-why-text strong { font-weight: 600; }

        .rec-actions { display: flex; gap: 10px; }

        .rec-btn-dismiss {
          flex: 0 0 auto; padding: 11px 18px;
          background: #f3f4f6; color: #374151;
          border: 1px solid #e5e7eb; border-radius: 10px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 13px; font-weight: 600; cursor: pointer;
          transition: background 0.15s;
        }

        .rec-btn-dismiss:hover { background: #e5e7eb; }

        .rec-btn-assign {
          flex: 1; padding: 11px;
          background: linear-gradient(135deg, #4f46e5, #7c3aed);
          color: #fff; border: none; border-radius: 10px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 14px; font-weight: 700; cursor: pointer;
          box-shadow: 0 4px 14px rgba(79,70,229,0.35);
          transition: opacity 0.15s, transform 0.1s;
        }

        .rec-btn-assign:hover { opacity: 0.92; }
        .rec-btn-assign:active { transform: scale(0.98); }

        /* ─── TASKS TAB ─── */
        .table-card {
          background: #fff; border: 1px solid #e5e7eb;
          border-radius: 14px; overflow: hidden;
        }

        .table-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 16px 22px; border-bottom: 1px solid #f3f4f6;
        }

        .table-header h2 {
          font-size: 11px; font-weight: 700; color: #9ca3af;
          text-transform: uppercase; letter-spacing: 0.06em;
        }

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

        .task-title { font-weight: 600; color: #111827; }

        .assignee { display: inline-flex; align-items: center; gap: 6px; }

        .assignee-dot {
          width: 22px; height: 22px; border-radius: 6px;
          background: linear-gradient(135deg, #4f46e5, #7c3aed);
          display: flex; align-items: center; justify-content: center;
          font-size: 10px; font-weight: 700; color: #fff; flex-shrink: 0;
        }

        .unassigned { font-size: 12px; color: #9ca3af; font-style: italic; }

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

        .empty-state {
          padding: 48px 0; text-align: center; color: #9ca3af; font-size: 14px;
        }

        /* ─── TEAM TAB ─── */
        .team-page { display: flex; flex-direction: column; gap: 20px; }

        .team-manager-banner {
          display: flex; align-items: center; gap: 16px;
          padding: 20px 24px;
          background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
          border-radius: 14px; color: #fff;
        }

        .manager-avatar-lg {
          width: 52px; height: 52px; border-radius: 13px;
          background: rgba(255,255,255,0.2); border: 2px solid rgba(255,255,255,0.35);
          display: flex; align-items: center; justify-content: center;
          font-size: 18px; font-weight: 700; color: #fff; flex-shrink: 0;
        }

        .mi-label { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.07em; opacity: 0.7; margin-bottom: 3px; }
        .mi-name { font-size: 18px; font-weight: 700; letter-spacing: -0.02em; }
        .mi-sub { font-size: 12px; opacity: 0.7; margin-top: 2px; }

        .manager-stats { margin-left: auto; display: flex; gap: 28px; }

        .mstat { text-align: center; }
        .ms-val { font-size: 22px; font-weight: 700; line-height: 1; }
        .ms-label { font-size: 11px; opacity: 0.65; margin-top: 3px; }

        .team-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 14px; }

        .member-card {
          background: #fff; border: 1px solid #e5e7eb; border-radius: 14px;
          padding: 18px 20px; transition: box-shadow 0.15s, border-color 0.15s;
        }

        .member-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.07); border-color: #d1d5db; }

        .member-card-top { display: flex; align-items: center; gap: 12px; margin-bottom: 14px; }

        .member-avatar {
          width: 42px; height: 42px; border-radius: 11px;
          background: linear-gradient(135deg, #4f46e5, #7c3aed);
          display: flex; align-items: center; justify-content: center;
          font-size: 15px; font-weight: 700; color: #fff; flex-shrink: 0;
        }

        .member-name { font-size: 14px; font-weight: 600; color: #111827; }
        .member-meta { font-size: 12px; color: #6b7280; margin-top: 2px; }

        .member-stats { display: flex; gap: 12px; margin-bottom: 14px; }

        .mcard-stat {
          flex: 1; background: #f9fafb; border: 1px solid #f3f4f6;
          border-radius: 8px; padding: 8px 10px; text-align: center;
        }

        .cs-val { font-size: 16px; font-weight: 700; color: #111827; }
        .cs-label { font-size: 10px; color: #9ca3af; font-weight: 500; text-transform: uppercase; letter-spacing: 0.04em; margin-top: 2px; }

        .workload-bar-wrap { margin-bottom: 12px; }

        .workload-bar-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px; }
        .workload-bar-label { font-size: 11px; font-weight: 600; color: #6b7280; }
        .workload-bar-pct { font-size: 11px; font-weight: 700; color: #374151; }

        .workload-bar-track { height: 6px; background: #f3f4f6; border-radius: 999px; overflow: hidden; }
        .workload-bar-fill { height: 100%; border-radius: 999px; transition: width 0.4s ease; }

        .skills-wrap { display: flex; flex-wrap: wrap; gap: 5px; }

        .skill-tag { padding: 3px 9px; background: #eef2ff; color: #4f46e5; border-radius: 5px; font-size: 11px; font-weight: 500; }
        .no-skills { font-size: 12px; color: #9ca3af; font-style: italic; }
      `}
    </style>
      <div className="dashboard-container">

        {/* ── NAVBAR ── */}
        <nav className="navbar">
          <div className="navbar-brand">
            <div className="brand-mark">⚡</div>
            <div>
              <div className="brand-text">TaskWeave</div>
              <div className="brand-sub">Manager Dashboard</div>
            </div>
          </div>

          <div className="navbar-center">
            <button className={`nav-link${activeTab === "overview" ? " active" : ""}`} onClick={() => setActiveTab("overview")}>
              Overview
            </button>
            <button className={`nav-link${activeTab === "tasks" ? " active" : ""}`} onClick={() => setActiveTab("tasks")}>
              Tasks <span className="nav-count">{tasks.length}</span>
            </button>
            <button className={`nav-link${activeTab === "team" ? " active" : ""}`} onClick={() => setActiveTab("team")}>
              Team <span className="nav-count">{members.length}</span>
            </button>
          </div>

          <div className="navbar-right">
            <button className="notif-btn">🔔</button>
            <button className="profile-trigger" onClick={() => setShowDropdown(!showDropdown)}>
              <div className="profile-avatar">{initials}</div>
              <div>
                <div className="pt-name">{managerName}</div>
                <div className="pt-role">Manager</div>
              </div>
              <span className="chevron">▾</span>
            </button>

            {showDropdown && (
              <div className="dropdown">
                <div className="dropdown-header">
                  <div className="dh-name">{managerName}</div>
                  <div className="dh-role">Manager · Admin</div>
                </div>
                <button className="dropdown-item">👤 My Profile</button>
                <button className="dropdown-item">⚙️ Settings</button>
                <div className="dropdown-divider" />
                <button className="dropdown-item danger" onClick={logout}>🚪 Logout</button>
              </div>
            )}
          </div>
        </nav>

        <div className="page-body">

          {/* ── OVERVIEW TAB ── */}
          {activeTab === "overview" && (
            <>
              <div className="page-header">
                <h1>Good morning, {managerName.split(" ")[0]} 👋</h1>
                <p>Here's what's happening with your team today.</p>
              </div>

              <div className="dashboard-grid">
                <div className="card">
                  <h2>New Task</h2>
                  <form onSubmit={handleCreateTask}>
                    <div className="field">
                      <label>Title</label>
                      <input placeholder="e.g. Design landing page" onChange={e => setTitle(e.target.value)} />
                    </div>
                    <div className="field">
                      <label>Description</label>
                      <textarea placeholder="What needs to be done?" onChange={e => setDescription(e.target.value)} />
                    </div>
                    <div className="form-row">
                      <div className="field">
                        <label>Skills</label>
                        <input placeholder="React, CSS…" onChange={e => setSkills(e.target.value)} />
                      </div>
                      <div className="field">
                        <label>Hours</label>
                        <input type="number" placeholder="0" onChange={e => setHours(e.target.value)} />
                      </div>
                    </div>
                    <div className="field">
  <label>Project Link</label>
  <input
  type="text"
    placeholder="GitHub / Drive / ZIP link"
    onChange={(e) => setProjectLink(e.target.value)}
  />
</div>
                    <div className="form-actions">
                      <button type="button" className="btn btn-secondary" onClick={getRecommendation} disabled={isRecommending}>
                        {isRecommending ? "Finding…" : "✦ Recommend"}
                      </button>
                      <button type="submit" className="btn btn-primary">Create →</button>
                    </div>
                  </form>

                  {/* inline loading state */}
                  {isRecommending && (
                    <div className="rec-loading">
                      <div className="spinner-ring" />
                      <div className="loading-dots">
                        <span /><span /><span />
                      </div>
                      <div className="loading-text">Finding the best match…</div>
                    </div>
                  )}
                </div>

                <div className="card">
                  <h2>Team Workload</h2>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={getWorkloadData()}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                      <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                      <Tooltip
                        contentStyle={{ borderRadius: 10, border: "1px solid #e5e7eb", fontSize: 12 }}
                        formatter={(_v,_n,p) => {
                          return `${p.payload.hours} hrs (${p.payload.percentage.toFixed(0)}%)`;
                        }}
                      />
                      <Bar dataKey="hours" radius={[5, 5, 0, 0]}>
                        {getWorkloadData().map((e, i) => {
                          let c = "#22c55e";
                          if (e.percentage > 80) c = "#ef4444";
                          else if (e.percentage > 50) c = "#facc15";
                          return <Cell key={i} fill={c} />;
                        })}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="card">
                  <h2>Task Status</h2>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie data={getTaskStatusData()} dataKey="value" innerRadius={60} outerRadius={100} paddingAngle={4}>
                       <Cell fill="#facc15" />
  <Cell fill="#3b82f6" />  
  <Cell fill="#22c55e" /> 
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #e5e7eb", fontSize: 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </>
          )}

          {/* ── TASKS TAB ── */}
          {activeTab === "tasks" && (
            <>
              <div className="page-header">
                <h1>All Tasks</h1>
                <p>{tasks.length} tasks across {members.length} team members.</p>
              </div>
              <div className="table-card">
                <div className="table-header">
                  <h2>Tasks</h2>
                  <span className="task-count">{tasks.length} total</span>
                </div>
                <table className="tasks-table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Assigned To</th>
                      <th>Skills</th>
                      <th>Hours</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tasks.length === 0 && (
                      <tr><td colSpan={5}><div className="empty-state">No tasks yet. Create one from the Overview tab.</div></td></tr>
                    )}
                    {tasks.map(task => {
                      const member = members.find(m => m._id === task.assignedTo);
                      return (
                        <tr key={task._id}>
                          <td className="task-title">{task.title}</td>
                          <td>
                            {member
                              ? <span className="assignee"><span className="assignee-dot">{member.name[0]}</span>{member.name}</span>
                              : <span className="unassigned">Unassigned</span>}
                          </td>
                          <td>{task.requiredSkills.map((s, i) => <span key={i} className="skill-chip">{s}</span>)}</td>
                          <td><span className="hours-badge">{task.estimatedHours}h</span></td>
                          <td>
                            <span className={`status-badge ${task.status === "completed" ? "status-completed" : task.status === "in-progress" ? "status-in_progress" : "status-pending"}`}>
                              {task.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* ── TEAM TAB ── */}
          {activeTab === "team" && (
            <>
              <div className="page-header">
                <h1>Your Team</h1>
                <p>{members.length} members reporting to you.</p>
              </div>
              <div className="team-page">
                <div className="team-manager-banner">
                  <div className="manager-avatar-lg">{managerInitials}</div>
                  <div>
                    <div className="mi-label">Team Manager</div>
                    <div className="mi-name">{managerName}</div>
                    <div className="mi-sub">Overseeing {members.length} members · {tasks.length} active tasks</div>
                  </div>
                  <div className="manager-stats">
                    <div className="mstat"><div className="ms-val">{members.length}</div><div className="ms-label">Members</div></div>
                    <div className="mstat"><div className="ms-val">{tasks.length}</div><div className="ms-label">Tasks</div></div>
                    <div className="mstat"><div className="ms-val">{tasks.filter(t => t.status === "completed").length}</div><div className="ms-label">Done</div></div>
                  </div>
                </div>

                {members.length === 0 ? (
                  <div className="empty-state">No team members found.</div>
                ) : (
                  <div className="team-grid">
                    {members.map(member => {
                      const taskCount = getMemberTaskCount(member._id);
                      const assignedHours = getMemberHours(member._id);
                      const workloadPct = getWorkloadPercent(member._id);
                      const barColor = workloadPct > 80 ? "#ef4444" : workloadPct > 50 ? "#facc15" : "#22c55e";
                      const initials = member.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);
                      const skillList = Array.isArray(member.skills)
                        ? member.skills.map((s: any) => typeof s === "string" ? s : s?.name || s?.skill || "").filter(Boolean)
                        : [];

                      return (
                        <div key={member._id} className="member-card">
                          <div className="member-card-top">
                            <div className="member-avatar">{initials}</div>
                            <div>
                              <div className="member-name">{member.name}</div>
                              <div className="member-meta">{taskCount} task{taskCount !== 1 ? "s" : ""} assigned</div>
                            </div>
                          </div>
                          <div className="member-stats">
                            <div className="mcard-stat"><div className="cs-val">{taskCount}</div><div className="cs-label">Tasks</div></div>
                            <div className="mcard-stat"><div className="cs-val">{assignedHours}h</div><div className="cs-label">Assigned</div></div>
                            <div className="mcard-stat"><div className="cs-val">{member.capacityHours ?? 16}h</div><div className="cs-label">Capacity</div></div>
                          </div>
                          <div className="workload-bar-wrap">
                            <div className="workload-bar-header">
                              <span className="workload-bar-label">Workload</span>
                              <span className="workload-bar-pct">{workloadPct.toFixed(0)}%</span>
                            </div>
                            <div className="workload-bar-track">
                              <div className="workload-bar-fill" style={{ width: `${workloadPct}%`, background: barColor }} />
                            </div>
                          </div>
                          <div className="skills-wrap">
                            {skillList.length > 0
                              ? skillList.map((s: string, i: number) => <span key={i} className="skill-tag">{s}</span>)
                              : <span className="no-skills">No skills listed</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
              <div className="card">
  <h2>Add Team Member</h2>

  <div className="form-row">
    <div className="field">
      <label>Name</label>
      <input
        placeholder="John Doe"
        value={memberName}
        onChange={(e) => setMemberName(e.target.value)}
      />
    </div>

    <div className="field">
      <label>Email</label>
      <input
        placeholder="john@example.com"
        value={memberEmail}
        onChange={(e) => setMemberEmail(e.target.value)}
      />
    </div>
  </div>

  <div className="form-row">
    <div className="field">
      <label>Password</label>
      <input
        type="password"
        value={memberPassword}
        onChange={(e) => setMemberPassword(e.target.value)}
      />
    </div>

    <div className="field">
      <label>Skills</label>
      <input
        placeholder="React, Node"
        value={memberSkills}
        onChange={(e) => setMemberSkills(e.target.value)}
      />
    </div>
  </div>

  <button className="btn btn-primary" onClick={createMember}>
    + Create Member
  </button>
</div>
            </>
          )}

        </div>
      </div>

      {/* ── RECOMMENDATION OVERLAY ── */}
      {(isRecommending || recommendedMember) && !isRecommending && (
        <div className="rec-overlay" onClick={(e) => { if (e.target === e.currentTarget) { setShowRecCard(false); setRecommendedMember(null); } }}>
          <div className={`rec-popup${showRecCard ? " visible" : ""}`}>

            <div className="rec-popup-header">
              <button className="rec-close" onClick={() => { setShowRecCard(false); setRecommendedMember(null); }}>✕</button>
              <div className="rec-ai-badge">✦ AI Recommendation</div>
              <div className="rec-member-row">
                <div className="rec-avatar">{recInitials}</div>
                <div>
                  <div className="rec-member-name">{recommendedMember?.recommendedMember}</div>
                  <div className="rec-member-sub">{recTaskCount} task{recTaskCount !== 1 ? "s" : ""} · {recHours}h assigned</div>
                </div>
                <div className="rec-score-pill">
                  <div className="rec-score-val">{recommendedMember?.score}</div>
                  <div className="rec-score-label">Score</div>
                </div>
              </div>
            </div>

            <div className="rec-popup-body">
              <div className="rec-stats-row">
                <div className="rec-stat">
                  <div className="rec-stat-val">{recTaskCount}</div>
                  <div className="rec-stat-label">Tasks</div>
                </div>
                <div className="rec-stat">
                  <div className="rec-stat-val">{recHours}h</div>
                  <div className="rec-stat-label">Assigned</div>
                </div>
                <div className="rec-stat">
                  <div className="rec-stat-val">{recWorkload.toFixed(0)}%</div>
                  <div className="rec-stat-label">Workload</div>
                </div>
              </div>

              <div className="rec-workload-wrap">
                <div className="rec-workload-header">
                  <span className="rec-workload-label">Current Workload</span>
                  <span className="rec-workload-pct">{recWorkload.toFixed(0)}%</span>
                </div>
                <div className="rec-workload-track">
                  <div
                    className="rec-workload-fill"
                    style={{
                      width: showRecCard ? `${recWorkload}%` : "0%",
                      background: recWorkload > 80 ? "#ef4444" : recWorkload > 50 ? "#facc15" : "#22c55e"
                    }}
                  />
                </div>
              </div>

              {recSkills.length > 0 && (
                <div className="rec-skills-wrap">
                  {recSkills.map((s: string, i: number) => (
                    <span key={i} className="rec-skill-tag">{s}</span>
                  ))}
                </div>
              )}

              <div className="rec-why">
  <span className="rec-why-icon">💡</span>

  <div className="rec-why-text">

    <strong>{recommendedMember?.recommendedMember}</strong> is selected because:

    <br /><br />

    {recommendedMember?.analysis?.[0] && (
      <>
        ✔ Skill Match: <strong>{recommendedMember.analysis[0].skillMatch}</strong><br />
        ✔ Skill Strength: <strong>{recommendedMember.analysis[0].skillLevel}</strong><br />
        ✔ Workload: <strong>{recommendedMember.analysis[0].workload}</strong><br />
        ✔ AI Confidence: <strong>{recommendedMember.analysis[0].mlConfidence}</strong>
      </>
    )}

    <br /><br />

    Compared to others:

    {recommendedMember?.analysis?.slice(1).map((m: any, i: number) => (
      <div key={i} style={{ marginTop: "6px" }}>
        ❌ {m.name}: Score {m.score}
      </div>
    ))}

  </div>
</div>

              <div className="rec-actions">
                <button className="rec-btn-dismiss" onClick={() => { setShowRecCard(false); setRecommendedMember(null); }}>
                  Dismiss
                </button>
                <button className="rec-btn-assign" onClick={handleAssignRecommended}>
                  ✓ Assign Task
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
}