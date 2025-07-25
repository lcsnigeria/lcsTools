/**
 * A comprehensive list of file extensions categorized by their common usage.
 * This array serves as a reference for various file types, including documents,
 * images, audio, video, archives, scripts, and more. Each file extension is 
 * accompanied by a brief description or context where applicable.
 *
 * Categories include but are not limited to:
 * - **Document formats**: Common file types for text, spreadsheets, presentations, etc.
 * - **Image formats**: Popular raster and vector image file types.
 * - **Audio formats**: Common audio file types for music and sound.
 * - **Video formats**: Widely used video file types for media playback.
 * - **Archives and compressed files**: Formats for bundling and compressing files.
 * - **Programming and scripting**: Extensions for source code and scripts in various languages.
 * - **Configuration and data files**: Formats for settings, structured data, and metadata.
 * - **3D models and virtual environments**: File types for 3D assets and virtual machines.
 * - **Certificates and security**: Extensions for cryptographic certificates and keys.
 * - **Miscellaneous**: Other file types with specific purposes.
 *
 * This list is intended for use in applications requiring file type validation,
 * categorization, or processing.
 *
 * @constant {string[]} allFileExtensions
 * @example
 * // Example usage:
 * if (allFileExtensions.includes('pdf')) {
 *   console.log('PDF is a supported file type.');
 * }
 */
export const allFileExtensions = [
    'abw',
    'arc',
    'azw',
    'bin', // Generic binary
    'bz',
    'bz2',
    'cda',
    'csh',
    'eot',
    'epub',
    'gz',
    'jar',
    'jsonld',
    'midi', // (or mid)
    'mjs', // JavaScript module
    'mpkg',
    'odp',
    'ods',
    'odt',
    'ogv', // Ogg video
    'ogx', // Ogg application
    'otf',
    'rtf',
    'tar',
    'ts', // TypeScript OR MPEG Transport Stream
    'ttf',
    'vsd',
    'weba', // WebM audio
    'woff',
    'woff2',
    'xhtml',
    'dtd',
    'zip',
    '7z',
    'ics',
    'eml',
    'mht',
    'mhtml',
    'nws',
    'glb', // GL Transmission Format Binary
    'gltf', // GL Transmission Format
    'iges', // (or igs)
    'step', // (or stp)
    'stl',
    'dwf',
    'gdl',
    'gtw',
    'mts', // AVCHD video
    'vtu',
    'x3d',
    'x3db',
    'x3dv',
    'flv',
    'wmv',
    'rar',
    'swf',
    'mdb',
    'accdb',
    'cab',
    'exe',
    'dll',
    'dmg',
    'apk',
    'iso',
    'deb',
    'rpm',
    'asm', // Assembly language
    'bat', // Batch file
    'class', // Java class file
    'diff', // Difference file
    'eps', // Encapsulated PostScript
    'fla', // Adobe Animate/Flash source
    'h', // C/C++ header
    'hpp', // C++ header
    'hxx', // C++ header
    'inc', // Include file (various languages)
    'java', // Java source
    'jsp', // JavaServer Pages
    'key', // Apple Keynote Presentation
    'log', // Log file
    'lua', // Lua script
    'm', // Objective-C or MATLAB
    'md', // Markdown (replaced 'markdown' with standard 'md')
    'msg', // Outlook Mail Message
    'o', // Object file
    'pages', // Apple Pages document
    'patch', // Patch file
    'pdb', // Program Database
    'psd', // Adobe Photoshop
    'r', // R language
    'rpm', // Red Hat Package Manager
    'sass', // Syntactically Awesome Style Sheets
    'scss', // Sassy CSS
    'sitx', // StuffIt X Archive
    'sln', // Visual Studio Solution
    'srt', // SubRip Subtitle
    'sys', // System file
    'tex', // LaTeX source
    'tmp', // Temporary file
    'torrent', // BitTorrent file
    'vb', // Visual Basic
    'vcf', // vCard File
    'vcxproj', // Visual Studio C++ Project
    'xcf', // GIMP image
    'xz', // XZ compressed archive
    'z', // Unix compress archive
    'bak', // Backup file
    'cfg', // Configuration file
    'ipynb', // IPython Notebook
    'less', // LESS stylesheet language
    'phar', // PHP Archive
    'toml', // TOML configuration file
    'vtt', // WebVTT (Web Video Text Tracks)
    'jpg',    // Image format
    'jpeg',   // Image format
    'png',    // Image format
    'gif',    // Image format
    'bmp',    // Image format
    'tiff',   // Image format
    'svg',    // Image format
    'webp',   // Image format
    'mp3',    // Audio format
    'wav',    // Audio format
    'aac',    // Audio format
    'flac',   // Audio format
    'ogg',    // Audio format
    'mp4',    // Video format
    'avi',    // Video format
    'mov',    // Video format
    'mkv',    // Video format
    'webm',   // Video format
    'pdf',    // Document format
    'doc',    // Document format
    'docx',   // Document format
    'xls',    // Document format
    'xlsx',   // Document format
    'ppt',    // Document format
    'pptx',   // Document format
    'txt',    // Document format
    'py',     // Python script
    'c',      // C source
    'cpp',    // C++ source
    'cs',     // C# source
    'php',    // PHP script
    'rb',     // Ruby script
    'go',     // Go source
    'swift',  // Swift source
    'kt',     // Kotlin source
    'rs',     // Rust source
    'ini',    // Configuration file
    'conf',   // Configuration file
    'yaml',   // Configuration file
    'yml',    // Configuration file
    'json',   // Data file
    'htm',    // Web file
    'html',   // Web file
    'css',    // Web file
    'js',     // Web file
    'jsx',    // React component
    'tsx',    // TypeScript React component
    'sql',    // SQL script
    'xml',    // Data file
    'csv',    // Data file
    'tsv',    // Data file
    'obj',    // 3D model file
    'fbx',    // 3D model file
    'dae',    // 3D model file
    'blend',  // 3D model file (Blender)
    'vmdk',   // Virtual machine disk
    'ova',    // Virtual appliance
    'ovf',    // Open Virtualization Format
    'pem',    // Certificate file
    'crt',    // Certificate file
    'cer',    // Certificate file
    'p12',    // Certificate file
    'sub',    // Subtitle file
    'sh',     // Shell script
    'ps1'     // PowerShell script
];

