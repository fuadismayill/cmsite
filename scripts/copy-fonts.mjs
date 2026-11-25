// Variable şrift fayllarını npm paketlərindən fonts/ qovluğuna kopyalayır (yalnız latin və latin-ext: Azərbaycan hərfləri üçün kifayətdir).
import { copyFileSync, mkdirSync } from "node:fs"

mkdirSync("fonts", { recursive: true })
const sources = {
  "montserrat-latin": "node_modules/@fontsource-variable/montserrat/files/montserrat-latin-wght-normal.woff2",
  "montserrat-latin-ext": "node_modules/@fontsource-variable/montserrat/files/montserrat-latin-ext-wght-normal.woff2",
  "noto-sans-latin": "node_modules/@fontsource-variable/noto-sans/files/noto-sans-latin-wght-normal.woff2",
  "noto-sans-latin-ext": "node_modules/@fontsource-variable/noto-sans/files/noto-sans-latin-ext-wght-normal.woff2",
}
for (const [name, from] of Object.entries(sources)) copyFileSync(from, `fonts/${name}.woff2`)
console.log("Şriftlər kopyalandı:", Object.keys(sources).join(", "))
