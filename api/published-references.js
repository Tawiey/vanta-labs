// Vercel serverless function — returns the client references that are cleared
// for the homepage "References" section (CLAUDE.md §10).
//
// GET /api/published-references → { references: [{ id, name, role, company, project, when, rating, quote }] }
//
// Only rows with BOTH checkboxes ticked are returned:
//   Can quote — the client's own consent, set from the form.
//   Publish   — the studio's editorial pick, ticked by hand in Notion.
// Only display fields are sent to the browser; nothing else from the row.
//
// Env: NOTION_TOKEN, NOTION_REFERENCES_DATABASE_ID (same as api/reference.js).
// The response is cached at Vercel's edge for 5 minutes, so ticking or
// unticking "Publish" shows up on the site within about 5 minutes.

const NOTION_VERSION = '2022-06-28';
const LIMIT = 24;

function text(prop) {
  if (!prop) return '';
  const parts = prop.title || prop.rich_text || [];
  return parts.map((p) => p.plain_text || '').join('').trim();
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const token = process.env.NOTION_TOKEN;
  const databaseId = process.env.NOTION_REFERENCES_DATABASE_ID;
  if (!token || !databaseId) {
    console.error('Missing NOTION_TOKEN or NOTION_REFERENCES_DATABASE_ID env var');
    return res.status(500).json({ error: 'Not configured' });
  }

  try {
    const notionRes = await fetch(`https://api.notion.com/v1/databases/${databaseId}/query`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Notion-Version': NOTION_VERSION,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        page_size: LIMIT,
        filter: {
          and: [
            { property: 'Publish', checkbox: { equals: true } },
            { property: 'Can quote', checkbox: { equals: true } },
          ],
        },
        sorts: [{ timestamp: 'created_time', direction: 'descending' }],
      }),
    });

    if (!notionRes.ok) {
      const detail = await notionRes.text();
      console.error('Notion API error', notionRes.status, detail);
      return res.status(502).json({ error: 'Upstream error' });
    }

    const data = await notionRes.json();
    const references = (data.results || [])
      .map((page) => {
        const p = page.properties || {};
        const rating = p.Rating && typeof p.Rating.number === 'number' ? p.Rating.number : null;
        return {
          id: page.id,
          name: text(p.Name),
          role: text(p.Role),
          company: text(p.Company),
          project: text(p.Project),
          when: text(p.When),
          rating: rating && rating >= 1 && rating <= 5 ? Math.round(rating) : null,
          quote: text(p.Experience),
        };
      })
      .filter((r) => r.name && r.quote);

    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=3600');
    return res.status(200).json({ references });
  } catch (err) {
    console.error('References handler failed', err);
    return res.status(500).json({ error: 'Something went wrong' });
  }
}