/**
 * A comprehensive list of MIME types used to identify the format of files.
 * This array includes MIME types for various file formats such as applications,
 * audio, fonts, images, messages, models, text, and videos.
 *
 * Each MIME type is represented as a string and may include comments indicating
 * the associated file extensions or additional context.
 *
 * @constant
 * @type {string[]}
 * @example
 * // Example usage:
 * if (allFileMimeTypes.includes('application/json')) {
 *   console.log('JSON MIME type is supported.');
 * }
 */
export const allFileMimeTypes = [
    'application/octet-stream', // Default for binary files
    'application/x-abiword',
    'application/x-freearc',
    'application/vnd.amazon.ebook',
    'application/x-bzip',
    'application/x-bzip2',
    'application/x-cdf',
    'application/x-csh',
    'application/epub+zip',
    'application/gzip',
    'application/java-archive',
    'application/ld+json',
    'application/vnd.apple.installer+xml',
    'application/vnd.oasis.opendocument.presentation',
    'application/vnd.oasis.opendocument.spreadsheet',
    'application/vnd.oasis.opendocument.text',
    'application/ogg',
    'application/rtf',
    'application/x-sh',
    'application/x-tar',
    'application/vnd.visio',
    'application/xhtml+xml',
    'application/xml-dtd',
    'application/zip',
    'application/x-7z-compressed',
    'application/vnd.ms-fontobject', // For .eot
    'application/vnd.rar', // For .rar
    'application/x-shockwave-flash', // For .swf
    'application/vnd.ms-access', // For .mdb, .accdb
    'application/vnd.ms-cab-compressed', // For .cab
    'application/x-msdownload', // For .exe, .dll
    'application/x-apple-diskimage', // For .dmg
    'application/vnd.android.package-archive', // For .apk
    'application/x-iso9660-image', // For .iso
    'application/vnd.debian.binary-package', // For .deb
    'application/x-redhat-package-manager', // For .rpm
    'application/x-sql', // For .sql (though text/plain is also used)
    'application/x-httpd-php', // For .php (often configured server-side)
    'application/json', // For .json
    'application/pdf', // For .pdf
    'application/vnd.ms-excel', // For .xls
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // For .xlsx
    'application/vnd.ms-powerpoint', // For .ppt
    'application/vnd.openxmlformats-officedocument.presentationml.presentation', // For .pptx
    'application/msword', // For .doc
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // For .docx
    'application/x-perl', // For .pl, .pm
    'application/x-ruby', // For .rb
    'application/x-shellscript', // For .sh (alternative to application/x-sh)
    'application/x-msi', // For .msi
    'application/x-ns-proxy-autoconfig', // For .pac
    'application/x-matroska', // For .mkv
    'application/vnd.sqlite3', // For .sqlite, .db
    'application/x-font-sfnt', // For .ttf, .otf (alternative)
    'application/wasm', // For .wasm
    'application/x-xz', // For .xz
    'application/x-zstd', // For .zst
    'application/vnd.google-earth.kml+xml', // For .kml
    'application/vnd.google-earth.kmz', // For .kmz
    'application/x-photoshop', // For .psd
    'application/postscript', // For .ps, .eps
    'application/x-latex', // For .latex, .tex
    'application/x-troff', // For .man, .me, .ms


    'audio/midi',
    'audio/x-midi',
    'audio/webm',


    'font/otf',
    'font/ttf',
    'font/woff',
    'font/woff2',


    'image/apng',
    'image/avif',
    'image/vnd.microsoft.icon', // More specific than x-icon for .ico


    'message/rfc822', // For .eml, .mht, .mhtml, .nws


    'model/gltf+json', // For .gltf
    'model/gltf-binary', // For .glb
    'model/iges',
    'model/step', // For .stp, .step
    'model/stl',
    'model/vnd.dwf',
    'model/vnd.gdl',
    'model/vnd.gtw',
    'model/vnd.mts',
    'model/vnd.vtu',
    'model/x3d+xml',
    'model/x3d+binary',
    'model/x3d+vrml',


    'text/calendar', // For .ics
    'text/javascript', // Often preferred over application/javascript for .js
    'text/markdown', // For .md
    'text/x-c',
    'text/x-java-source',
    'text/x-python',
    'text/yaml', // For .yaml, .yml


    'video/x-flv',
    'video/mp2t', // For .ts (MPEG transport stream)
    'video/x-ms-wmv',


    'audio/mpeg', // For .mp3
    'audio/ogg', // For .oga
    'audio/wav', // For .wav


    'image/bmp', // For .bmp
    'image/gif', // For .gif
    'image/jpeg', // For .jpg, .jpeg
    'image/png', // For .png
    'image/svg+xml', // For .svg
    'image/tiff', // For .tif, .tiff
    'image/webp', // For .webp


    'text/css', // For .css
    'text/csv', // For .csv
    'text/html', // For .html, .htm
    'text/plain', // For .txt
    'text/xml', // For .xml


    'video/mp4', // For .mp4
    'video/mpeg', // For .mpeg
    'video/ogg', // For .ogv
    'video/webm', // For .webm


    'text/vcard', // For .vcf
    'text/x-diff', // For .diff, .patch
    'text/x-go', // For .go
    'text/x-lua', // For .lua
    'text/x-rust', // For .rs
    'text/x-typescript', // For .ts, .tsx
];

