import fs from "fs";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Only POST requests allowed" });
  }

  // načítaj clients.json
  const clients = JSON.parse(fs.readFileSync("./clients.json", "utf-8"));

  const { apiKey, nazov, cena, popis, obrazok } = req.body;

  if (!apiKey || !clients[apiKey]) {
    return res.status(401).json({ message: "Neplatný API kľúč" });
  }

  const client = clients[apiKey];

  try {
    const response = await fetch(
      `https://api.webflow.com/v2/sites/${client.siteId}/collections/${client.collectionId}/items`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${client.apiToken}`,
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          isDraft: false,
          isArchived: false,
          fieldData: {
            name: nazov,
            slug: nazov.toLowerCase().replace(/\s+/g, "-"),
            cena,
            popis,
            obrazok
          }
        })
      }
    );

    const data = await response.json();

    // 🚨 tu pridáme kontrolu
    if (!response.ok) {
      console.error("Webflow API error:", data);
      return res.status(response.status).json({
        message: "Webflow API error",
        details: data
      });
    }

    return res.status(200).json(data);

  } catch (err) {
    console.error("Server error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
}
