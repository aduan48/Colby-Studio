import { useEffect, useState } from 'react';
import '../styles/SiteGate.css';

/** Blocks the whole site until the server confirms the password */
function SiteGate({ children }) {
  const [status, setStatus] = useState('checking'); // checking | locked | open
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/unlock')
      .then((r) => r.json())
      .then((d) => setStatus(d.ok ? 'open' : 'locked'))
      .catch(() => setStatus('locked'));
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    const res = await fetch('/api/unlock', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    if (res.ok) setStatus('open');
    else setError('Wrong password');
  };

  if (status === 'checking') return null;
  if (status === 'open') return children;

  return (
    <main className="gate">
      <form className="gate__card" onSubmit={submit}>
        <p className="gate__kicker">Under construction</p>
        <h1>The Studio at Colby</h1>
        <label htmlFor="gate-pw">Password</label>
        <input
          id="gate-pw"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoFocus
          autoComplete="current-password"
        />
        {error && <p className="gate__error" role="alert">{error}</p>}
        <button type="submit">Enter</button>
      </form>
    </main>
  );
}

export default SiteGate;