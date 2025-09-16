# ASCII Text Cleaner

A modern web application that removes non-ASCII characters from text with customizable options.

## Features

- **ASCII Character Filtering**: Removes all non-ASCII characters (codes 128+)
- **Em/En Dash Preservation**: Option to keep em dashes (—) and en dashes (–)
- **Character Blacklisting**: Remove specific ASCII characters you don't want
- **Dark Mode**: Clean dark/light theme toggle with localStorage persistence
- **Real-time Statistics**: Shows count of removed characters
- **Copy to Clipboard**: One-click copying of cleaned text
- **Responsive Design**: Works on desktop and mobile devices
- **Keyboard Shortcuts**:
  - Ctrl/Cmd + Enter: Clean text
  - Ctrl/Cmd + K: Clear all

## Usage

1. Paste or type your text in the input area
2. Configure options:
   - Toggle "Keep em dashes" to preserve — and – characters
   - Enter specific characters to blacklist in the text field
3. Click "Clean Text" to process
4. Copy the cleaned result with the "Copy Result" button

## Technologies Used

- HTML5
- CSS3 (with CSS Custom Properties for theming)
- Vanilla JavaScript
- Local Storage for theme persistence

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
