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
            downloadBtn,
            uploadBtn,
            fileInput,
            copyStatus,
            keepEmDashesCheckbox,
            blacklistInput,
            whitelistInput,
            removeHiddenCharsCheckbox,
            convertNbspCheckbox,
            convertEllipsisCheckbox,
            removeTrailingWhitespaceCheckbox,
            removeAsterisksCheckbox,
            removeMarkdownHeadingsCheckbox,
            convertLookalikesCheckbox,
            normalizeUnicodeCheckbox,
            themeToggle,
            themeIcon,
            inputCharCount,
            outputCharCount,
            inputCursorPos,
            gaugePercentage,
            gaugeCircle,
            statTotal,
            statRemoved,
            statClean,
            statLines,
            statWords,
        ] = [
            'input-text',
            'output-text',
            'clean-btn',
            'clear-btn',
            'copy-btn',
            'download-btn',
            'upload-btn',
            'file-input',
            'copy-status',
            'keep-em-dashes',
            'blacklist-letters',
            'whitelist-letters',
            'remove-hidden-chars',
            'convert-nbsp',
            'convert-ellipsis',
            'remove-trailing-whitespace',
            'remove-asterisks',
            'remove-markdown-headings',
            'convert-lookalikes',
            'normalize-unicode',
            'theme-toggle',
            'theme-icon',
            'input-char-count',
            'output-char-count',
            'input-cursor-pos',
            'gauge-percentage',
            'gauge-circle',
            'stat-total',
            'stat-removed',
            'stat-clean',
            'stat-lines',
            'stat-words',
        ].map(e => document.getElementById(e));

        // Tab Navigation
        const tabBtns = document.querySelectorAll('.tab-btn');
        const tabContents = document.querySelectorAll('.tab-content');

        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const tabName = btn.getAttribute('data-tab');

                tabBtns.forEach(b => b.classList.remove('active'));
                tabContents.forEach(c => c.classList.remove('active'));

                btn.classList.add('active');
                document.getElementById(tabName + '-tab').classList.add('active');
            });
        });

        const checkboxOptions = [
            keepEmDashesCheckbox,
            removeHiddenCharsCheckbox,
            convertNbspCheckbox,
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
                convertEllipsis: convertEllipsisCheckbox.checked,
                removeTrailingWhitespace: removeTrailingWhitespaceCheckbox.checked,
                removeAsterisks: removeAsterisksCheckbox.checked,
                removeMarkdownHeadings: removeMarkdownHeadingsCheckbox.checked,
                convertLookalikes: convertLookalikesCheckbox.checked,
                normalizeUnicode: normalizeUnicodeCheckbox.checked,
            };
        }

        // Update statistics
        function updateStats(inputVal, outputVal) {
            const totalChars = inputVal.length;
            const cleanChars = outputVal.length;
            const removedChars = totalChars - cleanChars;
            const removalRate = totalChars > 0 ? ((removedChars / totalChars) * 100).toFixed(2) : 0;

            const lines = inputVal ? inputVal.split('\n').length : 0;
            const words = inputVal ? inputVal.trim().split(/\s+/).filter(w => w.length > 0).length : 0;

            // Update character counts
            inputCharCount.textContent = `${totalChars.toLocaleString()} chars`;
            outputCharCount.textContent = `${cleanChars.toLocaleString()} chars`;

            // Update gauge
            gaugePercentage.textContent = `${removalRate}%`;
            const circumference = 2 * Math.PI * 80;
            const offset = circumference - (removalRate / 100) * circumference;
            gaugeCircle.style.strokeDashoffset = offset;

            // Update stats list
            statTotal.textContent = totalChars.toLocaleString();
            statRemoved.textContent = removedChars.toLocaleString();
            statClean.textContent = cleanChars.toLocaleString();
            statLines.textContent = lines.toLocaleString();
            statWords.textContent = words.toLocaleString();

            // Update detailed stats tab
            const detailedTotal = document.getElementById('detailed-total');
            const detailedAscii = document.getElementById('detailed-ascii');
            const detailedNonAscii = document.getElementById('detailed-non-ascii');
            const detailedLines = document.getElementById('detailed-lines');
            const detailedWords = document.getElementById('detailed-words');
            const detailedParagraphs = document.getElementById('detailed-paragraphs');

            if (detailedTotal) {
                detailedTotal.textContent = totalChars.toLocaleString();
                detailedAscii.textContent = cleanChars.toLocaleString();
                detailedNonAscii.textContent = removedChars.toLocaleString();
                detailedLines.textContent = lines.toLocaleString();
                detailedWords.textContent = words.toLocaleString();
                const paragraphs = inputVal ? inputVal.split(/\n\s*\n/).filter(p => p.trim().length > 0).length : 0;
                detailedParagraphs.textContent = paragraphs.toLocaleString();
            }
        }

        // Update cursor position
        function updateCursorPosition() {
            const pos = inputText.selectionStart;
            const textBeforeCursor = inputText.value.substring(0, pos);
            const lines = textBeforeCursor.split('\n');
            const line = lines.length;
            const col = lines[lines.length - 1].length + 1;
            inputCursorPos.textContent = `Line ${line}, Column ${col}`;
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

            const options = getOptions();
            const cleaned = removeNonAsciiCharacters(input, options);
            outputText.value = cleaned;

            updateStats(input, cleaned);

            const removedCount = input.length - cleaned.length;
            if (removedCount > 0) {
                showStatus(`Removed ${removedCount} character${removedCount === 1 ? '' : 's'}`, true);
            } else {
                showStatus('No characters removed', true);
            }
        }

        // File upload
        function handleFileUpload(e) {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = function (event) {
                inputText.value = event.target.result;
                const cleaned = removeNonAsciiCharacters(inputText.value, getOptions());
                outputText.value = cleaned;
                updateStats(inputText.value, cleaned);
                updateCursorPosition();
                saveSettings();
                showStatus('File uploaded successfully', true);
            };
            reader.onerror = function () {
                showStatus('Failed to read file', false);
            };
            reader.readAsText(file);
        }

        // File download
        function downloadResult() {
            const text = outputText.value;
            if (!text.trim()) {
                showStatus('No text to download', false);
                return;
            }

            const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'cleaned-text.txt';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            showStatus('File downloaded', true);
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
                updateStats(this.value, cleaned);
            } else {
                outputText.value = '';
                updateStats('', '');
            }
            saveSettings();
        });

        inputText.addEventListener('click', updateCursorPosition);
        inputText.addEventListener('keyup', updateCursorPosition);
        inputText.addEventListener('focus', updateCursorPosition);


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
            return localStorage.getItem('theme') || 'dark';
        }

        function updateThemeIcon(theme) {
            if (theme === 'light') {
                themeIcon.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1 -8.313 -12.454z" /></svg>';
            } else {
                themeIcon.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4" /><path d="M12 2v2" /><path d="M12 20v2" /><path d="M4.93 4.93l1.41 1.41" /><path d="M17.66 17.66l1.41 1.41" /><path d="M2 12h2" /><path d="M20 12h2" /><path d="M6.34 17.66l-1.41 1.41" /><path d="M19.07 4.93l-1.41 1.41" /></svg>';
            }
        }

        function applyTheme(theme) {
            document.documentElement.setAttribute('data-theme', theme);
            updateThemeIcon(theme);
            localStorage.setItem('theme', theme);
        }

        function toggleTheme() {
            const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
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
        downloadBtn.addEventListener('click', downloadResult);
        uploadBtn.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', handleFileUpload);
        themeToggle.addEventListener('click', toggleTheme);
        checkboxOptions.forEach(cb => cb.addEventListener('change', () => {
            saveSettings();
            if (inputText.value.trim()) {
                const cleaned = removeNonAsciiCharacters(inputText.value, getOptions());
                outputText.value = cleaned;
                updateStats(inputText.value, cleaned);
            }
        }));
        blacklistInput.addEventListener('input', () => {
            saveSettings();
            if (inputText.value.trim()) {
                const cleaned = removeNonAsciiCharacters(inputText.value, getOptions());
                outputText.value = cleaned;
                updateStats(inputText.value, cleaned);
            }
        });
        whitelistInput.addEventListener('input', () => {
            saveSettings();
            if (inputText.value.trim()) {
                const cleaned = removeNonAsciiCharacters(inputText.value, getOptions());
                outputText.value = cleaned;
                updateStats(inputText.value, cleaned);
            }
        });

        // Initialize stats
        updateStats('', '');
        updateCursorPosition();

        // Focus input on page load
        inputText.focus();
    });
}
