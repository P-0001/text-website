//67
document.addEventListener('DOMContentLoaded', function () {

    const get = (e) => document.getElementById(e);

    // Get DOM elements
    // bro this is js ik its not pretty but u dont need jquey in 2025 #savethebytes
    const inputText = get('input-text');
    const outputText = get('output-text');
    const cleanBtn = get('clean-btn');
    const clearBtn = get('clear-btn');
    const copyBtn = get('copy-btn');
    const copyStatus = get('copy-status');
    const keepEmDashesCheckbox = get('keep-em-dashes');
    const blacklistInput = get('blacklist-letters');
    const themeToggle = get('theme-toggle');
    const themeIcon = get('theme-icon');

    // Function to remove non-ASCII characters with options
    function removeNonAsciiCharacters(text = "", options = {}) {
        const { keepEmDashes = false, blacklistChars = '' } = options;

        let result = text;

        // @todo add whitelist chars

        // First, remove non-ASCII characters
        // ASCII characters have codes 0-127
        result = result.replace(/[^\x00-\x7F]/g, (match) => {
            // If keeping em/en dashes, preserve them
            if (keepEmDashes && (match === '—' || match === '–')) {
                return match;
            }
            return '';
        });

        // Then, remove blacklisted characters (even if they are ASCII)
        if (blacklistChars) {
            // Escape special regex characters in the blacklist
            const escapedChars = blacklistChars.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const blacklistRegex = new RegExp(`[${escapedChars}]`, 'g');
            result = result.replace(blacklistRegex, '');
        }

        return result;
    }

    let showInit;
    // Function to show status message
    function showStatus(message, isSuccess = true) {
        copyStatus.textContent = message;
        copyStatus.className = `status-message show ${isSuccess ? 'success' : 'error'}`;

        if (showInit) clearTimeout(showInit);

        // Hide the message after 5 seconds
        showInit = setTimeout(() => {
            copyStatus.classList.remove('show');
        }, 5000);
    }

    // Clean text function
    function cleanText() {
        const input = inputText.value;

        if (!input.trim()) {
            showStatus('Please enter some text to clean', false);
            return;
        }

        // Get options
        const options = {
            keepEmDashes: keepEmDashesCheckbox.checked,
            blacklistChars: blacklistInput.value
        };

        const cleaned = removeNonAsciiCharacters(input, options);
        outputText.value = cleaned;

        // Show statistics
        const originalLength = input.length;
        const cleanedLength = cleaned.length;
        const removedCount = originalLength - cleanedLength;

        if (removedCount > 0) {
            let statusMessage = `Removed ${removedCount} character${removedCount === 1 ? '' : 's'}`;
            if (options.keepEmDashes) {
                statusMessage += ' (kept em/en dashes)';
            }
            if (options.blacklistChars) {
                statusMessage += ` (blacklisted: ${options.blacklistChars})`;
            }
            showStatus(statusMessage, true);
        } else {
            showStatus('No characters removed', true);
        }
    }

    // Clear all text
    function clearAll() {
        inputText.value = '';
        outputText.value = '';
        copyStatus.classList.remove('show');
        inputText.focus();
    }

    // Copy result to clipboard
    async function copyResult() {
        const text = outputText.value;

        if (!text.trim()) {
            showStatus('No text to copy', false);
            return;
        }

        try {
            await navigator.clipboard.writeText(text);
            showStatus('Copied to clipboard!', true);
        } catch (err) {
            // Fallback for older browsers
            try {
                outputText.select();
                document.execCommand('copy');
                showStatus('Copied to clipboard!', true);
            } catch (fallbackErr) {
                showStatus('Failed to copy text', false);
            }
        }
    }

    // Event listeners
    cleanBtn.addEventListener('click', cleanText);
    clearBtn.addEventListener('click', clearAll);
    copyBtn.addEventListener('click', copyResult);

    // Real-time cleaning option (optional - can be enabled)
    // Uncomment the following lines if you want real-time cleaning as user types

    inputText.addEventListener('input', function (e) {
        e.preventDefault();
        if (this.value.trim()) {
            const cleaned = removeNonAsciiCharacters(this.value);
            outputText.value = cleaned;
        } else {
            outputText.value = '';
        }
    });


    // Keyboard shortcuts
    document.addEventListener('keydown', function (e) {
        // Ctrl/Cmd + Enter to clean text
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            cleanText();
        }

        // Ctrl/Cmd + K to clear all
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            clearAll();
        }

        // Ctrl/Cmd + C when output is focused to copy
        if ((e.ctrlKey || e.metaKey) && e.key === 'c' && document.activeElement === outputText) {
            copyResult();
        }
    });

    // Theme management
    function getStoredTheme() {
        return localStorage.getItem('theme') || 'light';
    }

    function setStoredTheme(theme) {
        localStorage.setItem('theme', theme);
    }

    function updateThemeIcon(theme) {
        themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
    }

    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        updateThemeIcon(theme);
        setStoredTheme(theme);
    }

    function toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        applyTheme(newTheme);
    }

    // Initialize theme
    const initialTheme = getStoredTheme();
    applyTheme(initialTheme);

    // Theme toggle event listener
    themeToggle.addEventListener('click', toggleTheme);

    // Focus input on page load
    inputText.focus();
});

/*
    9/16/25
*/
