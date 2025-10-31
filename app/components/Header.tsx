"use client";

export default function Header({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <header className="mb-6">
      <h1 id="card-title" className="text-2xl font-semibold leading-tight">
        {title}
      </h1>
      {subtitle && <p className="text-sm text-muted mt-1">{subtitle}</p>}
    </header>
  );
}
