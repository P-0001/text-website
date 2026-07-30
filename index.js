function removeNonAsciiCharacters(text, options = {}) {
    text = text ?? "";

    const {
        keepEmDashes = false,
        blacklistChars = '',
        whitelistChars = '',
        removeHiddenChars = false,
        convertNbsp = false,
        normalizeDashes = false,
        normalizeQuotes = false,
        convertEllipsis = false,
        removeTrailingWhitespace = false,
        removeAsterisks = false,
        removeMarkdownHeadings = false,
        convertLookalikes = false,
        normalizeUnicode = false,
    } = options;

    let result = text;

    // 1. Normalize Unicode forms (NFC) before anything else
    if (normalizeUnicode) {
        result = result.normalize('NFC');
    }

    // 2. Remove hidden/invisible characters
    if (removeHiddenChars) {
        result = result.replace(/[\u200B-\u200D\uFEFF\u00AD]/gu, '');
        result = result.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '');
    }

    // 3. Convert non-breaking spaces to regular spaces
    if (convertNbsp) {
        result = result.replace(/[\u00A0\u202F\u2060]/gu, ' ');
    }

    // 4. Convert lookalike characters (ligatures, etc.)
    if (convertLookalikes) {
        const lookalikeMap = {
            '\uFB00': 'ff', '\uFB01': 'fi', '\uFB02': 'fl',
            '\uFB03': 'ffi', '\uFB04': 'ffl', '\uFB05': 'ft',
            '\uFB06': 'st', '\uFB13': 'mn', '\uFB14': 'me',
            '\uFB15': 'mi', '\uFB16': 'vk', '\uFB17': 'lv',
        };
        result = result.replace(/[\uFB00-\uFB17]/gu, m => lookalikeMap[m] || '');
    }

    // 5. Normalize dashes to hyphens
    if (normalizeDashes) {
        result = result.replace(/[\u2010\u2011\u2012\u2013\u2014\u2015\u2053\u2E3A\u2E3B]/gu, '-');
    }

    // 6. Normalize smart quotes to straight quotes
    if (normalizeQuotes) {
        result = result
            .replace(/[\u2018\u2019\u201A\u201B]/gu, "'")
            .replace(/[\u201C\u201D\u201E\u201F]/gu, '"')
            .replace(/[\u2039\u203A]/gu, m => m === '\u2039' ? '<' : '>')
            .replace(/[\u00AB\u00BB]/gu, m => m === '\u00AB' ? '<<' : '>>');
    }

    // 7. Convert ellipsis character to three dots
    if (convertEllipsis) {
        result = result.replace(/\u2026/gu, '...');
    }

    const whitelistSet = new Set(whitelistChars);

    // 8. Remove non-ASCII characters (codes 0-127 are ASCII)
    result = result.replace(/[^\x00-\x7F]/gu, (match) => {
        if (whitelistSet.has(match)) {
            return match;
        }
        if (keepEmDashes && (match === '\u2014' || match === '\u2013')) {
            return "-";
        }
        return "";
    });

    // 9. Remove blacklisted characters (even if they are ASCII)
    if (blacklistChars) {
        const escapedChars = blacklistChars.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const blacklistRegex = new RegExp(`[${escapedChars}]`, 'g');
        result = result.replace(blacklistRegex, '');
    }

    // 10. Remove asterisks
    if (removeAsterisks) {
        result = result.replace(/\*/g, '');
    }

    // 11. Remove markdown headings (# at start of lines)
    if (removeMarkdownHeadings) {
        result = result.replace(/^#{1,6}\s?/gm, '');
    }

    // 12. Remove trailing whitespace from each line
    if (removeTrailingWhitespace) {
        result = result.replace(/[ \t]+$/gm, '');
    }

    return result;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { removeNonAsciiCharacters };
}

