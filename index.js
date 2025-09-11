// ASCII Text Cleaner - Remove all non-ASCII characters
document.addEventListener('DOMContentLoaded', function () {


    const typeable = [
        32,
        33,
        34,
        35,
        36,
        37,
        38,
        39,
        40,
        41,
        42,
        43,
        44,
        45,
        46,
        47,
        48,
        49,
        50,
        51,
        52,
        53,
        54,
        55,
        56,
        57,
        58,
        59,
        60,
        61,
        62,
        63,
        64,
        65,
        66,
        67,
        68,
        69,
        70,
        71,
        72,
        73,
        74,
        75,
        76,
        77,
        78,
        79,
        80,
        81,
        82,
        83,
        84,
        85,
        86,
        87,
        88,
        89,
        90,
        91,
        92,
        93,
        94,
        95,
        96,
        97,
        98,
        99,
        100,
        101,
        102,
        103,
        104,
        105,
        106,
        107,
        108,
        109,
        110,
        111,
        112,
        113,
        114,
        115,
        116,
        117,
        118,
        119,
        120,
        121,
        122,
        123,
        124
    ]





    // Get DOM elements
    const inputText = document.getElementById('input-text');
    const outputText = document.getElementById('output-text');
    const cleanBtn = document.getElementById('clean-btn');
    const clearBtn = document.getElementById('clear-btn');
    const copyBtn = document.getElementById('copy-btn');
    const copyStatus = document.getElementById('copy-status');
    const keepEmDashesCheckbox = document.getElementById('keep-em-dashes');
    const blacklistInput = document.getElementById('blacklist-letters');
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = document.querySelector('.theme-icon');

    // Function to remove non-ASCII characters with options
    function removeNonAsciiCharacters(text = "", options = {}) {
        const { keepEmDashes = false, blacklistChars = '' } = options;

        let result = text;

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
    9/11/25
*/
