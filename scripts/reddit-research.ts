/**
 * scripts/reddit-research.ts
 *
 * Pulls resident discussion about ASU Tempe apartments from Reddit's public JSON API,
 * then synthesises each apartment's data into a plain-English summary via Claude.
 *
 * Run:  npx tsx scripts/reddit-research.ts
 *
 * Requires ANTHROPIC_API_KEY in .env.local (auto-loaded below).
 */

import axios from "axios";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import Anthropic from "@anthropic-ai/sdk";

// __dirname equivalent for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env.local from the project root (one level up from scripts/)
dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

// ─── Config ──────────────────────────────────────────────────────────────────

const DELAY_MS = 4_000;          // polite pause between Reddit requests
const BETWEEN_APARTMENTS_MS = 8_000; // extra pause between apartments
const RETRY_BASE_MS = 5_000;     // exponential backoff base
const MAX_RETRIES = 4;
const COMMENT_LIMIT = 5;         // top N comments per post
const MAX_POSTS_PER_APT = 8;     // cap after deduplication, ranked by score
const SEARCH_LIMIT = 25;
const MIN_SCORE = 1;             // discard posts/comments at or below this

const OUTPUT_DIR = path.resolve(__dirname, "reddit-data");

// ─── Apartment list ───────────────────────────────────────────────────────────

const APARTMENTS: { name: string; slug: string }[] = [
  { name: "Alight Tempe",               slug: "alight-tempe" },
  { name: "District on Apache",         slug: "district-on-apache" },
  { name: "Union Tempe",                slug: "union-tempe" },
  { name: "University House Tempe",     slug: "university-house-tempe" },
  { name: "University Park Tempe",      slug: "university-park-tempe" },
  { name: "Paseo on University",        slug: "paseo-on-university" },
  { name: "Nexa Apartments",            slug: "nexa-apartments" },
  { name: "Skye at McClintock Station", slug: "skye-at-mcclintock-station" },
  { name: "Cleo Tempe",                 slug: "cleo-tempe" },
  { name: "Gateway at Tempe",           slug: "gateway-at-tempe" },
  { name: "Agave Apartments",           slug: "agave-apartments" },
  { name: "Onnix",                      slug: "onnix" },
  { name: "V on Broadway",              slug: "v-on-broadway" },
  { name: "The Access",                 slug: "the-access" },
  { name: "Riverside Luxury Living",    slug: "riverside-luxury-living" },
  { name: "Volta on Broadway",          slug: "volta-on-broadway" },
  { name: "The Hyve",                   slug: "the-hyve" },
  { name: "IMT Desert Palm Village",    slug: "imt-desert-palm-village" },
];

// ─── Types ────────────────────────────────────────────────────────────────────

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

// ─── HTTP helpers ─────────────────────────────────────────────────────────────

const http = axios.create({
  headers: {
    "User-Agent": "ASUDesiHub/1.0 (student housing research; github.com/asu-desi-hub)",
    Accept: "application/json",
  },
  timeout: 20_000,
});

function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

async function fetchJSON(url: string, attempt = 0): Promise<unknown> {
  try {
    const { data } = await http.get<unknown>(url);
    return data;
  } catch (err: unknown) {
    const status =
      axios.isAxiosError(err) ? err.response?.status : undefined;

    const shouldRetry =
      status === 429 ||
      status === 503 ||
      status === 500 ||
      (axios.isAxiosError(err) && !err.response); // network timeout

    if (shouldRetry && attempt < MAX_RETRIES) {
      const wait = RETRY_BASE_MS * Math.pow(2, attempt);
      console.log(
        `     ⏳ HTTP ${status ?? "timeout"} - retrying in ${wait / 1_000}s (attempt ${attempt + 1}/${MAX_RETRIES})`,
      );
      await sleep(wait);
      return fetchJSON(url, attempt + 1);
    }

    throw err;
  }
}

// ─── Reddit API calls ─────────────────────────────────────────────────────────

function unixToDate(utc: number): string {
  return new Date(utc * 1_000).toISOString().slice(0, 10);
}

