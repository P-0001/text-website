# ASCII Text Cleaner

A modern web application that removes non-ASCII characters from text with customizable options, real-time statistics, and a diff view.

## Features

- **ASCII Character Filtering**: Removes all non-ASCII characters (codes 128+)
- **Three-Tab Interface**:
  - **Clean** — Input/output with options panel and live statistics
  - **Diff** — Visual difference view of removed vs. retained characters
  - **Stats** — Detailed character analysis and text structure breakdown
- **Character Blacklisting**: Remove specific ASCII characters you don't want
- **Character Whitelisting**: Keep specific non-ASCII characters
- **Em/En Dash Preservation**: Option to keep em dashes (—) and en dashes (–)
- **Additional Cleaning Options**:
  - Remove hidden/invisible characters
  - Convert non-breaking spaces
  - Convert ellipsis to three dots
  - Remove trailing whitespace
  - Remove asterisks
  - Remove markdown headings
  - Convert lookalike characters (ligatures)
  - Normalize Unicode forms (NFC)
- **File Upload/Download**: Upload `.txt`/`.md` files and download cleaned output
- **Real-time Statistics**: Live character counts, removal rate gauge, line/word/paragraph counts
- **Cursor Position Tracking**: Shows current line and column in the input area
- **Dark/Light Theme**: Toggle with SVG icons, defaults to dark mode, persisted in localStorage
- **Copy to Clipboard**: One-click copying of cleaned text
- **Responsive Design**: Three-column layout on desktop, stacked on mobile
- **Keyboard Shortcuts**:
  - Ctrl/Cmd + Enter: Clean text
  - Ctrl/Cmd + K: Clear all

## Usage

1. Paste, type, or upload text in the input area
2. Configure options in the middle panel (blacklist, whitelist, checkboxes)
3. Click "Clean Text" or use Ctrl/Cmd + Enter
4. View statistics in the right panel
5. Copy or download the cleaned result

## Technologies Used

- HTML5
- CSS3 (with CSS Custom Properties for theming)
- Vanilla JavaScript
- Local Storage for settings persistence
- IndexedDB for input text persistence
- Inline SVG icons

## Project Structure

```
text-website/
  index.html       Main HTML
  index.js         Application logic
  static/
    main.css       Styles
    favicon.ico    Favicon
    logo_1024x1024.png  Logo image
  tests/
    test.js        Unit tests
```

## Live Demo

Visit the live application: [ASCII Text Cleaner](https://p-0001.github.io/text-website/)

## Local Development

1. Clone the repository
2. Open `index.html` in your browser
3. Or serve with a local HTTP server:
   ```bash
   python -m http.server 8000
   ```

## License

MIT License - feel free to use and modify as needed.