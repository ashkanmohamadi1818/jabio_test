# Census totals for the municipal districts

WorldPop is a model, so district populations can be far from the census (in Tehran the 22 districts add up to about 5.95
million against about 8.7 million). Put the official numbers here and `tools/rake_population.py` scales the residents in each
district to match them, keeping the pattern inside the district.

File: `content/census/tehran.csv`, UTF-8, header row required:

    district,population
    1,<number>
    2,<number>
    ...
    22,<number>

Where to get it: Statistical Centre of Iran, census results by Tehran municipal district (a table, free). Use one census year
for all 22 rows and write the year in `content/census/tehran.year.txt` (for example `1395`), because the site shows it.
Do not type numbers from memory.

Run: `python tools/rake_population.py .` (it is also part of `tools/rebuild_city_data.sh`). With no CSV it does nothing.
