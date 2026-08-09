const https = require("https");
const fs = require("fs");

function getPage(url) {
  return new Promise((resolve) => {
    https.get(url, { headers: { "User-Agent": "Mozilla/5.0" } }, res => {
      let data = "";
      res.on("data", chunk => data += chunk);
      res.on("end", () => resolve(data));
    }).on("error", () => resolve(""));
  });
}

async function main() {
  const html = await getPage("https://www.docteur-fitness.com/post-sitemap.xml");
  const urls = [...html.matchAll(/<loc>(https:\/\/www\.docteur-fitness\.com\/[^<]+)<\/loc>/g)].map(m => m[1]);
  console.log("Total articles in sitemap:", urls.length);
  
  const keywords = ["poulie", "smith", "adducteur", "machine", "incline", "triceps", "biceps", "couche", "developpe", "ecarte", "pec"];
  const relevant = urls.filter(u => keywords.some(k => u.includes(k)));
  console.log("Relevant articles count:", relevant.length);

  const foundGifs = {};
  for (const u of relevant) {
    const p = await getPage(u);
    const gifs = [...p.matchAll(/(https:\/\/www\.docteur-fitness\.com\/wp-content\/uploads\/[^\s"'\>]+\.gif)/g)].map(m => m[1]);
    if (gifs.length > 0) {
      foundGifs[u] = gifs;
    }
  }
  console.log(JSON.stringify(foundGifs, null, 2));
  fs.writeFileSync("found-gifs.json", JSON.stringify(foundGifs, null, 2));
}
main();
