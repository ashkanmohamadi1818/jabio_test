#!/bin/sh
# Full city-data rebuild, in the only order that works. Usage: tools/rebuild_city_data.sh <iran.osm.pbf> <overture-iran.parquet> <tif> <snapshot date> [admin.json] [tehran-buildings.parquet]
set -e
PBF="$1"; OV="$2"; TIF="$3"; DATE="$4"; ROOT="$(cd "$(dirname "$0")/.." && pwd)"
python -I "$ROOT/tools/build_osm_snapshot.py" "$PBF" "$ROOT" "$DATE"
python -I "$ROOT/tools/finalize_city_data.py" "$ROOT"
python -I "$ROOT/tools/add_population.py" "$TIF" "$ROOT"
# optional 6th argument: Tehran building footprints from fetch_overture_buildings.py (corrects the pattern of residents; see DATA-EXTRACTION.md section 11)
[ -n "$6" ] && python -I "$ROOT/tools/blend_population.py" "$ROOT" tehran "$6"
python -I "$ROOT/tools/rake_population.py" "$ROOT"
python -I "$ROOT/tools/add_overture.py" "$OV" "$ROOT"
python -I "$ROOT/tools/import_places.py" "$ROOT"
# optional 5th argument: the raw boundaries from extract_districts.py
[ -n "$5" ] && python -I "$ROOT/tools/build_districts.py" "$5" "$ROOT"
python -I "$ROOT/tools/build_site.py"
