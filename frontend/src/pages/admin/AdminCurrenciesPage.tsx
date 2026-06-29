import { useEffect, useState } from 'react';
import { Pencil } from 'lucide-react';
import api from '../../lib/api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';

interface Currency {
  code: string;
  name: string;
  region: string;
  symbol: string;
  rateToUsdt: number;
  isActive: boolean;
  decimals: number;
}

const REGION_LABELS: Record<string, string> = {
  CIS: 'СНГ', EUROPE: 'Европа', MENA: 'Ближний Восток',
  ASIA: 'Азия', LATAM: 'Латам', GLOBAL: 'Мир',
};

export function AdminCurrenciesPage() {
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [filter, setFilter] = useState('');
  const [edit, setEdit] = useState<Currency | null>(null);
  const [rate, setRate] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchData = () => {
    api.get('/api/admin/currencies').then((r) => setCurrencies(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const saveRate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!edit) return;
    await api.patch(`/api/admin/currencies/${edit.code}`, { rateToUsdt: parseFloat(rate), name: edit.name, region: edit.region, symbol: edit.symbol });
    setEdit(null);
    fetchData();
  };

  const filtered = currencies.filter((c) =>
    !filter || c.region === filter || c.code.includes(filter.toUpperCase()) || c.name.toLowerCase().includes(filter.toLowerCase())
  );

  const grouped = filtered.reduce<Record<string, Currency[]>>((acc, c) => {
    (acc[c.region] ||= []).push(c);
    return acc;
  }, {});

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-100 mb-2">Валюты NETWORS</h1>
      <p className="text-sm text-gray-500 mb-6">{currencies.length} валют — СНГ, Европа, Азия, Латам, MENA</p>

      <div className="flex gap-3 mb-4 flex-wrap">
        <input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Поиск..."
          className="px-3 py-2 bg-bg-card border border-gray-700 rounded-lg text-sm text-gray-100" />
        {Object.keys(REGION_LABELS).map((r) => (
          <button key={r} onClick={() => setFilter(filter === r ? '' : r)}
            className={`px-3 py-1.5 rounded-lg text-xs ${filter === r ? 'bg-accent text-white' : 'bg-bg-card text-gray-400 border border-gray-700'}`}>
            {REGION_LABELS[r]}
          </button>
        ))}
      </div>

      {loading ? <p className="text-gray-500">Загрузка...</p> : Object.entries(grouped).map(([region, list]) => (
        <div key={region} className="mb-6">
          <h2 className="text-sm font-semibold text-gray-400 mb-2">{REGION_LABELS[region] || region}</h2>
          <div className="bg-bg-card rounded-xl border border-gray-700 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700 text-gray-400 text-left">
                  <th className="px-4 py-2">Код</th>
                  <th className="px-4 py-2">Название</th>
                  <th className="px-4 py-2">Курс к USDT</th>
                  <th className="px-4 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {list.map((c) => (
                  <tr key={c.code} className="border-b border-gray-800 hover:bg-gray-800/30">
                    <td className="px-4 py-2 font-mono text-accent">{c.code}</td>
                    <td className="px-4 py-2 text-gray-300">{c.symbol} {c.name}</td>
                    <td className="px-4 py-2 text-gray-200">1 USDT = {c.rateToUsdt.toLocaleString('ru-RU')} {c.code}</td>
                    <td className="px-4 py-2">
                      <button onClick={() => { setEdit(c); setRate(String(c.rateToUsdt)); }}
                        className="p-1.5 hover:bg-accent/10 rounded text-accent"><Pencil size={14} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      <Modal isOpen={!!edit} onClose={() => setEdit(null)} title={`Курс ${edit?.code}`}>
        <form onSubmit={saveRate} className="space-y-4">
          <p className="text-sm text-gray-400">Сколько {edit?.code} за 1 USDT</p>
          <Input label="rateToUsdt" type="number" step="0.0001" value={rate} onChange={(e) => setRate(e.target.value)} required />
          <Button type="submit" className="w-full">Сохранить</Button>
        </form>
      </Modal>
    </div>
  );
}
