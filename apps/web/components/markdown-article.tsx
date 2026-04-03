import Link from "next/link";
import type { ReactNode } from "react";

type MarkdownArticleProps = {
  body: string;
};

function renderInline(text: string) {
  const parts = text.split(/(\[[^\]]+\]\([^)]+\))/g).filter(Boolean);

  return parts.map((part, index) => {
    const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (!linkMatch) {
      return <span key={`${part}-${index}`}>{part}</span>;
    }

    const [, label, href] = linkMatch;
    const isExternal = href.startsWith("http://") || href.startsWith("https://");

    if (isExternal) {
      return (
        <a
          key={`${href}-${index}`}
          href={href}
          target="_blank"
          rel="noreferrer"
          className="underline decoration-mocha-earth/45 underline-offset-4"
        >
          {label}
        </a>
      );
    }

    return (
      <Link key={`${href}-${index}`} href={href} className="underline decoration-mocha-earth/45 underline-offset-4">
        {label}
      </Link>
    );
  });
}

export function MarkdownArticle({ body }: MarkdownArticleProps) {
  const lines = body.split(/\r?\n/);
  const blocks: ReactNode[] = [];
  let listItems: string[] = [];

  const flushList = () => {
    if (listItems.length === 0) {
      return;
    }

    blocks.push(
      <ul key={`list-${blocks.length}`} className="list-disc space-y-2 pl-6 text-base leading-7 text-stone-700">
        {listItems.map((item, index) => (
          <li key={`${item}-${index}`}>{renderInline(item)}</li>
        ))}
      </ul>,
    );
    listItems = [];
  };

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed) {
      flushList();
      continue;
    }

    if (trimmed.startsWith("- ")) {
      listItems.push(trimmed.slice(2));
      continue;
    }

    flushList();

    if (trimmed.startsWith("### ")) {
      blocks.push(
        <h3 key={`h3-${blocks.length}`} className="font-display text-2xl text-stone-900">
          {renderInline(trimmed.slice(4))}
        </h3>,
      );
      continue;
    }

    if (trimmed.startsWith("## ")) {
      blocks.push(
        <h2 key={`h2-${blocks.length}`} className="font-display text-3xl text-stone-900">
          {renderInline(trimmed.slice(3))}
        </h2>,
      );
      continue;
    }

    if (trimmed.startsWith("# ")) {
      blocks.push(
        <h1 key={`h1-${blocks.length}`} className="font-display text-4xl text-stone-900">
          {renderInline(trimmed.slice(2))}
        </h1>,
      );
      continue;
    }

    blocks.push(
      <p key={`p-${blocks.length}`} className="text-base leading-8 text-stone-700">
        {renderInline(trimmed)}
      </p>,
    );
  }

  flushList();

  return <div className="space-y-5">{blocks}</div>;
}
