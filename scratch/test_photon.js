async function testPhoton() {
  const queries = ["Sarimasina", "Ambohimitsinjo", "Banja Antsiranana", "Madame Vazaha"];
  for (const q of queries) {
    const res = await fetch(
      `https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&lat=-12.28&lon=49.29`,
    );
    const data = await res.json();
    console.log(`=== Query: ${q} ===`);
    data.features?.forEach((f) => {
      console.log(
        f.properties.name,
        f.properties.city,
        f.properties.street,
        f.geometry.coordinates,
      );
    });
  }
}
testPhoton().catch(console.error);
