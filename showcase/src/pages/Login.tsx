import React, { useState } from 'react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Testing authentication state:\nEmail: ${email}\nPassword Length: ${password.length}`);
  };

  return (
    <div className="min-h-[480px] flex items-center justify-center bg-background">
      <Card className="w-full max-w-[380px] p-8">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 font-display font-black text-lg text-foreground mb-2">
            <span className="w-[26px] h-[26px] rounded-sm bg-foreground text-client flex items-center justify-center font-black text-[13px]">U</span>
            UDesign
          </div>
          <p className="text-xs text-muted-foreground">Accéder à votre console admin</p>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="font-display font-semibold text-[11px] uppercase tracking-wider text-muted-foreground" htmlFor="login-email">Identifiant</label>
            <input
              id="login-email"
              type="text"
              className="w-full h-10 border border-border rounded-sm px-3 bg-card text-foreground font-display text-[13.5px] outline-none focus:border-ring focus:ring-3 focus:ring-ud-accent-wash transition-all"
              placeholder="admin@udesign.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="font-display font-semibold text-[11px] uppercase tracking-wider text-muted-foreground" htmlFor="login-pass">Mot de passe</label>
            <input
              id="login-pass"
              type="password"
              className="w-full h-10 border border-border rounded-sm px-3 bg-card text-foreground font-display text-[13.5px] outline-none focus:border-ring focus:ring-3 focus:ring-ud-accent-wash transition-all"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <Button type="submit" className="w-full mt-2" variant="primary">
            Se connecter
          </Button>
        </form>
      </Card>
    </div>
  );
};
