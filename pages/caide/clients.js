import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/router";
import Head from "next/head";

export default function ClientDashboard() {
  const [clients, setClients] = useState([]);
  const [editing, setEditing] = useState({});
  const [authChecked, setAuthChecked] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const init = async () => {
      const {
        data: { session }
      } = await supabase.auth.getSession();

      if (!session?.user) {
        router.push("/join/login");
        return;
      }

      const userId = session.user.id;
      const { data, error } = await supabase
        .from("users")
        .select("role")
        .eq("id", userId)
        .single();

      if (error || !data || data.role !== "admin") {
        setAuthChecked(true);
        setIsAdmin(false);
        return;
      }

      setIsAdmin(true);
      setAuthChecked(true);
      fetchClients();
    };

    init();
  }, []);

  const fetchClients = async () => {
    const { data, error } = await supabase
      .from("registrations")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) console.error("Error fetching clients:", error);
    else setClients(data);
  };

  const uniqueClients = Object.values(
    clients.reduce((acc, client) => {
      acc[client.email] = acc[client.email] || client;
      return acc;
    }, {})
  );

  const handleEditToggle = (email) => {
    setEditing((prev) => ({
      ...prev,
      [email]: !prev[email]
    }));
  };

  const handleChange = (email, field, value) => {
    setClients((prev) =>
      prev.map((client) =>
        client.email === email ? { ...client, [field]: value } : client
      )
    );
  };

  const handleSave = async (client) => {
    const { error } = await supabase
      .from("registrations")
      .update({
        notion_link: client.notion_link,
        status: client.status,
        notes: client.notes
      })
      .eq("email", client.email);

    if (error) {
      alert("Failed to save. Check console.");
      console.error("Update error:", error);
    } else {
      setEditing((prev) => ({ ...prev, [client.email]: false }));
    }
  };

  if (!authChecked) {
    return (
      <main className="bg-black text-white min-h-screen flex items-center justify-center">
        <p className="text-theme-muted">Checking access...</p>
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <main className="bg-black text-white min-h-screen flex items-center justify-center text-center px-6">
        <div>
          <div className="text-4xl mb-2">⛔</div>
          <p className="text-lg font-medium">Access Denied</p>
          <p className="text-sm text-theme-muted">Only authorized users can view this page.</p>
        </div>
      </main>
    );
  }

  return (
    <>
      <Head><title>Client Codex | Selfware</title></Head>
      <main className="min-h-screen bg-black text-white px-4 sm:px-6 pt-20 pb-12 font-sans overflow-x-auto">
        <h1 className="text-3xl font-bold mb-8 border-b border-white/10 pb-2">📓 Client Dashboard</h1>

        <div className="grid gap-6">
          {uniqueClients.map((client) => {
            const isEditing = editing[client.email];
            return (
              <div
                key={client.email}
                className="theme-card p-4 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm space-y-2"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-xl font-semibold">{client.name}</div>
                    <div className="text-sm text-theme-muted">{client.email}</div>
                    <div className="text-sm text-theme-muted">({client.role})</div>
                  </div>
                  <button
                    onClick={() => handleEditToggle(client.email)}
                    className="text-sm underline hover:opacity-80"
                  >
                    {isEditing ? "Cancel" : "Edit"}
                  </button>
                </div>

                {isEditing ? (
                  <div className="space-y-2 text-sm">
                    <div>
                      <label className="block mb-1">Notion Link</label>
                      <input
                        type="text"
                        value={client.notion_link || ""}
                        onChange={(e) =>
                          handleChange(client.email, "notion_link", e.target.value)
                        }
                        className="w-full p-2 rounded bg-black/20 border border-white/10 text-white"
                      />
                    </div>
                    <div>
                      <label className="block mb-1">Status</label>
                      <select
                        value={client.status || "pending"}
                        onChange={(e) =>
                          handleChange(client.email, "status", e.target.value)
                        }
                        className="w-full p-2 rounded bg-black/20 border border-white/10 text-white"
                      >
                        <option value="pending">Pending</option>
                        <option value="booked">Booked</option>
                        <option value="paid">Paid</option>
                        <option value="complete">Complete</option>
                      </select>
                    </div>
                    <div>
                      <label className="block mb-1">Notes</label>
                      <textarea
                        rows={3}
                        value={client.notes || ""}
                        onChange={(e) =>
                          handleChange(client.email, "notes", e.target.value)
                        }
                        className="w-full p-2 rounded bg-black/20 border border-white/10 text-white"
                      />
                    </div>
                    <button
                      onClick={() => handleSave(client)}
                      className="bg-white text-black font-medium px-4 py-2 rounded hover:bg-gray-200 transition"
                    >
                      Save Changes
                    </button>
                  </div>
                ) : (
                  <div className="text-sm space-y-1">
                    <div><strong>Focus:</strong> {client.focus_areas?.join(", ")}</div>
                    <div><strong>Project:</strong> {client.project || "—"}</div>
                    {client.notion_link && (
                      <div>
                        <strong>Notion:</strong>{" "}
                        <a href={client.notion_link} target="_blank" rel="noopener noreferrer" className="underline text-blue-400">
                          View
                        </a>
                      </div>
                    )}
                    {client.status && (
                      <div><strong>Status:</strong> {client.status}</div>
                    )}
                    {client.notes && (
                      <div><strong>Notes:</strong> {client.notes}</div>
                    )}
                    {/* <button
                      onClick={() => resendInvoice(client)}
                      className="mt-2 underline text-blue-400 text-sm hover:opacity-80"
                    >
                      📤 Resend Invoice
                    </button> */}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>
    </>
  );
}
