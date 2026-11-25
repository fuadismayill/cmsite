// Vercel "public" qovluğunu statik çıxış kimi tapır: səhifəni ora kopyalayır.
import { copyFileSync, mkdirSync } from "node:fs"

mkdirSync("public", { recursive: true })
copyFileSync("index.html", "public/index.html")
console.log("index.html -> public/index.html")
