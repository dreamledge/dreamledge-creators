export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-[36px] border border-dashed border-white/10 bg-white/4 p-8 text-center">
      <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
      <p className="mt-2 text-sm text-text-secondary">{description}</p>
    </div>
  );
}
