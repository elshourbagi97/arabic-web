import axios from "axios";

const BASE = process.env.API_BASE || "http://localhost:8000/api";

async function run() {
  try {
    console.log("Logging in...");
    // prefer seeded regular user (password >= 6)
    const login = await axios.post(`${BASE}/auth/login`, {
      email: "user@wordpress.local",
      password: "password",
    });
    const token = login.data.token;
    console.log("Got token:", !!token);

    const client = axios.create({
      baseURL: BASE,
      headers: { Authorization: `Bearer ${token}` },
    });

    const name = `قسم اختبار ${Date.now()}`;
    console.log("Creating section:", name);
    const res = await client.post("/sections", { name });
    console.log("Create status:", res.status, res.data);

    const list = await client.get("/sections");
    console.log("Sections:", list.data);

    const found = (Array.isArray(list.data) ? list.data : []).some((s) => {
      if (typeof s === "string") return s === name;
      if (s && typeof s === "object")
        return s.name === name || s.title === name || s.label === name;
      return false;
    });

    if (found) console.log("E2E success: created section is present");
    else console.error("E2E failure: created section not found");
  } catch (e) {
    console.error(
      "E2E script failed",
      e.response?.status,
      e.response?.data || e.message,
    );
    process.exitCode = 2;
  }
}

run();
