const { removeNonAsciiCharacters: clean } = require('../index.js');

let passed = 0;
let failed = 0;

function assertEqual(actual, expected, label) {
    const isPass = actual === expected;
    if (isPass) {
        console.log(`\x1b[32m[PASS]\x1b[0m ${label}`);
        passed++;
    } else {
        console.log(`\x1b[31m[FAIL]\x1b[0m ${label}`);
        console.log(`  expected: ${JSON.stringify(expected)}`);
        console.log(`  actual:   ${JSON.stringify(actual)}`);
        failed++;
    }
}

// --- Basic ASCII ---
assertEqual(clean('Hello World'), 'Hello World', 'Pure ASCII passes through unchanged');
assertEqual(clean('12345!@#$%^&*()'), '12345!@#$%^&*()', 'ASCII symbols pass through');

// --- Non-ASCII removal ---
assertEqual(clean('café'), 'caf', 'Accented characters removed by default');
assertEqual(clean('Hello 🌍 World'), 'Hello  World', 'Emoji removed');
assertEqual(clean('日本語テスト'), '', 'Non-Latin scripts removed');
assertEqual(clean('naïve résumé'), 'nave rsum', 'Multiple accented chars removed');

// --- Em/en dashes ---
assertEqual(clean('word—word'), 'wordword', 'Em dash removed when keepEmDashes=false');
assertEqual(clean('word–word'), 'wordword', 'En dash removed when keepEmDashes=false');
assertEqual(clean('word—word', { keepEmDashes: true }), 'word-word', 'Em dash converted to hyphen when keepEmDashes=true');
assertEqual(clean('word–word', { keepEmDashes: true }), 'word-word', 'En dash converted to hyphen when keepEmDashes=true');

// --- Blacklist ---
assertEqual(clean('Hello World', { blacklistChars: 'lo' }), 'He Wrd', 'Blacklist removes specified ASCII chars');
assertEqual(clean('Hello World', { blacklistChars: ' ' }), 'HelloWorld', 'Blacklist removes spaces');
assertEqual(clean('a.b.c', { blacklistChars: '.' }), 'abc', 'Blacklist removes dots (regex-special char)');

// --- Whitelist ---
assertEqual(clean('café', { whitelistChars: 'é' }), 'café', 'Whitelisted accented char preserved');
assertEqual(clean('naïve', { whitelistChars: 'ï' }), 'naïve', 'Whitelisted ï preserved, other non-ASCII removed');
assertEqual(clean('Hello 🌍 World', { whitelistChars: '🌍' }), 'Hello 🌍 World', 'Whitelisted emoji preserved');
assertEqual(clean('café résumé', { whitelistChars: 'é' }), 'café résumé', 'Multiple whitelisted chars preserved');

// --- Whitelist + blacklist combo ---
assertEqual(
    clean('café test', { whitelistChars: 'é', blacklistChars: 't' }),
    'café es',
    'Whitelist preserves é, blacklist removes t'
);

// --- Whitelist + em dashes combo ---
assertEqual(
    clean('word—café', { keepEmDashes: true, whitelistChars: 'é' }),
    'word-café',
    'Em dash converted and é whitelisted simultaneously'
);

// --- Edge cases ---
assertEqual(clean(''), '', 'Empty string returns empty');
assertEqual(clean(undefined), '', 'Undefined returns empty');
assertEqual(clean(null), '', 'Null returns empty');
assertEqual(clean('   '), '   ', 'Whitespace-only preserved (ASCII)');

// --- Zero-width characters ---
assertEqual(clean('hello\u200Bworld'), 'helloworld', 'Zero-width space removed');
assertEqual(clean('hello\uFEFFworld'), 'helloworld', 'BOM character removed');

// --- Mixed content ---
assertEqual(
    clean('Price: €100 — café'),
    'Price: 100  caf',
    'Mixed content: euro symbol removed, em dash removed, accented chars removed (no options)'
);
assertEqual(
    clean('Price: €100 — café', { keepEmDashes: true, whitelistChars: '€é' }),
    'Price: €100 - café',
    'Mixed content with all options: em dash converted, € and é whitelisted'
);

// --- Remove hidden characters ---
assertEqual(clean('hello\u200Bworld', { removeHiddenChars: true }), 'helloworld', 'Zero-width space removed with removeHiddenChars');
assertEqual(clean('hello\uFEFFworld', { removeHiddenChars: true }), 'helloworld', 'BOM removed with removeHiddenChars');
assertEqual(clean('hello\u200Cworld', { removeHiddenChars: true }), 'helloworld', 'ZWNJ removed with removeHiddenChars');
assertEqual(clean('hello\u200Dworld', { removeHiddenChars: true }), 'helloworld', 'ZWJ removed with removeHiddenChars');
assertEqual(clean('hello\u00ADworld', { removeHiddenChars: true }), 'helloworld', 'Soft hyphen removed with removeHiddenChars');
assertEqual(clean('a\u0000b\u0001c', { removeHiddenChars: true }), 'abc', 'Control characters removed with removeHiddenChars');
assertEqual(clean('a\tb\nc', { removeHiddenChars: true }), 'a\tb\nc', 'Tab and newline preserved with removeHiddenChars');

// --- Convert non-breaking spaces ---
assertEqual(clean('hello\u00A0world', { convertNbsp: true }), 'hello world', 'Non-breaking space converted to regular space');
assertEqual(clean('a\u202Fb', { convertNbsp: true }), 'a b', 'Narrow no-break space converted to regular space');
assertEqual(clean('a\u2060b', { convertNbsp: true }), 'a b', 'Word joiner converted to regular space');

