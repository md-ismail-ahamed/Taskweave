const API_URL = "http://localhost:3000";

export const loginManager = async (email: string, password: string) => {
  const res = await fetch(`${API_URL}/api/manager/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });

  return res.json();
};

export const loginMember = async (email: string, password: string) => {
  const res = await fetch(`${API_URL}/api/member/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });

  return res.json();
};

export const createTask = async (task: any, token: string) => {
  const res = await fetch(`${API_URL}/api/task/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token
    },
    body: JSON.stringify(task)
  });

  return res.json();
};

export const getTasks = async (token: string) => {
  const res = await fetch(`${API_URL}/api/task`, {
    headers: {
      Authorization: token
    }
  });

  return res.json();
};