import { setLocaleAction } from "@/lib/actions/profile";

export function LocaleSwitcher({
  currentLocale,
  redirectPath,
}: {
  currentLocale: string;
  redirectPath: string;
}) {
  return (
    <form action={setLocaleAction} className="inline-flex items-center gap-2">
      <input type="hidden" name="redirect_path" value={redirectPath} />
      <select
        name="locale"
        defaultValue={currentLocale}
        className="rounded-full border border-stone-900/10 bg-white/80 px-4 py-2 text-sm text-stone-700"
      >
        <option value="en">EN</option>
        <option value="es">ES</option>
        <option value="pt-br">BR</option>
      </select>
      <button
        type="submit"
        className="rounded-full border border-stone-900/10 bg-stone-900 px-4 py-2 text-sm font-medium text-stone-50"
      >
        Save
      </button>
    </form>
  );
}
