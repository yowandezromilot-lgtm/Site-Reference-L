import fs from "node:fs";

async function parseLocal() {
  const url = "https://api.openstreetmap.org/api/0.6/map?bbox=49.285,-12.312,49.298,-12.298";
  const res = await fetch(url, { headers: { "User-Agent": "AntigravityDev/1.0" } });
  const xml = await res.text();

  // Find ways with name
  const ways = xml.matchAll(/<way id="(\d+)"[^>]*>([\s\S]*?)<\/way>/g);
  const ndToCoord = new Map();
  const nodeMatches = xml.matchAll(/<node id="(\d+)" lat="([^"]+)" lon="([^"]+)"/g);
  for (const nm of nodeMatches) {
    ndToCoord.set(nm[1], { lat: parseFloat(nm[2]), lon: parseFloat(nm[3]) });
  }

  for (const w of ways) {
    const content = w[2];
    const nameMatch = content.match(/<tag k="name" v="([^"]+)"\/>/);
    if (nameMatch) {
      const nds = [...content.matchAll(/<nd ref="(\d+)"\/>/g)].map((m) => m[1]);
      const coords = nds.map((id) => ndToCoord.get(id)).filter(Boolean);
      if (coords.length > 0) {
        const mid = coords[Math.floor(coords.length / 2)];
        console.log(
          `WAY "${nameMatch[1]}" mid: lat=${mid.lat}, lon=${mid.lon} (start: ${coords[0].lat}, ${coords[0].lon} to: ${coords[coords.length - 1].lat}, ${coords[coords.length - 1].lon})`,
        );
      }
    }
  }

  // Also node points
  const nodes = xml.matchAll(
    /<node id="(\d+)" lat="([^"]+)" lon="([^"]+)"[^>]*>([\s\S]*?)<\/node>/g,
  );
  for (const n of nodes) {
    const content = n[4];
    const nameMatch = content.match(/<tag k="name" v="([^"]+)"\/>/);
    if (nameMatch) {
      console.log(`NODE "${nameMatch[1]}" lat=${n[2]}, lon=${n[3]}`);
    }
  }
}
parseLocal().catch(console.error);