// --- Normalize dashes ---
assertEqual(clean('word—word', { normalizeDashes: true }), 'word-word', 'Em dash normalized to hyphen');
assertEqual(clean('word–word', { normalizeDashes: true }), 'word-word', 'En dash normalized to hyphen');
assertEqual(clean('word―word', { normalizeDashes: true }), 'word-word', 'Horizontal bar normalized to hyphen');
assertEqual(clean('word‐word', { normalizeDashes: true }), 'word-word', 'Hyphen (U+2010) normalized to ASCII hyphen');
assertEqual(clean('word‑word', { normalizeDashes: true }), 'word-word', 'Non-breaking hyphen normalized to ASCII hyphen');

// --- Normalize quotes ---
assertEqual(clean("it's", { normalizeQuotes: true }), "it's", 'Right single quote normalized to straight quote');
assertEqual(clean("it's", { normalizeQuotes: true }), "it's", 'Left single quote normalized to straight quote');
assertEqual(clean('"hello"', { normalizeQuotes: true }), '"hello"', 'Smart double quotes normalized to straight quotes');
assertEqual(clean("„hello‟", { normalizeQuotes: true }), '"hello"', 'Low and high double quotes normalized');
assertEqual(clean('‹hello›', { normalizeQuotes: true }), '<hello>', 'Guillemets (single) normalized to angle brackets');
assertEqual(clean('«hello»', { normalizeQuotes: true }), '<<hello>>', 'Guillemets (double) normalized');

// --- Convert ellipsis ---
assertEqual(clean('wait…', { convertEllipsis: true }), 'wait...', 'Ellipsis character converted to three dots');
assertEqual(clean('done… go…', { convertEllipsis: true }), 'done... go...', 'Multiple ellipsis characters converted');

// --- Remove trailing whitespace ---
assertEqual(clean('hello   ', { removeTrailingWhitespace: true }), 'hello', 'Trailing spaces removed');
assertEqual(clean('hello\t\t', { removeTrailingWhitespace: true }), 'hello', 'Trailing tabs removed');
assertEqual(clean('hello   \nworld  ', { removeTrailingWhitespace: true }), 'hello\nworld', 'Trailing whitespace removed from each line');
assertEqual(clean('  hello  ', { removeTrailingWhitespace: true }), '  hello', 'Leading whitespace preserved, trailing removed');

// --- Remove asterisks ---
assertEqual(clean('hello *world*', { removeAsterisks: true }), 'hello world', 'Asterisks removed');
assertEqual(clean('**bold**', { removeAsterisks: true }), 'bold', 'Markdown bold asterisks removed');
assertEqual(clean('a*b*c', { removeAsterisks: true }), 'abc', 'Inline asterisks removed');

// --- Remove markdown headings ---
assertEqual(clean('# Heading', { removeMarkdownHeadings: true }), 'Heading', 'H1 heading marker removed');
assertEqual(clean('## Subheading', { removeMarkdownHeadings: true }), 'Subheading', 'H2 heading marker removed');
assertEqual(clean('###### Deep', { removeMarkdownHeadings: true }), 'Deep', 'H6 heading marker removed');
assertEqual(clean('#Heading', { removeMarkdownHeadings: true }), 'Heading', 'Heading without space removed');
assertEqual(clean('line1\n# Heading\nline2', { removeMarkdownHeadings: true }), 'line1\nHeading\nline2', 'Heading in middle of text removed');
assertEqual(clean('not # a heading', { removeMarkdownHeadings: true }), 'not # a heading', 'Inline # not removed');

// --- Convert lookalike characters ---
assertEqual(clean('oﬃce', { convertLookalikes: true }), 'office', 'fi ligature converted');
assertEqual(clean('ﬂuid', { convertLookalikes: true }), 'fluid', 'fl ligature converted');
assertEqual(clean('ﬀerent', { convertLookalikes: true }), 'fferent', 'ff ligature converted');
assertEqual(clean('ﬃrmative', { convertLookalikes: true }), 'ffirmative', 'ffi ligature converted');
assertEqual(clean('ﬄuent', { convertLookalikes: true }), 'ffluent', 'ffl ligature converted');
assertEqual(clean('ﬆudy', { convertLookalikes: true }), 'study', 'st ligature converted');

// --- Normalize Unicode forms ---
assertEqual(clean('é', { normalizeUnicode: true }), '', 'NFC normalized accented char still removed (non-ASCII)');
assertEqual(clean('e\u0301', { normalizeUnicode: true }), '', 'NFD decomposed accented char removed after NFC normalization');
assertEqual(clean('café', { normalizeUnicode: true, whitelistChars: 'é' }), 'café', 'NFC normalized + whitelisted é preserved');

// --- Combo: multiple new options ---
assertEqual(
    clean('"hello…"   ', { normalizeQuotes: true, convertEllipsis: true, removeTrailingWhitespace: true }),
    '"hello..."',
    'Combo: quotes + ellipsis + trailing whitespace'
);
assertEqual(
    clean('# **bold** ﬁnal', { removeMarkdownHeadings: true, removeAsterisks: true, convertLookalikes: true }),
    'bold final',
    'Combo: headings + asterisks + lookalikes'
);

// --- Summary ---
console.log();
if (failed === 0) {
    console.log(`\x1b[32m${passed} passed, ${failed} failed — ALL TESTS PASSED\x1b[0m`);
} else {
    console.log(`\x1b[31m${passed} passed, ${failed} failed — SOME TESTS FAILED\x1b[0m`);
}
process.exit(failed > 0 ? 1 : 0);
