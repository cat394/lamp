# Lamp - light weight Web App tools

This is a package that provides minimal tools useful for web development.

> [!NOTE]
> Any tab or newline characters in the template will be replaced with an
> empty string.

> [!NOTE]
> Starting with version 2, this package no longer ships escaping functions, so please install a separate package such as lodash that has escaping functions.

This package currently includes the following tools:

- HTML

  - `html` function for generating templates.

## Usage:

- HTML

  Any value passed to the tag function is stringified. If the value to be
  inserted is an array, the elements of the array are stringified and joined.

  ```ts
  import { escapeDangerousMarkup, html } from "@kokomi/lamp";

  const template = html`<p>Hello</p>`; // => <p>Hello</p>

  const number = 1;
  const templateInNumber = html`<p>${number}</p>`; // => <p>1</p>

  const list = ["string", 1, true];
  const templateInArray = html`<ul>${
    list.map((item) => html`<li>${item}</li>`)
  }</ul>`;
  // => <ul><li>string</li><li>1</li><li>true</li></ul>
  ```

  > [!CAUTION]
  > The `html` function **do not escape markup**, so be sure to
  > manually escape any potentially dangerous content from your users.

  ```ts
  const dangerousMarkup = '<script src="inject.js"></script>';
  const template = html`<p>${dangerousMarkup}</p>`;
  // => <p><script src="inject.js"></script></p> - ❌︎ XSS attack!
  ```

## Licence

MIT
