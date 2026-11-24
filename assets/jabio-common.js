/* Jabio: texts (English and Persian) and the small widgets shared by the analysis page and the report. */
(function (root) {
  'use strict';
  var S = {
    /* business types */
    'grp.food': ['Food & drink', 'غذا و نوشیدنی'], 'grp.retail': ['Retail', 'خرده‌فروشی'], 'grp.health': ['Health & care', 'سلامت و مراقبت'],
    'grp.education': ['Education', 'آموزش'], 'grp.services': ['Services', 'خدمات'],
    'type.restaurant': ['Restaurant', 'رستوران'], 'type.cafe': ['Café', 'کافه'], 'type.grocery': ['Grocery & supermarket', 'خواربار و سوپرمارکت'],
    'type.fashion': ['Fashion & clothing', 'پوشاک'], 'type.beauty': ['Beauty & salon', 'آرایشی و سالن زیبایی'], 'type.pharmacy': ['Pharmacy', 'داروخانه'],
    'type.clinic': ['Clinic', 'کلینیک و مرکز درمانی'], 'type.fitness': ['Gym & fitness', 'باشگاه ورزشی'], 'type.education': ['Training & education', 'آموزشگاه'],
    'type.services': ['Service company', 'شرکت خدماتی'],
    'aud.families': ['Families', 'خانواده‌ها'], 'aud.students': ['Students', 'دانشجویان و دانش‌آموزان'], 'aud.employees': ['Employees', 'کارمندان و شاغلان'],
    'aud.tourists': ['Tourists', 'گردشگران'], 'aud.locals': ['Local residents', 'ساکنان محله'],
    'pri.foot': ['Foot traffic', 'تردد پیاده'], 'pri.car': ['Car access', 'دسترسی با خودرو'], 'pri.transit': ['Public transport', 'حمل‌ونقل عمومی'],
    'pri.parking': ['Parking', 'پارکینگ'], 'pri.visibility': ['Street visibility', 'دید از خیابان'], 'pri.shopping': ['Shopping centres', 'مراکز خرید و فروشگاه‌ها'],
    'pri.offices': ['Offices', 'ادارات و دفاتر'],
    'str.low': ['Away from rivals', 'دور از رقبا'], 'str.low.d': ['Prefer places with few direct competitors', 'جاهایی با رقیب مستقیم کم'],
    'str.balance': ['Balanced', 'متعادل'], 'str.balance.d': ['Weigh demand against competition', 'تقاضا را با رقابت بسنج'],
    'str.cluster': ['Next to rivals', 'کنار رقبا'], 'str.cluster.d': ['Join a cluster where customers already come', 'در خوشه‌ای که مشتری از قبل می‌آید'],
    'drv.residents': ['Residents (estimated)', 'ساکنان (برآورد)'], 'drv.office': ['Offices', 'دفاتر و ادارات'], 'drv.school': ['Schools', 'مدارس'],
    'drv.university': ['Universities', 'دانشگاه‌ها'], 'drv.retail': ['Shops', 'فروشگاه‌ها'], 'drv.mall': ['Shopping centres', 'مراکز خرید'],
    'drv.tourism': ['Hotels & sights', 'هتل و جاذبه‌ها'], 'drv.transit': ['Transit stops', 'ایستگاه‌های حمل‌ونقل'], 'drv.bank': ['Banks', 'بانک‌ها'],
    'drv.civic': ['Public offices', 'ادارات دولتی'], 'drv.park': ['Parks', 'پارک‌ها'], 'drv.health': ['Health facilities', 'مراکز درمانی'],
    'drv.leisure': ['Sport & leisure', 'ورزش و تفریح'],
    'acc.minor': ['Local streets', 'خیابان‌های محلی'], 'acc.major': ['Main roads', 'خیابان‌های اصلی'], 'acc.transit': ['Transit stops', 'ایستگاه‌ها'], 'acc.parking': ['Parking', 'پارکینگ'],
    'lvl.strong': ['Strong', 'قوی'], 'lvl.promising': ['Promising', 'امیدوارکننده'], 'lvl.mixed': ['Mixed', 'متوسط'], 'lvl.weak': ['Weak', 'ضعیف'],
    'ver.recommended': ['Recommended', 'توصیه می‌شود'], 'ver.promising': ['Promising: confirm on site', 'امیدوارکننده؛ با بازدید میدانی تأیید شود'],
    'ver.mixed': ['Mixed: proceed with care', 'نتیجه‌ی مبهم؛ با احتیاط'], 'ver.avoid': ['Not recommended here', 'در این نقطه توصیه نمی‌شود'],
    'quad.hot': ['Hot opportunity', 'فرصت داغ'], 'quad.niche': ['Small niche', 'بازار کوچک'], 'quad.watch': ['Watch', 'زیر نظر بگیرید'], 'quad.risk': ['High risk', 'پرریسک'],
    'cov.rich': ['Rich data', 'داده‌ی غنی'], 'cov.partial': ['Partial data', 'داده‌ی نسبی'], 'cov.thin': ['Thin data', 'داده‌ی محدود'],
    'm.pop': ['People', 'جمعیت'], 'm.demand': ['Demand', 'تقاضا'], 'm.access': ['Access', 'دسترسی'], 'm.comp': ['Competition', 'رقابت'],
    'deep.range': ['Plausible range {0} to {1}', 'بازه‌ی محتمل {0} تا {1}'], 'deep.rangeNote': ['If population is off by 30% and the map data is off by {0}%, the score would fall anywhere in this range. Not a statistical interval.', 'اگر جمعیت تا ۳۰٪ و داده‌ی نقشه تا {0}٪ خطا داشته باشد، امتیاز در همین بازه می‌افتد. بازه‌ی آماری نیست.'],
    'm.lowcomp': ['Room beside rivals', 'جا در کنار رقبا'], 'm.gap': ['Market gap', 'شکاف بازار'],
    /* the page */
    'jb.h': ['Where should your business go?', 'کسب‌وکارت را کجا بزنی؟'],
    'jb.sub': ['Pick a business and a city. Jabio counts what is around every block and ranks the places.', 'کسب‌وکار و شهر را انتخاب کن. جابیو هر بلوک را می‌شمارد و مکان‌ها را رتبه‌بندی می‌کند.'],
    'tab.areas': ['Find best areas', 'بهترین مناطق'], 'tab.spot': ['Check a spot', 'بررسی یک نقطه'],
    'f.city': ['City', 'شهر'], 'f.type': ['What business?', 'چه کسب‌وکاری؟'], 'f.aud': ['Who are your customers?', 'مشتریانت چه کسانی‌اند؟'],
    'f.radius': ['Customer reach', 'شعاع جذب مشتری'], 'f.pri': ['What matters most?', 'چه چیزی مهم‌تر است؟'], 'f.str': ['Competition strategy', 'استراتژی رقابت'],
    'f.go': ['Find best areas', 'یافتن بهترین مناطق'], 'f.opt': ['optional', 'اختیاری'], 'f.more': ['More options', 'گزینه‌های بیشتر'],
    'res.h': ['Best areas for {0} in {1}', 'بهترین مناطق برای {0} در {1}'],
    'res.hint': ['Each score compares an area with the busiest parts of {0}.', 'هر امتیاز، منطقه را با پررونق‌ترین بخش‌های {0} مقایسه می‌کند.'],
    'res.formula': ['{0}% people · {1}% demand · {2}% access · {3}% room beside rivals', '{0}٪ جمعیت · {1}٪ تقاضا · {2}٪ دسترسی · {3}٪ جا در کنار رقبا'],
    'res.guard': ['Areas with a demand index under {0} are not ranked.', 'مناطقی که شاخص تقاضایشان زیر {0} است رتبه نمی‌گیرند.'],
    'res.relaxed': ['No area reached the minimum demand, so all are shown.', 'هیچ منطقه‌ای به حداقل تقاضا نرسید؛ همه نمایش داده شده‌اند.'],
    'res.near': ['near {0}', 'نزدیک {0}'], 'res.analyze': ['Analyze this spot', 'تحلیل این نقطه'], 'res.heat': ['Brighter = better score', 'روشن‌تر = امتیاز بهتر'],
    'spot.h': ['Check a spot', 'بررسی یک نقطه'], 'spot.hint': ['Click anywhere on the map. Jabio shows which businesses fit there.', 'روی هر نقطه‌ی نقشه کلیک کن. جابیو نشان می‌دهد چه کسب‌وکارهایی آنجا می‌خورند.'],
    'spot.fit': ['What fits here', 'چه کسب‌وکاری اینجا می‌خورد'], 'spot.out': ['This spot is outside the mapped area of {0}.', 'این نقطه بیرون از محدوده‌ی نقشه‌ی {0} است.'],
    'spot.at': ['Spot', 'نقطه'], 'spot.back': ['Back to areas', 'بازگشت به مناطق'],
    'deep.score': ['Score', 'امتیاز'], 'deep.how': ['How the score is made', 'امتیاز چگونه ساخته شده'], 'deep.rivals': ['Direct competitors nearby', 'رقبای مستقیم نزدیک'],
    'deep.drivers': ['What brings customers', 'چه چیزی مشتری می‌آورد'], 'deep.good': ['In its favour', 'نقاط قوت'], 'deep.bad': ['Against it', 'نقاط ضعف'],
    'deep.risks': ['Risks to check', 'ریسک‌هایی که باید بررسی شود'], 'deep.report': ['Open report', 'باز کردن گزارش'], 'deep.copy': ['Copy link', 'کپی پیوند'],
    'map.3d': ['3D buildings and tilt', 'ساختمان‌های سه‌بعدی و کج‌کردن نقشه'],
    'look.h': ['See the place', 'محل را ببین'], 'look.note': ['Look at the street before you visit. Opens in a new tab; only this spot’s coordinates are sent, and only when you click. Street-level photos exist only where someone has captured them (Google has little in Iran; Mapillary is community photos).', 'پیش از رفتن، خیابان را ببین. در زبانه‌ی جدید باز می‌شود؛ فقط مختصات همین نقطه و فقط وقتی کلیک کنی فرستاده می‌شود. تصویر خیابانی فقط جایی هست که کسی برداشته باشد (گوگل در ایران تصویر کمی دارد؛ Mapillary عکس‌های مردمی است).'],
    'look.3d': ['3D view of this spot', 'نمای سه‌بعدی این نقطه'], 'look.google': ['Google Street View ↗', 'نمای خیابان گوگل ↗'], 'look.mly': ['Street photos (Mapillary) ↗', 'عکس‌های خیابان (Mapillary) ↗'],
    'osm.add': ['Add a missing place on OpenStreetMap', 'افزودن مکان جاافتاده در OpenStreetMap'],
    'osm.tip': ['Opens the OpenStreetMap editor at this spot in a new tab. Anyone can add a shop there; it appears here after the next data update.', 'ویرایشگر OpenStreetMap را در یک زبانه‌ی جدید روی همین نقطه باز می‌کند. هر کسی می‌تواند مغازه‌ای اضافه کند؛ بعد از به‌روزرسانی بعدی داده اینجا دیده می‌شود.'],
    'sv.save': ['Save this analysis', 'ذخیره‌ی این تحلیل'], 'sv.saved': ['Saved', 'ذخیره شد'], 'sv.full': ['You can keep {0} analyses. Remove one first.', 'حداکثر {0} تحلیل ذخیره می‌شود. اول یکی را حذف کن.'],
    'sv.h': ['My analyses', 'تحلیل‌های من'], 'sv.note': ['Kept only in this browser (nothing is sent anywhere). Clearing site data removes them.', 'فقط در همین مرورگر نگه داشته می‌شود (چیزی به جایی فرستاده نمی‌شود). پاک‌کردن اطلاعات سایت آن‌ها را حذف می‌کند.'],
    'sv.score': ['Score', 'امتیاز'], 'sv.open': ['Open', 'باز کردن'], 'sv.del': ['Remove', 'حذف'], 'sv.cmp': ['Comparison', 'مقایسه'], 'sv.best': ['highest', 'بیشترین'],
    'sv.empty': ['Nothing saved yet. Open a spot and press Save.', 'هنوز چیزی ذخیره نشده. یک نقطه را باز کن و ذخیره را بزن.'], 'sv.people': ['People nearby', 'جمعیت اطراف'], 'sv.rivals': ['Same-type rivals', 'رقبای هم‌نوع'],
    'sv.old': ['saved with an older method', 'با روش قدیمی‌تر ذخیره شده'],
    'deep.copied': ['Copied', 'کپی شد'], 'deep.none': ['None inside the radius', 'هیچ‌کدام در محدوده نیست'], 'deep.unnamed': ['(unnamed)', '(بدون نام)'],
    'deep.within': ['within {0} m', 'در شعاع {0} متر'], 'deep.radar': ['Profile', 'نیم‌رخ'], 'deep.people': ['about {0} people', 'حدود {0} نفر'], 'deep.weight': ['weight {0}%', 'وزن {0}٪'],
    'load': ['Loading {0}…', 'در حال بارگذاری {0}…'], 'load.fail': ['Could not load this city.', 'بارگذاری این شهر ممکن نشد.'],
    'data.credit': ['Places © OpenStreetMap contributors, snapshot of {0}, plus Overture Maps. Population: WorldPop 2020 (CC BY 4.0); in Tehran adjusted with building footprints (OpenStreetMap, Microsoft ML Buildings via Overture, ODbL).', 'مکان‌ها © مشارکت‌کنندگان OpenStreetMap، نسخه‌ی {0}، به‌علاوه‌ی Overture Maps. جمعیت: WorldPop 2020 (CC BY 4.0)؛ در تهران با ردپای ساختمان‌ها (OpenStreetMap و Microsoft ML Buildings از طریق Overture، ODbL) اصلاح شده.'],
    'method.h': ['How scores work', 'امتیازها چگونه محاسبه می‌شوند'],
    'method.1': ['Shops, offices, schools, roads and bus stops are counted from OpenStreetMap inside your radius. People come from the WorldPop 2020 estimate, spread over the buildings OpenStreetMap shows; in Tehran the pattern is corrected half-and-half with the footprints of about 520,000 buildings (OpenStreetMap and Microsoft), because WorldPop alone left the well-built north almost empty.', 'فروشگاه‌ها، دفاتر، مدارس، خیابان‌ها و ایستگاه‌ها از OpenStreetMap و داخل شعاع تو شمرده می‌شود. جمعیت از برآورد WorldPop 2020 می‌آید و بین ساختمان‌هایی که OpenStreetMap نشان می‌دهد پخش می‌شود؛ در تهران الگو نیم‌به‌نیم با ردپای حدود ۵۲۰ هزار ساختمان (OpenStreetMap و مایکروسافت) اصلاح شده، چون WorldPop به‌تنهایی شمال خوش‌ساخت را تقریباً خالی می‌گذاشت.'],
    'method.2': ['Each count is scaled against the busiest part of the same city (the top 2% = 100), and things nearby count more than things far away (weight falls to about 13% at the edge of your radius). A score means “compared with this city’s best streets”, not an absolute rating.', 'هر عدد با پررونق‌ترین بخش همان شهر سنجیده می‌شود (۲٪ برتر = ۱۰۰) و آنچه نزدیک‌تر است بیشتر حساب می‌شود (وزن در لبه‌ی شعاع حدود ۱۳٪). امتیاز یعنی «در مقایسه با بهترین خیابان‌های همین شهر»، نه نمره‌ی مطلق.'],
    'method.3': ['Score = people + demand + access + room beside rivals. The weights differ by business (shown above the results): people count more for neighbourhood businesses (grocery, pharmacy, clinic, beauty, gym, training) and demand counts more for businesses that live on visitors and offices. They are judgement, not a fit to outcomes, because there is no sales data. “Room” compares your rivals with the number this much demand normally carries: 50 means as many as usual, more means room to enter, less means crowded. “Away from rivals” raises its weight to 35%. A concept that depends on income also blends in how well-off the surroundings are (Tehran only).', 'امتیاز = جمعیت + تقاضا + دسترسی + جا در کنار رقبا. وزن‌ها برای هر کسب‌وکار فرق دارند (بالای نتایج نوشته شده): جمعیت برای کسب‌وکارهای محله‌ای (خواربار، داروخانه، مطب، آرایشگاه، باشگاه، آموزشگاه) بیشتر حساب می‌شود و تقاضا برای کسب‌وکارهایی که از مسافر و دفاتر زندگی می‌کنند. این وزن‌ها قضاوت است نه برازش با نتیجه، چون داده‌ی فروش نداریم. «جا» تعداد رقبا را با تعدادی می‌سنجد که این میزان تقاضا معمولاً تحمل می‌کند: ۵۰ یعنی به‌اندازه‌ی معمول، بیشتر یعنی جای ورود هست، کمتر یعنی شلوغ. گزینه‌ی «دور از رقبا» وزن آن را به ۳۵٪ می‌رساند. مفهومی که به درآمد وابسته است، وضع مالی اطراف را هم وارد می‌کند (فقط تهران).'],
    'method.4': ['Two guards: an area needs a demand index of at least 40 to be ranked, and “Recommended” needs at least 50. “No rivals” often means “no customers”.', 'دو محافظ: منطقه برای رتبه‌گرفتن به شاخص تقاضای حداقل ۴۰ نیاز دارد و «توصیه می‌شود» حداقل ۵۰. «بدون رقیب» اغلب یعنی «بدون مشتری».'],
    'method.6': ['Checked against reality only in one sense: with its own category hidden, the picture agrees with where businesses already are. That does not show that a place will be profitable, and existing businesses sit in the commercial core, so read it as a consistency check. Details: VALIDATION.md.', 'سنجیده‌شده با واقعیت فقط به یک معنا: وقتی دسته‌ی خودِ کسب‌وکار پنهان شود، تصویر با جای کسب‌وکارهای موجود هم‌خوان است. این نشان نمی‌دهد مکانی سودآور باشد، و کسب‌وکارهای موجود در مرکز تجاری‌اند، پس آن را یک بررسی سازگاری بدان. جزئیات: VALIDATION.md.'],
    'method.5': ['Not included: rent, income and real foot traffic. Population is a model, not a census, and it is not exact inside a single kilometre. Where OpenStreetMap is thin, counts are understated. Visit the place before you sign a lease.', 'در این تحلیل نیست: اجاره، درآمد و تردد واقعی. جمعیت یک مدل است نه سرشماری، و درون یک کیلومتر دقیق نیست. جایی که OpenStreetMap ناقص است، شمارش‌ها کمتر از واقعیت است. پیش از امضای قرارداد اجاره از محل بازدید کن.'],
    /* explanations */
    'g.driver': ['{0} {1} in the radius', '{0} مورد {1} در محدوده'], 'g.pop': ['Heavily populated: about {0} people within the radius', 'پرجمعیت: حدود {0} نفر در محدوده'],
    'g.access': ['Strong street and transit access', 'دسترسی خوب به خیابان و حمل‌ونقل'], 'g.gap': ['Demand clearly outweighs competition', 'تقاضا بیشتر از رقابت است'],
    'g.fewRivals': ['Only {0} direct competitors nearby', 'فقط {0} رقیب مستقیم در نزدیکی'],
    'b.demand': ['Few of the places this business depends on are nearby', 'مکان‌هایی که این کسب‌وکار به آن‌ها وابسته است کم‌اند'],
    'b.pop': ['Thinly populated: about {0} people within the radius', 'کم‌جمعیت: حدود {0} نفر در محدوده'], 'b.access': ['Weak street or transit access', 'دسترسی ضعیف به خیابان یا حمل‌ونقل'],
    'b.rivals': ['{0} direct competitors in the radius', '{0} رقیب مستقیم در محدوده'],
    'r.competition': ['{0} direct competitors inside the radius. You would share the same customers.', '{0} رقیب مستقیم در محدوده است. مشتری‌ها را با آن‌ها شریک می‌شوی.'],
    'r.lowDemand': ['Measured demand is low for this business type.', 'تقاضای اندازه‌گیری‌شده برای این نوع کسب‌وکار کم است.'],
    'r.weakAccess': ['Access is weak. Check the street, parking and bus stops on site.', 'دسترسی ضعیف است. خیابان، پارکینگ و ایستگاه‌ها را در محل ببین.'],
    'r.thinData.thin': ['OpenStreetMap is thin in this city, so counts are understated. Treat the score as a rough guide.', 'OpenStreetMap در این شهر ناقص است و شمارش‌ها کمتر از واقعیت است. امتیاز را راهنمای تقریبی بدان.'],
    'r.thinData.partial': ['OpenStreetMap coverage here is partial. Some shops may be missing.', 'پوشش OpenStreetMap در اینجا نسبی است. ممکن است بعضی مغازه‌ها ثبت نشده باشند.'],
    'r.thinHere': ['Few shops are mapped around here compared with how many people live nearby (about {0}% as complete as the rest of the city). “No rivals” may only mean nobody has mapped them. Walk the area before trusting the score, and add what you find.', 'در اینجا نسبت به جمعیت اطراف، مغازه‌ی کمی روی نقشه ثبت شده (حدود {0}٪ از میزان کامل‌بودن بقیه‌ی شهر). «بدون رقیب» شاید فقط یعنی کسی ثبتشان نکرده. پیش از اعتماد به امتیاز، محل را پیاده ببین و آنچه یافتی را اضافه کن.'],
    'res.thinSkipped': ['{0} map cells were left out of the ranking because too few shops are mapped there to judge them.', '{0} خانه‌ی نقشه از رتبه‌بندی کنار گذاشته شد، چون شمار مغازه‌های ثبت‌شده آنجا برای قضاوت کم است.'],
    'r.edge': ['This spot is near the edge of the mapped area, so counts are cut off.', 'این نقطه نزدیک لبه‌ی محدوده‌ی نقشه است و شمارش‌ها ناقص می‌ماند.'],
    'r.noRent': ['Rent, income and real foot traffic are not part of this analysis. Check them before deciding.', 'اجاره، درآمد و تردد واقعی در این تحلیل نیست. پیش از تصمیم بررسی شود.'],
    'rep.h': ['Location analysis', 'گزارش تحلیل مکان'], 'rep.print': ['Print or save as PDF', 'چاپ یا ذخیره به‌صورت PDF'], 'rep.back': ['Back to analysis', 'بازگشت به تحلیل'],
    'rep.empty': ['Open this page from an analysis, or add the details to the address.', 'این صفحه را از داخل یک تحلیل باز کن.'],
    'rep.date': ['Prepared {0}', 'تهیه‌شده در {0}'], 'rep.brief': ['The brief', 'خلاصه‌ی درخواست'], 'rep.map': ['What is around the spot', 'اطراف این نقطه'],
    'deep.rivalsNote': ['Sorted from the nearest. The distance is in a straight line from the spot you are checking, not along the streets.', 'از نزدیک‌ترین شروع می‌شود. فاصله به‌صورت خط مستقیم از نقطه‌ای است که بررسی می‌کنی، نه از مسیر خیابان‌ها.'],
    'in.h1': ['Compared with the rest of the city', 'در مقایسه با بقیه‌ی شهر'],
    'in.pct': ['Better than {0}% of the built-up blocks in {1} for this business.', 'برای این کسب‌وکار، بهتر از {0}٪ بلوک‌های ساخته‌شده‌ی {1}.'],
    'in.per': ['{0} people for each rival here (counting you). A typical block in this city has {1}.', 'اینجا برای هر رقیب (با احتساب خودت) {0} نفر هست. یک بلوک معمولی این شهر {1} دارد.'],
    'in.perThin': ['Few shops are mapped here, so the rival count is probably too low and this number too good.', 'اینجا مغازه‌ی کمی ثبت شده، پس تعداد رقبا احتمالاً کمتر از واقع است و این عدد بهتر از واقعیت.'],
    'in.h2': ['Who is around', 'چه کسانی اطراف هستند'], 'in.h2n': ['How strong each kind of customer is here, compared with the rest of the city (0 to 100).', 'هر نوع مشتری اینجا چقدر پررنگ است، در مقایسه با بقیه‌ی شهر (۰ تا ۱۰۰).'],
    'in.g.residents': ['People who live nearby', 'ساکنان اطراف'], 'in.g.workers': ['People who work nearby (offices, banks, government)', 'شاغلان اطراف (دفاتر، بانک‌ها، ادارات)'],
    'in.g.students': ['Students (schools, universities)', 'دانش‌آموزان و دانشجویان'], 'in.g.visitors': ['Visitors and passers-by (tourism, malls, shops, transit)', 'مسافر و رهگذر (گردشگری، مراکز خرید، مغازه‌ها، ایستگاه‌ها)'],
    'in.h3': ['Quick facts', 'نکته‌های سریع'], 'in.nearRival': ['Nearest direct rival: {0} m away{1}', 'نزدیک‌ترین رقیب مستقیم: {0} متر فاصله{1}'], 'in.noRival': ['No direct rival mapped inside the radius.', 'رقیب مستقیمی در شعاع ثبت نشده.'],
    'in.nearTransit': ['Nearest bus, metro or taxi stop: {0} m', 'نزدیک‌ترین ایستگاه اتوبوس، مترو یا تاکسی: {0} متر'], 'in.noTransit': ['No transit stop mapped within 1.5 km.', 'ایستگاهی در ۱٫۵ کیلومتری ثبت نشده.'],
    'in.people': ['About {0} people live within {1} m (estimate).', 'حدود {0} نفر در {1} متری زندگی می‌کنند (برآورد).'],
    'in.h4': ['Does the answer depend on how far customers travel?', 'آیا جواب به دوری مسیر مشتری بستگی دارد؟'], 'in.h4n': ['The same spot scored with different customer-reach radii. Big swings mean the result depends on that assumption.', 'همین نقطه با شعاع‌های جذب متفاوت. نوسان زیاد یعنی نتیجه به همین فرض وابسته است.'],
    'in.r': ['{0} m', '{0} متر'], 'in.h5': ['Clearly better spots close by', 'جاهای بهتر در همین نزدیکی'], 'in.h5n': ['Within 1.5 km, at least 4 points higher, and mapped well enough to trust.', 'در ۱٫۵ کیلومتری، دست‌کم ۴ امتیاز بالاتر، و با داده‌ی کافی برای اعتماد.'],
    'in.noBetter': ['No clearly better, well-mapped spot within 1.5 km.', 'جای بهتر و با داده‌ی کافی در ۱٫۵ کیلومتری نیست.'], 'in.look': ['Look', 'ببین'], 'in.score': ['score {0} · {1} m away', 'امتیاز {0} · {1} متر فاصله'],
    'be.h': ['Break-even check', 'محاسبه‌ی سر به سر'], 'be.n': ['Uses your own numbers. Nothing is sent or saved.', 'با عددهای خودت. چیزی فرستاده یا ذخیره نمی‌شود.'],
    'be.rent': ['Rent per month (Toman)', 'اجاره‌ی ماهانه (تومان)'], 'be.cost': ['Other costs per month: staff, bills… (Toman)', 'هزینه‌های ماهانه‌ی دیگر: حقوق، قبض… (تومان)'],
    'be.spend': ['Average spend per customer (Toman)', 'میانگین خرج هر مشتری (تومان)'], 'be.margin': ['Profit margin on a sale (%)', 'حاشیه‌ی سود هر فروش (٪)'], 'be.days': ['Open days per month', 'روز کاری در ماه'],
    'be.out': ['You need about {0} customers a day to cover your costs. That is {1} customers per 1,000 people living within {2} m, every working day, shared with {3} direct rivals.', 'برای پوشش هزینه‌ها حدود {0} مشتری در روز لازم داری. یعنی روزانه {1} مشتری به‌ازای هر ۱٬۰۰۰ نفر ساکن در {2} متری، که با {3} رقیب مستقیم تقسیم می‌شود.'],
    'be.ask': ['Fill in the numbers to see it.', 'عددها را وارد کن تا ببینی.'], 'be.warn': ['Ask: could you really serve this many people a day, in the hours you are open?', 'بپرس: واقعاً می‌توانی در ساعت‌های کاری روزانه این‌همه نفر را سرویس بدهی؟'],
    'ck.h': ['What this analysis cannot tell you: check these on site', 'آنچه این تحلیل نمی‌داند: اینها را در محل بررسی کن'],
    'ck.1': ['Rent and key money: ask at least three landlords or agents in the same street, and compare with the break-even above.', 'اجاره و سرقفلی: از دست‌کم سه مالک یا مشاور املاک همان خیابان بپرس و با سر به سر بالا مقایسه کن.'],
    'ck.2': ['Real foot traffic: count the people passing by for 30 minutes at lunch, in the evening, and on a Friday.', 'تردد واقعی: ۳۰ دقیقه در ظهر، عصر و جمعه تعداد رهگذرها را بشمار.'],
    'ck.3': ['Your rivals: visit the nearest ones. Are they busy? What do they charge? What do they not offer?', 'رقبا: به نزدیک‌ترین‌ها سر بزن. شلوغ‌اند؟ چه قیمتی دارند؟ چه چیزی ندارند؟'],
    'ck.4': ['Closed or missing shops: the map can list shops that closed and miss new ones. Walk the street.', 'مغازه‌های بسته یا جاافتاده: نقشه ممکن است مغازه‌ی بسته‌شده را داشته باشد و تازه‌ها را نه. خیابان را پیاده برو.'],
    'ck.5': ['Plans for the area: new roads, metro, or building works change everything. Ask the district municipality.', 'برنامه‌های محله: خیابان، مترو یا ساخت‌وساز تازه همه‌چیز را عوض می‌کند. از شهرداری منطقه بپرس.'],
    'ck.6': ['Licence and rules for your trade: ask the relevant guild (اتحادیه) before you sign anything.', 'مجوز و مقررات صنف: پیش از امضای هر چیز از اتحادیه‌ی مربوط بپرس.'],
    'ck.7': ['Parking, delivery access, safety and noise at the hours you will be open.', 'پارکینگ، دسترسی بار، امنیت و سروصدا در ساعت‌هایی که باز هستی.'],
    'view.blocks': ['Best blocks', 'بهترین بلوک‌ها'], 'view.district': ['Districts', 'مناطق شهرداری'], 'view.sub': ['Sub-districts', 'نواحی'],
    'dv.h': ['{0} for {1}, ranked by their best blocks', '{0} برای {1}، به ترتیب بهترین بلوک‌ها'],
    'dv.note': ['Each bar is the score of a district’s best 10% of blocks (the grey tick is its typical block). Blocks that are too thinly mapped to judge are left out.', 'هر نوار امتیاز ۱۰٪ بهترین بلوک‌های یک منطقه است (خط خاکستری بلوک معمولی آن است). بلوک‌هایی که داده‌شان برای قضاوت کم است حساب نمی‌شوند.'],
    'dv.people': ['Residents ≈ {0}', 'ساکنان ≈ {0}'], 'dv.rivals': ['{0} direct rivals per 10,000 residents', '{0} رقیب مستقیم به‌ازای هر ۱۰٬۰۰۰ ساکن'],
    'dv.thin': ['thinly mapped ({0}%)', 'داده‌ی کم ({0}٪)'], 'dv.ok': ['mapping {0}%', 'داده {0}٪'], 'dv.cover': ['only {0}% inside the mapped window', 'فقط {0}٪ داخل محدوده‌ی نقشه'],
    'dv.none': ['no block with enough data', 'بلوکی با داده‌ی کافی نیست'], 'dv.best': ['Best block', 'بهترین بلوک'], 'dv.typical': ['typical {0}', 'معمولی {0}'],
    'dv.warn': ['District residents are a model (WorldPop blended with the pattern of building footprints), not the census, and a district can be off by a factor of two or more: the 22 districts add up to about {1} million here against about 8.7 million in the census. Compare districts by their scores and mapping, not by resident counts. Boundaries come from OpenStreetMap; {0} of the 134 official sub-districts exist there. Shahr-e Rey is listed beside the 22 districts as its own city.', 'ساکنان هر منطقه یک مدل است (WorldPop ترکیب‌شده با الگوی ردپای ساختمان‌ها) نه سرشماری، و هر منطقه ممکن است دو برابر یا بیشتر خطا داشته باشد: مجموع ۲۲ منطقه اینجا حدود {1} میلیون است، در برابر حدود ۸٫۷ میلیون در سرشماری. مناطق را با امتیاز و کامل‌بودن داده مقایسه کن، نه با شمار ساکنان. مرزها از OpenStreetMap است؛ {0} ناحیه از ۱۳۴ ناحیه‌ی رسمی آنجا وجود دارد. شهر ری هم به‌عنوان شهری جدا کنار ۲۲ منطقه آمده است.'],
    'dv.in': ['In: {0}', 'در: {0}'],
    'sub.h': ['Which kind?', 'چه نوعی؟'], 'sub.any': ['General', 'کلی'], 'sub.note': ['Concept settings are expert starting points, not fitted to data.', 'تنظیم مفهوم‌ها فرض کارشناسی است، نه برازش‌شده با داده.'],
    'sub.all': ['See all categories and concepts', 'دیدن همه‌ی دسته‌ها و مفهوم‌ها'], 'sub.in': ['Concept: {0}', 'مفهوم: {0}'],
    'cc.h': ['Your concept: {0}', 'مفهوم تو: {0}'], 'cc.rivals': ['{0} of the {1} direct rivals nearby look like your concept, judging by their names.', '{0} از {1} رقیب مستقیم اطراف، از روی نام، شبیه مفهوم توست.'],
    'cc.nearest': ' The nearest is {0} m away.', 'cc.none': ['No direct rival nearby looks like your concept by name (names are an imperfect clue).', 'رقیبی با نام شبیه مفهوم تو نزدیک نیست (نام سرنخ ناقصی است).'],
    'cc.noname': ['This concept cannot be told apart by name, so the rivals shown are all of the general kind.', 'این مفهوم از روی نام قابل تشخیص نیست، پس رقبای نشان‌داده‌شده همه از نوع کلی‌اند.'],
    'cc.tip': ['Check on site: {0}', 'در محل بررسی کن: {0}'],
    'g.affFit': ['The income level around here matches this concept', 'سطح درآمد اطراف با این مفهوم می‌خواند'], 'b.affMiss': ['The income level around here does not match this concept', 'سطح درآمد اطراف با این مفهوم نمی‌خواند'],
    'r.popLow': ['Very few residents are modelled here ({0} within the radius) although many buildings are mapped. The population model is probably far too low in this area (it is known to miss parts of north Tehran), so the people score and the market size are understated.', 'اینجا ساکن بسیار کمی مدل شده ({0} نفر در شعاع) با اینکه ساختمان زیادی ثبت شده. مدل جمعیت احتمالاً در این منطقه خیلی کمتر از واقع است (می‌دانیم بخش‌هایی از شمال تهران را از دست می‌دهد)، پس امتیاز جمعیت و اندازه‌ی بازار کمتر از واقع نشان داده می‌شود.'],
    'r.noAff': ['Income level is not modelled in this city, so this concept’s income preference is ignored here.', 'سطح درآمد در این شهر مدل نشده، پس ترجیح درآمدی این مفهوم اینجا نادیده گرفته می‌شود.'],
    'in.aff': ['How well-off the people around are', 'وضع مالی مردم اطراف'], 'in.affn': ['Income level of the surroundings, 0 (modest) to 100 (well-off). Tehran only, and a proxy: elevation, which tracks income across the city. It cannot see a rich pocket in a poor area.', 'سطح درآمد اطراف، از ۰ (متوسط) تا ۱۰۰ (پردرآمد). فقط تهران، و یک جانشین است: ارتفاع از سطح دریا که در سراسر شهر با درآمد هم‌راستاست. جیب پردرآمد در محله‌ی کم‌درآمد را نمی‌بیند.'],
    'cc.aff': ['In this concept, income level counts {0}% of the score ({1}).', 'در این مفهوم سطح درآمد {0}٪ از امتیاز را می‌سازد ({1}).'], 'cc.affUp': ['it prefers well-off areas', 'مناطق پردرآمد را ترجیح می‌دهد'], 'cc.affDown': ['it prefers modest-income areas', 'مناطق با درآمد متوسط را ترجیح می‌دهد'],
    'fp.h': ['Foot traffic here (model, relative)', 'تردد پیاده در اینجا (مدل، نسبی)'],
    'fp.here': ['The street in front: busier than {0}% of the streets in district 5 (index {0}).', 'خیابان روبه‌رو: شلوغ‌تر از {0}٪ خیابان‌های منطقه‌ی ۵ (شاخص {0}).'],
    'fp.far': ['The nearest street in the model is {0} m away, so there is no estimate for the exact spot.', 'نزدیک‌ترین خیابان در مدل {0} متر دورتر است، پس برای خود نقطه برآوردی نیست.'],
    'fp.busiest': ['The busiest street within 200 m scores {0}.', 'شلوغ‌ترین خیابان در ۲۰۰ متری {0} می‌گیرد.'],
    'fp.note': ['A model of where people walk, built from the street network, homes, shops and transit stops. It exists only for district 5 of Tehran (all its sub-districts), it is relative (100 = the busiest 2% of streets), and no pedestrian has been counted yet to calibrate it. Count people at your spot before relying on it.', 'مدلی از اینکه مردم کجا راه می‌روند، ساخته‌شده از شبکه‌ی خیابان، خانه‌ها، مغازه‌ها و ایستگاه‌ها. فقط برای منطقه‌ی ۵ تهران (همه‌ی نواحی‌اش) هست، نسبی است (۱۰۰ = ۲٪ شلوغ‌ترین خیابان‌ها) و هنوز هیچ عابری برای کالیبره‌کردنش شمرده نشده. پیش از تکیه بر آن، در نقطه‌ات آدم بشمار.'],
    'fp.map': ['Foot traffic (model)', 'تردد پیاده (مدل)'], 'fp.legend': ['Estimated foot traffic, relative. Thicker and brighter = busier.', 'تردد پیاده‌ی برآوردی، نسبی. ضخیم‌تر و روشن‌تر = شلوغ‌تر.'],
    'fp.guide': ['Foot traffic (model)', 'تردد پیاده (مدل)'], 'fp.quiet': ['quiet', 'کم‌تردد'], 'fp.busy': ['busy', 'پرتردد'],
    'fp.gnote': ['Streets of district 5 (all sub-districts). Relative, not people per hour.', 'خیابان‌های منطقه‌ی ۵ (همه‌ی نواحی). نسبی است، نه نفر در ساعت.'],
    'hex.map': ['Hexbin model (hexagonal grid)', 'مدل هگزبین (شبکه شش‌ضلعی)'],
    'hex.guide': ['Hexbin score model', 'مدل هگزبین امتیازها'],
    'hex.gnote': ['Each hexagon (~{0} m across) aggregates surrounding blocks. Click any hex for details.', 'هر شش‌ضلعی (عرض حدود {0} متر) بلوک‌های محدوده را تجمیع می‌کند. برای جزئیات روی آن کلیک کنید.'],
    'hex.low': ['Weak', 'ضعیف'], 'hex.high': ['Strong', 'قوی'],
    'hex.sym': ['Hexbin cell (colour = score)', 'سلول هگزبین (رنگ بر اساس امتیاز)'],
    'hex.toggle': ['Hexbin model', 'مدل هگزبین'],
    'hex.pop.title': ['Hexbin cell', 'سلول هگزبین'],
    'hex.pop.blocks': ['{0} blocks · peak {1}', '{0} بلوک · بیشینه {1}'],
    'hex.pop.analyze': ['Analyze this spot', 'تحلیل این نقطه'],
    'map.wide': ['Enlarge the map', 'بزرگ‌کردن نقشه'], 'map.narrow': ['Shrink the map', 'کوچک‌کردن نقشه'],
    'deep.away': ['{0} m away', '{0} متر فاصله'],
    'leg.h': ['Map guide', 'راهنمای نقشه'], 'leg.biz': ['Businesses within {0} m', 'کسب‌وکارها در شعاع {0} متر'],
    'leg.yours': ['yours', 'کسب‌وکار تو'], 'leg.tap': ['Tap a colour to show or hide it.', 'برای نمایش یا پنهان کردن، روی رنگ بزن.'],
    'leg.symbols': ['Symbols', 'نمادها'], 'leg.spot': ['The spot you are checking', 'نقطه‌ای که بررسی می‌کنی'],
    'leg.reach': ['Customer reach (your radius)', 'شعاع جذب مشتری'], 'leg.area': ['Best area, numbered by rank', 'منطقه‌ی برتر، به ترتیب رتبه'],
    'leg.heat': ['Brighter = better score', 'روشن‌تر = امتیاز بهتر'], 'leg.big': ['Larger dots are your direct competitors.', 'نقطه‌های بزرگ‌تر رقبای مستقیم تو هستند.'],
    'leg.none': ['Click a spot or an area to see the businesses around it.', 'روی یک نقطه یا منطقه کلیک کن تا کسب‌وکارهای اطرافش را ببینی.'],
    'leg.open': ['Show the map guide', 'نمایش راهنمای نقشه'], 'leg.close': ['Hide the map guide', 'پنهان کردن راهنمای نقشه'],
    'leg.kind': ['Type', 'نوع'], 'leg.pop.dist': ['{0} m away', '{0} متر فاصله'],
    'rep.legend': ['Larger dots are your direct competitors. Dots outside the dashed ring are shown for context and are not counted. Grey shading: buildings and streets, darker where denser. Black dot: the spot.', 'نقطه‌های بزرگ‌تر رقبای مستقیم تو هستند. نقطه‌های بیرون حلقه‌ی خط‌چین فقط برای زمینه‌اند و شمرده نمی‌شوند. سایه‌ی خاکستری: ساختمان و خیابان، هرچه متراکم‌تر تیره‌تر. نقطه‌ی سیاه: همین مکان.'],
    'rep.verdict': ['Verdict', 'جمع‌بندی'], 'rep.method': ['How this was calculated', 'چگونه محاسبه شد'], 'rep.dist': ['Distance from the spot', 'فاصله تا این نقطه'], 'rep.name': ['Name', 'نام'],
    'rep.count': ['Count', 'تعداد'], 'rep.share': ['Share', 'سهم'], 'rep.pct': ['Index', 'شاخص'], 'rep.km': ['{0} km of street', '{0} کیلومتر خیابان'],
    'rep.noSpot': ['No details', 'بدون جزئیات']
  };
  function isFa() { return document.documentElement.lang === 'fa'; }
  function T(k) {
    var v = S[k]; if (!v) return k;
    var s = v[isFa() ? 1 : 0];
    for (var i = 1; i < arguments.length; i++) s = s.split('{' + (i - 1) + '}').join(arguments[i]);
    return s;
  }
  function N(n, d) { return Number(n).toLocaleString(isFa() ? 'fa-IR' : 'en-US', d == null ? {} : { maximumFractionDigits: d, minimumFractionDigits: d }); }
  /* a span that the language switcher can flip without a redraw */
  function L(k) { var v = S[k] || [k, k]; return '<span data-en="' + esc(v[0]) + '" data-fa="' + esc(v[1]) + '">' + esc(v[isFa() ? 1 : 0]) + '</span>'; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function cityName(c) { return isFa() ? c.fa : c.en; }
  function placeText(p) { return p ? (isFa() ? p.fa : p.en) : ''; }

  /* explanations, from the structured items the engine returns */
  function explain(it, kind) {
    var k = (kind === 'good' ? 'g.' : kind === 'bad' ? 'b.' : 'r.') + it.k;
    if (it.k === 'driver') return T('g.driver', N(it.n), T('drv.' + it.key));
    if (it.k === 'thinData') return T('r.thinData.' + (it.sev === 'high' ? 'thin' : 'partial'));
    if (S[k]) return T(k, N(it.n == null ? 0 : it.n));
    return k;
  }
  function weightsText(w) { return T('res.formula', N(Math.round(w.pop * 100)), N(Math.round(w.demand * 100)), N(Math.round(w.access * 100)), N(Math.round(w.comp * 100))); }

  /* ── widgets ───────────────────────────────────────────────────── */
  function ring(score, size, cls) {
    var r = size / 2 - 7, c = 2 * Math.PI * r, h = size / 2, lv = score >= 75 ? 'strong' : score >= 60 ? 'promising' : score >= 45 ? 'mixed' : 'weak';
    return '<svg class="jb-ring lv-' + lv + (cls ? ' ' + cls : '') + '" width="' + size + '" height="' + size + '" viewBox="0 0 ' + size + ' ' + size + '" role="img" aria-label="' + score + '/100">' +
      '<circle class="jb-ring-bg" cx="' + h + '" cy="' + h + '" r="' + r + '" fill="none" stroke-width="6"/>' +
      '<circle class="jb-ring-fg" cx="' + h + '" cy="' + h + '" r="' + r + '" fill="none" stroke-width="6" stroke-linecap="round" stroke-dasharray="' + (c * score / 100).toFixed(1) + ' ' + c.toFixed(1) + '" transform="rotate(-90 ' + h + ' ' + h + ')"/>' +
      '<text x="50%" y="50%" text-anchor="middle" dominant-baseline="central" class="jb-ring-t" font-size="' + Math.round(size * .34) + '">' + N(score) + '</text></svg>';
  }
  function bar(label, value, note) {
    return '<div class="jb-bar"><div class="jb-bar-h"><span>' + label + '</span><b>' + N(value) + '</b></div><div class="jb-bar-t"><i style="width:' + Math.max(2, Math.min(100, value)) + '%"></i></div>' + (note ? '<small>' + note + '</small>' : '') + '</div>';
  }

  /* the decision facts, as one block used by the workspace and by the printed report */
  function insightsHtml(d, o) {
    o = o || {}; var cityName = o.city || '', out = '', thin = d.complete < 60;
    var sec = function (h, body, note) { return '<section class="jb-sec"><h3>' + esc(T(h)) + '</h3>' + (note ? '<p class="jb-note">' + esc(T(note)) + '</p>' : '') + body + '</section>'; };
    out += sec('in.h1', bar(esc(T('in.pct', N(d.percentile), cityName)), d.percentile) +
      (d.perRival && d.perRival.median ? '<p class="jb-note">' + esc(T('in.per', N(d.perRival.value), N(d.perRival.median))) + (thin ? ' <b>' + esc(T('in.perThin')) + '</b>' : '') + '</p>' : ''));
    var mix = ['residents', 'workers', 'students', 'visitors'].map(function (k) { return bar(esc(T('in.g.' + k)), d.audienceMix[k]); }).join('');
    if (d.aff != null) mix += bar(esc(T('in.aff')), d.aff, esc(T('in.affn')));
    out += sec('in.h2', mix, 'in.h2n');
    var facts = '<ul class="jb-list"><li>' + esc(d.nearestRival ? T('in.nearRival', N(d.nearestRival.dist), d.nearestRival.name ? ' (' + d.nearestRival.name + ')' : '') : T('in.noRival')) + '</li>' +
      '<li>' + esc(d.nearestTransit ? T('in.nearTransit', N(d.nearestTransit.dist)) : T('in.noTransit')) + '</li>' +
      '<li>' + esc(T('in.people', N(d.people), N(d.r))) + '</li></ul>';
    out += sec('in.h3', facts);
    out += sec('in.h4', d.byRadius.map(function (x) { return bar(esc(T('in.r', N(x.r))) + (x.r === d.r ? ' ◂' : ''), x.score); }).join(''), 'in.h4n');
    var better = d.betterNearby && d.betterNearby.length ? '<div class="jb-rivals">' + d.betterNearby.map(function (b, k) {
      var nm = placeText(b.place) || (N(b.lat, 4) + ', ' + N(b.lon, 4));
      return '<div class="jb-rival"><span>' + esc(nm) + '<br><small>' + esc(T('in.score', N(b.score), N(b.dist))) + '</small></span>' + (o.link ? '<b><button type="button" class="jb-link" data-better="' + k + '">' + esc(T('in.look')) + '</button></b>' : '') + '</div>';
    }).join('') + '</div>' : '<p class="jb-note">' + esc(T('in.noBetter')) + '</p>';
    out += sec('in.h5', better, 'in.h5n');
    return out;
  }
  function checklistHtml() {
    return '<section class="jb-sec"><h3>' + esc(T('ck.h')) + '</h3><ul class="jb-list risk">' + [1, 2, 3, 4, 5, 6, 7].map(function (i) { return '<li>' + esc(T('ck.' + i)) + '</li>'; }).join('') + '</ul></section>';
  }
  function breakEvenHtml() {
    var f = function (id, key, val) { return '<label class="be-l" for="' + id + '">' + esc(T(key)) + '</label><input class="be-in" id="' + id + '" type="number" inputmode="numeric" min="0" step="any" value="' + val + '">'; };
    return '<section class="jb-sec" id="beBox"><h3>' + esc(T('be.h')) + '</h3><p class="jb-note">' + esc(T('be.n')) + '</p>' +
      f('beRent', 'be.rent', '') + f('beCost', 'be.cost', '') + f('beSpend', 'be.spend', '') + f('beMargin', 'be.margin', 40) + f('beDays', 'be.days', 26) +
      '<p class="be-out" id="beOut" aria-live="polite">' + esc(T('be.ask')) + '</p></section>';
  }
  function breakEven(d) {
    var v = function (id) { var e = document.getElementById(id); return e ? parseFloat(e.value) : NaN; };
    var rent = v('beRent'), cost = v('beCost') || 0, spend = v('beSpend'), mg = v('beMargin'), days = v('beDays') || 26, out = document.getElementById('beOut');
    if (!out) return;
    if (!(rent >= 0) || !(spend > 0) || !(mg > 0)) { out.textContent = T('be.ask'); return; }
    var perDay = (rent + cost) / (spend * mg / 100) / days, per1000 = d.people ? perDay / d.people * 1000 : 0;
    out.innerHTML = esc(T('be.out', N(Math.round(perDay * 10) / 10), N(Math.round(per1000 * 10) / 10), N(d.r), N(d.sameType))) + '<br><b>' + esc(T('be.warn')) + '</b>';
  }
  function radar(vals, labels, size) {
    var n = vals.length, c = size / 2, R = size / 2 - 34, i, pts = [], rings = '', axes = '', lab = '';
    function pt(i, v) { var a = -Math.PI / 2 + i * 2 * Math.PI / n; return [c + Math.cos(a) * R * v / 100, c + Math.sin(a) * R * v / 100]; }
    [25, 50, 75, 100].forEach(function (g) { var p = []; for (i = 0; i < n; i++) p.push(pt(i, g).map(function (x) { return x.toFixed(1); }).join(',')); rings += '<polygon class="jb-rg" points="' + p.join(' ') + '"/>'; });
    for (i = 0; i < n; i++) {
      var e = pt(i, 100), p = pt(i, Math.max(0, Math.min(100, vals[i]))), l = pt(i, 122);
      axes += '<line class="jb-rg" x1="' + c + '" y1="' + c + '" x2="' + e[0].toFixed(1) + '" y2="' + e[1].toFixed(1) + '"/>';
      pts.push(p[0].toFixed(1) + ',' + p[1].toFixed(1));
      lab += '<text class="jb-rl" x="' + l[0].toFixed(1) + '" y="' + l[1].toFixed(1) + '" text-anchor="middle" dominant-baseline="central">' + esc(labels[i]) + '</text>';
    }
    return '<svg class="jb-radar" viewBox="-56 0 ' + (size + 112) + ' ' + size + '" width="100%" role="img">' + rings + axes +
      '<polygon class="jb-rp" points="' + pts.join(' ') + '"/>' + lab + '</svg>';
  }
  function radarVals(a) { return [a.pop, a.demand, a.access, a.term, Math.max(0, Math.min(100, 50 + a.gap / 2))]; }
  function radarLabels() { return [T('m.pop'), T('m.demand'), T('m.access'), T('m.lowcomp'), T('m.gap')]; }

  /* offline dot map: buildings and streets as shade, every business type in its own colour */
  function dotMap(canvas, C, a, o, light) {
    var d = C.d, dpr = Math.min(2, window.devicePixelRatio || 1), W = canvas.clientWidth || 640, H = canvas.clientHeight || 420;
    canvas.width = W * dpr; canvas.height = H * dpr;
    var g = canvas.getContext('2d'); g.scale(dpr, dpr);
    var span = Math.max(a.r * 3.2, 2400), mPerPx = span / Math.min(W, H);
    var cosL = Math.cos(a.lat * Math.PI / 180);
    function px(lat, lon) { return [W / 2 + (lon - a.lon) * 111320 * cosL / mPerPx, H / 2 - (lat - a.lat) * 110574 / mPerPx]; }
    g.fillStyle = light ? '#F7F8FA' : '#0B0C10'; g.fillRect(0, 0, W, H);
    var CE = root.Jabio.CELL, iy, ix, c, v, max = 1;
    var bc = C.L['@bc'], mi = C.L['@minor'], ma = C.L['@major'];
    for (iy = 0; iy < C.ny; iy++) for (ix = 0; ix < C.nx; ix++) {
      c = iy * C.nx + ix; v = bc[c]; if (v > max) max = v;
    }
    var rmax = 1;
    for (c = 0; c < C.n; c++) { var rv = mi[c] + ma[c] * 1.6; if (rv > rmax) rmax = rv; }
    function blob(x, y, rad, rgb, alpha) {
      var gr = g.createRadialGradient(x, y, 0, x, y, rad);
      gr.addColorStop(0, 'rgba(' + rgb + ',' + alpha.toFixed(3) + ')'); gr.addColorStop(1, 'rgba(' + rgb + ',0)');
      g.fillStyle = gr; g.fillRect(x - rad, y - rad, rad * 2, rad * 2);
    }
    var s = CE / mPerPx, cb = light ? '17,17,19' : '255,255,255', cr = light ? '60,64,80' : '170,176,200';
    for (iy = 0; iy < C.ny; iy++) for (ix = 0; ix < C.nx; ix++) {
      c = iy * C.nx + ix;
      var la = d.s + (iy + .5) * d.dLat, lo = d.w + (ix + .5) * d.dLon, p = px(la, lo);
      if (p[0] < -40 || p[0] > W + 40 || p[1] < -40 || p[1] > H + 40) continue;
      if (bc[c] > 0) blob(p[0], p[1], s * .9, cb, (light ? .22 : .2) * Math.min(1, bc[c] / (max * .5)));
      var rl = mi[c] + ma[c] * 1.6;
      if (rl > 0) blob(p[0], p[1], s * .75, cr, (light ? .3 : .3) * Math.min(1, rl / (rmax * .6)));
    }
    /* every business in the radius, each type in its own colour; the user's own type is drawn larger and last */
    var all = root.Jabio.placesAround(C, a.lat, a.lon, a.r * 1.25);
    all.filter(function (q) { return q.biz !== a.type; }).concat(all.filter(function (q) { return q.biz === a.type; })).forEach(function (q) {
      var p = px(q.lat, q.lon), mine = q.biz === a.type;
      g.beginPath(); g.arc(p[0], p[1], mine ? 5.2 : 3.2, 0, 6.3); g.fillStyle = BIZ_COLOR[q.biz];
      g.fill(); g.lineWidth = mine ? 1.6 : 1; g.strokeStyle = light ? '#fff' : '#0B0C10'; g.stroke();
    });
    g.strokeStyle = light ? 'rgba(81,81,198,.9)' : 'rgba(194,195,245,.95)'; g.lineWidth = 1.5; g.setLineDash([6, 5]);
    g.beginPath(); g.arc(W / 2, H / 2, a.r / mPerPx, 0, 6.3); g.stroke(); g.setLineDash([]);
    g.fillStyle = light ? '#111113' : '#fff'; g.strokeStyle = light ? '#fff' : '#111113'; g.lineWidth = 2;
    g.beginPath(); g.arc(W / 2, H / 2, 6.5, 0, 6.3); g.fill(); g.stroke();
    g.font = '11px Poppins, sans-serif'; g.fillStyle = light ? 'rgba(17,17,19,.6)' : 'rgba(255,255,255,.6)';
    var scale = a.r >= 2000 ? 1000 : 500, sw = scale / mPerPx;
    g.fillRect(14, H - 22, sw, 2); g.fillText(scale >= 1000 ? '1 km' : '500 m', 14, H - 28);
  }

  /* one colour per business type, the same on the map, in the guide and in the report.
     Chosen so that no two look alike (CIE colour difference of at least 43), soft enough for the site and bright enough for a dark map; the busiest type, services, is a neutral grey. A white outline keeps them readable on the light map. */
  var BIZ_COLOR = { restaurant: '#ED4545', cafe: '#EDB545', services: '#9AA3B5', grocery: '#45ED45', pharmacy: '#61EFC0',
    fitness: '#4545ED', clinic: '#4588ED', education: '#CBF27D', beauty: '#EB84BB', fashion: '#ED45E1' };
  /* the guide: a row per business type with its colour and how many are in the radius. interactive = the workspace. */
  function legendRows(counts, sel, hidden, interactive) {
    return root.Jabio.ORDER.map(function (t) {
      var off = hidden && hidden[t], n = counts[t] || 0, tag = interactive ? 'button type="button" aria-pressed="' + (!off) + '"' : 'div';
      return '<' + tag + ' class="lg-row' + (t === sel ? ' me' : '') + (off ? ' off' : '') + '" data-biz="' + t + '"><i style="background:' + BIZ_COLOR[t] + '"></i>' +
        '<span>' + esc(T('type.' + t)) + (t === sel ? ' <em>' + esc(T('leg.yours')) + '</em>' : '') + '</span><b>' + N(n) + '</b></' + (interactive ? 'button' : 'div') + '>';
    }).join('');
  }
  /* state <-> address, so a result is a link */
  function toQuery(st) {
    var q = ['c=' + st.city, 'lat=' + st.point.lat.toFixed(5), 'lon=' + st.point.lon.toFixed(5), 'r=' + st.r, 't=' + (st.spotType || st.type)];
    if (st.sub && (st.spotType || st.type) === st.type) q.push('sub=' + st.sub);
    if (st.audience.length) q.push('a=' + st.audience.join(',')); if (st.priorities.length) q.push('p=' + st.priorities.join(',')); if (st.strategy && st.strategy !== 'balance') q.push('s=' + st.strategy);
    return q.join('&');
  }
  function fromQuery(search) {
    var p = new URLSearchParams(search), g = function (k) { return p.get(k); }, J = root.Jabio;
    var lat = parseFloat(g('lat')), lon = parseFloat(g('lon')), t = g('t');
    if (!(lat > 20 && lat < 45 && lon > 40 && lon < 66) || !J.TYPES[t]) return null;
    var list = function (k, ok) { return (g(k) || '').split(',').filter(function (x) { return ok[x]; }); };
    var tt = function () { return t; };
    var r = parseInt(g('r'), 10);
    return { city: g('c') || 'tehran', point: { lat: lat, lon: lon }, type: t, spotType: t, r: [500, 1000, 2000, 3000].indexOf(r) >= 0 ? r : 1000,
      sub: (function () { var t = root.GA_TAXONOMY, id = g('sub'); return t && t.cats[tt()] && t.cats[tt()].some(function (x) { return x.id === id; }) ? id : ''; })(),
      audience: list('a', J.AUDIENCE), priorities: list('p', J.PRIORITY), strategy: ['low', 'cluster'].indexOf(g('s')) >= 0 ? g('s') : 'balance' };
  }

  root.JW = { insightsHtml: insightsHtml, checklistHtml: checklistHtml, breakEvenHtml: breakEvenHtml, breakEven: breakEven, S: S, T: T, N: N, L: L, esc: esc, isFa: isFa, cityName: cityName, placeText: placeText, explain: explain, weightsText: weightsText,
    BIZ_COLOR: BIZ_COLOR, legendRows: legendRows, ring: ring, bar: bar, radar: radar, radarVals: radarVals, radarLabels: radarLabels, dotMap: dotMap, toQuery: toQuery, fromQuery: fromQuery };
})(window);
