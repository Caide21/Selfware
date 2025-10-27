// components/nav/AuthStatus.jsx
"use client";

import { useEffect, useState } from "react";
import { LogIn, LogOut } from "lucide-react";
// Adjust this import if your path aliases differ:
import { supabase } from "../../lib/supabaseClient";

export default function AuthStatus({ className = "" }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // initial load
    supabase.auth.getUser().then(({ data, error }) => {
      if (!mounted) return;
      setUser(data?.user ?? null);
      setLoading(false);
    });

    // subscribe to changes
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      setUser(session?.user ?? null);
    });

    return () => {
      mounted = false;
      sub?.subscription?.unsubscribe();
    };
  }, []);

  const display =
    user?.email ||
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    "User";

  async function signOut() {
    await supabase.auth.signOut();
  }

  return (
    <div
      className={[
        "flex items-center gap-2 rounded-full border px-2.5 py-1 text-sm",
        "border-zinc-300 dark:border-zinc-700",
        "bg-white/70 dark:bg-zinc-900/50 backdrop-blur",
        className,
      ].join(" ")}
      aria-live="polite"
    >
      <span
        className={[
          "inline-block h-2.5 w-2.5 rounded-full",
          user ? "bg-emerald-500" : "bg-zinc-400",
        ].join(" ")}
        title={user ? "Signed in" : "Guest"}
      />

      {loading ? (
        <span className="text-zinc-500">Checking…</span>
      ) : user ? (
        <>
          <span className="hidden sm:inline text-zinc-600 dark:text-zinc-300">
            Signed in:
          </span>
          <span className="font-medium">{display}</span>
          <button
            onClick={signOut}
            className="ml-1 rounded-md px-2 py-0.5 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            aria-label="Sign out"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </>
      ) : (
        <>
          <span className="text-zinc-600 dark:text-zinc-300">Guest</span>
          <a
            href="/login"
            className="ml-1 inline-flex items-center gap-1 rounded-md px-2 py-0.5 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            title="Sign in"
          >
            <LogIn className="h-4 w-4" />
            <span className="hidden sm:inline">Sign in</span>
          </a>
        </>
      )}
    </div>
  );
}
