'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { CriticalAlert, TemperatureSensor } from '@/lib/types';

const POLL_MS = 5000;
const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

function formatTick(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleTimeString('uk-UA', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export default function DashboardTempPage() {
  const [sensors, setSensors] = useState<TemperatureSensor[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState<CriticalAlert | null>(null);
  const [sseStatus, setSseStatus] = useState<'connecting' | 'open' | 'error'>(
    'connecting',
  );

  const fetchSensors = useCallback(async () => {
    try {
      const res = await fetch(`${apiUrl}/temperature-sensors`);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const data = (await res.json()) as TemperatureSensor[];
      setSensors(Array.isArray(data) ? data : []);
      setError(null);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Fetch failed';
      setError(`Не вдалося завантажити дані: ${message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchSensors();
    const id = window.setInterval(() => {
      void fetchSensors();
    }, POLL_MS);
    return () => window.clearInterval(id);
  }, [fetchSensors]);

  useEffect(() => {
    const es = new EventSource(`${apiUrl}/temperature-sensors/alerts`);

    es.onopen = () => setSseStatus('open');

    es.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data) as CriticalAlert;
        setAlert(payload);
      } catch {
        setAlert({
          type: 'critical_temperature',
          message: event.data,
          sensorId: '',
          sensorName: 'unknown',
          value: Number.NaN,
          unit: '',
        });
      }
    };

    es.onerror = () => {
      setSseStatus('error');
    };

    return () => {
      es.close();
    };
  }, []);

  const chartData = useMemo(() => {
    return [...sensors]
      .slice()
      .reverse()
      .map((s) => ({
        time: formatTick(s.createdAt ?? s.timestamp),
        value: s.value,
        sensorName: s.sensorName,
        unit: s.unit,
      }));
  }, [sensors]);

  const latest = sensors[0];

  return (
    <div className="space-y-6">
      <header className="fade-slide-in">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-signal">
          Live dashboard
        </p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-ink">
          Temperature
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-steel">
          Дані з{' '}
          <span className="font-mono text-ink">{apiUrl}/temperature-sensors</span>
          , оновлення кожні {POLL_MS / 1000} с. Критичні алерти — через SSE.
        </p>
      </header>

      <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-steel">
        <span
          className={[
            'inline-flex items-center gap-2',
            sseStatus === 'open' ? 'text-signal' : '',
            sseStatus === 'error' ? 'text-alert' : '',
          ].join(' ')}
        >
          <span
            className={[
              'inline-block h-2 w-2',
              sseStatus === 'open' ? 'bg-signal' : '',
              sseStatus === 'connecting' ? 'bg-steel/50' : '',
              sseStatus === 'error' ? 'bg-alert' : '',
            ].join(' ')}
          />
          SSE: {sseStatus}
        </span>
        {latest && (
          <span>
            latest: {latest.sensorName} = {latest.value}
            {latest.unit}
          </span>
        )}
      </div>

      {alert && (
        <div
          role="alert"
          className="alert-pulse fade-slide-in border border-alert/40 bg-alert-soft px-4 py-3 text-alert"
        >
          <p className="text-xs font-mono uppercase tracking-wider">
            Critical alert
          </p>
          <p className="mt-1 text-sm font-medium text-ink">{alert.message}</p>
          <p className="mt-1 font-mono text-xs">
            {alert.sensorName}
            {!Number.isNaN(alert.value) && (
              <>
                {' '}
                · {alert.value}
                {alert.unit}
              </>
            )}
          </p>
          <button
            type="button"
            onClick={() => setAlert(null)}
            className="mt-2 text-xs text-steel underline underline-offset-2 hover:text-ink"
          >
            Закрити
          </button>
        </div>
      )}

      {error && (
        <div className="border border-alert/30 bg-white/70 px-4 py-3 text-sm text-alert">
          {error}
        </div>
      )}

      <section className="border border-steel/15 bg-white/70 p-4 sm:p-6">
        <h2 className="text-sm font-medium text-ink">Тренд температури</h2>
        <p className="mt-1 text-xs text-steel">
          Останні записи з бекенду (до 50), вісь X — час створення.
        </p>

        <div className="mt-4 h-72 w-full sm:h-80">
          {loading && chartData.length === 0 ? (
            <p className="text-sm text-steel">Завантаження…</p>
          ) : chartData.length === 0 ? (
            <p className="text-sm text-steel">
              Немає даних. Надішліть POST на бекенд або перевірте API URL.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#c5d0d6" />
                <XAxis
                  dataKey="time"
                  tick={{ fontSize: 11, fill: '#3d5a6c' }}
                  minTickGap={24}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#3d5a6c' }}
                  unit="°"
                  width={40}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 0,
                    border: '1px solid #c5d0d6',
                    fontSize: 12,
                    fontFamily: 'IBM Plex Mono, monospace',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  name="Temperature"
                  stroke="#0d8a7a"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </section>

      <section className="border border-steel/15 bg-white/70 p-4 sm:p-6">
        <h2 className="text-sm font-medium text-ink">Останні виміри</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead className="font-mono text-xs uppercase tracking-wide text-steel">
              <tr className="border-b border-steel/15">
                <th className="py-2 pr-3 font-medium">Sensor</th>
                <th className="py-2 pr-3 font-medium">Value</th>
                <th className="py-2 pr-3 font-medium">Unit</th>
                <th className="py-2 font-medium">Created</th>
              </tr>
            </thead>
            <tbody>
              {sensors.slice(0, 10).map((s) => (
                <tr key={s.id} className="border-b border-steel/10">
                  <td className="py-2 pr-3">{s.sensorName}</td>
                  <td
                    className={[
                      'py-2 pr-3 font-mono',
                      s.value <= -10 ? 'font-medium text-alert' : '',
                    ].join(' ')}
                  >
                    {s.value}
                  </td>
                  <td className="py-2 pr-3">{s.unit}</td>
                  <td className="py-2 font-mono text-xs text-steel">
                    {formatTick(s.createdAt ?? s.timestamp)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
