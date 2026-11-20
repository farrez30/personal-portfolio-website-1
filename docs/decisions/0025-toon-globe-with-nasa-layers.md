# 0025. The orbit globe stays three.js toon, layered with NASA imagery

- Date: 2026-11-20
- Status: Accepted

## Context
The orbit page of story v5 shows the station and 22 client satellites around a real-time earth.
Farrez pointed at God's Eye View (MIT, CesiumJS, cloned to `D:\Projects\references\gods-eye-view`)
for more detailed day, night and cloud layers. Reading its code showed it switches globe lighting
off; its value is the layer stack and the data sources (NASA GIBS), not a day/night effect.

## Options considered
1. **three.js toon with NASA GIBS layers** (`orbit.html`): Blue Marble land posterised to pastel
   steps, VIIRS clouds from yesterday, Black Marble city lights, our own USNO sun maths.
2. **CesiumJS** (`orbit-cesium.html`): photoreal NASA imagery, Cesium lighting and atmosphere,
   no ion token. Satellites are dots until GLB models exist; tiles stay blurry near the station
   until they load; much heavier bundle; leaves the toon world of ADR 0020.
3. Use God's Eye View itself: rejected early, it brings Esri/Google/ion terms and no day/night.

Comparison page: `desain/cerita-v5/banding-lapis.html`.

## Decision (decided by: Farrez)
Option 1.

## Reasoning, in Farrez's words
"Tajam dari dekat": near the station A stays sharp, while Cesium is blurry until its tiles load.

Follow-up the same day: the terminator, clouds and night lights should look as real as in Cesium,
inside the toon version. So the earth shader breaks the toon step rule on purpose for light only:
smooth day-night falloff with an orange dusk tint, soft cloud alpha, dark night side, and
continuous Black Marble lights. Land, sea, coastlines and objects stay flat toon.

## Consequences
- Imagery is fetched from NASA GIBS at page load (about 6 to 10 s for three 4096 px images).
  For the build: bake Blue Marble and Black Marble to KTX2, refresh the cloud layer daily by cron.
- `?lapis=datar` keeps the offline flat version.
- No NASA logo, no implied endorsement; credit line "Citra: NASA GIBS".
- Revisit if the whole story moves to a realistic look, or if the station must be seen from far
  orbits where Cesium's streaming tiles win.
