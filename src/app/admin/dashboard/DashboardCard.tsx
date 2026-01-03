import Link from "next/link";

type DashboardCardProps = {
  title: string;
  description: string;
  href?: string;
  cta?: string;
  comingSoon?: boolean;
};

export default function DashboardCard({
  title,
  description,
  href,
  cta,
  comingSoon = false,
}: DashboardCardProps) {
  const baseClasses = "border-3 border-gray-400 bg-white p-6 transition-colors";

  if (href) {
    return (
      <Link
        href={href}
        className={`${baseClasses} block hover:border-slate-700`}
      >
        <h2 className="mb-2 text-xl font-bold text-gray-900 uppercase">
          {title}
        </h2>
        <p className="mb-4 text-gray-600">{description}</p>
        <p className="text-sm font-bold text-slate-700 uppercase">{cta}</p>
      </Link>
    );
  }

  return (
    <div className={baseClasses}>
      <h2 className="mb-2 text-xl font-bold text-gray-900 uppercase">
        {title}
      </h2>
      <p className="text-gray-600">{description}</p>
      {comingSoon && (
        <p className="mt-4 text-sm text-gray-500">Coming soon...</p>
      )}
    </div>
  );
}
