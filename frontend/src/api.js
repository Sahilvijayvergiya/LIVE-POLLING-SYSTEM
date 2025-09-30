// src/api.js
const API_URL = import.meta.env.VITE_API_URL;

export async function getPolls() {
  const res = await fetch(`${API_URL}/api/polls`, {
    credentials: "include"
  });
  if (!res.ok) throw new Error("Failed to fetch polls");
  return res.json();
}

export async function createPoll(data) {
  const res = await fetch(`${API_URL}/api/polls`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error("Failed to create poll");
  return res.json();
}
