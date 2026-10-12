import Link from 'next/link';

export default function HomePage() {
  return (
    <section className="relative flex min-h-[70vh] flex-col justify-center overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-24 h-72 bg-[radial-gradient(circle_at_30%_40%,rgba(13,138,122,0.18),transparent_55%),radial-gradient(circle_at_80%_20%,rgba(61,90,108,0.14),transparent_45%)]"
      />

      <p className="fade-slide-in relative font-mono text-xs uppercase tracking-[0.2em] text-signal">
        Cyber-physical systems
      </p>
      <h1 className="fade-slide-in relative mt-3 max-w-2xl text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
        CPS Monitor
      </h1>
      <p className="fade-slide-in relative mt-4 max-w-xl text-base leading-relaxed text-steel sm:text-lg">
        Моніторинг температури IoT-датчиків у реальному часі: графіки,
        історія вимірів і критичні SSE-алерти з бекенду NestJS.
      </p>

      <div className="fade-slide-in relative mt-8 flex flex-wrap gap-3">
        <Link
          href="/dashboard-temp"
          className="bg-signal px-5 py-2.5 text-sm font-medium text-white transition hover:bg-signal/90"
        >
          Відкрити Temperature
        </Link>
        <Link
          href="/login"
          className="border border-steel/30 bg-white/60 px-5 py-2.5 text-sm font-medium text-ink transition hover:border-steel/50"
        >
          Login
        </Link>
      </div>
    </section>
  );
}