if (typeof document !== 'undefined') {
    window.removeNonAsciiCharacters = removeNonAsciiCharacters;

    document.addEventListener('DOMContentLoaded', function () {
        const [
            inputText,
            outputText,
            cleanBtn,
            clearBtn,
            copyBtn,
            copyStatus,
            keepEmDashesCheckbox,
            blacklistInput,
            whitelistInput,
            removeHiddenCharsCheckbox,
            convertNbspCheckbox,
            normalizeDashesCheckbox,
            normalizeQuotesCheckbox,
            convertEllipsisCheckbox,
            removeTrailingWhitespaceCheckbox,
            removeAsterisksCheckbox,
            removeMarkdownHeadingsCheckbox,
            convertLookalikesCheckbox,
            normalizeUnicodeCheckbox,
            themeToggle,
            themeIcon,
        ] = [
            'input-text',
            'output-text',
            'clean-btn',
            'clear-btn',
            'copy-btn',
            'copy-status',
            'keep-em-dashes',
            'blacklist-letters',
            'whitelist-letters',
            'remove-hidden-chars',
            'convert-nbsp',
            'normalize-dashes',
            'normalize-quotes',
            'convert-ellipsis',
            'remove-trailing-whitespace',
            'remove-asterisks',
            'remove-markdown-headings',
            'convert-lookalikes',
            'normalize-unicode',
            'theme-toggle',
            'theme-icon',
        ].map(e => document.getElementById(e));

        const checkboxOptions = [
            keepEmDashesCheckbox,
            removeHiddenCharsCheckbox,
            convertNbspCheckbox,
            normalizeDashesCheckbox,
            normalizeQuotesCheckbox,
            convertEllipsisCheckbox,
            removeTrailingWhitespaceCheckbox,
            removeAsterisksCheckbox,
            removeMarkdownHeadingsCheckbox,
            convertLookalikesCheckbox,
            normalizeUnicodeCheckbox,
        ];

        function getOptions() {
            return {
                keepEmDashes: keepEmDashesCheckbox.checked,
                blacklistChars: blacklistInput.value,
                whitelistChars: whitelistInput.value,
                removeHiddenChars: removeHiddenCharsCheckbox.checked,
                convertNbsp: convertNbspCheckbox.checked,
                normalizeDashes: normalizeDashesCheckbox.checked,
                normalizeQuotes: normalizeQuotesCheckbox.checked,
                convertEllipsis: convertEllipsisCheckbox.checked,
                removeTrailingWhitespace: removeTrailingWhitespaceCheckbox.checked,
                removeAsterisks: removeAsterisksCheckbox.checked,
                removeMarkdownHeadings: removeMarkdownHeadingsCheckbox.checked,
                convertLookalikes: convertLookalikesCheckbox.checked,
                normalizeUnicode: normalizeUnicodeCheckbox.checked,
            };
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
            const options = getOptions();

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
                if (options.whitelistChars) {
                    statusMessage += ` (whitelisted: ${options.whitelistChars})`;
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
            saveSettings();
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

        inputText.addEventListener('input', function () {
            if (this.value.trim()) {
                const cleaned = removeNonAsciiCharacters(this.value, getOptions());
                outputText.value = cleaned;
            } else {
                outputText.value = '';
            }
            saveSettings();
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

        // Settings persistence (checkboxes/inputs in localStorage, large text in IndexedDB)
        const SETTINGS_KEY = 'ascii-cleaner-settings';
        const DB_NAME = 'ascii-cleaner';
        const DB_STORE = 'text';
        const DB_VERSION = 1;
        const TEXT_KEY = 'inputText';
        const SAVE_DELAY = 1000;
        let saveTimer = null;
        let db = null;

        function openDB() {
            return new Promise(function (resolve, reject) {
                if (!window.indexedDB) {
                    reject(new Error('IndexedDB not supported'));
                    return;
                }
                const req = indexedDB.open(DB_NAME, DB_VERSION);
                req.onupgradeneeded = function (e) {
                    e.target.result.createObjectStore(DB_STORE);
                };
                req.onsuccess = function (e) { resolve(e.target.result); };
                req.onerror = function (e) { reject(e.target.error); };
            });
        }

        function dbPut(store, key, value) {
            return new Promise(function (resolve, reject) {
                const tx = db.transaction(store, 'readwrite');
                tx.objectStore(store).put(value, key);
                tx.oncomplete = function () { resolve(); };
                tx.onerror = function () { reject(tx.error); };
            });
        }

        function dbGet(store, key) {
            return new Promise(function (resolve, reject) {
                const tx = db.transaction(store, 'readonly');
                const req = tx.objectStore(store).get(key);
                req.onsuccess = function () { resolve(req.result); };
                req.onerror = function () { reject(req.error); };
            });
        }

        function loadSettings() {
            try {
                const stored = JSON.parse(localStorage.getItem(SETTINGS_KEY)) || {};
                keepEmDashesCheckbox.checked = stored.keepEmDashes !== false;
                removeHiddenCharsCheckbox.checked = stored.removeHiddenChars || false;
                convertNbspCheckbox.checked = stored.convertNbsp || false;
                normalizeDashesCheckbox.checked = stored.normalizeDashes || false;
                normalizeQuotesCheckbox.checked = stored.normalizeQuotes || false;
                convertEllipsisCheckbox.checked = stored.convertEllipsis || false;
                removeTrailingWhitespaceCheckbox.checked = stored.removeTrailingWhitespace || false;
                removeAsterisksCheckbox.checked = stored.removeAsterisks || false;
                removeMarkdownHeadingsCheckbox.checked = stored.removeMarkdownHeadings || false;
                convertLookalikesCheckbox.checked = stored.convertLookalikes || false;
                normalizeUnicodeCheckbox.checked = stored.normalizeUnicode || false;
                blacklistInput.value = stored.blacklistChars || '';
                whitelistInput.value = stored.whitelistChars || '';
            } catch (e) {
                keepEmDashesCheckbox.checked = true;
            }
        }

        async function loadInputText() {
            if (db) {
                try {
                    const text = await dbGet(DB_STORE, TEXT_KEY);
                    if (text) inputText.value = text;
                    return;
                } catch (e) { }
            }
            try {
                const stored = JSON.parse(localStorage.getItem(SETTINGS_KEY)) || {};
                inputText.value = stored.inputText || '';
            } catch (e) { }
        }

        async function saveInputText() {
            const text = inputText.value;
            if (db) {
                try {
                    await dbPut(DB_STORE, TEXT_KEY, text);
                    return;
                } catch (e) { }
            }
            try {
                const stored = JSON.parse(localStorage.getItem(SETTINGS_KEY)) || {};
                stored.inputText = text;
                localStorage.setItem(SETTINGS_KEY, JSON.stringify(stored));
            } catch (e) { }
        }

        function saveSettings() {
            const settings = {
                keepEmDashes: keepEmDashesCheckbox.checked,
                removeHiddenChars: removeHiddenCharsCheckbox.checked,
                convertNbsp: convertNbspCheckbox.checked,
                normalizeDashes: normalizeDashesCheckbox.checked,
                normalizeQuotes: normalizeQuotesCheckbox.checked,
                convertEllipsis: convertEllipsisCheckbox.checked,
                removeTrailingWhitespace: removeTrailingWhitespaceCheckbox.checked,
                removeAsterisks: removeAsterisksCheckbox.checked,
                removeMarkdownHeadings: removeMarkdownHeadingsCheckbox.checked,
                convertLookalikes: convertLookalikesCheckbox.checked,
                normalizeUnicode: normalizeUnicodeCheckbox.checked,
                blacklistChars: blacklistInput.value,
                whitelistChars: whitelistInput.value
            };
            localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));

            if (saveTimer) clearTimeout(saveTimer);
            saveTimer = setTimeout(saveInputText, SAVE_DELAY);
        }

        // Theme management
        function getStoredTheme() {
            return localStorage.getItem('theme') || 'light';
        }

        function updateThemeIcon(theme) {
            themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
        }

        function applyTheme(theme) {
            document.documentElement.setAttribute('data-theme', theme);
            updateThemeIcon(theme);
            localStorage.setItem('theme', theme);
        }

        function toggleTheme() {
            const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            applyTheme(newTheme);
        }

        // Initialize
        loadSettings();
        applyTheme(getStoredTheme());
        openDB().then(function (d) {
            db = d;
            loadInputText();
        }).catch(function () {
            loadInputText();
        });

        // Event listeners
        cleanBtn.addEventListener('click', cleanText);
        clearBtn.addEventListener('click', clearAll);
        copyBtn.addEventListener('click', copyResult);
        themeToggle.addEventListener('click', toggleTheme);
        checkboxOptions.forEach(cb => cb.addEventListener('change', saveSettings));
        blacklistInput.addEventListener('input', saveSettings);
        whitelistInput.addEventListener('input', saveSettings);

        // Focus input on page load
        inputText.focus();
    });
}
