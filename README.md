# Jabio

Jabio ranks the best areas in 15 Iranian cities for a business, and checks any spot on the map, using real OpenStreetMap data. Around it, each part of the site does one job:

| Page | Its one job |
|---|---|
| `index.html` | Explains Jabio and sends people to it |
| `jabio.html` | **Analyze**: best areas for a business, or what fits a spot |
| `report.html` | The printable report of one analysis, rebuilt from its address |
| `about.html` | What Jabio is, how it works, what it holds to |
| `sources.html` | **Data sources and licences**, and what the data cannot tell you (`tools/build_pages.py`) |
| `faq.html` | **FAQ**: ten honest answers |
| `contact.html` | **Contact** form (needs the email in `assets/site.js`) |
| `404.html`, `robots.txt` | Not-found page and robots file. `sitemap.xml` and link-preview tags appear once `tools/site_url.txt` holds the site address; the preview image is `assets/og.png` (source `tools/og-source.html`) |
<!-- coderabbit-ai-generated:v1 -->

<!-- coderabbit-ai-generated-section:v1:494d49901f3acf30f83e028e693f418494b1f4d23428d2bd08b82faa0fb15ff0 -->

| `login.html` | Account registration and sign-in when the account service is running |

<!-- /coderabbit-ai-generated:v1 -->

<!-- coderabbit-ai-generated:v1 -->

<!-- coderabbit-ai-generated-section:v1:0d78d33c3a86b14045a49456a43f6770f4ea9468c8cb09974346b0fc48e23d1e -->

The analysis can run as a static site. Account registration and synchronized saves additionally require the Django service in `server/`; the static server remains guest-only. See [server setup](server/README.md).

<!-- /coderabbit-ai-generated:v1 -->

## Put your details in

Open `assets/site.js` and fill in `GA_SITE` at the top (email, LinkedIn, GitHub, X, YouTube). Empty entries stay hidden. The email also turns on the contact form.

## How the score works (method v2)

```
score = w_people × people + w_demand × demand + w_access × access + 0.20 × room
```

Counted from OpenStreetMap on a 250 m grid and scaled against the busiest part of the same city (top 2 % = 100). Nearby things count more than far ones (Gaussian falling to 13 % at the edge of the radius). **Room** compares the rivals present with the number that this much demand normally carries in the same city (50 = as many as usual). "Away from rivals" raises its weight to 0.35. Two guards: an area needs a demand index of at least 40 to be ranked, and "Recommended" needs at least 50. Every score comes with a plausible range (population ±30 %, map data ±10/20/30 % by coverage).

The people / demand / access weights are per business and are JUDGEMENT, not a fit (people 32% / demand 26% / access 22% for neighbourhood businesses, 24% / 34% / 22% for businesses that live on visitors and offices; room beside rivals 20%). A fit to where businesses already are was tried and dropped because it pulled every answer to the commercial centre (`tools/calibration.md`). A concept that depends on income (luxury café, fine dining, jewellery, skin clinic, tennis …) also blends in an income-level layer, built for Tehran only from elevation (`tools/add_affluence.py`; owner corrections in `content/affluence/tehran.csv`). `VALIDATION.md` measures only consistency with the existing map.

**What a user sees besides the score** (all from the same data, none of it changes the score): where the block stands among all blocks of the city, people per rival against a typical block, who is around (residents, workers, students, visitors), nearest rival and transit stop, the same spot at 500/1000/2000/3000 m, up to three clearly better well-mapped spots within 1.5 km, a break-even calculator that uses the visitor's own rent and prices, and a checklist of what the data cannot tell (rent, real foot traffic, rival quality, closed shops, plans for the area, licences, parking). The printed report carries the same sections.

