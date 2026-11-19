import { test } from "node:test";
import assert from "node:assert/strict";
import { formatDurasi } from "../components/musik/daftarLagu.js";

test("durasi ditulis m:ss atau j:mm:ss", () => {
  assert.equal(formatDurasi(206123), "3:26");
  assert.equal(formatDurasi(59500), "1:00");
  assert.equal(formatDurasi(5000), "0:05");
  assert.equal(formatDurasi(3723000), "1:02:03");
  for (const v of [0, -1, null, undefined, NaN]) assert.equal(formatDurasi(v), "");
});
