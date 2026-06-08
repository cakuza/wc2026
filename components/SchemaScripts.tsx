import { websiteSchema } from "@/lib/schema";

export function SchemaScripts() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema()) }}
      />
    </>
  );
}
