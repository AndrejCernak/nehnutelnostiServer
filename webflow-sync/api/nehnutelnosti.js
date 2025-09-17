import clients from "../clients.json" assert { type: "json" };

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { apiKey, nazov, cena, popis, obrazok } = req.body;
  const client = clients[apiKey];

  if (!client) {
    return res.status(403).json({ error: "Neplatný klient" });
  }

  try {
    const response = await fetch(
      `https://api.webflow.com/v2/sites/${client.site_id}/collections/${client.collection_id}/items`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${client.webflow_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isDraft: false,
          isArchived: false,
          fieldData: {
            name: nazov,
            slug: nazov.toLowerCase().replace(/\s+/g, "-"),
            cena: cena,
            popis: `<p>${popis}</p>`,
            obrazok: obrazok
          }
        })
      }
    );

    const result = await response.json();
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
