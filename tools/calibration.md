# Calibration: tried, measured, dropped

`node tools/calibrate_engine.js` fits the people / demand / access weights of each business to where real businesses already are, and tests them on cities left out of the fit. It did improve agreement with existing places (0.82 to 0.84 AUC).

**It was wrong for this product.** The site answers "where should a NEW business open", and existing businesses are concentrated in the commercial core. Fitting to them pushes every answer to the centre. Measured on Tehran (mean distance of the top 6 blocks of every business type from Enghelab/Valiasr):

| Weights | Distance | Districts used |
|---|---|---|
| Fitted (people about 15%) | 3.8 km | 10 |
| Old shared (30/30/20/20) | 4.5 km | 12 |
| People-heavy (35/25/20/20) | 5.3 km | 13 |

Owner feedback confirmed it: luxury concepts were sent to the old central districts, not to the well-off north.

**What the site uses now:** judgement weights in `CAL` (assets/jabio-engine.js): people 32% / demand 26% / access 22% for neighbourhood businesses (grocery, pharmacy, clinic, beauty, gym, training), people 24% / demand 34% / access 22% for businesses that live on visitors and offices (restaurant, café, fashion, services); room beside rivals 20% for all. These are not fitted to outcomes, because there is no outcome data. VALIDATION.md still measures agreement with existing placement; read it as "the picture is consistent with the map", not as "the answer is right".