/**
 * An array of text-based file extensions for formats that are human-readable,
 * such as programming languages, markup, configuration files, and plain text.
 * Used for file validation or to skip non-text-based processing (e.g., aspect ratio checks).
 *
 * @type {string[]}
 * @example
 * console.log(textFileExtensions.includes('js')); // true
 * console.log(textFileExtensions.includes('jpg')); // false
 */
export const textFileExtensions = [
    'asm',    // Assembly language
    'bat',    // Batch file
    'c',      // C source
    'cfg',    // Configuration file
    'conf',   // Configuration file
    'cpp',    // C++ source
    'cs',     // C# source
    'css',    // Cascading Style Sheets
    'csv',    // Comma-separated values
    'diff',   // Difference file
    'go',     // Go source
    'h',      // C/C++ header
    'hpp',    // C++ header
    'hxx',    // C++ header
    'htm',    // HTML
    'html',   // HTML
    'inc',    // Include file (various languages)
    'ini',    // Configuration file
    'java',   // Java source
    'js',     // JavaScript
    'json',   // JSON data
    'jsx',    // React JavaScript
    'kt',     // Kotlin source
    'less',   // LESS stylesheet
    'log',    // Log file
    'lua',    // Lua script
    'm',      // Objective-C or MATLAB
    'md',     // Markdown
    'patch',  // Patch file
    'php',    // PHP script
    'py',     // Python script
    'r',      // R language
    'rb',     // Ruby script
    'rs',     // Rust source
    'sass',   // Syntactically Awesome Style Sheets
    'scss',   // Sassy CSS
    'sh',     // Shell script
    'sql',    // SQL script
    'swift',  // Swift source
    'tex',    // LaTeX source
    'toml',   // TOML configuration
    'ts',     // TypeScript
    'tsx',    // TypeScript React
    'txt',    // Plain text
    'vb',     // Visual Basic
    'xml',    // XML data
    'yaml',   // YAML configuration
    'yml'     // YAML configuration
];

/** * An array of file extensions that are commonly used for archive and compressed files.
 * These extensions are typically used for bundling multiple files into a single file,
 * often with compression to reduce size.
 *
 * @type {string[]}
 * @example
 * console.log(archiveFileExtensions.includes('zip')); // true
 * console.log(archiveFileExtensions.includes('txt')); // false
 */
export const archiveFileExtensions = [
    'zip',   // ZIP archive
    'rar',   // RAR archive
    'tar',   // TAR archive
    'gz',    // GZIP archive
    'targz', // GZIP archive (tarball)
    '7z',    // 7-Zip archive
];