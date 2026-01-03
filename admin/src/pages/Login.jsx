import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminLogin, getAdminSession } from "../services/adminService.js";

export default function Login() {
  const navigate = useNavigate();
  const session = useMemo(() => getAdminSession(), []);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (session?.token && session?.user?.role === "admin") {
    navigate("/admin", { replace: true });
  }

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      await adminLogin({ email, password });
      navigate("/admin", { replace: true });
    } catch (err) {
      setError(err?.message || "Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="h-screen w-screen bg-[#03020a] text-white flex items-center justify-center p-8">
      <div className="w-full max-w-md rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl p-6">
        <h1 className="text-xl font-semibold">Admin login</h1>
        <p className="text-sm text-white/60 mt-2">Sign in to manage business approvals.</p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div className="space-y-1">
            <label className="text-sm text-white/70">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-[44px] rounded-xl bg-white/5 border border-white/10 px-4 text-sm text-white placeholder:text-white/40 focus:outline-none"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm text-white/70">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-[44px] rounded-xl bg-white/5 border border-white/10 px-4 text-sm text-white placeholder:text-white/40 focus:outline-none"
              required
            />
          </div>

          {error ? <p className="text-sm text-red-400">{error}</p> : null}

          <button
            type="submit"
            disabled={submitting}
            className="w-full h-[44px] rounded-xl bg-white text-black text-sm font-semibold disabled:opacity-60"
          >
            {submitting ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
