# `validateElement` Utility

A robust utility function for validating DOM elements or CSS selectors. Supports single and multiple inputs, ensures uniqueness, and provides clear error and warning messages for misuse.

---

## ✅ Features

* Accepts **HTMLElements**, **selector strings**, or **mixed arrays** of both.
* Optionally returns **all matching elements** with `validateAll = true`.
* Automatically filters **invalid entries** and detects **duplicates**.
* **Throws errors** for:

  * Duplicate references
  * Duplicate selectors
  * Invalid input types
  * Missing or unfound selectors
* **Warns** when the same DOM element is matched via both a reference and a selector.

---

## 📦 Installation

Just include the function in your utility module:

```js
import { validateElement } from './validateElement';
```

---

## 🔧 Usage

### Basic Validation

```js
const el = validateElement('.my-element'); // Returns the first matching element
```

### Get All Matches

```js
const allEls = validateElement('.my-element', true); // Returns array of all matches
```

### Validate a Single HTMLElement

```js
const el = document.getElementById('target');
const validated = validateElement(el); // Returns the same HTMLElement
```

### Mixed Input (Selector + Element)

```js
const el = document.querySelector('.btn');
const result = validateElement([el, '.box']); // Returns array of unique elements
```

---

## ⚠️ Warnings and Errors

### ❗ Duplicate Selector

```js
validateElement(['.item', '.item']); 
// ❌ Error: Duplicate selector provided
```

### ❗ Duplicate HTMLElement Reference

```js
const el = document.querySelector('.item');
validateElement([el, el]);
// ❌ Error: Duplicate HTMLElement reference provided
```

### ⚠️ Same DOM via Selector and Element Ref

```js
const el = document.querySelector('.item');
validateElement([el, '.item']);
// ⚠️ Warning: Duplicate element found via both selector and element reference
```

### ❗ Invalid Input Type

```js
validateElement(42); 
// ❌ Error: Invalid input: must be a selector string or an HTMLElement
```

### ❗ Selector with No Matches

```js
validateElement('.non-existent'); 
// ❌ Error: No valid HTML elements found
```

---

## 📘 API

```ts
validateElement(
  input: string | HTMLElement | Array<string | HTMLElement>,
  validateAll?: boolean
): HTMLElement | HTMLElement[]
```

* `input`: A single selector, HTMLElement, or an array of both.
* `validateAll`: If `true`, collects all elements matched by selectors (defaults to `false`).
* **Return**: If input is array or `validateAll` is `true`, returns an array. Otherwise, returns a single element.

---

## 🧪 Example

```js
const inputEl = document.querySelector('#my-input');
const result = validateElement([inputEl, '.other-class'], true);

console.log(result);
// → [HTMLElement, HTMLElement]
```
