import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch {
      setError('Неверный email или пароль');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex w-14 h-14 bg-accent rounded-2xl items-center justify-center mb-4">
            <span className="text-white font-bold text-xl">NW</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-100">NETWORS</h1>
          <p className="text-gray-400 mt-1">P2P процессинговая платформа</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-bg-card rounded-xl border border-gray-700 p-6 space-y-4">
          {error && (
            <div className="px-4 py-3 bg-danger/10 border border-danger/30 rounded-lg text-danger text-sm">{error}</div>
          )}
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="trader@networs.io" required />
          <Input label="Пароль" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <Button type="submit" loading={loading} className="w-full">Войти</Button>
          <p className="text-center text-sm text-gray-400">
            Нет аккаунта? <Link to="/register" className="text-accent hover:underline">Регистрация</Link>
          </p>
        </form>

        <div className="mt-4 p-4 bg-bg-card/50 rounded-lg border border-gray-800 text-xs text-gray-500 space-y-1">
          <p className="font-medium text-gray-400 mb-2">Тестовые аккаунты:</p>
          <p>Admin: admin@networs.io / password123</p>
          <p>Trader: trader@networs.io / password123</p>
          <p>Merchant: merchant@networs.io / password123</p>
        </div>
      </div>
    </div>
  );
}
