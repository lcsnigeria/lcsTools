# 📦 LCS Tools (JavaScript Utilities)

**A powerful frontend JavaScript toolkit by [LCS](https://lcs.ng) — utilities for building faster, cleaner, and more interactive web apps.**

LCS Tools is a collection of ready-to-use JavaScript tools designed to enhance UX in web apps. These utilities offer common UI enhancements such as OTP input handling, password visibility toggling, and geolocation with reverse geocoding — all implemented in a lightweight, dependency-free manner.

---

## 🌐 Features

- ✅ Easy-to-use utility functions and classes
- 🛠️ Tools for DOM handling, events, and user interaction
- 📍 Location detection
- 📤 File upload helper (coming soon)
- 🔐 Password toggle
- 🔄 Lightweight and modular
- 🧩 Browser-friendly (`<script>`) or Node-compatible (`require` / `import`)
- 🔒 Obfuscated for production use via Webpack

---

## 📦 Installation

### CDN (Browser)

```html
<script src="https://unpkg.com/lcs_tools@latest/dist/lt.min.js"></script>
<script>
  // Access via global namespace
  lcsTools.getCurrentLocation().then(console.log);
</script>
```

> ✅ When using via CDN, all exports are available under the `lcsTools` global object.

---

### NPM (Node / Build Tools)

```bash
npm install lcs_tools
```

Then in your code:

```js
// ESModule
import { getCurrentLocation } from 'lcs_tools';

// CommonJS
const { getCurrentLocation } = require('lcs_tools');
```

---

## 🚀 Usage Examples

### 📍 `getCurrentLocation()`

Fetch the current browser location with graceful fallback:

```js
lcsTools.getCurrentLocation()
  .then((locationText) => {
    console.log('Your location:', locationText);
  })
  .catch((err) => {
    console.warn('Location error:', err);
  });
```

Returns a promise that resolves to:

```plaintext
12 Yemi Car Wash Off Freedom Way, Itedo, Lekki Phase I, Lagos State, Nigeria
```

---

## 🔢 OTP Input Validation

**Purpose:**  
Manages OTP (One-Time Password) inputs with seamless auto-focus and input aggregation.

**Features:**
- Supports digit-only input
- Automatically jumps to the next field on valid input
- Moves to the previous input field on backspace
- Aggregates all inputs into a hidden field for submission

**Expected HTML Structure:**
```html
<div class="_otp_block">
  <div class="_otp_inputs">
    <input type="text" maxlength="1" />
    <input type="text" maxlength="1" />
    <input type="text" maxlength="1" />
    <input type="text" maxlength="1" />
  </div>
  <input type="hidden" name="otp" />
</div>
```

**Notes:**
- The final OTP string is automatically inserted into the hidden input field.

---

## 🔐 Password Visibility Toggle

**Purpose:**  
Allows toggling of password fields between `text` and `password`, improving user experience during login or sign-up.

**Features:**
- Click to show/hide password
- Dynamically changes the toggle button text (`Show` / `Hide`)

**Expected HTML Structure:**
```html
<div class="_form_password_wrapper">
  <input type="password" class="_password_input" />
  <button type="button" class="_show_hide_password">Show</button>
</div>
```

**Notes:**
- The button label updates automatically.
- Works on dynamically added elements too.

---

## 📍 Geolocation + Reverse Geocoding

**Purpose:**  
Fetches the user's current location, converts it to a human-readable address using OpenStreetMap’s **Nominatim API**, and inserts it into a specified field.

**Key Features:**
- Fully custom modal alert for user interaction
- Geolocation permission awareness
- Reverse geocoding to address string
- Compatible with both `input` fields and `contentEditable` elements
- Input fallback on failure

**Expected HTML Structure:**
```html
<input type="text" id="locationInput" placeholder="Your location will appear here">
<button class="lcsGetCurrentLocation" data-get_value="locationInput">Get Location</button>
```

**Usage Flow:**
1. User clicks the button with class `lcsGetCurrentLocation`.
2. A custom modal appears asking for permission (if required).
3. On approval, the location is fetched and resolved to a readable address.
4. The address is inserted into the targeted input or editable field.

**Permissions Handling:**
- Detects if permission is already granted, denied, or needs to be asked.
- Displays custom prompts accordingly.

**APIs Used:**
- `navigator.geolocation` for coordinates
- OpenStreetMap's [Nominatim Reverse Geocoding API](https://nominatim.openstreetmap.org/) for address resolution

**Failure Scenarios:**
- Geolocation unsupported
- Permission denied or dismissed
- No internet connection
- Input field target not found

**Fallback:**
If the address can't be fetched, the input is reset to its previous value.

---

## 💡 Best Practices

- Make sure each tool is wrapped in appropriate HTML structure.
- These tools rely on event delegation, so dynamic elements are supported out of the box.
- Use minimal styling overrides to ensure visual consistency if customizing the modals.

---

## 🧩 Integration Example
```html
<!-- OTP -->
<div class="_otp_block">
  <div class="_otp_inputs">
    <input type="text" maxlength="1">
    <input type="text" maxlength="1">
    <input type="text" maxlength="1">
    <input type="text" maxlength="1">
  </div>
  <input type="hidden" name="otp">
</div>

<!-- Password -->
<div class="_form_password_wrapper">
  <input type="password" class="_password_input" />
  <button class="_show_hide_password">Show</button>
</div>

<!-- Location -->
<input type="text" id="locationInput">
<button class="lcsGetCurrentLocation" data-get_value="locationInput">Get Location</button>
```

### 📤 `lcsUploadFile(...)` _(coming soon)_

Will support file upload with:
- progress tracking
- size/format validations
- server endpoint options

Stay tuned.

---

## 📁 Project Structure

```
lcs_tools/
├── dist/               # Bundled, obfuscated output
│   └── lt.min.js
├── src/                # Source modules
│   ├── index.js        # Main export entry
│   ├── location.js     # Location utility
│   ├── password.js     # Password toggle
│   └── ...more coming
├── webpack.config.js   # Build + Obfuscation
├── jsdoc.json          # Auto documentation
├── package.json
└── README.md
```

---

## 🧑‍💻 Contributing

Want to add a utility or improve one?

```bash
git clone https://github.com/lcsnigeria/lcs_tools.git
cd lcs_tools
npm install
npm run build
```

All source files live in `/src`. Just export any new functions or classes from `index.js` to include them in the final build.

> ✅ Contributions should be modular and documented using JSDoc comments.

---

## 📄 Documentation

Auto-generated from source using `JSDoc`. Build with:

```bash
npm run build
```

This will generate the HTML docs in a `docs/` folder (optionally host via GitHub Pages later).

---

## 📈 Versioning

Versioned using [standard-version](https://github.com/conventional-changelog/standard-version):

```bash
npm run release
```

This will:
- Bump the version (based on commit types)
- Tag the commit
- Generate a changelog
- Push and publish the release

---

## 📃 License

MIT License  

---

## 👨‍💻 Author
**Chinonso Frewen Justice** — [JCFuniverse](https://lcs.ng/jcfuniverse)
Founder & CEO, Loaded Channel Solutions (LCS)  
© 2025 - 🌐 [https://lcs.ng](https://lcs.ng) | 📧 justicefrewen@gmail.com

---

## 🔗 Links

- 🧰 GitHub Repo: [lcsnigeria/lcs_tools](https://github.com/lcsnigeria/lcs_tools)
- 🧪 NPM Package: [npmjs.com/package/lcs_tools](https://www.npmjs.com/package/lcs_tools)
- 📚 Docs: _Coming soon..._