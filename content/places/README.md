# Field-survey places (the part no open database has)

Open data will never know every shop. The only way to finish a thinly mapped district (for example Shahrak Azadi in District 21) is to walk it.
Put what you collect here as CSV, one file per city (for example `tehran.csv`), then run

    python tools/import_places.py .

Columns (header row required, UTF-8):

    category,lat,lon,name
    cafe,35.7061,51.2824,کافه نمونه
    pharmacy,35.7068,51.2831,داروخانه نمونه

`category` is one of: restaurant, cafe, grocery, fashion, beauty, pharmacy, clinic, hospital, fitness, education, school,
university, bank, civic, leisure, retail, mall, office, tourism, transit, park.

How to collect quickly: use the free **Every Door** app (Android / iOS), which adds shops straight to OpenStreetMap,
so everyone gains and the next data update brings them back. Or take a printed map of the district and note the
shops; or have a phone take a photo with GPS for each shop. Use this CSV route for what you want in Jabio before
the next OpenStreetMap update.

Only record places you actually saw. Do not copy from Google Maps, Neshan or Balad: their terms forbid bulk copying,
and it would put the whole project at legal risk.
