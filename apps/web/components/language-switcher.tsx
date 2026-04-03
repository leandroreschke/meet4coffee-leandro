"use client";

import { useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { setLocaleAction } from "@/lib/actions/locale";
import type { Locale } from "@meet4coffee/i18n";
import { localizePath } from "@/lib/locale";

export function LanguageSwitcher({ 
  currentLocale, 
  className,
  shortOptions = false,
  name
}: { 
  currentLocale: string; 
  className?: string;
  shortOptions?: boolean;
  name?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const isFormField = Boolean(name);

  function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    if (isFormField) {
      return;
    }

    const newLocale = e.target.value as Locale;
    startTransition(async () => {
      const localizedPath = localizePath(pathname, newLocale);
      const search = searchParams.toString();
      router.replace(search ? `${localizedPath}?${search}` : localizedPath);
      await setLocaleAction(newLocale);
      router.refresh();
    });
  }

  return (
    <select
      name={name}
      value={isFormField ? undefined : currentLocale}
      defaultValue={isFormField ? currentLocale : undefined}
      disabled={isPending}
      onChange={onChange}
      className={`appearance-none font-bold outline-none cursor-pointer disabled:opacity-50 focus:ring-2 focus:ring-mocha-earth ${className || "min-w-[8.5rem] bg-vanilla-cream text-mocha-earth px-3 py-2 rounded-full border-2 border-mocha-earth hover:bg-banana-split transition-colors"}`}
    >
      <option value="en">{shortOptions ? "🇺🇸 EN" : "🇺🇸 English"}</option>
      <option value="es">{shortOptions ? "🇪🇸 ES" : "🇪🇸 Español"}</option>
      <option value="pt-br">{shortOptions ? "🇧🇷 BR" : "🇧🇷 Português (Brasil)"}</option>
    </select>
  );
}
