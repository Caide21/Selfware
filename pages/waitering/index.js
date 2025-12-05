import { useEffect, useMemo, useRef, useState } from 'react';
import Head from 'next/head';
import { supabase } from '@/lib/supabaseClient';
import { usePageHeading } from '@/components/Layout/PageShell';
import { TextInput, TextAreaAuto } from '@/components/Form';
import Card from '@/components/CardKit/Card';
import WaiterTableCard from '@/components/Waitering/WaiterTableCard';

const PAGE_HEADING = {
  emoji: '',
  title: 'Waitering',
  subtitle: 'Track your hours, tables, and tips.',
};

const DEFAULT_BRANCH = 'Bossa Somerset West';

const initialTableForm = {
  table_number: '',
  guests: '',
  bill_total: '',
  tip_amount: '',
  payment_method: 'card',
  screenshotFile: null,
  notes: '',
};

function formatShiftDate(dateString) {
  if (!dateString) return '';
  const d = new Date(dateString);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
}

function formatDurationHours(hours = 0) {
  const totalMinutes = Math.max(0, Math.round(hours * 60));
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${h}h ${m}m`;
}

function formatCurrency(amount) {
  const num = Number(amount ?? 0);
  if (!Number.isFinite(num)) return 'R 0.00';
  return `R ${num.toFixed(2)}`;
}

function computeShiftSummary(shift, tables = [], nowTs = Date.now()) {
  const startMs = shift?.start_time ? new Date(shift.start_time).getTime() : null;
  const endMs = shift?.end_time ? new Date(shift.end_time).getTime() : null;
  const stopMs = endMs ?? nowTs;
  const durationHours = startMs ? Math.max(0, (stopMs - startMs) / (1000 * 60 * 60)) : 0;
  const tablesCount = Array.isArray(tables) ? tables.length : 0;

  let guestsTotal = 0;
  let turnoverTotal = 0;
  let tipsTotal = 0;
  (tables || []).forEach((t) => {
    guestsTotal += Number(t.guests || 0);
    turnoverTotal += Number(t.bill_total || 0);
    tipsTotal += Number(t.tip_amount || 0);
  });

  const tipPct = turnoverTotal > 0 ? (tipsTotal / turnoverTotal) * 100 : null;
  const tipsPerHour = durationHours > 0 ? tipsTotal / durationHours : null;

  return {
    durationHours,
    tablesCount,
    guestsTotal,
    turnoverTotal,
    tipsTotal,
    tipPct,
    tipsPerHour,
  };
}

function SummaryTile({ label, value }) {
  return (
    <div className="rounded-lg border border-white/20 bg-white/50 px-3 py-2 shadow-sm">
      <div className="text-[11px] uppercase tracking-wide text-text/60">{label}</div>
      <div className="text-base font-semibold text-text">{value}</div>
    </div>
  );
}

export default function WaiteringPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [activeShift, setActiveShift] = useState(null);
  const [selectedShift, setSelectedShift] = useState(null);
  const [tables, setTables] = useState([]);
  const [pastShifts, setPastShifts] = useState([]);
  const [tableForm, setTableForm] = useState(initialTableForm);
  const [fileInputKey, setFileInputKey] = useState(0);
  const [startingShift, setStartingShift] = useState(false);
  const [endingShift, setEndingShift] = useState(false);
  const [addingTable, setAddingTable] = useState(false);
  const [nowTs, setNowTs] = useState(Date.now());
  const [justCompletedSummary, setJustCompletedSummary] = useState(null);
  const [editingTable, setEditingTable] = useState(null);
  const [removeScreenshot, setRemoveScreenshot] = useState(false);

  const addFormRef = useRef(null);

  usePageHeading(PAGE_HEADING);

  useEffect(() => {
    let cancelled = false;
    const bootstrap = async () => {
      try {
        const { data } = await supabase.auth.getUser();
        if (cancelled) return;
        const resolvedUser = data?.user ?? null;
        setUser(resolvedUser);
        if (!resolvedUser) {
          setLoading(false);
          return;
        }
        await Promise.all([loadActiveShift(resolvedUser), loadPastShifts(resolvedUser)]);
      } catch (error) {
        if (!cancelled) setLoadError(error?.message || 'Failed to load shifts');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    bootstrap();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!activeShift) return undefined;
    const id = setInterval(() => setNowTs(Date.now()), 1000);
    return () => clearInterval(id);
  }, [activeShift]);

  useEffect(() => {
    if (selectedShift?.id) {
      loadTablesForShift(selectedShift.id);
    } else {
      setTables([]);
    }
  }, [selectedShift?.id]);

  useEffect(() => {
    if (selectedShift) return;
    if (activeShift) {
      setSelectedShift(activeShift);
    } else if (pastShifts.length) {
      setSelectedShift(pastShifts[0]);
    }
  }, [activeShift, pastShifts, selectedShift]);

  const activeSummary = useMemo(
    () =>
      activeShift
        ? computeShiftSummary(
            activeShift,
            activeShift?.id === selectedShift?.id ? tables : [],
            nowTs
          )
        : null,
    [activeShift, selectedShift?.id, tables, nowTs]
  );

  const selectedSummary = useMemo(
    () => (selectedShift ? computeShiftSummary(selectedShift, tables, nowTs) : null),
    [selectedShift, tables, nowTs]
  );

  async function loadActiveShift(currentUser = user) {
    if (!currentUser) return null;
    const { data, error } = await supabase
      .from('waiter_shifts')
      .select('*')
      .eq('user_id', currentUser.id)
      .eq('status', 'active')
      .order('start_time', { ascending: false })
      .limit(1);
    if (error) throw error;
    const shift = data?.[0] ?? null;
    setActiveShift(shift);
    return shift;
  }

  async function loadTablesForShift(shiftId) {
    if (!shiftId || !user) {
      setTables([]);
      return;
    }
    const { data, error } = await supabase
      .from('waiter_tables')
      .select('*')
      .eq('user_id', user.id)
      .eq('shift_id', shiftId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    setTables(data ?? []);
  }

  async function loadPastShifts(currentUser = user) {
    if (!currentUser) {
      setPastShifts([]);
      return;
    }
    const { data, error } = await supabase
      .from('waiter_shifts')
      .select('*')
      .eq('user_id', currentUser.id)
      .eq('status', 'completed')
      .order('start_time', { ascending: false })
      .limit(20);
    if (error) throw error;
    const shifts = data ?? [];
    const ids = shifts.map((s) => s.id);
    const tablesByShift = {};
    if (ids.length) {
      const { data: tableData, error: tablesError } = await supabase
        .from('waiter_tables')
        .select('shift_id, guests, bill_total, tip_amount')
        .in('shift_id', ids);
      if (tablesError) throw tablesError;
      (tableData || []).forEach((row) => {
        if (!tablesByShift[row.shift_id]) tablesByShift[row.shift_id] = [];
        tablesByShift[row.shift_id].push(row);
      });
    }
    setPastShifts(shifts.map((s) => ({ ...s, tables: tablesByShift[s.id] || [] })));
  }

  async function handleStartShift() {
    if (!user) {
      alert('Sign in required');
      return;
    }
    setStartingShift(true);
    setLoadError(null);
    try {
      const { data, error } = await supabase
        .from('waiter_shifts')
        .insert({
          user_id: user.id,
          start_time: new Date().toISOString(),
          status: 'active',
          branch: DEFAULT_BRANCH,
        })
        .select('*')
        .single();
      if (error) throw error;
      setActiveShift(data);
      setSelectedShift(data);
      setTables([]);
      setJustCompletedSummary(null);
    } catch (error) {
      setLoadError(error?.message || 'Unable to start shift');
    } finally {
      setStartingShift(false);
    }
  }

  async function handleEndShift() {
    if (!user || !activeShift) return;
    setEndingShift(true);
    setLoadError(null);
    const completedAt = new Date().toISOString();
    let tablesForShift = tables;
    if (selectedShift?.id !== activeShift.id) {
      const { data: activeTablesData } = await supabase
        .from('waiter_tables')
        .select('*')
        .eq('user_id', user.id)
        .eq('shift_id', activeShift.id)
        .order('created_at', { ascending: false });
      tablesForShift = activeTablesData || [];
    }
    try {
      const { data, error } = await supabase
        .from('waiter_shifts')
        .update({ end_time: completedAt, status: 'completed' })
        .eq('id', activeShift.id)
        .eq('user_id', user.id)
        .select('*')
        .single();
      if (error) throw error;
      const completedShift = data ?? { ...activeShift, end_time: completedAt, status: 'completed' };
      setJustCompletedSummary({
        shift: completedShift,
        summary: computeShiftSummary(completedShift, tablesForShift, nowTs),
      });
      if (selectedShift?.id === activeShift.id || !selectedShift) {
        setSelectedShift(completedShift);
      }
      setActiveShift(null);
      setTables([]);
      await loadPastShifts(user);
    } catch (error) {
      setLoadError(error?.message || 'Unable to end shift');
    } finally {
      setEndingShift(false);
    }
  }

  function resetTableForm() {
    setTableForm(initialTableForm);
    setFileInputKey((k) => k + 1);
  }

  function beginEditTable(table) {
    if (!table) return;
    setEditingTable(table);
    setRemoveScreenshot(false);
    setTableForm({
      table_number: table.table_number || '',
      guests: table.guests != null ? String(table.guests) : '',
      bill_total: table.bill_total != null ? String(table.bill_total) : '',
      tip_amount: table.tip_amount != null ? String(table.tip_amount) : '',
      payment_method: table.payment_method || 'card',
      screenshotFile: null,
      notes: table.notes || '',
    });
    setFileInputKey((k) => k + 1);
    addFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function cancelEditTable() {
    setEditingTable(null);
    setRemoveScreenshot(false);
    resetTableForm();
  }

  async function handleAddTable(e) {
    e.preventDefault();
    if (!user || !selectedShift) {
      alert('Select a shift first');
      return;
    }
    if (!editingTable && selectedShift.status !== 'active') {
      alert('Only active shifts can accept new tables.');
      return;
    }
    setAddingTable(true);
    setLoadError(null);
    let screenshotUrl = editingTable?.screenshot_url ?? null;
    try {
      const { screenshotFile, table_number, guests, bill_total, tip_amount, payment_method, notes } = tableForm;

      if (screenshotFile) {
        const filePath = `${user.id}/${selectedShift.id}/${
          typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(16).slice(2)
        }`;
        const { error: uploadError } = await supabase.storage.from('waiter-bills').upload(filePath, screenshotFile);
        if (uploadError) throw uploadError;
        const { data: publicUrlData } = supabase.storage.from('waiter-bills').getPublicUrl(filePath);
        screenshotUrl = publicUrlData?.publicUrl ?? null;
      }

      if (removeScreenshot) {
        screenshotUrl = null;
      }

      const payload = {
        user_id: user.id,
        shift_id: selectedShift.id,
        table_number,
        guests: Number(guests || 0),
        bill_total: Number(bill_total || 0),
        tip_amount: Number(tip_amount || 0),
        payment_method: payment_method || 'card',
        screenshot_url: screenshotUrl,
        notes: notes?.trim() || null,
      };

      if (editingTable) {
        const { error } = await supabase
          .from('waiter_tables')
          .update({
            table_number: payload.table_number,
            guests: payload.guests,
            bill_total: payload.bill_total,
            tip_amount: payload.tip_amount,
            payment_method: payload.payment_method,
            screenshot_url: payload.screenshot_url,
            notes: payload.notes,
          })
          .eq('id', editingTable.id)
          .eq('user_id', user.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('waiter_tables').insert(payload);
        if (error) throw error;
      }
      resetTableForm();
      setEditingTable(null);
      setRemoveScreenshot(false);
      await loadTablesForShift(selectedShift.id);
    } catch (error) {
      setLoadError(error?.message || 'Unable to add table');
    } finally {
      setAddingTable(false);
    }
  }

  async function handleDeleteTable(table) {
    if (!user || !selectedShift) return;
    const ok = window.confirm(`Delete table ${table.table_number}? This cannot be undone.`);
    if (!ok) return;
    setLoadError(null);
    try {
      const { error } = await supabase
        .from('waiter_tables')
        .delete()
        .eq('id', table.id)
        .eq('user_id', user.id);
      if (error) throw error;
      if (editingTable && editingTable.id === table.id) {
        cancelEditTable();
      }
      await loadTablesForShift(selectedShift.id);
    } catch (error) {
      setLoadError(error?.message || 'Unable to delete table');
    }
  }

  async function handleDeleteShift(shift) {
    if (!user) return;
    const ok = window.confirm('Delete this shift and all its tables? This cannot be undone.');
    if (!ok) return;
    setLoadError(null);
    try {
      await supabase.from('waiter_tables').delete().eq('user_id', user.id).eq('shift_id', shift.id);
      await supabase.from('waiter_shifts').delete().eq('user_id', user.id).eq('id', shift.id);

      if (activeShift?.id === shift.id) {
        setActiveShift(null);
        setTables([]);
        setEditingTable(null);
        setRemoveScreenshot(false);
        resetTableForm();
      }
      if (selectedShift?.id === shift.id) {
        setSelectedShift(null);
        setTables([]);
      }
      await loadPastShifts(user);
    } catch (error) {
      setLoadError(error?.message || 'Unable to delete shift');
    }
  }

  const renderActiveShift = () =>
    activeShift && (
      <Card
        variant="info"
        compact={false}
        title={formatShiftDate(activeShift.start_time)}
        subtitle={activeShift.branch || DEFAULT_BRANCH}
        meta={activeSummary ? `On shift ${formatDurationHours(activeSummary.durationHours)}` : 'On shift'}
        interactive
        selected={selectedShift?.id === activeShift.id}
        onClick={() => setSelectedShift(activeShift)}
        footer={
          <div className="flex items-center justify-between gap-3 text-sm text-text/70">
            <div className="flex items-center gap-3">
              <span>Started {formatShiftDate(activeShift.start_time)}</span>
              <button
                type="button"
                className="text-xs font-semibold text-rose-700 underline-offset-2 hover:underline"
                onClick={() => handleDeleteShift(activeShift)}
              >
                Delete shift
              </button>
            </div>
            <button
              className="rounded-full bg-rose-500 px-4 py-2 text-sm font-semibold text-white shadow hover:brightness-110"
              onClick={handleEndShift}
              disabled={endingShift}
            >
              {endingShift ? 'Ending...' : 'End track'}
            </button>
          </div>
        }
      >
        {activeSummary ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
            <SummaryTile label="Tables" value={activeSummary.tablesCount} />
            <SummaryTile label="Guests" value={activeSummary.guestsTotal} />
            <SummaryTile label="Turnover" value={formatCurrency(activeSummary.turnoverTotal)} />
            <SummaryTile label="Tips" value={formatCurrency(activeSummary.tipsTotal)} />
            <SummaryTile
              label="Tip %"
              value={activeSummary.tipPct != null ? `${activeSummary.tipPct.toFixed(1)}%` : '--'}
            />
            <SummaryTile
              label="Tips/hr"
              value={
                activeSummary.tipsPerHour != null && Number.isFinite(activeSummary.tipsPerHour)
                  ? formatCurrency(activeSummary.tipsPerHour)
                  : '--'
              }
            />
          </div>
        ) : (
          <div className="text-sm text-text/70">Tracking shift...</div>
        )}
      </Card>
    );

  return (
    <>
      <Head>
        <title>Waitering</title>
      </Head>
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-text">Waitering</h1>
          <p className="text-sm text-text/70">Track your hours, tables, and tips.</p>
        </div>

        {loadError && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {loadError}
          </div>
        )}

        {loading && <div className="text-sm text-text/60">Loading waitering data...</div>}

        {!loading && !user && (
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-6 text-sm text-text/80 shadow-sm">
            Sign in to track shifts and tables.
          </div>
        )}

        {!loading && user && (
          <>
            {activeShift ? (
              renderActiveShift()
            ) : (
              <div className="flex flex-col items-start gap-3">
                <button
                  className="rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow hover:brightness-110 disabled:opacity-70"
                  onClick={handleStartShift}
                  disabled={startingShift}
                >
                  {startingShift ? 'Starting...' : 'Get to work'}
                </button>
                <p className="text-sm text-text/70">No active shift. Start one to begin tracking.</p>
              </div>
            )}

            {justCompletedSummary ? (
              <Card
                variant="success"
                compact={false}
                title="Shift summary"
                subtitle={formatShiftDate(justCompletedSummary.shift?.start_time)}
              >
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                  <SummaryTile label="Duration" value={formatDurationHours(justCompletedSummary.summary.durationHours)} />
                  <SummaryTile label="Tables" value={justCompletedSummary.summary.tablesCount} />
                  <SummaryTile label="Guests" value={justCompletedSummary.summary.guestsTotal} />
                  <SummaryTile
                    label="Turnover"
                    value={formatCurrency(justCompletedSummary.summary.turnoverTotal)}
                  />
                  <SummaryTile label="Tips" value={formatCurrency(justCompletedSummary.summary.tipsTotal)} />
                  <SummaryTile
                    label="Tip %"
                    value={
                      justCompletedSummary.summary.tipPct != null
                        ? `${justCompletedSummary.summary.tipPct.toFixed(1)}%`
                        : '--'
                    }
                  />
                </div>
              </Card>
            ) : null}

            {selectedShift ? (
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="text-lg font-semibold text-text">
                      Tables for shift: {formatShiftDate(selectedShift.start_time)}
                    </h3>
                    <div className="text-sm text-text/70">
                      Status: {selectedShift.status || 'unknown'}
                      {selectedSummary ? ` - ${formatDurationHours(selectedSummary.durationHours)}` : ''}
                    </div>
                  </div>
                  {selectedShift.status === 'active' ? (
                    <button
                      className="rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-text shadow-sm hover:bg-slate-50"
                      onClick={() => addFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                    >
                      + Add table
                    </button>
                  ) : null}
                </div>

                {selectedSummary ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                    <SummaryTile label="Tables" value={selectedSummary.tablesCount} />
                    <SummaryTile label="Guests" value={selectedSummary.guestsTotal} />
                    <SummaryTile label="Turnover" value={formatCurrency(selectedSummary.turnoverTotal)} />
                    <SummaryTile label="Tips" value={formatCurrency(selectedSummary.tipsTotal)} />
                    <SummaryTile
                      label="Tip %"
                      value={selectedSummary.tipPct != null ? `${selectedSummary.tipPct.toFixed(1)}%` : '--'}
                    />
                    <SummaryTile
                      label="Tips/hr"
                      value={
                        selectedSummary.tipsPerHour != null && Number.isFinite(selectedSummary.tipsPerHour)
                          ? formatCurrency(selectedSummary.tipsPerHour)
                          : '--'
                      }
                    />
                  </div>
                ) : null}

                {selectedShift.status === 'active' || editingTable ? (
                  <div ref={addFormRef}>
                    <Card
                      variant="neutral"
                      compact={false}
                      title={editingTable ? `Edit table ${editingTable.table_number}` : 'Add table'}
                      subtitle={editingTable ? 'Update this table entry' : 'Log a bill for this shift'}
                    >
                      <form className="space-y-4" onSubmit={handleAddTable}>
                        <div className="grid gap-3 md:grid-cols-2">
                          <TextInput
                            required
                            label="Table number"
                            value={tableForm.table_number}
                            onChange={(e) => setTableForm((prev) => ({ ...prev, table_number: e.target.value }))}
                            placeholder="e.g. 12"
                          />
                          <TextInput
                            required
                            type="number"
                            min="0"
                            label="Guests"
                            value={tableForm.guests}
                            onChange={(e) => setTableForm((prev) => ({ ...prev, guests: e.target.value }))}
                            placeholder="2"
                          />
                          <TextInput
                            required
                            type="number"
                            step="0.01"
                            min="0"
                            label="Bill total (R)"
                            value={tableForm.bill_total}
                            onChange={(e) => setTableForm((prev) => ({ ...prev, bill_total: e.target.value }))}
                            placeholder="450.00"
                          />
                          <TextInput
                            required
                            type="number"
                            step="0.01"
                            min="0"
                            label="Tip amount (R)"
                            value={tableForm.tip_amount}
                            onChange={(e) => setTableForm((prev) => ({ ...prev, tip_amount: e.target.value }))}
                            placeholder="45.00"
                          />
                          <label className="block space-y-1">
                            <span className="block text-sm font-medium text-text">Payment method</span>
                            <select
                              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-text focus:outline-none focus:ring-2 focus:ring-primary/40"
                              value={tableForm.payment_method}
                              onChange={(e) => setTableForm((prev) => ({ ...prev, payment_method: e.target.value }))}
                            >
                              <option value="card">Card</option>
                              <option value="cash">Cash</option>
                              <option value="mixed">Mixed</option>
                            </select>
                          </label>
                          <label className="block space-y-1">
                            <span className="block text-sm font-medium text-text">
                              {editingTable ? 'New bill screenshot (optional, replaces existing)' : 'Bill screenshot (optional)'}
                            </span>
                            <input
                              key={fileInputKey}
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0] || null;
                                setTableForm((prev) => ({ ...prev, screenshotFile: file }));
                              }}
                              className="w-full text-sm text-text"
                            />
                            <span className="block text-xs text-text/70">Uploads to the public waiter-bills bucket.</span>
                          </label>
                        </div>
                        {editingTable && editingTable.screenshot_url ? (
                          <div className="space-y-2">
                            <div className="text-xs font-medium text-text/70">Current screenshot</div>
                            <div className="overflow-hidden rounded-lg border border-white/30 bg-white/30 shadow-inner">
                              <img
                                src={editingTable.screenshot_url}
                                alt="Existing bill screenshot"
                                className="h-32 w-full object-cover"
                              />
                            </div>
                            <label className="flex items-center gap-2 text-xs text-text/80">
                              <input
                                type="checkbox"
                                checked={removeScreenshot}
                                onChange={(e) => setRemoveScreenshot(e.target.checked)}
                              />
                              <span>Remove existing screenshot</span>
                            </label>
                          </div>
                        ) : null}
                        <TextAreaAuto
                          label="Notes"
                          placeholder="Special requests, comps, etc."
                          value={tableForm.notes}
                          onChange={(e) => setTableForm((prev) => ({ ...prev, notes: e.target.value }))}
                          maxRows={4}
                        />

                        <div className="flex items-center gap-3">
                          <button
                            type="submit"
                            className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow hover:brightness-110 disabled:opacity-70"
                            disabled={addingTable}
                          >
                            {addingTable
                              ? editingTable
                                ? 'Saving changes...'
                                : 'Saving...'
                              : editingTable
                              ? 'Save changes'
                              : 'Save table'}
                          </button>
                          <button
                            type="button"
                            className="text-sm font-medium text-text/70 underline-offset-2 hover:underline"
                            onClick={resetTableForm}
                          >
                            Clear
                          </button>
                          {editingTable && (
                            <button
                              type="button"
                              className="text-sm font-medium text-text/70 underline-offset-2 hover:underline"
                              onClick={cancelEditTable}
                            >
                              Cancel edit
                            </button>
                          )}
                        </div>
                      </form>
                    </Card>
                  </div>
                ) : null}

                <div className="grid gap-3 md:grid-cols-2">
                  {tables.map((table) => (
                    <WaiterTableCard
                      key={table.id}
                      table={table}
                      onEdit={beginEditTable}
                      onDelete={handleDeleteTable}
                    />
                  ))}
                </div>
                {!tables.length && <div className="text-sm text-text/70">No tables logged yet.</div>}
              </div>
            ) : null}

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-text">Past shifts</h3>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {pastShifts.map((shift) => {
                  const summary = computeShiftSummary(shift, shift.tables || []);
                  return (
                    <Card
                      key={shift.id}
                      variant="neutral"
                      compact={false}
                      title={formatShiftDate(shift.start_time)}
                      subtitle={shift.branch || DEFAULT_BRANCH}
                      meta={`${formatDurationHours(summary.durationHours)} | ${summary.tablesCount} tables`}
                      interactive
                      selected={selectedShift?.id === shift.id}
                      onClick={() => setSelectedShift(shift)}
                    >
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <SummaryTile label="Turnover" value={formatCurrency(summary.turnoverTotal)} />
                        <SummaryTile label="Tips" value={formatCurrency(summary.tipsTotal)} />
                        <SummaryTile
                          label="Tip %"
                          value={summary.tipPct != null ? `${summary.tipPct.toFixed(1)}%` : '--'}
                        />
                        <SummaryTile label="Guests" value={summary.guestsTotal} />
                      </div>
                      <div className="mt-3 flex justify-end">
                        <button
                          type="button"
                          className="text-xs font-semibold text-rose-700 underline-offset-2 hover:underline"
                          onClick={() => handleDeleteShift(shift)}
                        >
                          Delete shift
                        </button>
                      </div>
                    </Card>
                  );
                })}
              </div>
              {!pastShifts.length && <div className="text-sm text-text/70">No completed shifts yet.</div>}
            </div>
          </>
        )}
      </div>
    </>
  );
}
