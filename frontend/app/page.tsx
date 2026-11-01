import Link from 'next/link';
import HoloStage from '@/components/HoloStage';
import Signature from '@/components/Signature';

const modules = [
  {
    code: '01',
    title: 'Live sensors',
    text: 'Потік температури з NestJS, оновлення кожні 5 секунд.',
  },
  {
    code: '02',
    title: 'SSE alerts',
    text: 'Критичні пороги спалахують у контурі, щойно бекенд їх надсилає.',
  },
  {
    code: '03',
    title: 'Trace log',
    text: 'Історія вимірів лишається на графіку і в таблиці телеметрії.',
  },
] as const;

export default function HomePage() {
  return (
    <section className="relative">
      <div className="grid items-center gap-2 lg:grid-cols-[minmax(0,1.05fr)_minmax(260px,0.95fr)] lg:gap-6">
        <div className="relative">
          <p className="kicker fade-slide-in">Cyber-physical systems // online</p>
          <h1 className="fx-title fade-slide-in delay-1 mt-4 font-display text-5xl leading-[1.05] font-semibold tracking-tight sm:text-7xl">
            CPS
            <br />
            MONITOR
          </h1>
          <p className="fade-slide-in delay-2 mt-5 max-w-xl text-lg leading-relaxed text-steel">
            Командний місток температурних IoT-датчиків: неон телеметрії, графік
            у реальному часі і критичні алерти прямо з кіберфізичного контуру.
          </p>

          <div className="fade-slide-in delay-3 mt-8 flex flex-wrap gap-3">
            <Link href="/dashboard-temp" className="btn-neon px-6 py-3 text-sm">
              Open temperature
            </Link>
            <Link href="/login" className="btn-ghost px-6 py-3 text-sm">
              Access gate
            </Link>
          </div>

          <div className="fade-slide-in delay-3 mt-8">
            <Signature />
          </div>
        </div>

        <div className="fade-slide-in order-first lg:order-none">
          <div className="relative h-[280px] sm:h-[380px] lg:h-[460px]">
            <HoloStage />
          </div>
          <p className="text-center font-mono text-[10px] tracking-[0.22em] text-steel uppercase">
            drag · thermal core
          </p>
        </div>
      </div>

      <div className="relative mt-12 grid gap-4 md:grid-cols-3">
        {modules.map((item) => (
          <article key={item.code} className="hud-panel p-5">
            <p className="font-mono text-xs tracking-[0.2em] text-violet">
              MOD {item.code}
            </p>
            <h2 className="mt-3 font-display text-lg text-ink">{item.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-steel">{item.text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
