export default function LoginPage() {
  return (
    <section className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center">
      <p className="font-mono text-xs uppercase tracking-[0.18em] text-signal">
        Access
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink">
        Login
      </h1>
      <p className="mt-2 text-sm text-steel">
        Демонстраційна форма. Поля та кнопка заблоковані — авторизація ще не
        підключена.
      </p>

      <form
        className="mt-8 space-y-4 border border-steel/15 bg-white/70 p-6"
        action="#"
        aria-disabled="true"
      >
        <label className="block">
          <span className="text-xs font-medium text-steel">Email</span>
          <input
            type="email"
            name="email"
            placeholder="operator@cps.local"
            disabled
            className="mt-1.5 w-full border border-steel/20 bg-mist/60 px-3 py-2.5 text-sm text-ink/50 placeholder:text-steel/40 cursor-not-allowed"
          />
        </label>

        <label className="block">
          <span className="text-xs font-medium text-steel">Password</span>
          <input
            type="password"
            name="password"
            placeholder="••••••••"
            disabled
            className="mt-1.5 w-full border border-steel/20 bg-mist/60 px-3 py-2.5 text-sm text-ink/50 placeholder:text-steel/40 cursor-not-allowed"
          />
        </label>

        <button
          type="submit"
          disabled
          className="w-full cursor-not-allowed bg-steel/35 px-4 py-2.5 text-sm font-medium text-white"
        >
          Sign in (disabled)
        </button>
      </form>
    </section>
  );
}