**Business categories and concepts.** Each of the ten main categories has 10 to 14 detailed concepts (café: student, grab-and-go, café-restaurant, vegan, specialty, book café…; 124 in all), written in `tools/taxonomy_data.py` and built by `tools/build_taxonomy.py` into `assets/data/taxonomy.js` and the page `categories.html`. A concept changes who the customers are, what matters most, how much each demand driver counts and which places count as rivals; look-alike rivals are also counted by name. The main categories are fitted to data (VALIDATION.md); the concept settings are expert starting points and the interface says so. To add or change a concept, edit the data file and rebuild.

**Pedestrian-flow model.** For municipal district 5 of Tehran (all seven sub-districts) only, a gravity model on the walking network estimates where people walk (`tools/build_foot_model.py`, report in `tools/foot_model_d5.md`). It is a relative, uncalibrated index shown as a map layer and in the spot analysis; it is not part of the score and needs real pedestrian counts before any number is read as people.

**Districts.** For Tehran the workspace also ranks the 22 municipal districts and 116 sub-districts for the chosen business (`tools/extract_districts.py`, `tools/build_districts.py`, boundaries from OpenStreetMap). District resident counts are a model and can be far off; scale them to the census with `content/census/` and `tools/rake_population.py`. Details in DATA-EXTRACTION.md.

**Completing the places.** OpenStreetMap is incomplete in Iran (in Tehran it holds roughly half of the real shops). `tools/add_overture.py` adds confident, open places from Overture Maps that are not within 50 m of an OSM place of the same kind (+2,437 in Tehran, mostly restaurants, cafés, offices; checked: validation did not get worse). `content/places/` takes your own field-survey CSV (`tools/import_places.py`), the only way to finish a district like Ekbatan. Order: add_overture, then import_places. Do not copy from Google Maps, Neshan or Balad (their terms forbid bulk copying).

**What it does not know:** rent, real foot traffic, and the real income of each street. People come from the WorldPop 2020 model (CC BY 4.0, 1 km), spread over the 250 m cells in proportion to OpenStreetMap buildings (`tools/add_population.py`). WorldPop left the well-built north of Tehran almost empty (Tajrish: ~350 people/km2), so in Tehran the pattern of residents is blended half-and-half with the footprints of the ~520,000 buildings Overture Maps holds (OpenStreetMap + Microsoft ML Buildings; `tools/fetch_overture_buildings.py`, `tools/blend_population.py`). Against the district populations I could find published (18 of 22 districts, mixed census years) the typical error went from x1.9 to x1.7 (`tools/check_population.py`); it is still a model, not a census, and district 1 has no published figure to check against. Where OpenStreetMap is thin the counts are low, and every result says so (rich / partial / thin, from the number of buildings mapped). Treat a score as a shortlist to go and look at, not as a verdict.

## Rebuilding

```
python tools/build_site.py          pages, link check, engine test (no downloads)
python tools/build_osm_snapshot.py <iran.osm.pbf> . 2026-11-04     city data (needs pyosmium, about 6 min)
python tools/finalize_city_data.py .                               place, building and coverage counts per city
python tools/build_character.py ...                                the sign-in character, see its header
```

`tools/chrome.py` is the single source of the menu and footer; every page is built, none is written by hand except `login.html` and `signup.html`.

## Where things live

- `assets/jabio-engine.js` scoring · `jabio-common.js` texts and charts · `jabio-ui.js` workspace · `jabio-report.js` report
- `assets/data/cities/` per-city data (`<city>.js` for the engine)
- `assets/base.css`, `design-system.css` (the look, matched to Blackmarket/LootRun), `theme-light.css`, `jabio.css`, `home.css`, `content.css`, `pages.css`
- `assets/vendor/` MapLibre and its RTL plugin, self-hosted · `assets/fonts/` fonts, self-hosted
- `assets/maps/` the home hero: NASA night lights and Natural Earth lines

## Needs internet

Basemap tiles on the analysis page (OpenFreeMap). Everything else is local, including the analysis itself and the report's map.

## Data and credit

Full list with licences: `sources.html` (built by `tools/build_pages.py`). The home hero uses Natural Earth lines (public domain) and NASA night lights. Keep the credits if you publish. The OSM snapshot is of 2026-11-04.
