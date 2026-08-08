import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import test from "node:test";
import { teamMembers } from "../app/data/team.ts";

const expected = [
  ["Shay Livnat", "Chairman", "/team/shay-livnat.jpg", "https://www.linkedin.com/in/shay-livnat-73193/"],
  ["Liav Ben Rubi", "CEO", "/team/liav-ben-rubi.jpg", "https://www.linkedin.com/in/liav-ben-rubi/"],
  ["Dana Taigman Koren", "CBO", "/team/dana-taigman-koren.jpg", "https://www.linkedin.com/in/danataigmankoren/"],
  ["Dalia Damary", "CFO", "/team/dalia-damary.jpg", "https://www.linkedin.com/in/dalia-damary-4964271a5/"],
  ["Neta Fuchs", "Automotive & Logistics Domain Manager", "/team/neta-fuchs.jpg", "https://www.linkedin.com/in/neta-fuchs-3702163b0/"],
  ["Din Shalit", "Industry 4.0, Energy & Defense Domain Manager", "/team/din-shalit.jpg", "https://www.linkedin.com/in/din-shalit-405267173/"],
  ["Yuval Asayag", "Operations & Marketing Lead", "/team/yuval-asayag.jpg", "https://www.linkedin.com/in/yuval-asayag/"],
  ["Oz Dekel", "Junior Full Stack Developer", "/team/oz-dekel.jpg", "https://www.linkedin.com/in/oz-dekel-789ab326a/"],
  ["Yael Silberbusch", "Office Manager", "/team/yael-silberbusch.jpg", "https://www.linkedin.com/in/yael-silberbusch-44a1723a4/"],
  ["Evyatar Ben-Ishay", "POC Center Manager", "/team/evyatar-ben-ishay.jpg", "https://www.linkedin.com/in/evyatar-ben-ishay-1a8b60138/"],
];

const hashes = {
  "shay-livnat.jpg": "c14f8ae42ac3bd77227283408d84ca74fd8c688b1e6f4d178634931f987c1c2d",
  "liav-ben-rubi.jpg": "a91730fde5b6b2e90c9864eefb2d1af5776fe80cd2f541a05454c947b4c6e531",
  "dana-taigman-koren.jpg": "83635b6caec1e2fedaa1d68f29712f45055ba83bd8c1736bf2df084054d5b316",
  "dalia-damary.jpg": "4aa2664318cff6b8c8a81ebfc7af786cb26f333485058fa8643b2e9d18cda6fe",
  "neta-fuchs.jpg": "5f3dddca5cfab4464c4c59bf3e618a58d2c196b06d2e7615c8efdbe04fc3ad79",
  "din-shalit.jpg": "bb38fa35c52e98f04ce2e614527d7cee65503525b0db5ddfd29e8ee0446e00e0",
  "yuval-asayag.jpg": "bacbd703f5bddbf795469ebd3e678c4ced6c8406185481b92bce1bf5d26c8ad6",
  "oz-dekel.jpg": "ae626789feaf6848f9fdf8007aff7a4b9f18d4b67a52b8e2e8788cfc965bca8f",
  "yael-silberbusch.jpg": "0c1189ddd0c679763b140a42e95ea7776725d3416b5e0ae7c7f8f83b8ef0736c",
  "evyatar-ben-ishay.jpg": "45b921c7aa1d07d81334d5c7227adc1289839a542089b22281856eaea527c96b",
};

function jpegDimensions(buffer) {
  assert.equal(buffer.readUInt16BE(0), 0xffd8);
  let offset = 2;
  while (offset + 9 < buffer.length) {
    if (buffer[offset] !== 0xff) { offset += 1; continue; }
    const marker = buffer[offset + 1];
    if (marker === 0xd8 || marker === 0xd9) { offset += 2; continue; }
    const length = buffer.readUInt16BE(offset + 2);
    if ([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf].includes(marker)) {
      return { height: buffer.readUInt16BE(offset + 5), width: buffer.readUInt16BE(offset + 7) };
    }
    offset += length + 2;
  }
  throw new Error("JPEG dimensions were not found");
}

test("team data exactly matches the authoritative roster", () => {
  assert.equal(teamMembers.length, 10);
  assert.deepEqual(teamMembers.map(({ name, title, image, linkedin }) => [name, title, image, linkedin]), expected);
  assert.equal(new Set(teamMembers.map(({ name }) => name)).size, 10);
  assert.equal(new Set(teamMembers.map(({ linkedin }) => linkedin)).size, 10);
  for (const member of teamMembers) {
    assert.deepEqual(Object.keys(member).sort(), ["image", "linkedin", "name", "title"]);
    assert.match(member.linkedin, /^https:\/\/www\.linkedin\.com\/in\/[a-z0-9-]+\/$/i);
  }
});

test("approved portrait bytes, dimensions, and filenames remain exact", async () => {
  const directory = new URL("../public/team/", import.meta.url);
  const files = (await readdir(directory)).sort();
  assert.deepEqual(files, Object.keys(hashes).sort());
  let aggregate = 0;
  for (const file of files) {
    const bytes = await readFile(new URL(file, directory));
    aggregate += bytes.length;
    assert.ok(bytes.length <= 250 * 1024, `${file}: ${bytes.length}`);
    assert.equal(createHash("sha256").update(bytes).digest("hex"), hashes[file], file);
    assert.deepEqual(jpegDimensions(bytes), { width: 600, height: 600 }, file);
  }
  assert.ok(aggregate <= 1.5 * 1024 * 1024, `aggregate: ${aggregate}`);
});

test("team presentation remains static, server-renderable, and non-promotional", async () => {
  const source = await readFile(new URL("../app/components/about/TeamSection.tsx", import.meta.url), "utf8");
  assert.doesNotMatch(source, /["']use client["']|useState|useEffect|IntersectionObserver|addEventListener|fetch\(|XMLHttpRequest|localStorage|sessionStorage|analytics|carousel/i);
  assert.match(source, /<section[^>]+aria-labelledby=/i);
  assert.match(source, /<ul[^>]+data-team-roster/i);
  assert.match(source, /width="600"[\s\S]*height="600"[\s\S]*loading="lazy"[\s\S]*decoding="async"/i);
  assert.match(source, /target="_blank"[\s\S]*rel="noopener noreferrer"/i);
  assert.doesNotMatch(source, /biograph|credential|achievement|tenure|expertise|reports to|employee count/i);
});
