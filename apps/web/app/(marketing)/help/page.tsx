import Link from "next/link";
import { createTranslator } from "@meet4coffee/i18n";

import { getPreferredLocale } from "@/lib/auth";
import { localizePath } from "@/lib/locale";
import { listPublishedContent } from "@/lib/services/content";

function normalize(value: string) {
  return value.trim().toLowerCase();
}

export default async function HelpCenterPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string; tag?: string }>;
}) {
  const locale = await getPreferredLocale();
  const t = createTranslator(locale);
  const params = searchParams ? await searchParams : undefined;
  const query = typeof params?.q === "string" ? normalize(params.q) : "";
  const tag = typeof params?.tag === "string" ? normalize(params.tag) : "";

  const items = await listPublishedContent("help");
  const tags = Array.from(new Set(items.flatMap((item) => item.tags))).sort((a, b) => a.localeCompare(b));

  const filteredItems = items.filter((item) => {
    const matchesQuery =
      query.length === 0 ||
      normalize(item.title).includes(query) ||
      normalize(item.excerpt ?? "").includes(query) ||
      item.tags.some((itemTag) => normalize(itemTag).includes(query));

    const matchesTag = tag.length === 0 || item.tags.some((itemTag) => normalize(itemTag) === tag);

    return matchesQuery && matchesTag;
  });

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-6 py-12 md:px-8">
      <section className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-mocha-earth/70">{t("landing.footer.help")}</p>
        <h1 className="font-display text-5xl text-stone-900">{t("help.title")}</h1>
        <p className="max-w-2xl text-base leading-7 text-stone-700">
          {t("help.description")}
        </p>
      </section>

      <section className="surface-card mt-8 rounded-[2rem] p-5">
        <form className="grid gap-3 md:grid-cols-[1fr_220px_auto] items-end">
          <label className="block w-full">
            <span className="sr-only">Search query</span>
            <input
              type="search"
              name="q"
              defaultValue={query}
              placeholder={t("help.filterSearchPlaceholder")}
              className="w-full rounded-2xl border border-mocha-earth/15 bg-white px-4 py-3"
            />
          </label>
          <label className="block w-full">
            <span className="sr-only">Filter by tag</span>
            <select name="tag" defaultValue={tag} className="w-full rounded-2xl border border-mocha-earth/15 bg-white px-4 py-3">
              <option value="">{t("help.filterAllTags")}</option>
              {tags.map((itemTag) => (
                <option key={itemTag} value={itemTag}>
                  {itemTag}
                </option>
              ))}
            </select>
          </label>
          <button
            type="submit"
            className="rounded-full bg-mocha-earth px-5 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-vanilla-cream"
          >
            {t("help.filterButton")}
          </button>
        </form>
      </section>

      <section className="mt-8 space-y-4">
        {filteredItems.length === 0 ? (
          <div className="surface-card rounded-[1.8rem] p-6 text-sm text-stone-700">
            {t("help.noMatches")}
          </div>
        ) : (
          filteredItems.map((item) => (
            <article key={item.id} className="surface-card rounded-[1.8rem] p-6">
              <h2 className="font-display text-3xl text-stone-900">
                <Link
                  href={localizePath(`/help/${item.slug}`, locale)}
                  transitionTypes={["nav-forward"]}
                  className="underline-offset-4 hover:underline"
                >
                  {item.title}
                </Link>
              </h2>
              {item.excerpt ? <p className="mt-3 text-base leading-7 text-stone-700">{item.excerpt}</p> : null}
              {item.tags.length > 0 ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {item.tags.map((itemTag) => (
                    <span
                      key={`${item.id}-${itemTag}`}
                      className="rounded-full border border-mocha-earth/15 bg-white px-3 py-1 text-xs uppercase tracking-[0.14em] text-stone-700"
                    >
                      {itemTag}
                    </span>
                  ))}
                </div>
              ) : null}
            </article>
          ))
        )}
      </section>
    </main>
  );
}
