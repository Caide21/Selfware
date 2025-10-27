import { useEffect, useState } from "react";
import { TextInput, TextAreaAuto } from '@/components/Form';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/router';
import Head from 'next/head';

const STATUS_OPTIONS = ['pending', 'booked', 'paid', 'complete'];

export default function ClientDashboard() {
  const [clients, setClients] = useState([]);
  const [editing, setEditing] = useState({});
  const [authChecked, setAuthChecked] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const init = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        router.push('/join/login');
        return;
      }

      const userId = session.user.id;
      const { data, error } = await supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .single();

      if (error || !data || data.role !== 'admin') {
        setAuthChecked(true);
        setIsAdmin(false);
        return;
      }

      setIsAdmin(true);
      setAuthChecked(true);
      fetchClients();
    };

    init();
  }, [router]);

  const fetchClients = async () => {
    const { data, error } = await supabase
      .from('registrations')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching clients:', error);
    } else {
      setClients(data);
    }
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
      [email]: !prev[email],
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
      .from('registrations')
      .update({
        notion_link: client.notion_link,
        status: client.status,
        notes: client.notes,
      })
      .eq('email', client.email);

    if (error) {
      alert('Failed to save. Check console.');
      console.error('Update error:', error);
    } else {
      setEditing((prev) => ({ ...prev, [client.email]: false }));
    }
  };

  if (!authChecked) {
    return (
      <main className="flex min-h-screen items-center justify-center text-text">
        <p className="text-text-muted">Checking access...</p>
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6 text-center text-text">
        <div>
          <div className="mb-2 text-4xl">⚠️</div>
          <p className="text-lg font-medium">Access Denied</p>
          <p className="text-sm text-text-muted">Only authorized users can view this page.</p>
        </div>
      </main>
    );
  }

  return (
    <>
      <Head>
        <title>Client Codex | Selfware</title>
      </Head>
      <main className="min-h-screen px-4 pt-20 pb-12 text-text sm:px-6">
        <h1 className="mb-8 text-3xl font-semibold">Client Dashboard</h1>

        <div className="grid gap-6">
          {uniqueClients.map((client) => {
            const isEditing = editing[client.email];
            return (
              <div
                key={client.email}
                className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-xl font-semibold text-text">{client.name}</div>
                    <div className="text-sm text-text-muted">{client.email}</div>
                    <div className="text-sm text-text-muted">({client.role})</div>
                  </div>
                  <button
                    onClick={() => handleEditToggle(client.email)}
                    className="text-sm font-medium text-info underline hover:opacity-80"
                  >
                    {isEditing ? 'Cancel' : 'Edit'}
                  </button>
                </div>

                {isEditing ? (
                  <div className="space-y-3 text-sm text-text">
                    <div>
                      <label className="mb-1 block">Notion Link</label>
                      <TextInput
                        value={client.notion_link || ''}
                        onChange={(e) => handleChange(client.email, 'notion_link', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="mb-1 block">Status</label>
                      <select
                        value={client.status || 'pending'}
                        onChange={(e) => handleChange(client.email, 'status', e.target.value)}
                        className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/40"
                      >
                        {STATUS_OPTIONS.map((option) => (
                          <option key={option} value={option}>
                            {option.charAt(0).toUpperCase() + option.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="mb-1 block">Notes</label>
                      <TextAreaAuto
                        value={client.notes || ''}
                        onChange={(e) => handleChange(client.email, 'notes', e.target.value)}
                        maxRows={8}
                      />
                    </div>
                    <button
                      onClick={() => handleSave(client)}
                      className="inline-flex items-center rounded-full bg-cta-accent px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:shadow-lg hover:brightness-110"
                    >
                      Save Changes
                    </button>
                  </div>
                ) : (
                  <div className="space-y-1 text-sm text-text-muted">
                    <div>
                      <strong>Focus:</strong> {client.focus_areas?.join(', ')}
                    </div>
                    <div>
                      <strong>Project:</strong> {client.project || '—'}
                    </div>
                    {client.notion_link ? (
                      <div>
                        <strong>Notion:</strong>{' '}
                        <a
                          href={client.notion_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-info underline"
                        >
                          View
                        </a>
                      </div>
                    ) : null}
                    {client.status ? (
                      <div>
                        <strong>Status:</strong> {client.status}
                      </div>
                    ) : null}
                    {client.notes ? (
                      <div>
                        <strong>Notes:</strong> {client.notes}
                      </div>
                    ) : null}
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
