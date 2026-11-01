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
import HoloStage from '@/components/HoloStage';
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

  const sseLabel =
    sseStatus === 'open'
      ? 'link stable'
      : sseStatus === 'error'
        ? 'link lost'
        : 'syncing';

  return (
    <div className="space-y-6">
      <header className="fade-slide-in flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="kicker">Live dashboard</p>
          <h1 className="fx-title mt-2 font-display text-4xl font-semibold sm:text-5xl">
            TEMPERATURE
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-steel">
            Канал{' '}
            <span className="font-mono break-all text-signal">
              {apiUrl}/temperature-sensors
            </span>
            . Оновлення кожні {POLL_MS / 1000} с, критичні події — через SSE.
          </p>
        </div>
        <div className="mx-auto h-64 w-full max-w-[240px] shrink-0 self-center">
          <HoloStage compact />
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        <article className="hud-panel p-4">
          <p className="kicker">Core temp</p>
          <p className="stat-value mt-3">
            {latest ? (
              <>
                {latest.value}
                <span className="text-lg text-signal">{latest.unit}</span>
              </>
            ) : (
              '—'
            )}
          </p>
          <p className="mt-2 font-mono text-xs text-steel">
            {latest ? latest.sensorName : 'очікування датчика'}
          </p>
        </article>
        <article className="hud-panel p-4">
          <p className="kicker">Samples</p>
          <p className="stat-value mt-3">{sensors.length}</p>
          <p className="mt-2 font-mono text-xs text-steel">у поточному буфері</p>
        </article>
        <article className="hud-panel p-4">
          <p className="kicker">SSE channel</p>
          <p className="mt-3 inline-flex items-center gap-2 font-display text-xl text-ink">
            <span
              className={[
                sseStatus === 'open' ? 'live-dot' : 'inline-block h-2 w-2 rounded-full',
                sseStatus === 'connecting' ? 'bg-steel/60' : '',
                sseStatus === 'error' ? 'bg-alert shadow-[0_0_10px_#ff4d7a]' : '',
              ].join(' ')}
            />
            {sseLabel}
          </p>
          <p className="mt-2 font-mono text-xs text-steel">{sseStatus}</p>
        </article>
      </div>

      {alert && (
        <div
          role="alert"
          className="alert-pulse fade-slide-in border border-alert/50 bg-alert-soft px-4 py-3 text-alert"
        >
          <p className="font-mono text-xs tracking-[0.2em] uppercase">
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
            className="mt-2 text-xs tracking-wide text-steel uppercase underline underline-offset-4 hover:text-ink"
          >
            Закрити
          </button>
        </div>
      )}

      {error && (
        <div className="border border-alert/40 bg-alert-soft px-4 py-3 text-sm text-alert">
          {error}
        </div>
      )}

      <section className="hud-panel p-4 sm:p-6">
        <h2 className="font-display text-lg text-ink">Тренд температури</h2>
        <p className="mt-1 text-xs text-steel">
          Останні записи з бекенду (до 50), вісь X — час створення.
        </p>

        <div className="mt-4 h-72 w-full sm:h-80">
          {loading && chartData.length === 0 ? (
            <p className="font-mono text-sm text-signal">Завантаження…</p>
          ) : chartData.length === 0 ? (
            <p className="text-sm text-steel">
              Немає даних. Надішліть POST на бекенд або перевірте API URL.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(42,244,255,0.12)" />
                <XAxis
                  dataKey="time"
                  tick={{ fontSize: 11, fill: '#8eafc4' }}
                  minTickGap={24}
                  axisLine={{ stroke: 'rgba(42,244,255,0.25)' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#8eafc4' }}
                  unit="°"
                  width={40}
                  axisLine={{ stroke: 'rgba(42,244,255,0.25)' }}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 0,
                    border: '1px solid rgba(42,244,255,0.35)',
                    background: '#07111c',
                    color: '#e7fbff',
                    fontSize: 12,
                    fontFamily: 'JetBrains Mono, monospace',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  name="Temperature"
                  stroke="#2af4ff"
                  strokeWidth={2.4}
                  dot={false}
                  activeDot={{ r: 5, fill: '#ff3df0', stroke: '#f4feff' }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </section>

      <section className="hud-panel p-4 sm:p-6">
        <h2 className="font-display text-lg text-ink">Останні виміри</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead className="font-mono text-[11px] tracking-[0.16em] text-signal uppercase">
              <tr className="border-b border-signal/20">
                <th className="py-2 pr-3 font-medium">Sensor</th>
                <th className="py-2 pr-3 font-medium">Value</th>
                <th className="py-2 pr-3 font-medium">Unit</th>
                <th className="py-2 font-medium">Created</th>
              </tr>
            </thead>
            <tbody>
              {sensors.slice(0, 10).map((s) => (
                <tr
                  key={s.id}
                  className="border-b border-signal/10 transition-colors hover:bg-signal/5"
                >
                  <td className="py-2.5 pr-3">{s.sensorName}</td>
                  <td
                    className={[
                      'py-2.5 pr-3 font-mono',
                      s.value <= -10 ? 'font-medium text-alert' : 'text-signal',
                    ].join(' ')}
                  >
                    {s.value}
                  </td>
                  <td className="py-2.5 pr-3 text-steel">{s.unit}</td>
                  <td className="py-2.5 font-mono text-xs text-steel">
                    {formatTick(s.createdAt ?? s.timestamp)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {sensors.length === 0 && !loading && (
            <p className="py-4 text-sm text-steel">Порожній журнал вимірів.</p>
          )}
        </div>
      </section>
    </div>
  );
}
