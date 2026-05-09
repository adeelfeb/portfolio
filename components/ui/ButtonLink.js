import Link from 'next/link';

function cx(...parts) {
  return parts.filter(Boolean).join(' ');
}

/**
 * Reusable fully-clickable "button" built on Next.js Link.
 * Keeps text on one line and removes underline by default.
 */
export default function ButtonLink({
  href,
  children,
  className = '',
  variant = 'primary',
  ...props
}) {
  const base =
    'inline-flex items-center justify-center whitespace-nowrap select-none no-underline cursor-pointer transition-all';

  const variants = {
    primary:
      'px-6 py-3 rounded-xl font-semibold text-white bg-slate-900 hover:bg-slate-800',
    outline:
      'px-6 py-3 rounded-xl font-semibold text-slate-900 bg-white border border-slate-200 hover:border-slate-300 hover:shadow-sm',
    emerald:
      'px-6 py-3 rounded-xl font-semibold text-emerald-800 bg-emerald-100 hover:bg-emerald-200',
    gradient:
      'px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:shadow-lg hover:scale-[1.01]',
  };

  return (
    <Link
      href={href}
      className={cx(base, variants[variant] || variants.primary, className)}
      {...props}
    >
      {children}
    </Link>
  );
}

