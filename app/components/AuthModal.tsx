"use client";

import { useEffect, useState } from "react";
import { useAuth } from "./AuthContext";

export default function AuthModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { signIn, signUp } = useAuth();

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [fullName, setFullName] = useState(""); // signup only
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) {
      setMsg(null);
      setLoading(false);
    }
  }, [open]);

  if (!open) return null;

  const submit = async () => {
    setMsg(null);
    setLoading(true);

    if (mode === "login") {
      const r = await signIn(email, password);
      setLoading(false);
      if (!r.ok) return setMsg(r.error || "Login failed");
      onClose();
      return;
    }

    const r = await signUp({ email, password, fullName });
    setLoading(false);
    if (!r.ok) return setMsg(r.error || "Signup failed");
    setMsg("Account created. You can login now.");
    setMode("login");
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* overlay */}
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-label="Close"
      />

      {/* modal card */}
      <div className="relative w-[92%] max-w-xl bg-[#fffaf2] rounded-2xl border border-[#e8dccb] shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e8dccb]">
          <h3 className="text-lg font-semibold">
            {mode === "login" ? "Login" : "Sign Up"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-2xl leading-none opacity-70 hover:opacity-100"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="p-6">
          {mode === "signup" && (
            <>
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Full name"
                className="w-full px-4 py-3 rounded-xl border border-[#e8dccb] bg-white focus:outline-none mb-3"
              />
            </>
          )}

          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full px-4 py-3 rounded-xl border border-[#e8dccb] bg-white focus:outline-none mb-3"
          />

          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            type="password"
            className="w-full px-4 py-3 rounded-xl border border-[#e8dccb] bg-white focus:outline-none mb-4"
          />

          <button
            type="button"
            disabled={loading}
            onClick={submit}
            className="w-full py-2.5 rounded-xl border border-[#c9a36a] hover:bg-[#c9a36a] hover:text-white transition font-semibold"
          >
            {loading ? "Please wait..." : mode === "login" ? "Login" : "Create account"}
          </button>

          {msg && <div className="mt-3 text-sm opacity-80">{msg}</div>}

          <div className="mt-4 text-sm text-center opacity-80">
            {mode === "login" ? (
              <>
                Don’t have an account?{" "}
                <button
                  type="button"
                  className="underline font-semibold"
                  onClick={() => setMode("signup")}
                >
                  Sign up
                </button>
              </>
            ) : (
              <>
                Already a member?{" "}
                <button
                  type="button"
                  className="underline font-semibold"
                  onClick={() => setMode("login")}
                >
                  Login
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
