export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Only POST requests allowed" });
  }

  try {
    // 🔹 LOGOVANIE čo príde z portálu
    console.log("===== NEW REQUEST FROM NEHNUTELNOSTI.SK =====");
    console.log("Headers:", req.headers);
    console.log("Body:", req.body);
    console.log("============================================");

    // načítaj všetkých klientov zo serverových premenných
    const clients = JSON.parse(process.env.CLIENTS_JSON);

    const { apiKey, nazov, cena, popis, obrazok } = req.body;

    // validácia API kľúča
    if (!apiKey || !clients[apiKey]) {
      return res.status(401).json({ message: "Neplatný API kľúč" });
    }

    const client = clients[apiKey];

    // payload pre Webflow
    const payload = {
      isDraft: false,
      isArchived: false,
      fieldData: {
        name: nazov,
        slug: nazov
          .toLowerCase()
          .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // odstráni diakritiku
          .replace(/[^a-z0-9]+/g, "-") // nahradí všetko iné ako a-z0-9 pomlčkou
          .replace(/^-+|-+$/g, ""),    // odstráni pomlčky na začiatku a konci
        cena,
        popis,
        obrazok
      }
    };

    // zavolaj Webflow API
    const response = await fetch(
      `https://api.webflow.com/v2/sites/${client.siteId}/collections/${client.collectionId}/items`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${client.apiToken}`,
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: JSON.stringify(payload)
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        message: "Webflow API error",
        details: data
      });
    }

    return res.status(200).json(data);

  } catch (err) {
    console.error("Server error:", err);
    return res.status(500).json({
      message: "Server error",
      error: err.message
    });
  }
}
