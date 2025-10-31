"use client";

export default function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`mx-auto bg-surface rounded-base card-shadow ${className}`}
      role="region"
      aria-labelledby="card-title"
    >
      {children}
    </div>
  );
}