async function searchR_ASU(query: string): Promise<RawPost[]> {
  const url =
    `https://www.reddit.com/r/ASU/search.json` +
    `?q=${encodeURIComponent(query)}&sort=relevance&limit=${SEARCH_LIMIT}&restrict_sr=1`;

  const data = (await fetchJSON(url)) as RedditSearchResponse;
  return data?.data?.children ?? [];
}

async function fetchTopComments(postId: string): Promise<RedditComment[]> {
  const url =
    `https://www.reddit.com/comments/${postId}.json` +
    `?limit=${COMMENT_LIMIT}&sort=top`;

  const data = (await fetchJSON(url)) as RedditCommentsResponse;
  if (!Array.isArray(data) || data.length < 2) return [];

  const children = data[1]?.data?.children ?? [];

  return children
    .filter(
      (c) =>
        c.kind === "t1" &&
        c.data.score > MIN_SCORE &&
        c.data.body &&
        c.data.body !== "[deleted]" &&
        c.data.body !== "[removed]",
    )
    .slice(0, COMMENT_LIMIT)
    .map((c) => ({
      body: c.data.body,
      score: c.data.score,
      date: unixToDate(c.data.created_utc),
      // author intentionally omitted
    }));
}

// ─── Reddit response types (minimal) ─────────────────────────────────────────

interface RawPostData {
  id: string;
  title: string;
  permalink: string;
  score: number;
  created_utc: number;
  selftext: string;
}
interface RawPost {
  kind: string;
  data: RawPostData;
}
interface RedditSearchResponse {
  data: { children: RawPost[] };
}
interface RawCommentData {
  body: string;
  score: number;
  created_utc: number;
}
interface RawComment {
  kind: string;
  data: RawCommentData;
}
interface RedditCommentsResponse {
  1: { data: { children: RawComment[] } };
}

// ─── Per-apartment research ───────────────────────────────────────────────────

async function researchApartment(
  name: string,
  slug: string,
): Promise<ApartmentData> {
  // 2 searches only: bare name + "{name} ASU"
  const queries = [name, `${name} ASU`];

  const seenIds = new Set<string>();
  const candidates: RawPost[] = [];

  // ── Phase 1: collect unique post candidates across searches ──
  for (const query of queries) {
    console.log(`  🔍 "${query}"`);
    await sleep(DELAY_MS);

    let results: RawPost[] = [];
    try {
      results = await searchR_ASU(query);
    } catch (err) {
      console.log(`     ⚠️  Search failed: ${(err as Error).message}`);
      continue;
    }

    const fresh = results.filter(
      (r) => r.kind === "t3" && !seenIds.has(r.data.id) && r.data.score > MIN_SCORE,
    );

    console.log(
      `     ${results.length} results · ${fresh.length} new with score > ${MIN_SCORE}`,
    );

    for (const r of fresh) {
      seenIds.add(r.data.id);
      candidates.push(r);
    }
  }

  // ── Phase 2: take top MAX_POSTS_PER_APT by score, then fetch comments ──
  const topCandidates = candidates
    .sort((a, b) => b.data.score - a.data.score)
    .slice(0, MAX_POSTS_PER_APT);

  console.log(
    `  📋 ${candidates.length} unique posts found → fetching comments for top ${topCandidates.length}`,
  );

  const posts: RedditPost[] = [];

  for (const result of topCandidates) {
    const p = result.data;
    console.log(`     💬 "${p.title.slice(0, 60)}…" (score ${p.score})`);
    await sleep(DELAY_MS);

    let comments: RedditComment[] = [];
    try {
      comments = await fetchTopComments(p.id);
    } catch {
      console.log(`     ⚠️  Comments failed for this post - skipping`);
      // still include the post itself, just without comments
    }

    posts.push({
      title: p.title,
      url: `https://reddit.com${p.permalink}`,
      score: p.score,
      date: unixToDate(p.created_utc),
      selftext: p.selftext ?? "",
      comments,
    });
  }

  console.log(`  ✅ ${posts.length} post(s) collected`);
  return { apartment: name, slug, posts };
}

// ─── Claude synthesis ─────────────────────────────────────────────────────────

const NOT_ENOUGH = "Not enough community data yet.";

