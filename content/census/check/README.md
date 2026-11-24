# Published district populations (a check, not an input)

`tehran-published.csv` holds the district populations I could read from published pages (Persian Wikipedia pages of the districts,
which cite the Statistical Centre of Iran). They were read from the pages by a script, not typed from memory, but the years are mixed
(1395 where found, 1390 otherwise), districts 1, 5, 10 and 15 had no census figure there, and Wikipedia is not the census itself.

So they are NOT used to set residents. `tools/check_population.py` only compares the model with them, so we can see whether a change
to the residents moved the model towards or away from the published numbers. The official table for all 22 districts, one year, goes in
`content/census/tehran.csv` (see ../README.md); that one does set the residents.
