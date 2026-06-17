export type Translations = Record<string, string>;

let currentLocale: Translations = {};

export function loadLocale(locale: Translations): void {
  currentLocale = locale;
}

export function t(key: string, ...args: string[]): string {
  let str = currentLocale[key];
  if (str === undefined) {
    console.warn(`[i18n] Missing translation key: "${key}"`);
    str = key;
  }
  args.forEach((arg, i) => {
    str = str!.replace(`{${i}}`, arg);
  });
  return str!;
}

export function getLocale(): Translations {
  return currentLocale;
}

export function applyHtmlTranslations(): void {
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (!key) return;
    const translated = t(key);
    if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
      el.placeholder = translated;
    } else if (el instanceof HTMLSelectElement) {
      el.options[0].text = translated;
    } else {
      el.textContent = translated;
    }
  });
}
