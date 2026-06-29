import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

export function RegisterPage() {
  const { register } = useAuth();
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
      await register(email, password);
      navigate('/dashboard');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setError(msg || 'Ошибка регистрации');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-100">Регистрация трейдера</h1>
          <p className="text-gray-400 mt-1">Баланс и кошельки назначает администратор</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-bg-card rounded-xl border border-gray-700 p-6 space-y-4">
          {error && (
            <div className="px-4 py-3 bg-danger/10 border border-danger/30 rounded-lg text-danger text-sm">
              {error}
            </div>
          )}

          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Input label="Пароль (мин. 8 символов)" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />

          <Button type="submit" loading={loading} className="w-full">Зарегистрироваться</Button>

          <p className="text-center text-sm text-gray-400">
            Уже есть аккаунт?{' '}
            <Link to="/login" className="text-accent hover:underline">Войти</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
