import { useState } from 'react';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { Card } from '../components/Card';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(email && password ? 'Form state is valid.' : 'Enter an email and password.');
  };

  const valid = message === 'Form state is valid.';
  const invalid = Boolean(message) && !valid;

  return (
    <div className="form-preview">
      <Card surface="overlay" className="dialog-sample">
        <header className="dialog-heading">
          <span className="showcase-mark" aria-hidden="true">U</span>
          <div>
            <p className="preview-kicker">Secure workspace</p>
            <h1>Sign in to UDesign</h1>
          </div>
        </header>

        <p className="dialog-description">Inspect field labels, keyboard focus, validation, and mobile dialog sizing.</p>

        <form onSubmit={handleSubmit} className="form-stack" noValidate>
          <label className="form-field" htmlFor="login-email">
            <span>Email address</span>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              placeholder="name@udesign.com"
              aria-describedby={invalid ? 'login-error' : undefined}
              aria-invalid={invalid || undefined}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>

          <label className="form-field" htmlFor="login-password">
            <span>Password</span>
            <input
              id="login-password"
              type="password"
              autoComplete="current-password"
              placeholder="Enter your password"
              aria-describedby={invalid ? 'login-error' : undefined}
              aria-invalid={invalid || undefined}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>

          <label className="checkbox-field">
            <input type="checkbox" />
            <span>Keep this device signed in</span>
          </label>

          {message && (
            <div id={invalid ? 'login-error' : undefined} className={`form-message tone-${valid ? 'success' : 'danger'}`} role={invalid ? 'alert' : 'status'}>
              <Badge variant={valid ? 'success' : 'danger'}>{valid ? 'Ready' : 'Needs attention'}</Badge>
              <span>{message}</span>
            </div>
          )}

          <Button type="submit">Sign in</Button>
          <Button variant="secondary" disabled>Single sign-on unavailable</Button>
        </form>
      </Card>
    </div>
  );
}
