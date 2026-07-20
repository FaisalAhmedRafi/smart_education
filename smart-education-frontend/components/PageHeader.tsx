export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-8 flex items-start justify-between">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">
          {title}
        </h1>
        {description && (
          <p className="mt-1 text-sm text-ink/60">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}