async function synthesise(data: ApartmentData): Promise<string> {
  if (data.posts.length === 0) return NOT_ENOUGH;

  const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
  if (!apiKey) {
    console.warn("  ⚠️  ANTHROPIC_API_KEY not set - skipping synthesis");
    return NOT_ENOUGH;
  }

  const client = new Anthropic({ apiKey });

  // Build a compact plaintext dump - no usernames, just content
  const textDump = data.posts
    .map((p) => {
      const commentBlock = p.comments
        .map((c) => `  [${c.score}↑ ${c.date}] ${c.body}`)
        .join("\n");
      return [
        `## Post: ${p.title} (score: ${p.score}, date: ${p.date})`,
        p.selftext ? `Post body: ${p.selftext}` : "",
        commentBlock || "  (no comments above threshold)",
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n\n---\n\n");

  const systemPrompt =
    `You are writing the "What residents say" section of a student housing guide for ` +
    `students at ASU Tempe. Based on the resident experiences below, write ` +
    `2-3 short paragraphs (150-200 words total) of plain, honest, conversational advice about ` +
    `${data.apartment}. Follow these rules strictly:\n` +
    `- Write as if a well-informed friend is telling you what to genuinely expect. Use "you" ` +
    `and "residents" naturally.\n` +
    `- Do NOT mention Reddit, reviews, forums, data sources, or where the information comes from.\n` +
    `- Do NOT use markdown - no headers, no bullet points, no bold, no dashes (no –, -, or ---).\n` +
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
      messages: [
        {
          role: "user",
          content: textDump,
        },
      ],
    });

    const block = message.content[0];
    return block.type === "text" ? block.text.trim() : NOT_ENOUGH;
  } catch (err) {
    console.error(`  ❌ Claude error: ${(err as Error).message}`);
    return NOT_ENOUGH;
  }
}

// ─── Entry point ─────────────────────────────────────────────────────────────

async function main() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  console.log(`\n🏠 ASU Orbit - Reddit research`);
  console.log(`   Output: ${OUTPUT_DIR}`);
  console.log(`   Apartments: ${APARTMENTS.length}`);
  console.log(`   Anthropic key: ${process.env.ANTHROPIC_API_KEY ? "✓ loaded" : "✗ missing"}\n`);

  const allSummaries: Record<string, string> = {};

  for (let i = 0; i < APARTMENTS.length; i++) {
    const { name, slug } = APARTMENTS[i];
    console.log(`\n─── [${i + 1}/${APARTMENTS.length}] ${name} ───`);

    // 1. Collect Reddit data
    let data: ApartmentData;
    try {
      data = await researchApartment(name, slug);
    } catch (err) {
      console.error(`  ❌ Research failed: ${(err as Error).message}`);
      data = { apartment: name, slug, posts: [] };
    }

    // 2. Save raw JSON
    const jsonPath = path.join(OUTPUT_DIR, `${slug}.json`);
    fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2), "utf8");
    console.log(`  💾 Raw data → ${slug}.json`);

    // 3. Synthesise
    console.log(`  🤖 Calling Claude…`);
    const summary = await synthesise(data);

    // 4. Save per-apartment summary
    const summaryPath = path.join(OUTPUT_DIR, `${slug}-summary.txt`);
    fs.writeFileSync(summaryPath, summary, "utf8");
    console.log(`  📄 Summary → ${slug}-summary.txt`);

    allSummaries[slug] = summary;

    // Pause between apartments (skip after the last one)
    if (i < APARTMENTS.length - 1) {
      console.log(`  ⏸  Waiting ${BETWEEN_APARTMENTS_MS / 1_000}s before next apartment…`);
      await sleep(BETWEEN_APARTMENTS_MS);
    }
  }

  // 5. Write combined file
  const allPath = path.join(OUTPUT_DIR, "all-summaries.json");
  fs.writeFileSync(allPath, JSON.stringify(allSummaries, null, 2), "utf8");

  console.log(`\n🎉 Done! Combined summaries → scripts/reddit-data/all-summaries.json`);
  console.log(
    `\nNext step: copy summaries into the community_notes column in Supabase.\n`,
  );
}

main().catch((err) => {
  console.error("\n💥 Fatal error:", err);
  process.exit(1);
});
