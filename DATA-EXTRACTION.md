# How the place data is collected (Tehran first, then all of Iran)

Everything below is legal and repeatable. Order matters.

## 1. What we found for Tehran (November 2026)

| Source | Result in the Tehran window |
|---|---|
| OpenStreetMap (Geofabrik extract) | 47,062 places read at first. `tools/audit_osm_tags.py` found tagged places the extractor dropped (internet cafés, marketplaces, laboratories, currency exchanges, caterers, community centres): about +1,100 after fixing `classify()`. |
| Overture Maps (Meta, Foursquare, Microsoft) | 12,582 places in the window; after quality filters and removing everything within 50 m of an OSM place of the same kind, **+2,429**, mostly restaurants, cafés, offices, malls, fitness. |
| Iran's open-data portal (data.gov.ir) | Searched for trade units, land use, commercial centres: nothing at shop level (only agriculture land-use maps and research reports). Tehran municipality's portals were unreachable. |
| Result | About 52,000 places, up from 47,000. Validation did not get worse (0.841). |

**The real problem is not a flat shortage but uneven mapping.** Measured, with correction: the point first used here as "Ekbatan" (35.711, 51.290) is in fact Shahrak Azadi / Farhangian in District 21 (OpenStreetMap puts Ekbatan Town at 35.7070, 51.3056, District 5). In a 3 x 2 km box around that point only about 50 shops and services are mapped (completeness 32 out of 100, about 40,000 residents within 1 km), against 571 in Narmak. The real Ekbatan is better mapped (175 in a 2 x 1.5 km box, completeness 68, still about 40% fewer per km2 than Narmak, in line with the owner's estimate of half missing). So the engine measures **local completeness** (mapped shops against residents, compared with the better-mapped part of the same city); where it is under 30 the area is kept out of the "best areas" ranking, a warning is shown, and the plausible range widens.

## 2. The pipeline

```
python tools/audit_osm_tags.py <iran.osm.pbf> tehran        what the extractor still ignores (BBOX=w,s,e,n for one district)
python tools/fetch_overture.py <overture-iran.parquet>        Overture places for Iran (needs duckdb)
tools/rebuild_city_data.sh <pbf> <parquet> <worldpop.tif> 2026-11-04
        = build_osm_snapshot.py -> finalize_city_data.py -> add_population.py -> add_overture.py -> import_places.py -> build_site.py
python tools/add_affluence.py <copernicus-dem-N35E051.tif> . tehran      # income-level layer, Tehran only
node tools/validate_engine.js --write ; node tools/test_engine.js
```

Add a district by field survey: `content/places/tehran.csv` (see `content/places/README.md`), then `python tools/import_places.py .`

## 3. What we deliberately do not do

Scraping Google Maps, Neshan, Balad, Snapp or similar, even for one district. Checked, not assumed: Balad's terms (balad.ir/terms) forbid "crawling, scraping and using any robot, spider or scraper to access the site and its database automatically, for any purpose". Google's terms say the same, and Neshan's robots.txt closes its search and map endpoints. One complaint could take the whole site down. Their data may only be used through their own licensed APIs (a Neshan or Balad API key, with its terms read first).

Overture Maps has only 19 places in the Shahrak Azadi / Farhangian area (District 21), so no open source fills it. What does: the survey page below.

## 3b. The field-survey page (`survey.html`)

Open it on a phone in the district. Orange squares are where many people live but few shops are mapped (the engine's own completeness measure; Tehran has about 3,700 of them). Tap a shop (or "Use my location"), choose what it is, add the sign's name. It warns about a same-kind place within 30 m, keeps everything in the browser, and downloads `tehran.csv`. Put it in `content/places/` and run `python tools/import_places.py .`. Tested end to end with the real importer.

## 4. Ideas not yet tried (each needs something from the owner, or more work)

- **Street-level photos read by OCR** (shop signs from Mapillary images): needs a free Mapillary token and a coverage check in Tehran.
- **Walk the thin districts** with Every Door (adds to OpenStreetMap itself) or the survey CSV. Start with districts the completeness score flags: it lists exactly where.
- **A licensed place-data feed** (Foursquare, a local directory with a data licence) if the budget exists.
- **OSM mapping party** at a university: a few dozen students can complete a district in a day, and the result benefits everyone.

## 5. To go from Tehran to all of Iran

1. Add the cities (id, name, centre, half-size in km) to `CITIES` in `tools/build_osm_snapshot.py`. 2. `fetch_overture.py` already covers Iran: no change. 3. Run `rebuild_city_data.sh`. 4. Completeness, calibration, validation and tests run per city automatically. Cities with a thin result are flagged by the engine itself.

## 6. Municipal districts and sub-districts (Tehran)

`python tools/extract_districts.py <pbf> <raw.json> 51.00 35.40 51.80 36.00` then `python tools/build_districts.py <raw.json> .` writes `assets/data/cities/tehran-districts.js` from OpenStreetMap boundaries: all 22 districts (منطقه) and 116 sub-districts (ناحیه; the official count is 134, so 18 are missing in OSM). Total area is 628 km2 against about 730 km2 officially, so the outer edges are incomplete. The workspace shows them as "Districts" and "Sub-districts" next to "Best blocks": each ranked by its best 10% of blocks, with residents, rivals per 10,000 residents, mapping completeness and how much of the district lies inside the mapped window.

**Known weakness: district populations.** WorldPop put about 5.95 million people in the 22 districts (census: about 8.7 million), with District 1 at 62,000 and District 22 at 524,000. Section 11 describes the footprint blend that now corrects the pattern; the district totals are still a model and the page says so.

**Shahr-e Rey** (OSM admin_level 7, 23 km2) is not one of the 22 municipal districts but is part of the built-up city, so `build_districts.py` lists it beside them as number 23 (flag `x`). Tajrish, Niavaran, Zafaraniyeh, Elahieh and Kamranieh are inside municipal district 1 and were never outside the map; Shemiranat as a county is mostly mountain and village, and its urban part is Tehran's district 1. To fix it, put the official table in `content/census/tehran.csv` (see `content/census/README.md`) and run `python tools/rake_population.py .`: each district is scaled to its census total while the pattern inside it is kept. Tested on a copy: every district hits its total exactly.

## 7. Rent and prices

Not collected, on purpose. Divar's terms (read on its rendered page) forbid "robots, scrapers, crawlers ... to extract information" and announce legal action; Sheypoor is the same kind of platform. Official statistics exist on data.gov.ir (Statistical Centre: average rent and price per m2 of a residential unit in Tehran), but downloading needs a login, the data is from 2023, and it is residential, city-wide, not commercial. Options that are allowed: (a) apply for Divar's official partner API ("Kenar Divar") and use it under its terms; (b) a form where agents and shop owners report real commercial rents with the date (the same walk-and-record idea as `survey.html`); (c) the visitor's own rent in the break-even box, which already exists.

## 8. Checked and closed (November 2026)

- **Neshan API with a key**: its platform terms (platform.neshan.org/terms, 4-1-8, 4-1-9, 4-1-10) forbid storing service data on a server, bulk fetching into another system, and building business lists from it, even through the API. Written permission is the only way (`DATA-LICENSE-REQUEST.md`).
- **Balad, Divar, Google**: terms forbid crawling and scraping outright.
- **Official sector lists on data.gov.ir** (licensed sports clubs, health centres, municipal health centres, non-state schools): downloading needs a free portal login (HTTP 401 without it), and they carry addresses, not coordinates. Free geocoding (Nominatim) was tested on six Tehran addresses: three found nothing and three were 366 to 996 m off, which is useless for 250 m cells.
- Left: a paid or written data licence (fastest for "everything"), paid field survey with `survey.html`, owners adding their own shops, Mapillary imagery with sign reading (needs a token).

## 9. Income level, population errors and central bias (found with the owner, November 2026)

- A luxury concept was sent to the old central districts. Measured: the engine had no income signal, and the weights fitted to existing businesses pulled everything to the centre (mean distance of the top blocks from the centre: 3.8 km fitted, 4.7 km with the judgement weights now used).
- Income level: no open income map exists, so elevation is the proxy for Tehran (affluent neighbourhoods average 1,618 m, less affluent ones 1,108 m, no overlap; the two lists were written from common knowledge and the owner should confirm them). Corrections per sub-district go in `content/affluence/tehran.csv`.
- (Fixed in section 11.) Population in north Tehran was wrong in the model: Zafaraniyeh, Niavaran and Tajrish came out at about 1,100 people within 1 km, and District 1 at 62,000 while holding 27% of the city's mapped buildings. Mapped buildings are also very uneven (District 1: 17,800, District 4: 2,000, District 15: 600). The engine now flags such places (`popLow`). The fix is the official table "برآورد جمعیت و خانوار شهر تهران به تفکیک منطقه" (Tehran municipality ICT organisation, 1400, XLSX on data.gov.ir, free login to download): put the 22 numbers in `content/census/tehran.csv` and run `python tools/rake_population.py .` (the default mode blends the WorldPop and building patterns inside each district).

## 10. Pedestrian-flow model (district 5 of Tehran, all its sub-districts)

`python tools/extract_streets.py <pbf> <streets.json> 51.245 35.683 51.359 35.824` (district 5 plus a 1.5 km margin; 2 minutes) then `python tools/build_foot_model.py <streets.json> . tehran d5` (15 minutes) builds `assets/data/cities/tehran-d5-foot.js` (700 KB) and the report `tools/foot_model_d5.md`. Any other district or sub-district works the same way: pass its id (`d12`, `d5n6`). It started as sub-district 6 only and was extended to the whole district in November 2026; the index is now normalised over district 5 (100 = busier 2% of its streets), so numbers from the old sub-district file are not comparable. Gravity trip assignment on the walking network (65,800 nodes, 73,000 edges, 29,300 streets inside the district, 989 km): residents (population layer), transit stops and offices set out; shops, cafés, schools, parks and stops attract; trips within 800 m of walking follow shortest paths and add to every street they use. Output: a relative flow index per street (100 = busier 2% of streets in the area), shown as the 👣 layer on the map and as "Foot traffic here" in the spot analysis. Not part of the score.

What was checked without counts (district 5): the ranking of streets keeps a rank correlation of at least 0.87 against the base model across nine changes of judgement (0.98-1.00 for decay, radius, weight of stops and workers; the lowest, 0.87, is for normalised trips); none of the 717 streets with index 90 or more sits in a disconnected fragment (3.3% of nodes are in fragments). The street-type and stop-distance checks are in `tools/foot_model_d5.md`.

What is missing: pedestrian counts. Every number is relative and uncalibrated, and the weights (ATTRACT table, 150 per stop, 10 per office) are judgement. To calibrate: count people on 60 to 100 streets in the area, 3 slots of 15 minutes each, and fit the index to the counts; only then may a figure be quoted as people per hour. To extend to another area: run extract_streets with its box (margin 1.5 km) and build_foot_model with its sub-district id.

## 11. Population in the well-off north, and how a luxury café reaches it (November 2026)

**The finding.** The owner saw that a luxury café search never offered Tajrish or Kamranieh. It is not a boundary problem: the city window (35.48-35.92 N, 51.12-51.66 E) holds Tajrish, Shemiran and Rey. The cause was residents. In the 2.25 km square around Tajrish, WorldPop 1 km (UN-adjusted) gives 2,320 people, the 100 m "constrained" WorldPop 4,921 (checked: `irn_ppp_2020_constrained.tif`, BSGM), and the model we used 1,797; around Vanak it gives 70,000. A place with no residents scores as no customers.

**What was tried.**
- WorldPop 100 m constrained: only two to three times higher in Tajrish, still far too low; not adopted.
- Floor-area weights from OSM tags: too few tagged levels (see section 8).
- Official district populations: Persian Wikipedia pages of the districts quote a census for 18 of the 22 districts, in mixed years (1395 for ten, 1390 for eight); districts 1, 5, 10 and 15 have no census figure there, and Wikipedia is not the census. They are kept in `content/census/check/tehran-published.csv` as a CHECK only, not as input. The official table, one year, 22 rows, still goes in `content/census/tehran.csv` (that one sets residents; see `content/census/README.md`).
- Building footprints: Overture's building layer for the Tehran window has 519,361 footprints (73,000 OpenStreetMap, 446,000 Microsoft ML Buildings; both ODbL-1.0), 167 km2. OpenStreetMap alone, which was all the engine counted, holds a seventh of them. Footprints cover 13-28% of the ground in every district, villas and towers alike, so footprints alone cannot say how many people live in a building (Ekbatan has the lowest coverage and the most people): floors are unknown. WorldPop knows the towers. So the two are blended.

**What was done.** `tools/fetch_overture_buildings.py tehran <out.parquet>` (3 minutes) and `tools/blend_population.py . tehran <out.parquet> 0.5`: residents of a cell = city total x (0.5 x WorldPop pattern + 0.5 x footprint pattern). The weight of a footprint is its area limited to 30..400 m2 (a shed counts little, a compound no more than a large house). The city total is unchanged (8.9 million in the window). It runs after `add_population.py` and before `rake_population.py` (`rebuild_city_data.sh`, 6th argument).

**How it was checked.** `python tools/check_population.py .` compares modelled and published residents of the 18 districts that have a published figure. Typical error: x1.90 with WorldPop alone, x1.74 at 70% WorldPop, x1.68 at 50%, x1.64 at 30%; with 0% WorldPop only 4 of 18 districts are within 30%. Share 0.5 was kept because floors are unknown and a lower share would under-count towers. Residents per km2 after the change: Tajrish 6,700 (was 355), Niavaran 6,400 (400), Zafaraniyeh 5,200 (680), Kamranieh 9,500 (3,400), Vanak 14,000 (13,300). District 1 itself has no published figure to compare with.

**The side effect, reported honestly.** The mean distance of the best blocks of all ten business types from the old centre fell from 4.7 km to 2.8 km. The published figures explain part of it: the old model gave districts 17, 20, 11, 8 and 7 (south and centre) only 0.2-0.5 of their published populations and gave districts 21 and 22 (west) about three times theirs, and some of the "far from the centre" winners were artefacts of that. The corrected southern and central districts are legitimately denser. Plain searches (no income preference) therefore lean towards the dense core more than before; income-driven concepts do not (below). If a plain search still looks wrong to someone who knows a district, that is the next thing to check, and the official district table is what would settle it. `tools/test_engine.js` now guards "spread over at least 8 districts and at least 2.5 km from the centre" instead of the old 4 km.

**Income now scales the customers, not only the score.** For a concept with an income preference (luxury café +1.0, student café -0.3, ...) the residents term and the demand term are multiplied by the buying power of the surroundings (an area at the bottom of the income scale keeps 30% of its weight at preference 1.0, one at the top keeps all of it); the income level itself is then blended in as before. These are judgement settings, not fitted. Result for the luxury café in Tehran (1 km): all 20 best spots are above 35.745 N (the north), their mean distance from the old centre is 8.6 km (it was about 4.7); Tajrish ranks 12th, Zafaraniyeh 14th, Niavaran 26th and Kamranieh 37th of 60; Shahr-e Rey is not in the 60 (its income level is the lowest, by design). Tajrish is held back by its many existing cafés, which the engine counts as rivals: that is the model saying "busy, not empty".

**For all of Iran.** Run `fetch_overture_buildings.py <city id>` for each city, then `blend_population.py` with its parquet. Only Tehran is done: the other cities still use WorldPop spread over OSM buildings, and no published district figures exist to check them against.

