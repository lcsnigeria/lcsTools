/**
 * An object mapping common file extensions and language identifiers to their corresponding
 * code language names. This mapping is useful for syntax highlighting, code parsing,
 * and language detection in code editors or file viewers.
 *
 * @typedef {Object} codeLanguageMappings
 * @example
 * // Get the code language for a JavaScript file extension
 * const lang = codeLanguageMappings['js']; // 'javascript'
 */
export const codeLanguageMappings = {
  abap: 'abap', // ABAP programming language
  ada: 'ada', // Ada programming language
  aes: 'aes', // AES scripting language
  bat: 'bat', // Windows Batch file
  c: 'c', // C programming language
  clj: 'clojure', // Clojure programming language
  cls: 'apex', // Apex programming language
  coffee: 'coffeescript', // CoffeeScript programming language
  cpp: 'cpp', // C++ programming language
  cs: 'csharp', // C# programming language
  css: 'css', // CSS stylesheet language
  d: 'd', // D programming language
  dart: 'dart', // Dart programming language
  docker: 'dockerfile', // Dockerfile scripting language
  ejs: 'ejs', // Embedded JavaScript templates
  ex: 'elixir', // Elixir programming language
  elm: 'elm', // Elm programming language
  erl: 'erlang', // Erlang programming language
  f90: 'fortran', // Fortran programming language
  fs: 'fsharp', // F# programming language
  go: 'go', // Go programming language
  groovy: 'groovy', // Groovy programming language
  hbs: 'handlebars', // Handlebars template language
  html: 'html', // HTML markup language
  ini: 'ini', // INI configuration file
  java: 'java', // Java programming language
  js: 'javascript', // JavaScript programming language
  json: 'json', // JSON data format
  jl: 'julia', // Julia programming language
  kt: 'kotlin', // Kotlin programming language
  less: 'less', // LESS stylesheet language
  lua: 'lua', // Lua programming language
  md: 'markdown', // Markdown markup language
  mysql: 'mysql', // MySQL database language
  m: 'objective-c', // Objective-C programming language
  pas: 'pascal', // Pascal programming language
  pl: 'perl', // Perl programming language
  pgsql: 'pgsql', // PostgreSQL database language
  php: 'php', // PHP scripting language
  ps1: 'powershell', // PowerShell scripting language
  py: 'python', // Python programming language
  r: 'r', // R programming language
  rb: 'ruby', // Ruby programming language
  rs: 'rust', // Rust programming language
  sass: 'sass', // SASS stylesheet language
  scala: 'scala', // Scala programming language
  scss: 'scss', // SCSS stylesheet language
  sh: 'shell', // Shell scripting language
  sol: 'solidity', // Solidity smart contract language
  sql: 'sql', // SQL database language
  swift: 'swift', // Swift programming language
  tcl: 'tcl', // TCL scripting language
  ts: 'typescript', // TypeScript programming language
  txt: 'plaintext', // Plaintext
  vb: 'vb', // Visual Basic programming language
  xml: 'xml', // XML markup language
  yaml: 'yaml' // YAML data serialization language
};

/**
 * An array of all valid language identifiers supported by Monaco Editor.
 * This is derived from the values of codeLanguageMappings.
 *
 * @type {string[]}
 * @example
 * // Check if a language is supported
 * const isSupported = codeLanguages.includes('javascript'); // true
 */
export const codeLanguages = Object.values(codeLanguageMappings);

/**
 * Validates a language abbreviation by checking if it exists in codeLanguageMappings
 * and corresponds to a valid Monaco Editor language identifier.
 *
 * @param {string} lang - The language abbreviation to validate (e.g., 'js', 'py').
 * @returns {string|null} The validated language identifier (e.g., 'javascript') or null if invalid.
 * @example
 * const lang = validateCodeLanguage('js'); // Returns 'javascript'
 * const invalidLang = validateCodeLanguage('xyz'); // Returns null
 */
export function validateCodeLanguage(lang) {
  if (!lang) return null;
  const lowercasedLang = lang.toLowerCase(lang);
  const mappedLang = codeLanguageMappings[lowercasedLang] || lowercasedLang;
  const validatedLanguage = codeLanguages.includes(mappedLang) ? mappedLang.trim() : null;
  return validatedLanguage;
}