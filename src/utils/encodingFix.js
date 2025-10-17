// Utility to fix common mojibake where UTF-8 bytes were decoded as Latin-1
// It attempts to recover readable UTF-8 text from strings like "PolÃ­tica" -> "Política".
// This is a temporary client-side workaround; real fix should be applied at the server/database.
export function fixUtf8Mojibake(s) {
  if (!s || typeof s !== 'string') return s;
  try {
    // decodeURIComponent(escape(s)) converts from Latin1-decoded string back to proper UTF-8
    // eslint-disable-next-line no-undef, no-unused-vars
    return decodeURIComponent(escape(s));
  } catch (e) {
    return s;
  }
}

export default fixUtf8Mojibake;
