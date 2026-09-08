// ბაზის პროვაიდერის ავტომატური შერჩევა DATABASE_URL-ის მიხედვით:
//   file:./dev.db          -> sqlite     (ლოკალური / VPS)
//   postgres://… postgresql://… -> postgresql (Vercel + Neon)
//
// prisma/schema.prisma-ში იცვლება მხოლოდ `provider` ხაზი datasource ბლოკში.
// გაშვება ავტომატურია: postinstall, predev, prebuild.
import fs from "node:fs";
import path from "node:path";

const schemaPath = path.join(process.cwd(), "prisma", "schema.prisma");

function readEnvFile(file) {
  try {
    const text = fs.readFileSync(path.join(process.cwd(), file), "utf8");
    const m = /^\s*DATABASE_URL\s*=\s*(.+)$/m.exec(text);
    if (!m) return null;
    return m[1].trim().replace(/^["']|["']$/g, "");
  } catch {
    return null;
  }
}

const url = process.env.DATABASE_URL || readEnvFile(".env.local") || readEnvFile(".env") || "";
const provider = /^postgres(ql)?:\/\//i.test(url) ? "postgresql" : "sqlite";

if (!fs.existsSync(schemaPath)) {
  console.error(`[prisma-schema] ვერ ვიპოვე ${schemaPath}`);
  process.exit(1);
}

const schema = fs.readFileSync(schemaPath, "utf8");
const current = /datasource\s+db\s*\{[^}]*?provider\s*=\s*"([^"]+)"/s.exec(schema)?.[1];

if (current === provider) {
  console.log(`[prisma-schema] პროვაიდერი: ${provider} (უცვლელი)`);
} else {
  const next = schema.replace(
    /(datasource\s+db\s*\{[^}]*?provider\s*=\s*")[^"]+(")/s,
    `$1${provider}$2`
  );
  fs.writeFileSync(schemaPath, next);
  console.log(`[prisma-schema] პროვაიდერი შეიცვალა: ${current} -> ${provider}`);
}
