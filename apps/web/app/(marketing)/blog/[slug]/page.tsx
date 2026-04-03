import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createTranslator } from "@meet4coffee/i18n";

import { MarkdownArticle } from "@/components/markdown-article";
import { getPreferredLocale } from "@/lib/auth";
import { localizePath, toIntlLocale } from "@/lib/locale";
import { getPublishedContentBySlug } from "@/lib/services/content";

type BlogArticlePageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: BlogArticlePageProps): Promise<Metadata> {
  const locale = await getPreferredLocale();
  const t = createTranslator(locale);
  const { slug } = await params;
  const article = await getPublishedContentBySlug("blog", slug);

  if (!article) {
    return {
      title: `${t("landing.footer.blog")} | ${t("app.name")}`,
    };
  }

  return {
    title: article.seo_title ?? `${article.title} | Meet 4 Coffee`,
    description: article.seo_description ?? article.excerpt ?? undefined,
  };
}

export default async function BlogArticlePage({ params }: BlogArticlePageProps) {
  const locale = await getPreferredLocale();
  const t = createTranslator(locale);
  const intlLocale = toIntlLocale(locale);
  const { slug } = await params;
  const article = await getPublishedContentBySlug("blog", slug);

  if (!article) {
    notFound();
  }

  return (
    <main className="mx-auto min-h-screen max-w-4xl px-6 py-12 md:px-8">
      <Link
        href={localizePath("/blog", locale)}
        transitionTypes={["nav-back"]}
        className="text-sm font-medium text-stone-700 underline underline-offset-4"
      >
        {t("blog.backToIndex")}
      </Link>
      <article className="surface-card mt-5 rounded-[2.2rem] p-7 md:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-mocha-earth/70">{t("landing.footer.blog")}</p>
        <h1 className="mt-3 font-display text-5xl leading-tight text-stone-900">{article.title}</h1>
        {article.excerpt ? <p className="mt-4 text-lg leading-8 text-stone-700">{article.excerpt}</p> : null}
        <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-stone-600">
          <span>
            {article.published_at ? new Date(article.published_at).toLocaleDateString(intlLocale) : t("common.unscheduled")}
          </span>
          {article.author?.name ? <span>By {article.author.name}</span> : null}
        </div>
        <div className="mt-8">
          <MarkdownArticle body={article.body} />
        </div>
      </article>
    </main>
  );
}
