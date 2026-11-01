import Signature from '@/components/Signature';

export default function LoginPage() {
  return (
    <section className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center">
      <p className="kicker">Access gate</p>
      <h1 className="fx-title mt-3 font-display text-4xl font-semibold">LOGIN</h1>
      <p className="mt-3 text-sm leading-relaxed text-steel">
        Термінал доступу заблоковано. Авторизація ще не підключена — поля
        лише показують контур майбутнього входу.
      </p>

      <form
        className="hud-panel mt-8 space-y-4 p-6"
        action="#"
        aria-disabled="true"
      >
        <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.2em] text-steel">
          <span>Node // auth</span>
          <span className="text-alert">locked</span>
        </div>

        <label className="block">
          <span className="text-xs font-medium tracking-wide text-steel">
            Email
          </span>
          <input
            type="email"
            name="email"
            placeholder="operator@cps.local"
            disabled
            className="mt-1.5 w-full cursor-not-allowed border border-signal/20 bg-mist/80 px-3 py-2.5 font-mono text-sm text-ink/50 placeholder:text-steel/40"
          />
        </label>

        <label className="block">
          <span className="text-xs font-medium tracking-wide text-steel">
            Password
          </span>
          <input
            type="password"
            name="password"
            placeholder="••••••••"
            disabled
            className="mt-1.5 w-full cursor-not-allowed border border-signal/20 bg-mist/80 px-3 py-2.5 font-mono text-sm text-ink/50 placeholder:text-steel/40"
          />
        </label>

        <button
          type="submit"
          disabled
          className="w-full cursor-not-allowed border border-steel/30 bg-steel/15 px-4 py-2.5 font-mono text-xs tracking-[0.16em] text-steel uppercase"
        >
          Sign in · disabled
        </button>
      </form>

      <div className="mt-6">
        <Signature />
      </div>
    </section>
  );
}
