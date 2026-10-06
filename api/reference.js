// Vercel serverless function — receives a client reference / testimonial from
// the shareable /references page and creates a row in a Notion database.
//
// Required environment variables (set in Vercel → Project → Settings → Env Vars):
//   NOTION_TOKEN                   Same internal integration secret as /api/callback.
//   NOTION_REFERENCES_DATABASE_ID  The "Vanta Studio — Client References" database id.
//
// The Notion database must be shared with the integration (database → •••
// → Connections → connect), or the API returns "object not found".
// Expected properties: Name (title), Role (text), Company (text), Project (text),
// When (text), Rating (number), Experience (text), Can quote (checkbox),
// Status (select), Submitted (created time). See CLAUDE.md §10.

const NOTION_VERSION = '2022-06-28';
const MAX = { name: 120, role: 120, company: 160, project: 160, when: 40, experience: 1900 };

function clean(value, limit) {
  return typeof value === 'string' ? value.trim().slice(0, limit) : '';
}

function richText(content) {
  return content ? { rich_text: [{ text: { content } }] } : { rich_text: [] };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const token = process.env.NOTION_TOKEN;
  const databaseId = process.env.NOTION_REFERENCES_DATABASE_ID;
  if (!token || !databaseId) {
    console.error('Missing NOTION_TOKEN or NOTION_REFERENCES_DATABASE_ID env var');
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
  const role = clean(body.role, MAX.role);
  const company = clean(body.company, MAX.company);
  const project = clean(body.project, MAX.project);
  const when = clean(body.when, MAX.when);
  const experience = clean(body.experience, MAX.experience);
  const rating = Number(body.rating);
  const canQuote = body.can_quote === true;

  if (!name) return res.status(400).json({ error: 'Please add your name.' });
  if (!project) return res.status(400).json({ error: 'Please add the project name.' });
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Please pick a rating from 1 to 5 stars.' });
  }
  if (experience.length < 10) {
    return res.status(400).json({ error: 'Please tell us a little about working with us.' });
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
          Role: richText(role),
          Company: richText(company),
          Project: richText(project),
          When: richText(when),
          Rating: { number: rating },
          Experience: richText(experience),
          'Can quote': { checkbox: canQuote },
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
    console.error('Reference handler failed', err);
    return res.status(500).json({ error: 'Something went wrong. Please email hello@vantalabs.co.' });
  }
}
