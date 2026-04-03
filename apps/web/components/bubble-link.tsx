import Link from "next/link";

export function BubbleLink({
  href,
  title,
  description,
  showDescription = true,
}: {
  href: string;
  title: string;
  description: string;
  showDescription?: boolean;
}) {
  return (
    <Link
      href={href}
      transitionTypes={["nav-forward"]}
      className={`group relative overflow-hidden rounded-[2.25rem] border border-stone-900/10 bg-white/90 px-6 shadow-[0_18px_40px_rgba(76,48,31,0.14)] transition-transform duration-300 ease-out hover:-translate-y-1 ${
        showDescription ? "py-5" : "py-8"
      }`}
      style={{ viewTransitionName: `bubble-${title.toLowerCase()}` }}
    >
      <span className="absolute inset-x-4 top-3 h-8 rounded-full bg-amber-100/70 blur-xl transition-opacity duration-300 group-hover:opacity-90" />
      <div className="relative">
        <h3 className={`font-display text-stone-900 ${showDescription ? "text-2xl" : "text-5xl leading-none"}`}>
          {title}
        </h3>
        {showDescription ? (
          <p className="mt-2 text-sm leading-6 text-stone-600">{description}</p>
        ) : null}
      </div>
    </Link>
  );
}
