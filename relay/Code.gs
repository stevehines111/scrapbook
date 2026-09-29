/**
 * Scrapbook relay for Google Photos downloads (Google Apps Script web app).
 *
 * Only needed if the browser refuses to download picked photos from lh3.googleusercontent.com directly.
 * The page POSTs { url, token } as text/plain (so the browser sends no CORS preflight). This script checks the
 * URL is a Google Photos image URL, fetches it with the caller's own bearer token and returns
 * { ok, mimeType, data } with the image as base64. Nothing is stored and there are no secrets in this file.
 *
 * Deploy steps are in CLAUDE.md. Deploy as a web app: Execute as Me, Who has access: Anyone.
 */

var ALLOWED_HOST = 'lh3.googleusercontent.com';

function doPost(e) {
  try {
    var body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    var url = String(body.url || '');
    var token = String(body.token || '');
    var m = url.match(/^https:\/\/([^\/?#]+)(?:[\/?#]|$)/);
    if (!m || m[1].toLowerCase() !== ALLOWED_HOST) return reply_({ ok: false, error: 'URL not allowed' });
    if (!token) return reply_({ ok: false, error: 'No token' });

    // No redirects: the bearer token is only ever sent to lh3.googleusercontent.com.
    var res = UrlFetchApp.fetch(url, {
      headers: { Authorization: 'Bearer ' + token },
      muteHttpExceptions: true,
      followRedirects: false
    });
    var code = res.getResponseCode();
    if (code !== 200) return reply_({ ok: false, error: 'HTTP ' + code });

    var blob = res.getBlob();
    return reply_({ ok: true, mimeType: blob.getContentType() || 'image/jpeg', data: Utilities.base64Encode(blob.getBytes()) });
  } catch (err) {
    return reply_({ ok: false, error: String((err && err.message) || err) });
  }
}

// Opening the web app URL in a browser shows this, to confirm the deployment is live.
function doGet() {
  return reply_({ ok: true, service: 'scrapbook-relay' });
}

function reply_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
