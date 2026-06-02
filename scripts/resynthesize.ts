/**
 * scripts/resynthesize.ts
 *
 * Re-runs only the Claude synthesis step using the already-downloaded
 * Reddit JSON files in scripts/reddit-data/.  No network requests to
 * Reddit are made.
 *
 * Run:  npx tsx scripts/resynthesize.ts
 *
 * Requires ANTHROPIC_API_KEY in .env.local
 */

import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import Anthropic from "@anthropic-ai/sdk";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

const OUTPUT_DIR = path.resolve(__dirname, "reddit-data");
const NOT_ENOUGH = "Not enough community data yet.";

// ── Types (mirrors reddit-research.ts) ───────────────────────────────────────

interface RedditComment {
  body: string;
  score: number;
  date: string;
}

interface RedditPost {
  title: string;
  url: string;
  score: number;
  date: string;
  selftext: string;
  comments: RedditComment[];
}

interface ApartmentData {
  apartment: string;
  slug: string;
  posts: RedditPost[];
}

// ── Claude synthesis ──────────────────────────────────────────────────────────

function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

async function synthesise(
  client: Anthropic,
  data: ApartmentData,
): Promise<string> {
  if (data.posts.length === 0) return NOT_ENOUGH;

  const textDump = data.posts
    .map((p) => {
      const commentBlock = p.comments
        .map((c) => `  [${c.score}↑ ${c.date}] ${c.body}`)
        .join("\n");
      return [
        `Post: ${p.title} (score: ${p.score}, date: ${p.date})`,
        p.selftext ? `Post body: ${p.selftext}` : "",
        commentBlock || "  (no comments above threshold)",
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n\n");

  const systemPrompt =
    `You are writing the "What residents say" section of a student housing guide for ` +
    `students at ASU Tempe. Based on the resident experiences below, write ` +
    `2-3 short paragraphs (150-200 words total) of plain, honest, conversational advice about ` +
    `${data.apartment}. Follow these rules strictly:\n` +
    `- Write as if a well-informed friend is telling you what to genuinely expect. Use "you" ` +
    `and "residents" naturally.\n` +
    `- Do NOT mention Reddit, reviews, forums, data sources, or where the information comes from.\n` +
    `- Do NOT use markdown — no headers, no bullet points, no bold, no dashes (no –, —, or ---).\n` +
    `- Do NOT use phrases like "based on reviews", "community data shows", or "residents report that".\n` +
    `- Be honest. If something is bad, say it plainly and helpfully. If something is good, say that too.\n` +
    `- Focus on: management quality, maintenance response, move-out and deposit charges, noise levels, ` +
    `safety, value for money, and anything relevant to students (deposits, ` +
    `lease documentation, roommate situations).\n` +
    `- End with one practical sentence about who this building is a good fit for, or not.\n` +
    `- If there is genuinely not enough information to say anything useful, write exactly: '${NOT_ENOUGH}'\n` +
    `- Plain paragraphs only. No em dashes. No lists. No formatting.`;

  try {
    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 512,
      system: systemPrompt,
      messages: [{ role: "user", content: textDump }],
    });

    const block = message.content[0];
    return block.type === "text" ? block.text.trim() : NOT_ENOUGH;
  } catch (err) {
    console.error(`  ❌ Claude error: ${(err as Error).message}`);
    return NOT_ENOUGH;
  }
}

// ── Entry point ───────────────────────────────────────────────────────────────

async function main() {
  const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
  if (!apiKey) {
    console.error("❌ ANTHROPIC_API_KEY not set in .env.local");
    process.exit(1);
  }

  const client = new Anthropic({ apiKey });

  // Collect all {slug}.json files (skip all-summaries.json)
  const files = fs
    .readdirSync(OUTPUT_DIR)
    .filter((f) => f.endsWith(".json") && f !== "all-summaries.json");

  console.log(`\n🏠 ASU Orbit — Re-synthesis with humanised prompt`);
  console.log(`   Reading from: ${OUTPUT_DIR}`);
  console.log(`   Apartments:   ${files.length}\n`);

  const allSummaries: Record<string, string> = {};

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const slug = file.replace(".json", "");
    const rawPath = path.join(OUTPUT_DIR, file);

    const data = JSON.parse(fs.readFileSync(rawPath, "utf8")) as ApartmentData;
    const postCount = data.posts.length;

    console.log(
      `[${i + 1}/${files.length}] ${data.apartment} — ${postCount} post(s)`,
    );

    const summary = await synthesise(client, data);

    // Overwrite per-apartment summary file
    const summaryPath = path.join(OUTPUT_DIR, `${slug}-summary.txt`);
    fs.writeFileSync(summaryPath, summary, "utf8");
    console.log(`  ✅ → ${slug}-summary.txt`);

    allSummaries[slug] = summary;

    // Small pause between Claude calls to avoid rate limiting
    if (i < files.length - 1) await sleep(1_000);
  }

  // Overwrite combined file
  const allPath = path.join(OUTPUT_DIR, "all-summaries.json");
  fs.writeFileSync(allPath, JSON.stringify(allSummaries, null, 2), "utf8");

  console.log(`\n🎉 Done! Updated summaries → scripts/reddit-data/all-summaries.json`);
  console.log(`\nNext: copy the summaries into update-descriptions.sql and run in Supabase.\n`);
}

main().catch((err) => {
  console.error("\n💥 Fatal:", err);
  process.exit(1);
});
