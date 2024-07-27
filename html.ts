import { escape } from "@std/html";

/**
 * Escapes dangerous markup to prevent XSS attacks.
 *
 * Example:
 *
 * ```ts
 * import { escapeDangerousMarkup } from "@kokomi/lamp";
 *
 * const dangerousMarkup = '<script src="inject.js></script>';
 *
 * const escaped = escapeDangerousMarkup(dangerousMarkup);
 * // =>  &lt;script src=&quot;inject.js&quot;&gt;&lt;/script&gt;
 * ```
 */
export function escapeDangerousMarkup(markup: string): string {
  return escape(markup);
}

/**
 * A template tag function that creates a string from template literals, allowing dynamic values to be safely included.
 *
 * If the value to be inserted is an array, the elements of the array are stringified and joined.
 *
 * Example:
 *
 * ```ts
 * import { html } from "@kokomi/lamp";
 *
 * const template = html`<p>Hello</p>`; // => <p>Hello</p>
 *
 * const number = 1;
 * const templateInNumber = html`<p>${number}</p>`; // => <p>1</p>
 *
 * const list = ['string', 1, true];
 * const templateInArray = html`<ul>${list.map((item) => html`<li>${item}</li>`)}</ul>`;
 * // => <ul><li>string</li><li>1</li><li>true</li></ul>
 * ```
 */
export function html(raw: readonly string[], ...values: unknown[]): string {
  const stringified = values.map(formatValue);

  const template = String.raw({ raw }, ...stringified);

  const formattedTemplate = formatTemplate(template);

  return formattedTemplate;
}

function formatValue(value: unknown) {
  if (!Array.isArray(value)) {
    return String(value);
  }
  return value.map(String).join(""); // array item format string and joined
}

function formatTemplate(template: string) {
  return template.replace(/[\t\r\n]/g, ""); // remove tab and carriage returns
}
