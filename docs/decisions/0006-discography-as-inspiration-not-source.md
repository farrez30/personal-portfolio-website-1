# 0006. Discography as inspiration, not as source code

- Date: 2026-11-04
- Status: Accepted

## Context

Discography (github.com/dmtrbrl/discography) is the visual reference for the rack. Its repository
has no license file. Farrez asked to copy its code; under copyright law a public repository without
a license is "all rights reserved" (GitHub Docs, choosealicense.com), and attribution is not a
license.

## Options considered

1. Copy the code with attribution.
2. Ask the author for a license, and meanwhile reimplement from the techniques (study notes, own
   code, own assets).
3. Drop the reference.

## Decision

Option 2. Decided by: Farrez (approved opening issue
https://github.com/dmtrbrl/discography/issues/3 and cloning the repository locally to study).

## Reasoning

Farrez disagreed that the rule should be this strict, and accepted the issue route so the site
carries no legal risk while the author answers.

## Consequences

- The clone lives in `D:\Projects\references\discography`, outside this repository.
- Measurements and techniques (millimetre case parts, softbox sheen, diffraction, flight paths) are
  rewritten here; no file, texture or font from it is used.
- Credit as inspiration sits in README and `public/credits.txt`, not on the front page.
- Revisit if the author adds a license or answers the issue.
