import { useEffect, useState } from 'react';
import '../styles/Admin.css';

/** fetch wrapper: sends JSON, throws on errors so callers can show them */
const api = async (url, options = {}) => {
  const res = await fetch(url, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(data.error || 'Request failed'), { status: res.status });
  return data;
};

const show = (v) => (v === null || v === undefined || v === '' ? '—' : String(v));

function Admin() {
  const [authed, setAuthed] = useState(null); // null = checking
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [types, setTypes] = useState([]);
  const [type, setType] = useState(null);
  const [rows, setRows] = useState([]);
  const [selected, setSelected] = useState(null);

  // am I already signed in?
  useEffect(() => {
    api('/api/admin/auth/session').then((d) => setAuthed(d.ok)).catch(() => setAuthed(false));
  }, []);

  // once signed in, load the tab list
  useEffect(() => {
    if (!authed) return;
    api('/api/admin/types').then((t) => {
      setTypes(t);
      setType(t[0]);
    });
  }, [authed]);

  // load rows whenever the tab changes
  useEffect(() => {
    if (!authed || !type) return;
    setSelected(null);
    api(`/api/admin/${type}`)
      .then(setRows)
      .catch((e) => (e.status === 401 ? setAuthed(false) : setError(e.message)));
  }, [authed, type]);

  const login = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api('/api/admin/auth/login', { method: 'POST', body: JSON.stringify({ password }) });
      setPassword('');
      setAuthed(true);
    } catch (err) {
      setError(err.message);
    }
  };

  const logout = async () => {
    await api('/api/admin/auth/logout', { method: 'POST' });
    setAuthed(false);
  };

  const remove = async (row) => {
    if (!window.confirm(`Delete ${type} #${row.id}? This can't be undone.`)) return;
    try {
      await api(`/api/admin/${type}/${row.id}`, { method: 'DELETE' });
      setRows((r) => r.filter((x) => x.id !== row.id));
      setSelected(null);
    } catch (err) {
      setError(err.message);
    }
  };

  if (authed === null) return null;

  if (!authed) {
    return (
      <main className="admin admin--login">
        <form className="admin-card" onSubmit={login}>
          <p className="admin-kicker">Admin</p>
          <h1>Sign in</h1>
          <label htmlFor="admin-pw">Password</label>
          <input id="admin-pw" type="password" value={password}
                 onChange={(e) => setPassword(e.target.value)} autoFocus />
          {error && <p className="admin-error" role="alert">{error}</p>}
          <button type="submit" className="admin-btn">Enter</button>
        </form>
      </main>
    );
  }

  // the list shows the first few columns; the detail panel shows everything
  const columns = rows[0] ? Object.keys(rows[0]).slice(0, 5) : [];

  return (
    <main className="admin">
      <header className="admin-head">
        <h1>Admin</h1>
        <button className="admin-btn admin-btn--ghost" onClick={logout}>Sign out</button>
      </header>

      <nav className="admin-tabs">
        {types.map((t) => (
          <button key={t} className={`admin-tab ${t === type ? 'is-active' : ''}`}
                  onClick={() => setType(t)}>
            {t}
          </button>
        ))}
      </nav>

      {error && <p className="admin-error" role="alert">{error}</p>}

      <div className="admin-body">
        <div className="admin-table-wrap">
          {rows.length === 0 ? (
            <p className="admin-empty">Nothing here yet.</p>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>{columns.map((c) => <th key={c}>{c}</th>)}</tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} onClick={() => setSelected(row)}
                      className={selected?.id === row.id ? 'is-selected' : ''}>
                    {columns.map((c) => <td key={c}>{show(row[c])}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {selected && (
          <aside className="admin-detail">
            <div className="admin-detail__head">
              <h2>#{selected.id}</h2>
              <button className="admin-btn admin-btn--ghost" onClick={() => setSelected(null)}>Close</button>
            </div>
            <dl>
              {Object.entries(selected).map(([k, v]) => (
                <div key={k}>
                  <dt>{k}</dt>
                  <dd>{show(v)}</dd>
                </div>
              ))}
            </dl>
            <button className="admin-btn admin-btn--danger" onClick={() => remove(selected)}>
              Delete
            </button>
          </aside>
        )}
      </div>
    </main>
  );
}

export default Admin;