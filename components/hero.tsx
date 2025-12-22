export function Hero({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <section
      className="card"
      style={{ padding: 'clamp(1.3rem, 4.5vw, 1.6rem)', display: 'grid', gap: '0.6rem' }}
    >
      <h1 style={{ margin: 0, fontSize: 'clamp(1.4rem, 4vw, 1.8rem)' }}>{title}</h1>
      {subtitle ? (
        <p style={{ margin: 0, color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>{subtitle}</p>
      ) : null}
    </section>
  );
}
