export function SectionHeader({ eyebrow, title, description }: { eyebrow: string; title: string; description?: string }) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-medium uppercase tracking-[0.35em] text-accent">{eyebrow}</p>
      <h2 className="text-2xl font-semibold tracking-tight text-text-primary sm:text-3xl">{title}</h2>
      {description ? <p className="max-w-2xl text-sm leading-6 text-text-secondary">{description}</p> : null}
    </div>
  );
}
