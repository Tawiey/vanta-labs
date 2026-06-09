// Vercel serverless function — receives a "request a callback" submission from
// the homepage contact section and creates a row in the Notion database.
//
// Required environment variables (set in Vercel → Project → Settings → Env Vars):
//   NOTION_TOKEN        Internal integration secret (starts with ntn_…).
//   NOTION_DATABASE_ID  The "Vanta Labs — Callback Requests" database id.
//
// The Notion database must be shared with the integration (database → •••
// → Connections → connect), or the API returns "object not found".

const NOTION_VERSION = '2022-06-28';
const MAX = { name: 120, company: 160, phone: 40, note: 1200 };

function clean(value, limit) {
  return typeof value === 'string' ? value.trim().slice(0, limit) : '';
}

function richText(content) {
  return content ? { rich_text: [{ text: { content } }] } : { rich_text: [] };
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const token = process.env.NOTION_TOKEN;
  const databaseId = process.env.NOTION_DATABASE_ID;
  if (!token || !databaseId) {
    console.error('Missing NOTION_TOKEN or NOTION_DATABASE_ID env var');
    return res.status(500).json({ error: 'Server is not configured. Please email hello@vantalabs.co.' });
  }

  // Vercel parses JSON bodies automatically, but guard against string bodies too.
  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { body = {}; }
  }
  body = body || {};

  // Honeypot — bots fill hidden fields; humans leave them empty.
  if (clean(body.company_url, 200)) {
    return res.status(200).json({ ok: true });
  }

  const name = clean(body.name, MAX.name);
  const company = clean(body.company, MAX.company);
  const phone = clean(body.phone, MAX.phone);
  const note = clean(body.note, MAX.note);

  if (!name) return res.status(400).json({ error: 'Please add your name.' });
  if (!phone) return res.status(400).json({ error: 'Please add a phone number.' });
  if (phone.replace(/[^0-9]/g, '').length < 7) {
    return res.status(400).json({ error: 'That phone number looks too short.' });
  }

  try {
    const notionRes = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Notion-Version': NOTION_VERSION,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        parent: { database_id: databaseId },
        properties: {
          Name: { title: [{ text: { content: name } }] },
          Company: richText(company),
          Phone: { phone_number: phone },
          Note: richText(note),
          Status: { select: { name: 'New' } },
        },
      }),
    });

    if (!notionRes.ok) {
      const detail = await notionRes.text();
      console.error('Notion API error', notionRes.status, detail);
      return res.status(502).json({ error: "Couldn't save that. Please email hello@vantalabs.co." });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Callback handler failed', err);
    return res.status(500).json({ error: 'Something went wrong. Please email hello@vantalabs.co.' });
  }
};
