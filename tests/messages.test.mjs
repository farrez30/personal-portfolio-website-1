// Guards the translation files: same keys in every locale, and visible copy
// sticks to plain punctuation (no dash-joined clauses, arrows or emoji markers).
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";

const dir = new URL("../messages/", import.meta.url);
const locales = Object.fromEntries(
  readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => [f.replace(".json", ""), JSON.parse(readFileSync(new URL(f, dir), "utf8"))])
);

// "a.b.c" -> value, arrays kept as leaves
const flatten = (obj, prefix = "") =>
  Object.entries(obj).flatMap(([k, v]) =>
    v && typeof v === "object" && !Array.isArray(v)
      ? flatten(v, `${prefix}${k}.`)
      : [[`${prefix}${k}`, v]]
  );

const strings = (v) => (Array.isArray(v) ? v : [v]).filter((s) => typeof s === "string");

test("every locale has the same keys as en", () => {
  const base = flatten(locales.en).map(([k]) => k).sort();
  for (const [loc, msgs] of Object.entries(locales)) {
    assert.deepEqual(flatten(msgs).map(([k]) => k).sort(), base, `keys differ in ${loc}`);
  }
});

const BANNED = [
  [/[—–]/, "dash used to join clauses, use a comma or a full stop"],
  [/→|←|⇒/, "arrow in copy, use a word"],
  [/ · /, "middle-dot joined phrases, split into separate items"],
  [/\p{Extended_Pictographic}/u, "emoji in copy, use an icon from react-icons"],
];

test("copy uses plain punctuation", () => {
  for (const [loc, msgs] of Object.entries(locales)) {
    for (const [key, value] of flatten(msgs)) {
      for (const s of strings(value)) {
        for (const [re, why] of BANNED) assert.doesNotMatch(s, re, `${loc}:${key} ${why}`);
        // " | " is only the browser-tab title separator
        if (key !== "meta.title") assert.ok(!s.includes(" | "), `${loc}:${key} uses " | "`);
      }
    }
  }
});

test("header roles are a list, so each role can be kept on one line", () => {
  for (const [loc, msgs] of Object.entries(locales)) {
    assert.ok(Array.isArray(msgs.header.roles) && msgs.header.roles.length > 0, `${loc}: header.roles`);
  }
});
