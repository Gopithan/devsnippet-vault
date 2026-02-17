import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    setLoading(true);

    try {
      const res = await api.post("/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      window.location.href = "/dashboard";
    } catch (err) {
      setMsg(err?.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.wrap}>
      <form onSubmit={onSubmit} style={styles.card}>
        <h2 style={styles.title}>Login</h2>

        <label style={styles.label}>Email</label>
        <input
          style={styles.input}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="test1@gmail.com"
        />

        <label style={styles.label}>Password</label>
        <input
          style={styles.input}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="123456"
        />

        {msg && <p style={styles.msg}>{msg}</p>}

        <button disabled={loading} style={styles.btn}>
          {loading ? "Logging in..." : "Login"}
        </button>

        <p style={styles.small}>
          No account? <Link to="/register">Register</Link>
        </p>
      </form>
    </div>
  );
}

const styles = {
  wrap: { minHeight: "100vh", display: "grid", placeItems: "center", padding: 16 },
  card: { width: 360, padding: 20, border: "1px solid #333", borderRadius: 12 },
  title: { marginTop: 0 },
  label: { display: "block", marginTop: 10, marginBottom: 6 },
  input: { width: "100%", padding: 10, borderRadius: 8, border: "1px solid #444" },
  btn: { marginTop: 14, width: "100%", padding: 10, borderRadius: 8, border: "none", cursor: "pointer" },
  small: { marginTop: 12, fontSize: 14 },
  msg: { color: "tomato", marginTop: 10 },
};
