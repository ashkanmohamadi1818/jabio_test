'use strict';

const BLOG_CATEGORIES = [
  { id: 'all', en: 'All articles', fa: 'همه مقالات' },
  { id: 'strategy', en: 'Site Strategy', fa: 'استراتژی مکان‌یابی' },
  { id: 'finance', en: 'Rent & Economics', fa: 'اجاره و اقتصاد ملک' },
  { id: 'field-guide', en: 'Field Research', fa: 'بررسی میدانی' },
  { id: 'cities', en: 'City Guides', fa: 'تحلیل شهرها' }
];

const BLOG_POSTS = [
  {
    slug: 'how-to-choose-shop-location',
    category: 'strategy',
    date: '2026-11-18',
    dateFa: '۲۷ آبان ۱۴۰۵',
    readMins: 11,
    featured: true,
    title: {
      en: 'How to Choose a Shop Location in Iran: The No-Nonsense Field Playbook',
      fa: 'چطور بهترین مغازه رو برای کسب‌وکارمون انتخاب کنیم؟ (راهنمای جامع و بی‌تعارف)'
    },
    excerpt: {
      en: 'Before you hand over a cheque to a landlord, learn how to shrink an entire Iranian city down to 3 winning streets using real demand data, comparison tables, and a field checklist.',
      fa: 'قبل از اینکه پای قرارداد اجاره رو امضا کنید و کلی پول دکور بدید، یاد بگیرید چطور یه شهر بزرگ رو با داده واقعی، جدول مقایسه و چک‌لیست میدانی به ۳ خیابان طلایی محدود کنید.'
    },
    keyTakeaway: {
      en: 'Do not start your search on real-estate listing apps. Pick your customer radius and demand drivers first, narrow the city down to 3–5 high-scoring blocks, and only then compare rents inside those blocks.',
      fa: 'هیچ‌وقت جستجوی مغازه رو از دیوار و آگهی املاک کل شهر شروع نکنید! اول شعاع مشتری و محرک‌های تقاضای صنفتون رو مشخص کنید، شهر رو به ۳ تا ۵ بلوک برتر غربال کنید و تازه بعدش برید سراغ مقایسه رهن و اجاره همون محدوده‌ها.'
    },
    cta: {
      en: 'Find top city blocks',
      fa: 'تحلیل بلوک‌های شهر',
      href: '/jabio.html'
    },
    sections: [
      {
        id: 'why-gut-fails',
        heading: {
          en: '1. Why "this street feels busy" is the most expensive trap',
          fa: '۱. چرا جمله «این خیابون خیلی شلوغه» گرون‌ترین تله انتخاب مغازه‌ست؟'
        },
        paragraphs: {
          en: [
            'Let’s be honest: almost every shuttered shop you walk past in Tehran, Isfahan, or Shiraz was rented by someone who genuinely believed the street was packed. They drove past at 7 PM, saw headlights and sidewalks full of people, fell in love with a clean storefront, and signed a one-year lease.',
            'Two months later, reality hits. Half the people on that sidewalk were rushing to a metro exit with headphones on, the cars were moving at 50 km/h with nowhere to pull over, and the actual residents who buy groceries or coffee three times a week lived two blocks away on a quieter neighbourhood strip.'
          ],
          fa: [
            'بیایید روراست باشیم؛ تقریباً پشت هر مغازه‌ای که بعد از شش ماه کرکره‌ش پایین میاد و آگهی «واگذاری با دکور» می‌خوره، یه آدم باانگیزه بوده که روز اول با خودش گفته: «عجب خیابون شلوغیه، اینجا حتماً می‌گیره!» ساعت ۷ عصر از اونجا رد شده، چراغ مغازه‌ها و شلوغی خیابون چشمش رو گرفته و قرارداد رو بسته.',
            'اما دو ماه بعد واقعیت خودش رو نشون می‌ده: نصف عابرا با هندزفری داشتن می‌دویدن سمت مترو، ماشین‌ها با سرعت ۵۰ کیلومتر رد می‌شدن و جای پارک نبود، و مشتری واقعی اون صنف اصلاً دو کوچه اون‌ورتر توی بافت مسکونی زندگی می‌کرد. پس اولین قانون مکان‌یابی اینه: «شلوغی خام» هیچ ربطی به «مشتری خریدار» نداره.'
          ]
        },
        tip: {
          labelEn: 'Field rule of thumb',
          labelFa: 'نکته طلایی از کف بازار',
          en: 'A 35 m² shop on the exact right block consistently outsells an 80 m² showroom with luxury decor on the wrong side of an avenue.',
          fa: 'یه مغازه ۳۵ متری توی بلوک درست و پرپاخور، تقریباً همیشه بیشتر از یه مغازه ۸۰ متری با دکور چندمیلیاردی توی جای اشتباه می‌فروشه. دکور رو می‌شه عوض کرد، ولی جای مغازه رو نه!'
        }
      },
      {
        id: 'catchment-comparison',
        heading: {
          en: '2. Match your business type to its real catchment radius',
          fa: '۲. هر صنفی شعاع مشتری خودش رو داره (جدول مقایسه اصناف)'
        },
        paragraphs: {
          en: [
            'Before calling a single real-estate agent, pin down how far your typical customer is realistically willing to walk or drive. A neighbourhood bakery lives on households within 400 metres; a dental clinic or specialty gym pulls patients from 2 to 3 kilometres away if transit and parking are easy.'
          ],
          fa: [
            'قبل از اینکه حتی به یه مشاور املاک زنگ بزنید، باید بدونید مشتریِ کار شما حاضره چند متر پیاده بیاد یا چند دقیقه رانندگی کنه تا از شما خرید کنه. سوپرمارکت و نانوایی فانتزی روی همسایه‌های ۴۰۰ متری می‌چرخن، ولی یه کلینیک یا باشگاه خوب می‌تونه از شعاع ۲ تا ۳ کیلومتری مشتری جذب کنه. این جدول رو برای مقایسه سریع داشته باشید:'
          ]
        },
        table: {
          captionEn: 'Typical customer catchment radius & primary demand drivers by category',
          captionFa: 'مقایسه شعاع جذب مشتری و مهم‌ترین محرک‌های فروش برای اصناف رایج در ایران',
          headersEn: ['Business type', 'Real catchment', 'Top demand driver', 'Rent sensitivity'],
          headersFa: ['نوع کسب‌وکار', 'شعاع واقعی مشتری', 'محرک اصلی تقاضا', 'حساسیت به اجاره'],
          rowsEn: [
            ['Supermarket / Bakery', '300 – 700 m', 'Dense residential households', 'High (thin margins)'],
            ['Specialty Café / Juice', '500 m – 1.5 km', 'Offices, universities, evening walkers', 'Medium'],
            ['Pharmacy', '500 m – 1 km', 'Clinics, doctors, residential density', 'Medium-Low'],
            ['Restaurant / Fast Food', '1 – 2.5 km', 'Offices + families + delivery reach', 'Medium'],
            ['Clothing / Beauty Salon', '1.5 – 3 km', 'Established retail cluster + visibility', 'High on main strip'],
            ['Clinic / Gym', '2 – 4 km', 'Parking, metro/BRT access, families', 'Low (upper floors work)']
          ],
          rowsFa: [
            ['سوپرمارکت و نانوایی فانتزی', '۳۰۰ تا ۷۰۰ متر', 'تراکم خانوار و برج‌های مسکونی', 'خیلی بالا (حاشیه سود کم)'],
            ['کافه تخصصی و آبمیوه‌فروشی', '۵۰۰ متر تا ۱٫۵ کیلومتر', 'ادارات، دانشگاه و پاخور عصرگاهی', 'متوسط'],
            ['داروخانه', '۵۰۰ متر تا ۱ کیلومتر', 'مطب پزشکان، درمانگاه و بافت مسکونی', 'متوسط رو به پایین'],
            ['رستوران و فست‌فود', '۱ تا ۲٫۵ کیلومتر', 'شاغلان ظهر + خانواده‌ها + پیک محلی', 'متوسط'],
            ['پوشاک و سالن زیبایی', '۱٫۵ تا ۳ کیلومتر', 'راسته تجاری جاافتاده و دید ویترین', 'بالا در برِ اصلی'],
            ['کلینیک و باشگاه ورزشی', '۲ تا ۴ کیلومتر', 'جای پارک، مترو و دسترسی آسان', 'پایین (طبقه اول هم جواب می‌ده)']
          ]
        }
      },
      {
        id: 'four-signals',
        heading: {
          en: '3. Filter the city with four objective signals instead of guesswork',
          fa: '۳. به‌جای حدس و گمان، محله‌ها رو با ۴ شاخص واقعی غربال کنید'
        },
        paragraphs: {
          en: [
            'When you walk into a neighbourhood with a broker, everything blurs together—the landlord’s sales pitch, fresh paint, and the width of the avenue. Breaking every candidate block into four measurable pillars keeps your head clear:'
          ],
          fa: [
            'وقتی با مشاور املاک می‌رید بازدید، حرف‌های قشنگ مالک، نورپردازی مغازه و عرض خیابون ذهن آدم رو منحرف می‌کنه. اگه می‌خواید سرتون کلاه نره، هر مغازه‌ای رو جداگانه روی این چهار تا ستون بسنجید:'
          ]
        },
        bullets: {
          en: [
            'Resident population: how many households actually sleep within your walking radius (the backbone of weekday + weekend stability).',
            'Demand generators: offices, schools, universities, hospitals, malls, and active retail strips that inject fresh buyers every day.',
            'Real street & transit access: walkable sidewalks, metro/BRT/bus stops, and whether a driver can actually stop without getting honked at.',
            'Room beside competitors: comparing rival count against total neighbourhood demand—remember, zero rivals often means zero demand, not a secret goldmine.'
          ],
          fa: [
            'جمعیت ساکن واقعی: چند هزار نفر واقعاً توی شعاع دسترسی شما زندگی می‌کنن؟ این عدد بیمه فروش شما توی روزهای تعطیل و عصرهاست.',
            'محرک‌های تقاضا (مشتری‌سازها): اداره، دانشگاه، مدرسه، کلینیک، پاساژ و مغازه‌های مکمل که هر روز پای آدم‌های جدید رو به محل باز می‌کنن.',
            'دسترسی و پاخور واقعی: کیفیت پیاده‌رو، فاصله تا ایستگاه مترو یا اتوبوس، و اینکه راننده واقعاً بتونه ۲ دقیقه جلوی مغازه وایسه یا نه.',
            'ظرفیت بازار کنار رقبا: مقایسه تعداد رقبای فعلی با حجم کل تقاضای محله. یادتون باشه نبودِ هیچ رقیبی معمولاً نشونه بازارِ مرده‌ست، نه گنجِ کشف‌نشده!'
          ]
        },
        internalLinks: [
          { en: 'Browse all 15 Iranian city hubs', fa: 'آمار و تحلیل ۱۵ شهر ایران رو ببینید', href: '/cities' },
          { en: 'How Jabio calculates block scores', fa: 'روش‌شناسی امتیازدهی جابیو چطور کار می‌کنه؟', href: '/methodology' }
        ]
      },
      {
        id: 'three-visit-audit',
        heading: {
          en: '4. The 3-visit field audit before you talk money',
          fa: '۴. قانون «سه بار بازدید» قبل از اینکه اصلاً سر قیمت چونه بزنید'
        },
        paragraphs: {
          en: [
            'Data gets you to the right three streets in five minutes, saving weeks of aimless driving. Now comes the human part that no satellite or map can replace: standing on the pavement.',
            'Visit each finalist block three separate times—a weekday noon (12:30), a weekday evening (18:30–20:00), and a Friday afternoon. Spend 15 minutes counting passers-by who actually fit your buyer profile, peek inside the two closest rivals to see how busy their cash register is, and chat for five minutes with a neighbouring shopkeeper who isn’t your direct competitor. They will tell you more truth in five minutes than ten property listings.'
          ],
          fa: [
            'داده و نقشه توی پنج دقیقه کل شهر رو براتون فیلتر می‌کنه و می‌رسونه‌تون به ۳ خیابون برتر؛ اما از اینجا به بعدش کارِ کف خیابونه که هیچ نقشه‌ای جاش رو نمی‌گیره.',
            'به هر کدوم از ۳ گزینه نهایی دقیقاً سه بار سر بزنید: یک ظهر روز کاری (حدود ۱۲:۳۰)، یک عصر روز کاری (۱۸:۳۰ تا ۲۰) و یک بعدازظهر جمعه. هر بار ۱۵ دقیقه گوشه پیاده‌رو وایسید، عابرایی که واقعاً به تیپ مشتری شما می‌خورن رو بشمارید، یه سر به دو تا رقیب نزدیک بزنید ببینید دخلشون می‌چرخه یا نه، و ۵ دقیقه با یه مغازه‌دار همسایه (از صنف غیررقیب) گپ بزنید. یه کاسب قدیمی محل توی ۵ دقیقه چیزهایی بهتون می‌گه که تو هیچ آگهی املاکی پیدا نمی‌شه!'
          ]
        },
        internalLinks: [
          { en: 'Compare up to 4 candidate shops side-by-side', fa: 'تا ۴ مغازه کاندیدا رو کنار هم مقایسه کنید', href: '/compare.html' }
        ]
      }
    ],
    checklist: {
      titleEn: 'Pre-Lease Shop Location Field Checklist',
      titleFa: 'چک‌لیست میدانی انتخاب مغازه (قبل از امضای قرارداد)',
      subtitleEn: 'Tick off each step on your phone while scouting — your progress is saved in this browser.',
      subtitleFa: 'موقعی که برای بازدید مغازه می‌رید هر مورد رو همین‌جا تیک بزنید؛ تیک‌ها توی مرورگرتون ذخیره می‌شه.',
      items: [
        { id: 'c1', en: 'Defined my exact customer catchment radius (500 m, 1 km, or 2+ km)', fa: 'شعاع دقیق جذب مشتری صنفم رو مشخص کردم (۵۰۰ متر، ۱ کیلومتر یا بیشتر)' },
        { id: 'c2', en: 'Checked the block’s population, demand, access, and rival scores on Jabio', fa: 'امتیاز جمعیت، تقاضا، دسترسی و رقبا رو روی نقشه جابیو چک کردم' },
        { id: 'c3', en: 'Visited the street 3 times: weekday noon, weekday evening, and Friday', fa: 'سه بار در زمان‌های مختلف (ظهر کاری، عصر کاری و جمعه) از محل بازدید کردم' },
        { id: 'c4', en: 'Counted real target pedestrians for 15 minutes right outside the door', fa: '۱۵ دقیقه دقیق جلوی در مغازه عابرانِ هدف رو شمردم' },
        { id: 'c5', en: 'Asked 2 neighbouring non-rival shopkeepers about seasonal dips & past tenants', fa: 'از ۲ کسبه همسایه درباره سابقه مستاجرهای قبلی و افت فصلی پرسیدم' },
        { id: 'c6', en: 'Checked sidewalk width, sun/shade angle, signage visibility, and parking', fa: 'عرض پیاده‌رو، آفتاب‌گیر بودن، دید تابلو از دور و جای پارک رو بررسی کردم' },
        { id: 'c7', en: 'Verified municipal & guild permit eligibility for my exact trade', fa: 'مجاز بودن صنفم و ضوابط اتحادیه و شهرداری رو برای این ملک استعلام گرفتم' }
      ]
    },
    faq: [
      {
        qEn: 'Should I pick a cheaper shop on a side street or pay double on a main avenue?',
        qFa: 'مغازه ارزون‌تر توی کوچه فرعی بهتره یا اجاره دوبرابر توی برِ خیابان اصلی؟',
        aEn: 'It depends on impulse vs. destination buying. Grab-and-go bakeries, pharmacies, and juice bars need visible footfall and suffer on hidden side streets. Clinics, specialty cafés with strong Instagram pull, salons, and delivery kitchens often earn far higher net profit one block off the main boulevard at half the rent.',
        aFa: 'بستگی به مدل خرید مشتری داره. اگه فروشتون به خرید آنی رهگذرا وابسته‌ست (مثل آبمیوه‌فروشی، نانوایی یا داروخانه)، کوچه پرت معمولاً به ضررتون می‌شه. اما برای کلینیک، کافه مقصدی با سوشال‌مدیای قوی، سالن زیبایی یا آشپزخانه ارسال غذا، ۵۰ متر داخل فرعی پررفت‌وآمد با نصف اجاره خیلی وقت‌ها سود خالص بیشتری می‌سازه.'
      },
      {
        qEn: 'How many candidate shops should I compare before signing?',
        qFa: 'قبل از بستن قرارداد چند تا مغازه رو باید با هم مقایسه کنم؟',
        aEn: 'Aim for 3 to 5 shortlisted units inside high-scoring blocks. Comparing fewer than three creates tunnel vision; visiting twenty without data wastes weeks and leaves you confused.',
        aFa: 'بهترین حالت ۳ تا ۵ گزینه غربال‌شده توی بلوک‌های با امتیاز بالاست. کمتر از ۳ گزینه باعث می‌شه عجولانه تصمیم بگیرید و بازدید از ۲۰ مغازه پراکنده بدون داده هم فقط خسته‌تون می‌کنه.'
      },
      {
        qEn: 'What does a high Jabio score guarantee—and what does it NOT cover?',
        qFa: 'امتیاز بالای جابیو دقیقاً چی رو نشون می‌ده و چه چیزهایی رو پوشش نمی‌ده؟',
        aEn: 'A high Jabio score proves strong real-world population, nearby demand attractors, transit access, and healthy competition balance. It does not include rent price, exact shop frontage, or landlord terms—always pair the score with our break-even formula and a field visit.',
        aFa: 'امتیاز بالای جابیو یعنی اون بلوک از نظر جمعیت، محرک‌های تقاضا، دسترسی و تعادل رقبا واقعاً پتانسیل بالایی داره؛ اما نرخ اجاره، وضعیت ظاهری ملک و شرایط مالک توش نیست. همیشه امتیاز جابیو رو با محاسبه نقطه سربه‌سر و بازدید میدانی تکمیل کنید.'
      }
    ]
  },

  {
    slug: 'rent-break-even-calculation',
    category: 'finance',
    date: '2026-11-15',
    dateFa: '۲۴ آبان ۱۴۰۵',
    readMins: 10,
    featured: false,
    title: {
      en: 'Shop Rent Break-Even Calculator: How Many Daily Buyers Cover Your Lease?',
      fa: 'محاسبه نقطه سربه‌سر اجاره مغازه: روزی چند تا مشتری باید بیاد تا ضرر نکنید؟'
    },
    excerpt: {
      en: 'Stop guessing whether a rent is "fair." Turn monthly rent, deposit (rahn) opportunity cost, and staff payroll into the exact daily customer count your street must deliver.',
      fa: 'به‌جای اینکه چشمی بگید «اجاره‌ش خوبه یا گرونه»، با یه حساب سرانگشتی دقیق ببینید با این رهن و اجاره، مغازه‌تون روزی چند تا فاکتور باید بزنه تا فقط سر‌به‌سر بشه!'
    },
    keyTakeaway: {
      en: 'Never calculate break-even on cash rent alone. Add 2.5%–3% monthly opportunity cost for your deposit (رهن) plus payroll and utilities—otherwise your real rent burden is hidden.',
      fa: 'تله بزرگ بازار ایران اینه که خیلی‌ها فقط اجاره ماهانه رو حساب می‌کنن و پول پیش (رهن) رو نادیده می‌گیرن! همیشه حدود ۲٫۵ تا ۳ درصدِ مبلغ رهن رو به‌عنوان هزینه ماهانه به اجاره اضافه کنید تا عدد واقعی دربیاد.'
    },
    cta: {
      en: 'Check spot break-even',
      fa: 'محاسبه روی نقشه',
      href: '/jabio.html?m=spot'
    },
    sections: [
      {
        id: 'hidden-rahn-cost',
        heading: {
          en: '1. The rahn (deposit) illusion: what your shop REALLY costs every month',
          fa: '۱. توهم پول پیش (رهن): اجاره واقعی مغازه شما چقدره؟'
        },
        paragraphs: {
          en: [
            'In Iran’s commercial real-estate market, a landlord might quote "1.5 billion Toman rahn + 35 million Toman monthly rent" and tell you "the rent is practically nothing!" Don’t fall for it. That 1.5 billion Toman sitting in the landlord’s account is capital you cannot invest in inventory, marketing, or even a risk-free return.',
            'Using the market’s standard 3% monthly conversion rate (30 million Toman per 1 billion Toman of deposit), 1.5 billion rahn equals 45 million Toman of real monthly occupancy cost. Add the 35 million cash rent, and your shop actually costs 80 million Toman a month before you even switch on the lights.'
          ],
          fa: [
            'توی بازار اجاره ایران خیلی وقت‌ها مالک یا مشاور املاک می‌گه: «اجاره‌ش چیزی نیست، ماهی ۳۵ تومنه با یک و نیم میلیارد رهن!» اما بیایید سر خودمون کلاه نذاریم؛ اون ۱٫۵ میلیارد تومنی که دست مالک می‌خوابه، سرمایه در گردش شماست که می‌تونست توی خرید جنس، تبلیغات یا حداقل سود بانکی کار کنه.',
            'با نرخ تبدیل عرف بازار (هر ۱ میلیارد رهن ≈ ۳۰ میلیون تومان اجاره ماهانه)، اون ۱٫۵ میلیارد رهن خودش ماهی ۴۵ میلیون تومان هزینه فرصت داره! وقتی با اجاره نقدی ۳۵ میلیونی جمعش می‌کنید، می‌بینید هزینه واقعی این مغازه ماهی ۸۰ میلیون تومنه—تازه قبل از اینکه برق و گاز و حقوق پرسنل رو حساب کنید.'
          ]
        }
      },
      {
        id: 'breakeven-formula',
        heading: {
          en: '2. One simple formula to find your daily customer target',
          fa: '۲. فرمول ساده و سرانگشتی برای پیدا کردن تعداد مشتری روزانه'
        },
        paragraphs: {
          en: [
            'Once you add up all monthly fixed costs (effective rent + utilities + mall/building charge + base staff payroll + software/accounting), plug them into one clean equation:',
            'Daily Break-Even Customers = Monthly Fixed Costs ÷ (Working Days × Average Receipt × Gross Margin %).'
          ],
          fa: [
            'حالا کل هزینه‌های ثابت ماهانه‌تون رو روی کاغذ جمع بزنید: اجاره واقعی (با احتساب هزینه فرصت رهن) + حقوق پایه پرسنل + آب و برق و گاز و اینترنت + شارژ مجتمع + هزینه‌های ثابت حسابداری و مالیات. بعد بزنیدش توی این فرمول ساده:',
            'تعداد مشتری روزانه برای سربه‌سر شدن = کل هزینه‌های ثابت ماهانه ÷ (تعداد روزهای کاری × میانگین هر فاکتور × درصد حاشیه سود ناخالص).'
          ]
        },
        tip: {
          labelEn: 'Don’t forget the 10–15% rent-to-revenue ceiling',
          labelFa: 'قانون طلایی نسبت اجاره به فروش',
          en: 'For healthy retail and cafés, total effective occupancy cost should stay between 8% and 14% of monthly revenue. Above 18%, you are working for the landlord.',
          fa: 'توی اکثر کسب‌وکارهای خرده‌فروشی و کافه، اگه اجاره واقعی بیشتر از ۱۰ تا ۱۵ درصد کل فروش ماهانه‌تون باشه، نفس کسب‌وکار می‌گیره. بالای ۱۸٪ یعنی عملاً دارید فقط برای صاحب‌ملک کار می‌کنید!'
        }
      },
      {
        id: 'real-toman-scenarios',
        heading: {
          en: '3. Three real Toman examples: Café vs. Supermarket vs. Clothing Boutique',
          fa: '۳. سه مثال واقعی تومانی: مقایسه کافه، سوپرمارکت و بوتیک پوشاک'
        },
        paragraphs: {
          en: [
            'Numbers speak louder than theory. Look at how the exact same 180 million Toman monthly fixed cost demands wildly different daily footfall depending on ticket size and gross margin:'
          ],
          fa: [
            'بیاید به‌جای تئوری، سه تا کسب‌وکار واقعی در ایران رو با هم مقایسه کنیم. ببینید چطور تفاوت حاشیه سود و میانگین فاکتور، تعداد مشتری روزانه لازم رو زمین تا آسمون عوض می‌کنه:'
          ]
        },
        table: {
          captionEn: 'Monthly fixed cost vs. daily customers required just to break even (28 working days)',
          captionFa: 'جدول مقایسه نقطه سربه‌سر روزانه برای ۳ صنف رایج (مبنا: ۲۸ روز کاری در ماه)',
          headersEn: ['Business scenario', 'Monthly fixed burn', 'Avg. ticket', 'Gross margin', 'Daily buyers needed'],
          headersFa: ['سناریوی کسب‌وکار', 'هزینه ثابت ماهانه', 'میانگین فاکتور', 'حاشیه سود ناخالص', 'مشتری روزانه (سربه‌سر)'],
          rowsEn: [
            ['Neighbourhood Café', '180M Toman', '280,000 Toman', '55%', '42 customers / day'],
            ['Local Supermarket', '160M Toman', '420,000 Toman', '18%', '76 customers / day'],
            ['Clothing Boutique', '220M Toman', '2,200,000 Toman', '42%', '9 customers / day'],
            ['Grab-and-go Bakery', '135M Toman', '160,000 Toman', '48%', '63 customers / day']
          ],
          rowsFa: [
            ['کافه محله‌ای', '۱۸۰ میلیون تومان', '۲۸۰ هزار تومان', '۵۵٪', '۴۲ مشتری در روز'],
            ['سوپرمارکت محلی', '۱۶۰ میلیون تومان', '۴۲۰ هزار تومان', '۱۸٪', '۷۶ مشتری در روز'],
            ['بوتیک پوشاک', '۲۲۰ میلیون تومان', '۲٫۲ میلیون تومان', '۴۲٪', '۹ مشتری در روز'],
            ['نانوایی فانتزی', '۱۳۵ میلیون تومان', '۱۶۰ هزار تومان', '۴۸٪', '۶۳ مشتری در روز']
          ]
        },
        internalLinks: [
          { en: 'Explore Café demand hotspots in Tehran', fa: 'محله‌های پرتقاضای کافه در تهران رو ببینید', href: '/cities/tehran/cafe' },
          { en: 'Explore Supermarket scores in Isfahan', fa: 'امتیاز محله‌های سوپرمارکت در اصفهان', href: '/cities/isfahan/grocery' }
        ]
      },
      {
        id: 'stress-test-worst-case',
        heading: {
          en: '4. Stress-test the lease with a gloomy month before signing',
          fa: '۴. قبل از امضا، سناریوی «ماه کساد» رو هم تست کنید'
        },
        paragraphs: {
          en: [
            'Never sign a lease that only works if every single day feels like Esfand (the pre-Nowruz shopping rush). Cut your expected sales by 25%, bump your costs by 15%, and make sure you keep at least 3 months of fixed burn in cash reserve for the slow ramp-up period.',
            'Then open Jabio on that exact coordinate: if you need 76 daily supermarket buyers, check whether 15,000+ residents live within 600 m and how many established groceries already split that catchment. If the math doesn’t hold on paper, walk away—there is always another shop.'
          ],
          fa: [
            'هیچ‌وقت روی فروشِ شب عید و اسفندماه برنامه‌ریزی نکنید! فروش پیش‌بینی‌شده‌تون رو ۲۵ درصد کم کنید، هزینه‌ها رو ۱۵ درصد بیشتر در نظر بگیرید و مطمئن بشید حداقل ۳ ماه هزینه ثابت رو به‌عنوان سرمایه در گردش کنار گذاشتید تا ماه‌های اول خاک‌خوری کم نیارید.',
            'در آخر هم همون نقطه رو توی جابیو باز کنید: اگه برای سوپرمارکت روزی ۷۶ مشتری لازم دارید، چک کنید ببینید توی شعاع ۶۰۰ متری حداقل ۱۵ هزار ساکن هست و چند تا سوپرمارکت قوی اونجا فعالن. اگه روی کاغذ نمی‌صرفه، اصلاً دلبسته ملک نشید؛ مغازه خوب همیشه پیدا می‌شه.'
          ]
        }
      }
    ],
    checklist: {
      titleEn: 'Rent & Break-Even Reality Check',
      titleFa: 'چک‌لیست مالی قبل از امضای اجاره‌نامه مغازه',
      subtitleEn: 'Run through these 6 financial checks before handing over your deposit cheque.',
      subtitleFa: 'قبل از تحویل چک پول پیش، این ۶ مورد مالی رو حتماً تیک بزنید.',
      items: [
        { id: 'r1', en: 'Added 2.5%–3% monthly opportunity cost of rahn (deposit) to cash rent', fa: 'هزینه فرصت ماهانه رهن (حدود ۳٪ در ماه) رو به اجاره نقدی اضافه کردم' },
        { id: 'r2', en: 'Included building charges, commercial utilities, payroll, and packaging', fa: 'شارژ ساختمان، قبوض تجاری، حقوق پرسنل و هزینه‌های جاری رو دقیق جمع زدم' },
        { id: 'r3', en: 'Calculated exact daily break-even customer count using realistic gross margin', fa: 'تعداد مشتری روزانه سربه‌سر رو با حاشیه سود واقعی (نه خوش‌بینانه) حساب کردم' },
        { id: 'r4', en: 'Checked that effective rent stays under 15% of realistic monthly revenue', fa: 'مطمئن شدم اجاره واقعی زیر ۱۵٪ فروش منطقی ماهانه می‌مونه' },
        { id: 'r5', en: 'Verified that surrounding residents & demand on Jabio can support that daily count', fa: 'توی جابیو چک کردم جمعیت و تقاضای محله واقعاً کشش این تعداد مشتری رو داره' },
        { id: 'r6', en: 'Set aside 3 months of fixed operating reserve beyond fit-out & deposit', fa: 'جدا از رهن و هزینه دکور، حداقل ۳ ماه هزینه ثابت رو برای خاک‌خوری کنار گذاشتم' }
      ]
    },
    faq: [
      {
        qEn: 'How do I convert rahn (deposit) to monthly rent in Iran?',
        qFa: 'نرخ تبدیل رهن به اجاره در بازار ملک تجاری چطور حساب می‌شه؟',
        aEn: 'In most Iranian cities, every 100 million Toman of deposit converts to roughly 2.5 to 3 million Toman of monthly rent. Even if you pay full rahn (رهن کامل), always include that monthly equivalent in your break-even calculation.',
        aFa: 'در عرف بازار ایران هر ۱۰۰ میلیون تومان رهن معمولاً معادل ۲٫۵ تا ۳ میلیون تومان اجاره ماهانه حساب می‌شه. حتی اگر مغازه رو رهن کامل می‌کنید، حتماً این معادل ماهانه رو توی محاسبه نقطه سربه‌سر بیارید تا سود واقعیتون اشتباه درنیاد.'
      },
      {
        qEn: 'Should fit-out and renovation costs be included in monthly break-even?',
        qFa: 'هزینه دکوراسیون و تجهیز مغازه رو هم باید توی نقطه سربه‌سر ماهانه آورد؟',
        aEn: 'Keep operational break-even separate from payback period. First verify that monthly revenue beats monthly operating costs; second, divide your total fit-out investment by expected monthly net profit to ensure you recover renovation money within 12–18 months.',
        aFa: 'بهتره این دو تا رو جدا حساب کنید: اول مطمئن بشید فروش ماهانه هزینه‌های جاری رو پوشش می‌ده (سربه‌سر عملیاتی)؛ دوم کل هزینه دکور و تجهیز رو تقسیم بر سود خالص ماهانه کنید تا مطمئن بشید نهایتاً ظرف ۱۲ تا ۱۸ ماه پول دکور برمی‌گرده.'
      },
      {
        qEn: 'What if the shop’s rent looks high, but the street is famous?',
        qFa: 'اگه اجاره مغازه بالاست ولی خیابون خیلی معروفیه، ارزشش رو داره؟',
        aEn: 'Only if the street’s footfall lets you charge higher prices or triple your daily volume without tripling staff. Run the break-even equation for both the famous boulevard and a nearby secondary street—often the second option leaves twice as much cash in your pocket.',
        aFa: 'فقط زمانی که معروفیت خیابون باعث بشه یا قیمت بالاتری بذارید یا تعداد فاکتور روزانه‌تون واقعاً ۲ تا ۳ برابر بشه. حتماً فرمول سربه‌سر رو هم برای خیابون معروف و هم برای فرعی پرتردد بغلش حساب کنید؛ خیلی وقت‌ها گزینه دوم سود خالص بیشتری تو جیبتون می‌ذاره.'
      }
    ]
  },

  {
    slug: 'foot-traffic-vs-visibility',
    category: 'field-guide',
    date: '2026-11-11',
    dateFa: '۲۰ آبان ۱۴۰۵',
    readMins: 9,
    featured: false,
    title: {
      en: 'Foot Traffic vs. Street Visibility vs. Car Access: What Actually Drives Sales?',
      fa: 'پاخور پیاده، دید از خیابون یا جای پارک؟ کدومش واقعاً مغازه‌تون رو پرفروش می‌کنه؟'
    },
    excerpt: {
      en: 'Fast cars make a boulevard look busy, yet convert terribly for impulse retail. Learn how to tell valuable walking traffic apart from useless pass-through traffic.',
      fa: 'ترافیک سنگین ماشین خیابون رو شلوغ نشون می‌ده، اما لزوماً پول تو دخل نمی‌آره! فرق پاخور پیاده، دید از بلوار اصلی و دسترسی خودرو رو دقیق بشناسید.'
    },
    keyTakeaway: {
      en: 'A driver passing at 50 km/h sees your sign for 1.5 seconds; a pedestrian walking at 4 km/h sees your window for 15 seconds. Match the street type to how customers buy from you.',
      fa: 'راننده‌ای که با سرعت ۵۰ کیلومتر رد می‌شه، تابلوتون رو فقط ۱٫۵ ثانیه می‌بینه؛ ولی عابر پیاده ۱۵ ثانیه ویترینتون رو نگاه می‌کنه. قبل از پرداخت اجاره برِ بلوار، ببینید مشتری شما پیاده‌ست یا سواره!'
    },
    cta: {
      en: 'Explore Tehran access',
      fa: 'مشاهده نقشه تهران',
      href: '/cities/tehran'
    },
    sections: [
      {
        id: 'three-access-signals',
        heading: {
          en: '1. Three totally different types of "busy" that people mix up',
          fa: '۱. سه نوع «شلوغی» کاملاً متفاوت که معمولاً با هم قاطی می‌شن'
        },
        paragraphs: {
          en: [
            'When someone says "Valiasr or Shariati has insane traffic," pause and ask: what kind? In retail site selection, three completely separate things hide behind the word "busy":',
            'First is slow pedestrian footfall (people strolling at 4 km/h who can stop, smell fresh bread, or glance into a window). Second is arterial car visibility (thousands of cars streaming past a wide boulevard with medians and zero curb parking). Third is arrival convenience (whether someone who ALREADY wants to visit you can park within 80 metres or step off a metro/BRT station).'
          ],
          fa: [
            'وقتی می‌شنوید «خیابون ولیعصر یا شریعتی ترددش فوق‌العاده‌ست»، سریع بپرسید: دقیقاً چه جور ترددی؟ توی علم مکان‌یابی، پشت کلمه «شلوغی» سه تا مفهوم کاملاً جدا قایم شده که اگه قاطی‌شون کنید اجاره اضافی می‌دید:',
            'اول، پاخور پیاده آروم (آدم‌هایی که با سرعت ۴ کیلومتر قدم می‌زنن، فرصت دارن ویترین رو ببینن و هوس خرید کنن). دوم، دیدِ سواره در بلوار اصلی (هزاران ماشینی که با سرعت رد می‌شن ولی نه راه دورزدن دارن نه جای پارک). سوم، سهولت رسیدن (مشتری که قصد اومدن پیش شما رو داره، راحت جای پارک یا ایستگاه مترو و BRT پیدا می‌کنه یا کلافه می‌شه و برمی‌گرده؟).'
          ]
        }
      },
      {
        id: 'street-matrix',
        heading: {
          en: '2. Which street type wins for your business? (Comparison Matrix)',
          fa: '۲. کدوم مدل خیابون به درد کسب‌وکار شما می‌خوره؟ (جدول مقایسه)'
        },
        paragraphs: {
          en: [
            'Paying main-boulevard rent for a business that actually needs easy parking is one of the fastest ways to bleed margin. Compare all three access signals side-by-side:'
          ],
          fa: [
            'خیلی از کسب‌وکارها بی‌خودی پولِ برِ بلوار پرترافیک رو می‌دن در حالی که مشتریشون فقط دنبال جای پارک راحته! توی این جدول دقیق ببینید کدوم شاخص برای کدوم صنف حیاتی‌تره:'
          ]
        },
        table: {
          captionEn: 'How pedestrian flow, car visibility, and parking impact different shop categories',
          captionFa: 'تاثیر پاخور پیاده، دید سواره و جای پارک روی فروش اصناف مختلف',
          headersEn: ['Access type', 'Best-fit businesses', 'Conversion speed', 'Hidden trap'],
          headersFa: ['نوع دسترسی', 'مناسب‌ترین اصناف', 'نرخ تبدیل به خرید', 'تله پنهان'],
          rowsEn: [
            ['Slow pedestrian sidewalk', 'Bakery, café, pharmacy, juice, clothing', 'Very high (impulse)', 'Commuter-rush sidewalks where nobody stops'],
            ['Fast arterial boulevard', 'Showrooms, banks, flagship brands', 'Low direct walk-in', 'High rent + median dividers block half of traffic'],
            ['Side street with easy parking', 'Clinics, gyms, bulk groceries, salons', 'High (planned visits)', 'Poor visibility without Google Maps / signage'],
            ['Metro / BRT interchange', 'Takeaway coffee, fast food, convenience', 'High during peak hrs', 'Dead evenings & Fridays if office-only']
          ],
          rowsFa: [
            ['پیاده‌روی پهن و آروم', 'نانوایی، کافه، داروخانه، آبمیوه، پوشاک', 'خیلی بالا (خرید آنی)', 'پیاده‌روهای عجولانه که عابر فقط رد می‌شه'],
            ['برِ بلوار پرترافیک', 'نمایشگاه، برندهای بزرگ، شعب بانکی', 'ورودی آنی پایین', 'اجاره سنگین + جدول وسط خیابون نصف تردد رو می‌بنده'],
            ['فرعی با جای پارک راحت', 'کلینیک، باشگاه، سوپرمارکت عمده، سالن', 'بالا (مراجعه با قصد)', 'بدون لوکیشن قوی در نشان/بلد دیده نمی‌شید'],
            ['کنار ایستگاه مترو / BRT', 'قهوه بیرون‌بر، فست‌فود، خرده‌فروشی سریع', 'عالی در ساعات اوج', 'اگه بافت فقط اداری باشه، شب‌ها و جمعه‌ها خلوته']
          ]
        }
      },
      {
        id: 'morning-vs-evening-side',
        heading: {
          en: '3. The "going to work" side vs. the "going home" side of the street',
          fa: '۳. راز سمتِ رفتِ صبح در برابر سمتِ برگشتِ عصر'
        },
        paragraphs: {
          en: [
            'Here is a detail experienced Iranian shopkeepers know by heart: on any major two-way avenue divided by a curb, guardrails, or a BRT lane, the two sides of the exact same street behave like two different neighbourhoods.',
            'People driving or walking toward offices in the morning want quick espresso, pastries, and newspapers—so the morning-commute side wins for grab-and-go breakfast concepts. On the way home between 17:30 and 21:00, people have time and bigger baskets: supermarkets, fruit shops, butcheries, and takeout restaurants consistently pull 30–50% higher sales on the homebound side.'
          ],
          fa: [
            'یه راز قدیمی بین کسبه باتجربه ایران هست که خیلیا بهش توجه نمی‌کنن: توی بلوارهای دوطرفه‌ای که وسطش جدول، نرده یا خط BRT داره، دو طرفِ همون یه خیابون عملاً دو تا بازار کاملاً متفاوتن!',
            'صبح‌ها آدم‌هایی که می‌رن سر کار، دنبال قهوه سریع، شیرینی صبحانه یا خرید کوچیکن؛ پس سمت «مسیر رفت» برای کافه بیرون‌بر و نانوایی صبحانه عالیه. اما عصرها از ساعت ۵:۳۰ تا ۹ شب که مردم دارن برمی‌گردن خونه، حوصله خرید دارن و سبد خریدشون سنگین‌تره؛ بنابراین سوپرمارکت، میوه‌فروشی، پروتئینی و غذای بیرون‌بر روی سمت «مسیر برگشت» معمولاً ۳۰ تا ۵۰ درصد فروش بالاتری می‌زنن.'
          ]
        },
        tip: {
          labelEn: 'Check the sunny vs. shady sidewalk too',
          labelFa: 'سمت آفتاب‌رو و سایه‌رو رو فراموش نکنید',
          en: 'In hot Iranian summers across Tehran, Isfahan, Shiraz, and Ahvaz, pedestrians overwhelmingly walk on the shaded side of the avenue from May to September—sometimes creating a 2× footfall gap across a 15-metre road.',
          fa: 'توی تابستون‌های گرم تهران، اصفهان، شیراز و مشهد، از اردیبهشت تا مهر بخش بزرگی از عابرا فقط از پیاده‌روی سایه‌گیر رد می‌شن. خیلی وقت‌ها دو طرف یه خیابون ۱۵ متری به همین دلیل ساده تا ۲ برابر اختلاف پاخور دارن!'
        },
        internalLinks: [
          { en: 'Explore Shiraz city coverage & streets', fa: 'تحلیل محله‌ها و دسترسی‌های شیراز رو ببینید', href: '/cities/shiraz' },
          { en: 'Check pharmacy spots in Mashhad', fa: 'بهترین محدوده‌های داروخانه در مشهد', href: '/cities/mashhad/pharmacy' }
        ]
      },
      {
        id: 'measure-15-min-footfall',
        heading: {
          en: '4. How to run a 15-minute street count like a pro',
          fa: '۴. چطور توی ۱۵ دقیقه پاخور واقعی خیابون رو مثل حرفه‌ای‌ها بشمارید؟'
        },
        paragraphs: {
          en: [
            'Stand 10 metres from the unit with a simple phone tally app. Don’t count every body—split your count into two buckets: "Hurried pass-through" (staring straight ahead, walking fast) vs. "Browsing shoppers" (carrying shopping bags, glancing at windows, walking in pairs). Even 60 browsing shoppers per 15 minutes will out-earn 250 hurried commuters every single day.'
          ],
          fa: [
            'ده متر اون‌ورتر از مغازه وایسید و با یه شمارنده ساده توی موبایل، ۱۵ دقیقه عابرا رو توی دو تا سبد جدا بشمارید: سبد اول «عابر عجول» (سرش تو گوشیه یا تند می‌ره سمت ایستگاه) و سبد دوم «عابر خریدار» (کیسه خرید دستشه، دو نفره قدم می‌زنن، ویترین‌ها رو نگاه می‌کنن). باور کنید ۶۰ تا عابر خریدار در ربع ساعت، خیلی بیشتر از ۲۵۰ تا عابر عجول براتون پول می‌سازه!'
          ]
        }
      }
    ],
    checklist: {
      titleEn: 'Street Access & Footfall Field Checklist',
      titleFa: 'چک‌لیست بررسی پاخور، دید و دسترسی مغازه',
      subtitleEn: 'Evaluate the exact micro-location right outside the shop door.',
      subtitleFa: 'این ۶ نکته ریز رو دقیقاً جلوی درِ مغازه کاندیدا بررسی و تیک بزنید.',
      items: [
        { id: 'f1', en: 'Measured 15-minute browsing pedestrian count (not just hurried commuters)', fa: 'تعداد عابران خریدار (نه صرفاً عابران عجول) رو به مدت ۱۵ دقیقه شمردم' },
        { id: 'f2', en: 'Verified whether the unit sits on the morning-commute or homebound side', fa: 'چک کردم مغازه سمت مسیر رفتِ صبحه یا سمت مسیر برگشتِ عصر' },
        { id: 'f3', en: 'Checked shade/sun exposure on the sidewalk during peak afternoon hours', fa: 'سایه‌گیر یا آفتاب‌گیر بودن پیاده‌رو رو در ساعات اوج عصر بررسی کردم' },
        { id: 'f4', en: 'Confirmed there is no tree trunk, kiosk, or bus shelter blocking the storefront sign', fa: 'مطمئن شدم دکه، درخت یا ایستگاه اتوبوس جلوی دید تابلو و ویترین رو نگرفته' },
        { id: 'f5', en: 'Tested real car parking availability within 100 m at 19:00', fa: 'ساعت ۷ عصر شخصاً چک کردم توی ۱۰۰ متری مغازه جای پارک پیدا می‌شه یا نه' },
        { id: 'f6', en: 'Measured walking distance to the nearest metro, BRT, or main bus stop', fa: 'فاصله پیاده تا نزدیک‌ترین ایستگاه مترو، BRT یا اتوبوس رو اندازه گرفتم' }
      ]
    },
    faq: [
      {
        qEn: 'Does a corner shop (دو نبش) always justify 30–40% higher rent?',
        qFa: 'آیا مغازه دو نبش همیشه ارزش ۳۰ تا ۴۰ درصد اجاره بیشتر رو داره؟',
        aEn: 'A corner unit doubles your window frontage and catches foot traffic from two streets, which is huge for cafés, bakeries, pharmacies, and flagship retail. For appointment-based services like clinics or salons, however, paying a 40% corner premium rarely pays back.',
        aFa: 'مغازه دو نبش دید ویترینتون رو دوبرابر می‌کنه و تردد دو تا خیابان رو می‌گیره؛ برای کافه، نانوایی فانتزی، داروخانه و پوشاک فوق‌العاده‌ست. اما برای کسب‌وکارهای نوبتی مثل کلینیک یا دفتر خدماتی، پرداخت ۴۰٪ اجاره اضافه بابت دو نبش معمولاً توجیه اقتصادی نداره.'
      },
      {
        qEn: 'Are stairs (2–3 steps up or down) really a dealbreaker for retail?',
        qFa: 'داشتن دو سه تا پله (بالا یا زیرزمین) واقعاً فروش مغازه رو کم می‌کنه؟',
        aEn: 'Yes—more than most beginners expect. Even 3 steps down into a semi-basement can cut impulse walk-in conversions by 25–40%, especially for parents with strollers and older shoppers. Only accept steps if the rent discount is steep and your business is destination-driven.',
        aFa: 'بله، خیلی بیشتر از چیزی که فکرش رو می‌کنید! حتی سه تا پله به سمت پایین می‌تونه ورودی آنی عابرا (به‌خصوص سالمندان و خانواده‌های با کالسکه) رو ۲۵ تا ۴۰ درصد کاهش بده. فقط وقتی پله رو قبول کنید که اجاره خیلی پایین‌تر باشه و مشتری با قصد قبلی پیشتون بیاد.'
      },
      {
        qEn: 'How does Jabio score street access across cities?',
        qFa: 'جابیو دسترسی خیابان‌ها رو توی شهرهای مختلف چطور امتیازدهی می‌کنه؟',
        aEn: 'Jabio scores every 250 m block using real road network density, main arterial proximity, local walkable streets, and mapped metro/BRT/bus transit stops—plus an experimental street-level foot-traffic layer in Tehran’s District 5.',
        aFa: 'جابیو برای هر بلوک ۲۵۰ متری، تراکم شبکه معابر، دسترسی به شریان‌های اصلی، خیابان‌های محلی پیاده‌رو و فاصله تا ایستگاه‌های مترو و اتوبوس رو محاسبه می‌کنه و در منطقه ۵ تهران لایه آزمایشی تردد پیاده هم اضافه شده.'
      }
    ]
  },

  {
    slug: 'common-commercial-lease-mistakes',
    category: 'finance',
    date: '2026-11-08',
    dateFa: '۱۷ آبان ۱۴۰۵',
    readMins: 12,
    featured: false,
    title: {
      en: '7 Expensive Commercial Lease Mistakes in Iran (And How to Dodge Every One)',
      fa: '۷ اشتباه مرگبار در اجاره مغازه در ایران که میلیون‌ها تومان روی دستتون می‌ذاره'
    },
    excerpt: {
      en: 'From thinking "no rivals" means easy money to forgetting year-two renewal caps, guild permits, and three-phase power—read this before signing any Iranian commercial lease.',
      fa: 'از ذوق‌کردن برای «نبود رقیب» گرفته تا فراموش‌کردن شرط تمدید سال دوم، استعلام اتحادیه و برق سه‌فاز؛ قبل از دست به قلم شدن این ۷ اشتباه رایج رو بخونید.'
    },
    keyTakeaway: {
      en: 'Zero rivals on a block is usually a red flag for dead demand, and signing without a year-two renewal clause lets a landlord capture the exact footfall you spent a year building.',
      fa: 'دو تا از گرون‌ترین اشتباهات کسبه ایرانی اینه: یا می‌رن جای بدون رقیب که اصلاً تقاضا نداره، یا مغازه رو با زحمت پاخوردار می‌کنن و سال دوم چون شرط تمدید ننوشتن، با اجاره نجومی مجبور به تخلیه می‌شن!'
    },
    cta: {
      en: 'Compare candidate shops',
      fa: 'مقایسه مغازه‌ها',
      href: '/compare.html'
    },
    sections: [
      {
        id: 'location-blind-spots',
        heading: {
          en: 'Mistakes 1–3: Location traps that drain your cash in the first 90 days',
          fa: 'اشتباهات ۱ تا ۳: تله‌های مکانی که توی ۹۰ روز اول نقدینگی رو می‌بلعن'
        },
        paragraphs: {
          en: [
            'Most beginners think bad leases only happen in the paperwork. Half the damage actually happens before anyone drafts a contract:'
          ],
          fa: [
            'خیلی‌ها فکر می‌کنن اشتباهات اجاره فقط توی متن قولنامه‌ست، در حالی که نصف ضررهای سنگین دقیقاً همون موقعی اتفاق می‌افته که داریم مغازه رو انتخاب می‌کنیم:'
          ]
        },
        bullets: {
          en: [
            'Mistake 1 — Celebrating "zero competition": If there isn’t a single café, bakery, or boutique within 1 km, ask why. Usually the street lacks demand. That’s why Jabio automatically filters out blocks whose demand score sits below 40.',
            'Mistake 2 — Falling for a single Friday-night visit: A street that looks electric at 20:00 on Thursday can be completely deserted from 09:00 to 16:00 all week.',
            'Mistake 3 — Skipping the "graveyard check": Never lease a unit without asking the barber or grocer next door how many tenants opened and closed in that exact shop over the last 3 years. High turnover in one specific storefront is almost always a structural curse.'
          ],
          fa: [
            'اشتباه ۱ — ذوق‌کردن از «نبود رقیب»: اگه تو شعاع ۱ کیلومتری هیچ کافه یا مغازه مشابهی نیست، به‌جای خوشحالی شک کنید! احتمالاً اونجا تقاضا نداره. دقیقاً به همین خاطر جابیو بلوک‌های با شاخص تقاضای زیر ۴۰ رو اصلاً پیشنهاد نمی‌ده.',
            'اشتباه ۲ — تصمیم‌گیری با یک بازدید پنج‌شنبه‌شب: خیلی از خیابون‌ها شب‌های آخر هفته قشنگ و شلوغن، ولی از شنبه تا چهارشنبه ۹ صبح تا ۴ عصر پرنده پر نمی‌زنه!',
            'اشتباه ۳ — نپرسیدن از سابقه مستاجرهای قبلی: حتماً از مغازه‌دار کناری بپرسید تو ۳ سال گذشته چند نفر تو همین مغازه اومدن و جمع کردن رفتن. اگه یه مغازه هی مستاجر عوض کرده، معمولاً یه ایراد پنهان جدی داره.'
          ]
        }
      },
      {
        id: 'legal-utility-traps',
        heading: {
          en: 'Mistakes 4–7: Contract clauses, permits, and utility nightmares',
          fa: 'اشتباهات ۴ تا ۷: تله‌های قرارداد، مجوز اتحادیه و انشعابات'
        },
        paragraphs: {
          en: [
            'Once you find a winning block, protect your renovation money with four non-negotiable legal and technical checks:'
          ],
          fa: [
            'حالا فرض کنیم بهترین بلوک شهر رو پیدا کردید؛ اگه این چهار تا نکته حقوقی و فنی رو قبل از امضا چک نکنید، کل پول دکور و زحمتتون روی هوا می‌ره:'
          ]
        },
        bullets: {
          en: [
            'Mistake 4 — Signing before checking guild (اتحادیه) & municipal rules: Restaurant hood/ventilation ducts, medical clinic zoning, pharmacy distance rules, and outdoor signage permissions can halt your opening for months if checked too late.',
            'Mistake 5 — No year-two renewal cap: Imagine spending 800 million Toman on interior build-out, making the corner famous in 10 months, and having the landlord demand a 100% hike at renewal. Always write a clear renewal cap (e.g., official inflation index or fixed % cap) into the contract.',
            'Mistake 6 — Paying rent during renovation: Negotiate 30 to 45 days of rent-free fit-out time (تنفس اجاره) from the handover date so you aren’t burning rent while tilers and electricians are still inside.',
            'Mistake 7 — Assuming utilities are ready: Verify 3-phase electricity (برق سه‌فاز) for espresso machines/ovens, commercial gas pressure, dedicated water/sewage drain, and whether the previous tenant left unpaid utility or municipal tax arrears.'
          ],
          fa: [
            'اشتباه ۴ — امضا قبل از استعلام اتحادیه و شهرداری: برای دودکش و تهویه رستوران، فاصله قانونی داروخانه، مجوز کلینیک یا حتی ابعاد تابلو، قبل از امضا حتماً استعلام بگیرید؛ وگرنه بعد از دکور پلمب یا معطل می‌شید.',
            'اشتباه ۵ — ننوشتن شرط تمدید سال دوم: فرض کنید ۸۰۰ میلیون خرج دکور کردید و مغازه رو جا انداختید؛ سال بعد مالک می‌بینه فروشتون خوبه و اجاره رو دوبرابر می‌کنه! حتماً بند تمدید برای سال دوم و سوم با سقف افزایش مشخص (مثلاً نرخ تورم رسمی یا درصد توافقی) تو قرارداد بیارید.',
            'اشتباه ۶ — نگرفتن تنفس اجاره برای دکوراسیون: حتماً ۳۰ تا ۴۵ روز زمان تنفس بدون اجاره برای بازسازی و تجهیز مذاکره کنید تا موقعی که بنا و برق‌کار تو مغازه‌ان، اجاره نندازید.',
            'اشتباه ۷ — چک‌نکردن برق سه‌فاز و بدهی قبلی‌ها: برای دستگاه اسپرسو، فر فست‌فود یا یخچال‌های صنعتی برق سه‌فاز و فشار گاز حیاتی‌ست. همچنین حتماً تسویه قبوض و عوارض پسماند و کسب‌وپیشه مستاجر قبلی رو مکتوب بگیرید.'
          ]
        }
      },
      {
        id: 'clause-comparison-table',
        heading: {
          en: 'Contract Negotiation Cheatsheet: Weak Lease vs. Smart Lease',
          fa: 'جدول مقایسه: قرارداد آماتوری در برابر قرارداد حرفه‌ای و مطمئن'
        },
        paragraphs: {
          en: [
            'Take this table with you to the real-estate office so nothing slips through during negotiation:'
          ],
          fa: [
            'این جدول رو موقع رفتن به بنگاه املاک روی گوشی باز نگه دارید تا هیچ بند مهمی از قلم نیفته:'
          ]
        },
        table: {
          captionEn: 'Key commercial lease terms to negotiate before signing in Iran',
          captionFa: 'مقایسه بندهای کلیدی اجاره‌نامه تجاری در بنگاه املاک',
          headersEn: ['Contract clause', 'Risky rookie mistake', 'Smart protective clause'],
          headersFa: ['بند قرارداد', 'اشتباه رایج و پرریسک', 'بند حرفه‌ای و محافظ سرمایه'],
          rowsEn: [
            ['Fit-out period', 'Rent starts on signing day', '30–45 days rent-free renovation window'],
            ['Year-2 renewal', 'Verbal promise ("we’ll work it out")', 'Written option to renew with clear % cap'],
            ['Permit contingency', 'Binding even if licence is denied', 'Cancellation right if guild/zoning blocks trade'],
            ['Utility & tax debts', 'Not mentioned in handover note', 'Landlord guarantees zero prior utility/municipal debt'],
            ['Sublease / Transfer', 'Strictly forbidden without exception', 'Right to transfer decor/lease with landlord consent']
          ],
          rowsFa: [
            ['زمان تجهیز و دکور', 'شروع اجاره دقیقاً از روز قرارداد', '۳۰ تا ۴۵ روز تنفس اجاره برای بازسازی'],
            ['تمدید سال دوم', 'قول شفاهی مالک («کنار میایم»)', 'حق تمدید مکتوب برای ۲ سال با سقف افزایش مشخص'],
            ['شرط مجوز صنفی', 'قطعی بودن قرارداد حتی در صورت عدم مجوز', 'حق فسخ یا استرداد ودیعه در صورت منع قانونی کاربری ملک'],
            ['بدهی قبلی‌ها', 'سکوت در متن صورت‌جلسه تحویل', 'تعهد مکتوب مالک بر تسویه تمام قبوض و عوارض پیشین'],
            ['واگذاری دکور', 'ممنوعیت مطلق بدون هیچ انعطافی', 'امکان واگذاری سرقفلی دکور/اجاره با هماهنگی مالک']
          ]
        },
        internalLinks: [
          { en: 'Calculate your exact rent break-even first', fa: 'اول نقطه سربه‌سر اجاره رو دقیق حساب کنید', href: '/blog/rent-break-even-calculation' },
          { en: 'Read Jabio’s step-by-step shop scouting guide', fa: 'راهنمای گام‌به‌گام انتخاب مغازه رو بخونید', href: '/blog/how-to-choose-shop-location' }
        ]
      }
    ],
    checklist: {
      titleEn: 'Commercial Lease Signing & Inspection Checklist',
      titleFa: 'چک‌لیست فنی و حقوقی قبل از امضای اجاره‌نامه تجاری',
      subtitleEn: 'Check every technical & legal item inside the unit and at the real-estate office.',
      subtitleFa: 'این ۷ مورد رو داخل خود مغازه و پای میز قرارداد تیک بزنید.',
      items: [
        { id: 'm1', en: 'Verified commercial zoning (کاربری تجاری) & guild permit eligibility', fa: 'تجاری بودن سند و مجاز بودن صنفم در این ملک رو استعلام گرفتم' },
        { id: 'm2', en: 'Asked neighbours about previous tenant turnover in this exact shop', fa: 'از همسایه‌ها درباره سابقه مستاجرهای قبلی این مغازه پرس‌وجو کردم' },
        { id: 'm3', en: 'Tested electrical panel (amperage / 3-phase), gas pressure, and drainage', fa: 'تابلو برق (آمپر و سه‌فاز)، فشار گاز، آب و کف‌شور فاضلاب رو تست کردم' },
        { id: 'm4', en: 'Negotiated 30–45 days of rent-free fit-out period in writing', fa: '۳۰ تا ۴۵ روز تنفس اجاره برای دکوراسیون رو مکتوب توی قرارداد آوردم' },
        { id: 'm5', en: 'Added a written year-two renewal cap clause to protect decor investment', fa: 'بند تمدید سال دوم با سقف افزایش مشخص رو توی قرارداد ثبت کردم' },
        { id: 'm6', en: 'Photographed all walls, shutters, and meter readings at handover', fa: 'از تمام دیوارها، کرکره و رقم کنتورهای آب و برق و گاز عکس گرفتم' },
        { id: 'm7', en: 'Confirmed zero unpaid utility bills or municipal business taxes from prior tenants', fa: 'تسویه کامل قبوض و عوارض شهرداری دوره‌های قبل رو مکتوب گرفتم' }
      ]
    },
    faq: [
      {
        qEn: 'What if the landlord refuses to write a year-two renewal cap?',
        qFa: 'اگه مالک زیر بار نوشتن شرط تمدید سال دوم نرفت چی کار کنیم؟',
        aEn: 'If your business requires heavy interior build-out (like a café, restaurant, or salon), refusing any renewal predictability is a major red flag. Either negotiate a 2-year lease from day one or keep your renovation modular and portable so you don’t leave hundreds of millions cemented into someone else’s walls.',
        aFa: 'اگه کارتون دکور سنگین داره (مثل کافه، رستوران یا سالن زیبایی)، زیر بار نرفتن مالک یه زنگ خطر جدیه! یا از روز اول قرارداد ۲ ساله ببندید، یا دکور رو طوری مدولار و قابل جابه‌جایی بسازید که مجبور نشید صدها میلیون تومان رو توی دیوار مالک جا بذارید.'
      },
      {
        qEn: 'Is "commercial-status residential" (موقعیت اداری/تجاری) safe for retail?',
        qFa: 'اجاره ملک با «موقعیت تجاری» به‌جای «سند تجاری» ریسک داره؟',
        aEn: 'For walk-in retail and food businesses, operating without proper commercial status exposes you to municipal fines, shuttering orders, and denial of guild licences. Always confirm the exact permissible trade with your local union (اتحادیه) before paying.',
        aFa: 'برای مغازه‌های پاخور و اصناف غذایی، فعالیت در ملک بدون کاربری تجاری واقعی ریسک جریمه کمیسیون ماده ۱۰۰، پلمب و نگرفتن جواز کسب داره. حتماً قبل از پرداخت پول از اتحادیه مربوطه استعلام دقیق بگیرید.'
      },
      {
        qEn: 'How much rent-free renovation time is normal to ask for?',
        qFa: 'چند روز تنفس اجاره برای دکوراسیون تو بازار ایران عرفه؟',
        aEn: 'For a ready-to-paint retail shop, 15 to 20 days is standard. For cafés, restaurants, or units needing plumbing, tiling, and electrical rewiring, 30 to 45 days is completely normal and expected by commercial landlords.',
        aFa: 'برای یه مغازه آماده که فقط نقاشی و قفسه‌بندی می‌خواد ۱۵ تا ۲۰ روز عرفه؛ اما برای کافه، رستوران یا مغازه‌هایی که لوله‌کشی، برق‌کشی و سرامیک می‌خوان، ۳۰ تا ۴۵ روز تنفس کاملاً طبیعی و قابل مذاکره‌ست.'
      }
    ]
  },

  {
    slug: 'tehran-commercial-districts-guide',
    category: 'cities',
    date: '2026-11-05',
    dateFa: '۱۴ آبان ۱۴۰۵',
    readMins: 11,
    featured: false,
    title: {
      en: 'Tehran Commercial Districts Guide: Where Each Business Actually Thrives',
      fa: 'تحلیل مناطق ۲۲گانه تهران برای مغازه‌داری: هر کسب‌وکاری کجای تهران جواب می‌ده؟'
    },
    excerpt: {
      en: 'Tehran isn’t one market—it’s five distinct urban economies. See what Jabio’s 50,600+ mapped Tehran places reveal about Central office corridors, West Tehran family hubs, and Northern high-ticket strips.',
      fa: 'تهران یه بازار یکدست نیست؛ پنج تا اقتصاد شهری کاملاً متفاوته! از داده‌های بیش از ۵۰ هزار مکان ثبت‌شده تهران ببینید هر صنفی توی مرکز، غرب، شرق یا شمال تهران چه عملکردی داره.'
    },
    keyTakeaway: {
      en: 'Central Tehran (Districts 6 & 7) booms on weekday office lunch and coffee; West Tehran (Districts 2 & 5) delivers steady 7-day family retail; North Tehran (Districts 1 & 3) rewards premium high-ticket concepts.',
      fa: 'مرکز تهران (مناطق ۶ و ۷) بهشت فروشِ روزانه و اداریه؛ غرب تهران (مناطق ۲ و ۵) تقاضای هفت‌روزه و خانوادگی پایدار می‌سازه؛ و شمال تهران (مناطق ۱ و ۳) برای برندهای با حاشیه سود و سبد خرید بالا جواب می‌ده.'
    },
    cta: {
      en: 'Open Tehran city hub',
      fa: 'تحلیل مناطق تهران',
      href: '/cities/tehran'
    },
    sections: [
      {
        id: 'tehran-not-one-city',
        heading: {
          en: '1. Stop treating Tehran as one market: five commercial personalities',
          fa: '۱. تهران یه بازار نیست؛ ۵ تا شخصیت تجاری کاملاً متفاوت داره!'
        },
        paragraphs: {
          en: [
            'In Jabio’s Tehran dataset—covering over 50,600 mapped places and 520,000+ building footprints—one pattern jumps off the map immediately: a business model that crushes it in Poonak can starve to death in Karimkhan, and vice versa.',
            'Why? Because Tehran’s rhythm flips sharply by district. Central office corridors peak violently from 08:30 to 17:00 Saturday through Wednesday, then go quiet on Friday afternoons. Meanwhile, dense residential-commercial hubs in West and East Tehran stay alive from morning groceries all the way to 23:00 family dinners.'
          ],
          fa: [
            'وقتی توی داده‌های تهران جابیو (بیش از ۵۰٬۶۰۰ مکان ثبت‌شده و ۵۲۰ هزار ساختمان) نگاه می‌کنیم، یه واقعیت خیلی واضح به چشم می‌خوره: مدلی که توی پونک یا نارمک می‌ترکونه، ممکنه توی کریم‌خان یا مطهری ضرر بده—و برعکس!',
            'چرا؟ چون ضرب‌آهنگ زندگی توی مناطق تهران فرق داره. کریدورهای اداری مرکز شهر از شنبه تا چهارشنبه ساعت ۸:۳۰ صبح تا ۵ عصر غلغله‌ست، اما پنج‌شنبه‌عصر و جمعه سوت‌وکور می‌شه. در عوض محله‌های پرتراکم غرب و شرق تهران هفت روز هفته از خرید صبحگاهی تا شام ساعت ۱۱ شب زنده‌ان.'
          ]
        }
      },
      {
        id: 'tehran-districts-table',
        heading: {
          en: '2. Tehran Commercial Zones Compared (Real Data Breakdown)',
          fa: '۲. جدول مقایسه قطب‌های تجاری تهران (کدوم منطقه برای کی خوبه؟)'
        },
        paragraphs: {
          en: [
            'Use this zone-by-zone matrix to match your target buyer, operating hours, and rent budget to the right part of Tehran:'
          ],
          fa: [
            'این جدول مقایسه بهتون کمک می‌کنه بر اساس ساعت کاری، بودجه اجاره و تیپ مشتری، دقیقاً برید سراغ بخش درستِ تهران:'
          ]
        },
        table: {
          captionEn: 'Comparison of Tehran’s five main commercial zones across demand rhythm, top categories, and rent tier',
          captionFa: 'مقایسه پنج قطب اصلی کسب‌وکار در تهران بر اساس ریتم تقاضا، اصناف برنده و سطح اجاره',
          headersEn: ['Tehran zone', 'Key neighbourhoods', 'Peak rhythm', 'Winning categories', 'Rent tier'],
          headersFa: ['پهنه تهران', 'محله‌های شاخص', 'ساعات اوج فروش', 'اصناف برنده', 'سطح اجاره'],
          rowsEn: [
            ['Central Core (D6, D7, D11)', 'Valiasr, Karimkhan, Motahhari, Enghelab', 'Sat–Wed 08:30–18:00', 'Lunch restaurants, cafés, clinics, print/B2B', 'High (main) / Mid (side)'],
            ['West Hubs (D2, D5)', 'Sadeghiyeh, Poonak, Saadat Abad, Sattarkhan', '7 days · strong evenings', 'Supermarkets, pharmacies, gyms, family dining', 'High-Mid'],
            ['North Premium (D1, D3)', 'Tajrish, Fereshteh, Jordan, Pasdaran', 'Afternoons & weekends', 'Specialty cafés, luxury boutiques, aesthetic clinics', 'Very High'],
            ['East Dense (D4, D8)', 'Narmak, Tehranpars, Resalat', '7 days · steady local flow', 'Groceries, bakeries, clothing strips, pharmacies', 'Mid'],
            ['South-Central (D10, D12, D15)', 'Salsabil, Bazaar fringes, Piroozi', 'High daytime volume', 'High-turnover retail, pharmacies, fast food', 'Mid-Low']
          ],
          rowsFa: [
            ['مرکز شهر (مناطق ۶، ۷، ۱۱)', 'ولیعصر، کریم‌خان، مطهری، انقلاب', 'شنبه تا چهارشنبه ۸:۳۰ تا ۱۸', 'رستوران ناهاری، کافه، کلینیک، خدمات اداری', 'بالا (اصلی) / متوسط (فرعی)'],
            ['قطب غرب (مناطق ۲ و ۵)', 'صادقیه، پونک، سعادت‌آباد، ستارخان', '۷ روز هفته · عصرهای پررونق', 'سوپرمارکت، داروخانه، باشگاه، رستوران خانوادگی', 'متوسط رو به بالا'],
            ['شمال تهران (مناطق ۱ و ۳)', 'تجریش، فرشته، جردن، پاسداران', 'عصرها و آخر هفته‌ها', 'کافه تخصصی، بوتیک برند، کلینیک زیبایی', 'خیلی بالا'],
            ['شرق پرتراکم (مناطق ۴ و ۸)', 'نارمک، تهرانپارس، رسالت', '۷ روز هفته · مشتری محلی پایدار', 'خرده‌فروشی روزمره، پوشاک، نانوایی، داروخانه', 'متوسط'],
            ['مرکز-جنوب (مناطق ۱۰، ۱۲، ۱۵)', 'سلسبیل، پیروزی، حاشیه بازار', 'حجم بالای خرید روزانه', 'فروش پرتیراژ، داروخانه، فست‌فود اقتصادی', 'متوسط رو به پایین']
          ]
        },
        internalLinks: [
          { en: 'Best Restaurant areas in Tehran', fa: 'بهترین محله‌های رستوران در تهران', href: '/cities/tehran/restaurant' },
          { en: 'Best Pharmacy spots in Tehran', fa: 'مکان‌یابی داروخانه در تهران', href: '/cities/tehran/pharmacy' },
          { en: 'Best Clothing & Fashion strips in Tehran', fa: 'راسته‌های برتر پوشاک در تهران', href: '/cities/tehran/fashion' }
        ]
      },
      {
        id: 'tehran-extra-layers',
        heading: {
          en: '3. Two extra data layers Jabio unlocks specifically in Tehran',
          fa: '۳. دو تا لایه ویژه که جابیو مخصوص تهران براتون باز می‌کنه'
        },
        paragraphs: {
          en: [
            'Because purchasing power shifts dramatically from south to north in Tehran, Jabio adds a smoothed elevation-based affluence proxy when you select concept pricing tiers (budget, mid-range, premium). That stops you from pitching a 350,000-Toman pour-over coffee in a price-sensitive block—or underpricing in a premium northern pocket.',
            'On top of that, Tehran’s District 5 includes our experimental street-level pedestrian flow layer covering neighbourhoods from Poonak and Jannat Abad to Bagh-e-Feyz and Shahran—helping you compare side streets before you even get in the car.'
          ],
          fa: [
            'چون قدرت خرید توی تهران از جنوب به شمال تفاوت چشمگیری داره، جابیو برای تهران لایه «شاخص رفاه هموارشده» رو اضافه کرده تا وقتی سطح قیمتی کسب‌وکارتون (اقتصادی، میان‌رده یا لوکس) رو انتخاب می‌کنید، محله‌هایی پیشنهاد بشن که واقعاً با قیمت منوی شما هم‌خونی دارن.',
            'علاوه بر این، توی منطقه ۵ تهران (از پونک و جنت‌آباد تا باغ‌فیض و شهران) لایه آزمایشی تردد پیاده در سطح خیابان فعال شده تا حتی قبل از اینکه استارت ماشین رو بزنید، بتونید خیابان‌های فرعی رو دقیق با هم مقایسه کنید.'
          ]
        },
        tip: {
          labelEn: 'The two-block Tehran rule',
          labelFa: 'قانون «دو بلوک فاصله» در تهران',
          en: 'In Tehran, moving just 300 metres can flip a street from lively retail into quiet residential apartments. Always zoom in to the exact 250 m block rather than judging an entire district by name.',
          fa: 'توی تهران فقط ۳۰۰ متر جابه‌جایی کافیه تا از یه راسته تجاری زنده برید وسط یه کوچه کاملاً مسکونی و خلوت! هیچ‌وقت فقط به اسم منطقه (مثلاً «پونک» یا «یوسف‌آباد») اکتفا نکنید؛ همیشه روی بلوک ۲۵۰ متری دقیق زوم کنید.'
        }
      }
    ],
    checklist: {
      titleEn: 'Tehran District & Micro-Pocket Scouting Checklist',
      titleFa: 'چک‌لیست انتخاب محله و بلوک در تهران',
      subtitleEn: 'Validate your Tehran district choice before touring units.',
      subtitleFa: 'قبل از گشتن دنبال مغازه در تهران، این ۶ مرحله رو تیک بزنید.',
      items: [
        { id: 't1', en: 'Matched my operating hours (weekday lunch vs. 7-day evening) to the right zone', fa: 'ساعت اوج فروشم (اداریِ ظهر یا خانوادگیِ شب) رو با پهنه درست تهران هماهنگ کردم' },
        { id: 't2', en: 'Aligned my menu/product price tier with the block’s purchasing power', fa: 'سطح قیمتی کالا یا منو رو با توان خرید محله انتخابی تطبیق دادم' },
        { id: 't3', en: 'Checked nearest Tehran Metro or BRT station walking distance', fa: 'فاصله پیاده تا نزدیک‌ترین ایستگاه مترو یا خط BRT رو بررسی کردم' },
        { id: 't4', en: 'Verified odd-even / traffic restriction zone (طرح ترافیک) impact on staff & buyers', fa: 'تاثیر محدوده طرح ترافیک و کنترل آلودگی هوا روی مشتری و ارسال پیک رو سنجیدم' },
        { id: 't5', en: 'Checked 250 m block scores on Jabio rather than relying on district reputation', fa: 'به‌جای تکیه به اسم محله، امتیاز بلوک ۲۵۰ متری دقیق رو توی جابیو دیدم' },
        { id: 't6', en: 'Compared rents across 2 neighbouring Tehran districts before committing', fa: 'اجاره رو حداقل بین ۲ محله هم‌تراز تهران مقایسه کردم تا بهترین نسبت سود به اجاره دربیاد' }
      ]
    },
    faq: [
      {
        qEn: 'Which Tehran districts have the steadiest 7-day demand for everyday businesses?',
        qFa: 'کدوم مناطق تهران برای کسب‌وکارهای روزمره فروش ۷روزه و پایدارتری دارن؟',
        aEn: 'Dense residential-commercial hubs in Districts 2, 5 (Sadeghiyeh, Poonak, Saadat Abad, Sattarkhan) and Districts 4, 8 (Narmak, Tehranpars) consistently combine strong household density with active evening retail—making them ideal for supermarkets, pharmacies, clinics, bakeries, and gyms.',
        aFa: 'قطب‌های مسکونی-تجاری پرتراکم مثل مناطق ۲ و ۵ (صادقیه، پونک، سعادت‌آباد، ستارخان) و مناطق ۴ و ۸ (نارمک و تهرانپارس) چون هم جمعیت ساکن بالایی دارن و هم بافت تجاری عصرگاهی زنده، برای سوپرمارکت، داروخانه، کلینیک، نانوایی و باشگاه فروش هفت‌روزه خیلی پایداری می‌سازن.'
      },
      {
        qEn: 'Does Tehran’s Traffic Restriction Zone (طرح ترافیک) hurt retail shops?',
        qFa: 'قرار گرفتن مغازه داخل محدوده طرح ترافیک تهران به فروش ضربه می‌زنه؟',
        aEn: 'For car-dependent destination businesses (furniture, bulk shopping, clinics without metro access), yes—weekday daytime car visits drop sharply. For metro-served cafés, lunch spots, and office services in Districts 6, 7, and 11, pedestrian and metro commuters easily compensate.',
        aFa: 'برای کسب‌وکارهایی که مشتری با ماشین شخصی میاد (مثل نمایشگاه، خرید عمده یا کلینیک دور از مترو) بله، تردد روزانه رو سخت می‌کنه. اما برای کافه، رستوران ناهاری و خدمات کنار مترو توی مناطق ۶، ۷ و ۱۱، تردد بالای پیاده و مترو کاملاً جبرانش می‌کنه.'
      },
      {
        qEn: 'Are other Iranian cities besides Tehran also scored on Jabio?',
        qFa: 'آیا غیر از تهران، شهرهای دیگه ایران هم توی جابیو تحلیل شدن؟',
        aEn: 'Yes—Jabio scores 15 major Iranian cities on the exact same 250 m spatial grid, including Mashhad, Isfahan, Shiraz, Tabriz, Karaj, Qom, Ahvaz, Rasht, Kermanshah, Yazd, and more.',
        aFa: 'بله! ۱۵ کلان‌شهر ایران شامل مشهد، اصفهان، شیراز، تبریز، کرج، قم، اهواز، رشت، کرمانشاه، یزد و بقیه با همین شبکه ۲۵۰ متری در جابیو امتیازدهی شدن و هر شهر صفحه اختصاصی خودش رو داره.'
      }
    ]
  },

  {
    slug: 'opening-cafe-or-restaurant-guide',
    category: 'strategy',
    date: '2026-11-02',
    dateFa: '۱۱ آبان ۱۴۰۵',
    readMins: 10,
    featured: false,
    title: {
      en: 'Café & Restaurant Site Selection: Open Next to Rivals or Hunt a Quiet Gap?',
      fa: 'مکان‌یابی کافه و رستوران: بغل دست رقبا باز کنیم یا بریم یه محله بی‌رقیب؟'
    },
    excerpt: {
      en: 'Why being the 4th great café on a famous street often beats being the only café on a quiet block—and the exact scenarios where an under-served gap makes far more net profit.',
      fa: 'چرا خیلی وقت‌ها چهارمین کافه خوبِ یه خیابون معروف خیلی بیشتر از تنها کافه یه محله خلوت می‌فروشه؟ و دقیقاً چه موقع باید برید سراغ محله کم‌رقیب؟'
    },
    keyTakeaway: {
      en: 'Destination dine-in cafés and restaurants thrive inside proven food clusters; takeaway coffee bars, local bakeries, and delivery kitchens earn higher net profit in high-demand, moderate-rival gaps.',
      fa: 'اگه کافه یا رستورانتون «مقصدی و تجربه‌محوره»، حضور کنار رقبا مشتری آماده میاره؛ اما اگه مدل کارتون قهوه بیرون‌بر، قنادی محلی یا آشپزخانه ارسال غذاست، توی یه محله پرتقاضا و کم‌رقیب با نصف اجاره سود خیلی بهتری می‌برید.'
    },
    cta: {
      en: 'Top Tehran café areas',
      fa: 'بهترین مناطق کافه',
      href: '/cities/tehran/cafe'
    },
    sections: [
      {
        id: 'why-clusters-win',
        heading: {
          en: '1. Why good cafés love crowding onto the exact same street',
          fa: '۱. چرا کافه‌های موفق معمولاً همگی توی یه خیابون جمع می‌شن؟'
        },
        paragraphs: {
          en: [
            'Think about how you and your friends decide where to go on a Thursday evening. Do you say "let’s drive 30 minutes to that one isolated street with a single café we’ve never heard of"? Almost never. You pick a lively street—like Karimkhan, Tajrish, Shariati, Chaharbagh in Isfahan, or Ma’ali Abad in Shiraz—because even if one place is full, three other great spots are 50 metres away.',
            'Economists call this "agglomeration." Being the fourth strong café on an established dining street gives you free pre-qualified customers walking right past your glass door every evening—provided your coffee, menu, or vibe gives them one clear reason to step inside.'
          ],
          fa: [
            'یه لحظه رفتار خودمون رو پنج‌شنبه‌عصر تصور کنید: وقتی با دوستانتون می‌خواید برید کافه یا شام، می‌گید «بیاید بریم اون کوچه خلوت که فقط یه دونه کافه ناشناس داره»؟ تقریباً هیچ‌وقت! می‌رید خیابون‌هایی مثل کریم‌خان، یوسف‌آباد، چهارباغ اصفهان یا معالی‌آباد شیراز، چون مطمئنید اگه یکی شلوغ بود، ۵۰ متر اون‌ورتر سه تا انتخاب خوب دیگه هم هست.',
            'به این می‌گن «اثر خوشه‌بندی». وقتی چهارمین کافه باکیفیت توی یه راسته کافه‌خیز هستید، مشتریِ آماده و دست‌به‌جیب هر شب از جلوی شیشه‌تون رد می‌شه؛ فقط کافیه کیفیت قهوه، فضا یا منوتون یه دلیل روشن برای انتخاب شدن بهش بده.'
          ]
        }
      },
      {
        id: 'cluster-vs-gap-table',
        heading: {
          en: '2. Next to Rivals vs. Under-Served Gap: Full Comparison',
          fa: '۲. مقایسه کامل: باز کردن کنار رقبا در برابر پیدا کردن خلاء بازار'
        },
        paragraphs: {
          en: [
            'So which strategy fits YOUR concept? Don’t guess—match your café or restaurant model directly to this table (and pick the matching competition strategy inside Jabio’s analyzer):'
          ],
          fa: [
            'خب بالاخره برای مدل کاریِ شما کدوم استراتژی درست‌تره؟ توی این جدول دقیق مقایسه کنید و بعد دقیقاً همون استراتژی رقابت رو توی ابزار جابیو انتخاب کنید:'
          ]
        },
        table: {
          captionEn: 'Choosing between a proven dining cluster and an under-served neighbourhood gap',
          captionFa: 'جدول تصمیم‌گیری: استراتژی «کنار رقبا» یا «دور از رقبا» برای کافه و رستوران',
          headersEn: ['Factor', 'Inside a dining cluster', 'High-demand quiet gap', 'Balanced (default)'],
          headersFa: ['معیار مقایسه', 'حضور در خوشه رقبا', 'خلاء بازار (دور از رقبا)', 'استراتژی متعادل (پیش‌فرض)'],
          rowsEn: [
            ['Best concepts', 'Specialty dine-in café, brunch, trendy restaurant', 'Takeaway espresso, local bakery, cloud kitchen', 'Neighbourhood café-bistro, family fast food'],
            ['Customer acquisition', 'Instant evening walk-ins', 'Needs strong signage, Maps & SnappFood', 'Mix of repeat locals + walk-ins'],
            ['Rent level', 'High (premium strip)', '35% – 50% lower', 'Moderate'],
            ['Differentiation needed', 'Very high (must stand out)', 'Consistent quality & speed', 'Good vibe + fair pricing'],
            ['Jabio strategy toggle', 'Next to rivals', 'Away from rivals', 'Balanced']
          ],
          rowsFa: [
            ['مناسب‌ترین مدل‌ها', 'کافه تخصصی نشیمن‌دار، برانچ، رستوران خاص', 'قهوه بیرون‌بر، قنادی محلی، آشپزخانه ارسال', 'کافه‌رستوران محله‌ای، فست‌فود خانوادگی'],
            ['جذب مشتری اولیه', 'ورودی سریع از پاخور شبانه', 'نیازمند تابلو قوی، نقشه و اسنپ‌فود', 'ترکیب مشتری ثابت محلی و رهگذر'],
            ['سطح رهن و اجاره', 'بالا (راسته معروف)', '۳۵ تا ۵۰ درصد ارزان‌تر', 'متعادل'],
            ['نیاز به تمایز', 'خیلی بالا (باید حرف تازه داشته باشید)', 'کیفیت ثابت، سرعت و خوش‌برخوردی', 'فضای دلنشین و قیمت منصفانه'],
            ['گزینه متناظر در جابیو', 'کنار رقبا (Next to rivals)', 'دور از رقبا (Away from rivals)', 'متعادل (Balanced)']
          ]
        },
        internalLinks: [
          { en: 'Best Café areas in Isfahan', fa: 'بهترین مناطق کافه در اصفهان', href: '/cities/isfahan/cafe' },
          { en: 'Best Café areas in Shiraz', fa: 'بهترین مناطق کافه در شیراز', href: '/cities/shiraz/cafe' },
          { en: 'Best Restaurant areas in Mashhad', fa: 'بهترین مناطق رستوران در مشهد', href: '/cities/mashhad/restaurant' }
        ]
      },
      {
        id: 'three-cafe-secrets',
        heading: {
          en: '3. Three practical details that make or break a café’s profitability',
          fa: '۳. سه تا جزئیات عملی که سود کافه و رستوران رو زیر و رو می‌کنن'
        },
        paragraphs: {
          en: [
            'Even inside a top-scoring block, food businesses have physical constraints that ordinary shops don’t face. Check these three before falling in love with a space:'
          ],
          fa: [
            'حتی توی یه بلوک با امتیاز ۹۰، کافه و رستوران دردسرهای فنی خاصی دارن که مغازه پوشاک نداره. این سه تا مورد رو حتماً قبل از قولنامه بسنجید:'
          ]
        },
        bullets: {
          en: [
            'Day-to-night revenue balance: An office-only café makes money from 08:30 to 15:00 and sits empty all evening. Pairing nearby offices with dense residential apartments keeps your espresso machine humming from 08:00 to 23:00.',
            'Sidewalk depth & visual warmth: A café whose interior light and bar are clearly visible through wide glass windows converts nearly twice as many evening passers-by as a dark tinted storefront.',
            'Ventilation, grease traps & 3-phase power: Adding a commercial kitchen hood or upgrading electricity after signing can easily cost 250–400 million Toman—verify building approval upfront.'
          ],
          fa: [
            'تعادل فروش صبح و شب: کافه‌ای که فقط وسط بافت اداریه، تا ساعت ۳ عصر شلوغه و از ۴ عصر تا شب خالی می‌مونه! دنبال بلوکی باشید که هم اداره یا دانشگاه نزدیکش باشه و هم بافت مسکونی داشته باشه تا دستگاه اسپرسوتون از ۸ صبح تا ۱۱ شب روشن بمونه.',
            'ویترین شیشه‌ای و نور گرم: کافه‌ای که عابر پیاده از بیرون نور گرم، دستگاه قهوه و حال‌وهوای داخلش رو می‌بینه، تقریباً دو برابرِ مغازه‌های شیشه‌دودی یا بسته مشتری رهگذر جذب می‌کنه.',
            'هود، چربی‌گیر و برق سه‌فاز: کشیدن کانال هود تا پشت‌بام یا گرفتن مجوز برق سه‌فاز بعد از قرارداد می‌تونه ۲۵۰ تا ۴۰۰ میلیون خرج اضافی و دعوای همسایه بسازه؛ حتماً موافقت ساختمان رو قبل از امضا بگیرید.'
          ]
        },
        tip: {
          labelEn: 'Spy on rivals the smart way',
          labelFa: 'رقبا رو هوشمندانه رصد کنید',
          en: 'Buy a coffee at the three nearest cafés on a Tuesday afternoon and a Thursday night. Count occupied seats, note their average menu price, and see what’s missing (good pastries? cold brew? laptop-friendly tables?)—that gap is your angle.',
          fa: 'یه سه‌شنبه‌عصر و یه پنج‌شنبه‌شب برید تو ۳ تا کافه نزدیک و یه قهوه بخورید. ببینید چند تا میز پره، میانگین قیمت منوشون چنده و چی کم دارن (شیرینی تازه؟ میز مناسب لپ‌تاپ؟ فضای بیرون؟). همون جای خالی می‌شه نقطه قوت شما!'
        }
      }
    ],
    checklist: {
      titleEn: 'Café & Restaurant Site-Selection Checklist',
      titleFa: 'چک‌لیست اختصاصی مکان‌یابی کافه و رستوران',
      subtitleEn: 'Verify demand balance, rival strategy, and kitchen infrastructure before signing.',
      subtitleFa: 'قبل از راه‌اندازی کافه یا رستوران، این ۷ مورد رو بررسی و تیک بزنید.',
      items: [
        { id: 'k1', en: 'Chosen my competition strategy: Cluster (dine-in) vs. Gap (takeaway/delivery)', fa: 'استراتژی رقابتم رو مشخص کردم: حضور در خوشه رقبا یا محله کم‌رقیب' },
        { id: 'k2', en: 'Tested all 3 competition strategies on Jabio’s map for my target city', fa: 'هر ۳ حالت رقابت (متعادل، کنار رقبا، دور از رقبا) رو در جابیو مقایسه کردم' },
        { id: 'k3', en: 'Visited the 3 closest rival cafés/restaurants on both a weekday and Thursday night', fa: 'به ۳ رقیب نزدیک هم در روز کاری و هم پنج‌شنبه‌شب سر زدم و شلوغی‌شون رو دیدم' },
        { id: 'k4', en: 'Verified day + evening demand mix (offices/universities + nearby residents)', fa: 'مطمئن شدم محله هم مشتری روزانه (اداری/دانشگاهی) داره هم پاخور شبانه' },
        { id: 'k5', en: 'Confirmed 3-phase power, water/drain capacity, and hood/ventilation permission', fa: 'برق سه‌فاز، فاضلاب مناسب و مجوز کانال تهویه/هود رو در ساختمان چک کردم' },
        { id: 'k6', en: 'Checked storefront glass visibility and potential for sidewalk seating/pickup window', fa: 'دید ویترین از پیاده‌رو و امکان پنجره بیرون‌بر یا میز بیرونی رو بررسی کردم' },
        { id: 'k7', en: 'Validated that daily break-even receipts fit realistic seat turnover & delivery volume', fa: 'چک کردم تعداد فاکتور سربه‌سر با ظرفیت میزها و سفارش پیک هم‌خونی داره' }
      ]
    },
    faq: [
      {
        qEn: 'Is a 20 m² takeaway coffee bar more profitable than a 90 m² dine-in café?',
        qFa: 'کافه بیرون‌بر ۲۰ متری سودآورتره یا کافه نشیمن‌دار ۹۰ متری؟',
        aEn: 'In high-rent strips near offices, universities, and metro stations, a 15–25 m² takeaway espresso bar often achieves much faster payback because rent, decor, and staffing costs are a fraction of a full dine-in café—as long as your daily cup volume is high.',
        aFa: 'توی محدوده‌های پررفت‌وآمد نزدیک ادارات، دانشگاه و مترو، کافه بیرون‌بر ۱۵ تا ۲۵ متری چون اجاره، هزینه دکور و تعداد پرسنلش خیلی کمتره، معمولاً سریع‌تر به سوددهی و بازگشت سرمایه می‌رسه—به‌شرط اینکه سرعت سرویس و تیراژ فروش روزانه‌تون بالا باشه.'
      },
      {
        qEn: 'How many cafés in a 500 m radius means the area is oversaturated?',
        qFa: 'وجود چند تا کافه توی شعاع ۵۰۰ متری یعنی اون محله اشباع شده؟',
        aEn: 'There is no single magic number—it depends on demand density. Five cafés around a major university or office hub with 40,000 daily visitors can all thrive, while three cafés in a quiet residential pocket with 5,000 residents may struggle. Jabio calculates this exact demand-to-rival ratio automatically.',
        aFa: 'عدد ثابت نداره و به حجم تقاضا بستگی داره! کنار یه دانشگاه بزرگ یا قطب اداری با ۴۰ هزار رفت‌وآمد روزانه، ۵ تا کافه همگی پرفروش‌اند؛ اما توی یه محله کم‌تردد، ۳ تا کافه هم به مشکل می‌خورن. جابیو دقیقاً همین نسبت تقاضا به رقیب رو براتون می‌سنجه.'
      },
      {
        qEn: 'Can SnappFood and delivery apps save a bad physical location?',
        qFa: 'آیا اسنپ‌فود و فروش آنلاین می‌تونه جای یه مغازه بدجا رو جبران کنه؟',
        aEn: 'Delivery apps help cloud kitchens operate from cheaper side streets, but delivery radius still depends heavily on dense surrounding population and offices—plus commission fees eat 15–20% of revenue. Even for delivery-first brands, picking a high-demand block on Jabio cuts delivery time and boosts ratings.',
        aFa: 'فروش آنلاین کمک می‌کنه با اجاره کمتر توی فرعی کار کنید، ولی شعاع ارسال پیک همچنان به تراکم جمعیت و ادارات اطرافتون وابسته‌ست و کمیسیون هم بخشی از سود رو می‌گیره. حتی برای آشپزخانه ارسال غذا، انتخاب بلوک پرتقاضا روی جابیو زمان ارسال رو کم و امتیازتون رو بالا می‌بره.'
      }
    ]
  }
];

const BLOG_BY_SLUG = new Map(BLOG_POSTS.map((p) => [p.slug, p]));

const CHANGELOG_RELEASES = [
  {
    version: 'v2.4',
    date: '2026-11-21',
    dateFa: '۳۰ آبان ۱۴۰۵',
    tagEn: 'Platform & SEO',
    tagFa: 'پلتفرم و سئو',
    title: {
      en: '15 City Hubs, 150 City × Business Pages, Blog, Pricing & Account Settings',
      fa: 'صفحات اختصاصی ۱۵ شهر، ۱۵۰ صفحه ترکیبی شهر+صنف، وبلاگ، تعرفه‌ها و تنظیمات حساب'
    },
    items: {
      en: [
        'Launched server-rendered City Directory (/cities) and 150 real engine-scored City + Business Category landing pages across Iran.',
        'Added bilingual Location Intelligence Blog (/blog) with 6 in-depth field guides and commercial leasing playbooks.',
        'Published dedicated Methodology (/methodology) and Data Updates (/changelog) documentation pages.',
        'Introduced transparent Toman Pricing & Plans (/pricing) plus full Account Settings (/account) and Password Recovery (/forgot-password).'
      ],
      fa: [
        'راه‌اندازی دایرکتوری ۱۵ شهر (/cities) و ۱۵۰ صفحه فرود ترکیبی «شهر + صنف» با رندر سمت سرور و امتیازهای واقعی موتور تحلیلی.',
        'افزودن بخش وبلاگ و مقالات آموزشی مکان‌یابی (/blog) با ۶ راهنمای تخصصی دوزبانه.',
        'انتشار صفحه مستقل روش‌شناسی علمی مدل (/methodology) و تاریخچه به‌روزرسانی داده‌ها (/changelog).',
        'ارائه صفحه شفاف تعرفه‌ها با پلن‌بندی تومانی (/pricing) به همراه تنظیمات حساب کاربری (/account) و بازیابی رمز عبور (/forgot-password).'
      ]
    }
  },
  {
    version: 'v2.3',
    date: '2026-11-04',
    dateFa: '۱۳ آبان ۱۴۰۵',
    tagEn: 'Data Snapshot',
    tagFa: 'به‌روزرسانی داده',
    title: {
      en: 'November 2026 Iran Geospatial Snapshot (15 Cities)',
      fa: 'اسنپ‌شات آبان ۱۴۰۵ داده‌های مکانی ۱۵ شهر ایران'
    },
    items: {
      en: [
        'Refreshed OpenStreetMap Geofabrik Iran extract (2026-11-04) across all 15 cities: 125,000+ mapped POIs and 190,000+ buildings.',
        'Merged Overture Maps Places (release 2026-10-21.0) with 50 m deduplication to fill missing shops and services.',
        'Adjusted Tehran residential raster 50/50 using ~520,000 OSM + Microsoft ML building footprints from Overture.'
      ],
      fa: [
        'به‌روزرسانی کامل استخراج OpenStreetMap ایران (نسخه ۲۰۲۶-۱۱-۰۴) برای هر ۱۵ شهر شامل بیش از ۱۲۵ هزار مکان و ۱۹۰ هزار ساختمان.',
        'ادغام داده‌های مکان Overture Maps (نسخه ۲۰۲۶-۱۰-۲۱) با فیلتر حذف تکراری در شعاع ۵۰ متری برای تکمیل مغازه‌های جاافتاده.',
        'اصلاح نقشه توزیع جمعیت تهران با ترکیب ۵۰/۵۰ ردپای بیش از ۵۲۰ هزار ساختمان (OSM و Microsoft ML).'
      ]
    }
  },
  {
    version: 'v2.2',
    date: '2026-10-18',
    dateFa: '۲۶ مهر ۱۴۰۵',
    tagEn: 'Scoring Engine',
    tagFa: 'موتور تحلیل',
    title: {
      en: 'Method v2: Gaussian Distance Decay, Relative Saturation & District 5 Footfall',
      fa: 'روش نسخه ۲: افت فاصله گاوسی، اشباع نسبی رقبا و مدل تردد پیاده منطقه ۵'
    },
    items: {
      en: [
        'Upgraded spatial kernel from flat circle to Gaussian decay (sigma = radius / 2) so immediate neighbours weigh more than edge blocks.',
        'Replaced raw competitor counts with Demand-Adjusted Room Beside Rivals so busy hubs are judged fairly against expected rivals.',
        'Added experimental street-level pedestrian flow model for Tehran District 5 and Tehran elevation-based affluence proxy for sub-categories.'
      ],
      fa: [
        'ارتقای هسته محاسباتی از دایره تخت به افت فاصله گاوسی (sigma = شعاع ÷ ۲) برای وزن‌دهی دقیق‌تر به اطراف نزدیک نقطه.',
        'جایگزینی شمارش خام رقبا با شاخص «ظرفیت بازار در کنار رقبا» متناسب با سطح تقاضای همان محله.',
        'افزودن مدل آزمایشی تردد پیاده خیابان‌های منطقه ۵ تهران و شاخص رفاه هموارشده برای مفاهیم تخصصی تهران.'
      ]
    }
  },
  {
    version: 'v2.1',
    date: '2026-09-25',
    dateFa: '۳ مهر ۱۴۰۵',
    tagEn: 'Product',
    tagFa: 'محصول',
    title: {
      en: 'Multi-Location Compare, Printable PDF Reports & Optional Accounts',
      fa: 'مقایسه هم‌زمان چند مکان، گزارش قابل چاپ PDF و حساب کاربری اختیاری'
    },
    items: {
      en: [
        'Launched side-by-side comparison workspace (/compare.html) and clean print-ready location reports (/report.html).',
        'Added local Break-Even Rent Calculator directly inside every spot analysis.',
        'Introduced optional account syncing for saved analyses while preserving full guest privacy.'
      ],
      fa: [
        'راه‌اندازی صفحه مقایسه هم‌زمان چند موقعیت (/compare.html) و گزارش چاپی و PDF (/report.html).',
        'افزودن محاسبه‌گر محلی نقطه سربه‌سر اجاره در بطن تحلیل هر نقطه.',
        'ارائه حساب کاربری اختیاری برای همگام‌سازی تحلیل‌های ذخیره‌شده بدون محدودکردن دسترسی مهمان.'
      ]
    }
  }
];

const ROADMAP_ITEMS = [
  {
    quarter: { en: 'Q1 2027', fa: 'بهار ۱۴۰۶' },
    status: { en: 'In progress', fa: 'در حال اجرا' },
    title: { en: 'Expanding pedestrian flow model to Tehran Districts 1, 2, 3 & 6', fa: 'گسترش مدل تردد پیاده به مناطق ۱، ۲، ۳ و ۶ تهران' },
    desc: { en: 'Extending the street-network walking model beyond District 5 with field-count calibration points.', fa: 'توسعه مدل تردد پیاده شبکه‌محور به مناطق کلیدی تجاری تهران همراه با نقاط کالیبراسیون میدانی.' }
  },
  {
    quarter: { en: 'Q2 2027', fa: 'تابستان ۱۴۰۶' },
    status: { en: 'Planned', fa: 'برنامه‌ریزی‌شده' },
    title: { en: '5 new cities + commercial rent benchmark ranges', fa: 'افزودن ۵ شهر جدید و بازه‌های مرجع اجاره تجاری' },
    desc: { en: 'Adding Sari, Qazvin, Zanjan, Gorgan, and Bandar Abbas alongside anonymized district rent bands.', fa: 'اضافه‌کردن ساری، قزوین، زنجان، گرگان و بندرعباس به همراه بازه‌های راهنمای اجاره تجاری به تفکیک منطقه.' }
  },
  {
    quarter: { en: 'Q3 2027', fa: 'پاییز ۱۴۰۶' },
    status: { en: 'Planned', fa: 'برنامه‌ریزی‌شده' },
    title: { en: 'Team workspaces & API for retail chains and agencies', fa: 'فضای کاری تیمی و API برای برندهای زنجیره‌ای و املاک' },
    desc: { en: 'Shared shortlists, batch coordinate scoring via API, and white-label PDF reports for commercial brokers.', fa: 'فهرست‌های مشترک تیمی، امتیازدهی دسته‌ای از طریق API و گزارش‌های PDF با برند اختصاصی برای مشاوران املاک تجاری.' }
  }
];

const PRICING_PLANS = [
  {
    id: 'free',
    recommended: false,
    name: { en: 'Free', fa: 'رایگان' },
    audience: { en: 'For first-time founders & local shop owners', fa: 'برای کارآفرینان و کسبه در شروع مسیر' },
    monthlyToman: 0,
    annualToman: 0,
    monthlyLabel: { en: '0 Toman', fa: '۰ تومان' },
    annualLabel: { en: '0 Toman', fa: '۰ تومان' },
    period: { en: 'Forever free', fa: 'همیشه رایگان' },
    cta: { en: 'Start analyzing free', fa: 'شروع رایگان تحلیل' },
    ctaHref: '/jabio.html',
    features: {
      en: [
        'Full map scoring across all 15 Iranian cities',
        'All 10 business categories & sub-category concepts',
        'Find Best Areas + Check Any Spot modes',
        'Built-in Break-Even Rent Calculator',
        'Save up to 10 analyses & print summary report'
      ],
      fa: [
        'تحلیل کامل روی نقشه در هر ۱۵ شهر ایران',
        'دسترسی به تمام ۱۰ صنف اصلی و زیرشاخه‌ها',
        'هر دو حالت «یافتن بهترین مناطق» و «بررسی یک نقطه»',
        'محاسبه‌گر نقطه سربه‌سر اجاره روی هر نقطه',
        'ذخیره تا ۱۰ تحلیل و خروجی چاپی خلاصه'
      ]
    }
  },
  {
    id: 'pro',
    recommended: true,
    name: { en: 'Pro', fa: 'حرفه‌ای' },
    audience: { en: 'For serious founders, consultants & multi-site planners', fa: 'برای بنیان‌گذاران، مشاوران کسب‌وکار و انتخاب دقیق ملک' },
    monthlyToman: 490000,
    annualToman: 390000,
    monthlyLabel: { en: '490,000 Toman', fa: '۴۹۰٬۰۰۰ تومان' },
    annualLabel: { en: '390,000 Toman', fa: '۳۹۰٬۰۰۰ تومان' },
    period: { en: 'per month', fa: 'در ماه' },
    cta: { en: 'Request Pro access', fa: 'درخواست پلن حرفه‌ای' },
    ctaHref: '#pricing-inquiry',
    features: {
      en: [
        'Everything in Free, with unlimited saved locations',
        'Side-by-side comparison of up to 12 candidate shops',
        'Full clean PDF reports with competitor tables & radar charts',
        'Priority access to Tehran pedestrian foot-traffic & affluence layers',
        'Export saved shortlists & competitor lists (JSON / CSV)'
      ],
      fa: [
        'تمام امکانات نسخه رایگان با ذخیره نامحدود تحلیل‌ها',
        'مقایسه هم‌زمان تا ۱۲ ملک کاندیدا کنار هم',
        'گزارش PDF کامل همراه با جدول رقبا و نمودار عنکبوتی',
        'دسترسی اولویت‌دار به لایه‌های تردد پیاده و شاخص رفاه تهران',
        'خروجی فایل فهرست نقاط منتخب و رقبا (JSON / CSV)'
      ]
    }
  },
  {
    id: 'enterprise',
    recommended: false,
    name: { en: 'Enterprise & Agencies', fa: 'سازمانی و املاک' },
    audience: { en: 'For retail chains, franchises & commercial real-estate teams', fa: 'برای برندهای زنجیره‌ای، فرانچایزها و آژانس‌های املاک تجاری' },
    monthlyToman: 2490000,
    annualToman: 1990000,
    monthlyLabel: { en: 'From 2,490,000 Toman', fa: 'از ۲٬۴۹۰٬۰۰۰ تومان' },
    annualLabel: { en: 'From 1,990,000 Toman', fa: 'از ۱٬۹۹۰٬۰۰۰ تومان' },
    period: { en: 'per month', fa: 'در ماه' },
    cta: { en: 'Talk to sales', fa: 'درخواست مشاوره سازمانی' },
    ctaHref: '#pricing-inquiry',
    features: {
      en: [
        'Multi-seat workspace (5+ analysts or real-estate agents)',
        'White-label PDF reports with your agency or brand header',
        'Custom scoring weights calibrated to your chain’s existing branches',
        'Batch location scoring API & quarterly custom city updates',
        'Dedicated onboarding and direct data analyst support'
      ],
      fa: [
        'دسترسی تیمی چندکاربره (۵ کاربر یا بیشتر برای تیم‌های املاک)',
        'گزارش‌های PDF با لوگو و سربرگ اختصاصی برند یا آژانس شما',
        'کالیبراسیون وزن‌های امتیازدهی بر اساس عملکرد شعب فعلی برند شما',
        'دسترسی API برای امتیازدهی دسته‌ای و به‌روزرسانی اختصاصی داده‌ها',
        'پشتیبانی مستقیم تحلیلگر داده و جلسه راه‌اندازی اختصاصی'
      ]
    }
  }
];

const PRICING_MATRIX = [
  { feature: { en: '15 Iranian cities & 10 business categories', fa: '۱۵ شهر ایران و ۱۰ دسته‌بندی اصلی اصناف' }, free: { en: 'Included', fa: 'دارد' }, pro: { en: 'Included', fa: 'دارد' }, ent: { en: 'Included + Custom', fa: 'دارد + شهر اختصاصی' } },
  { feature: { en: 'Saved location analyses', fa: 'تعداد تحلیل‌های ذخیره‌شده' }, free: { en: 'Up to 10', fa: 'تا ۱۰ تحلیل' }, pro: { en: 'Unlimited', fa: 'نامحدود' }, ent: { en: 'Unlimited (Team)', fa: 'نامحدود (تیمی)' } },
  { feature: { en: 'Side-by-side spot comparison', fa: 'مقایسه هم‌زمان چند مکان' }, free: { en: 'Up to 3 spots', fa: 'تا ۳ مکان' }, pro: { en: 'Up to 12 spots', fa: 'تا ۱۲ مکان' }, ent: { en: 'Unlimited', fa: 'نامحدود' } },
  { feature: { en: 'PDF & printable reports', fa: 'گزارش PDF و چاپی' }, free: { en: 'Standard summary', fa: 'نسخه استاندارد' }, pro: { en: 'Full analyst PDF', fa: 'گزارش کامل تحلیلی' }, ent: { en: 'White-label branded', fa: 'با برند اختصاصی شما' } },
  { feature: { en: 'Tehran affluence & D5 footfall layers', fa: 'لایه‌های شاخص رفاه و تردد پیاده تهران' }, free: { en: 'Preview', fa: 'پیش‌نمایش' }, pro: { en: 'Full access', fa: 'دسترسی کامل' }, ent: { en: 'Full + Custom zones', fa: 'کامل + محدوده اختصاصی' } },
  { feature: { en: 'Data export & API access', fa: 'خروجی داده و دسترسی API' }, free: { en: '—', fa: '—' }, pro: { en: 'JSON / CSV export', fa: 'خروجی JSON / CSV' }, ent: { en: 'Export + REST API', fa: 'خروجی + API اختصاصی' } },
  { feature: { en: 'Custom weight calibration on your branches', fa: 'کالیبراسیون مدل بر اساس فروش شعب فعلی' }, free: { en: '—', fa: '—' }, pro: { en: '—', fa: '—' }, ent: { en: 'Included', fa: 'شامل می‌شود' } }
];

const PRICING_FAQ = [
  {
    q: { en: 'Can I use Jabio completely free without signing up?', fa: 'آیا می‌توانم بدون ثبت‌نام و کاملاً رایگان از جابیو استفاده کنم؟' },
    a: { en: 'Yes. Every city, category, heatmap, spot analyzer, and break-even calculator works free without creating an account. Accounts are only needed if you want to sync saved analyses across devices or upgrade later.', fa: 'بله. تمام ۱۵ شهر، ۱۰ صنف، نقشه حرارتی، بررسی نقطه و محاسبه‌گر نقطه سربه‌سر بدون نیاز به ثبت‌نام و رایگان در دسترس هستند. حساب کاربری فقط برای همگام‌سازی ذخیره‌شده‌ها روی دستگاه‌های مختلف یا استفاده از امکانات حرفه‌ای لازم است.' }
  },
  {
    q: { en: 'How does annual billing work and can I switch plans?', fa: 'پرداخت سالانه چگونه است و آیا امکان تغییر پلن وجود دارد؟' },
    a: { en: 'Annual plans give a 20% discount compared with monthly billing (390,000 Toman/month equivalent for Pro). You can upgrade, downgrade, or pause at the end of any billing cycle with no lock-in.', fa: 'در پرداخت سالانه ۲۰٪ تخفیف نسبت به تعرفه ماهانه اعمال می‌شود (معادل ماهانه ۳۹۰٬۰۰۰ تومان برای پلن حرفه‌ای). در پایان هر دوره می‌توانید بدون جریمه پلن خود را ارتقا دهید یا تغییر دهید.' }
  },
  {
    q: { en: 'Is the Enterprise plan suitable for commercial real-estate agencies?', fa: 'آیا پلن سازمانی برای آژانس‌های املاک تجاری مناسب است؟' },
    a: { en: 'Yes. Commercial real-estate teams use white-label Jabio PDF reports to back up commercial listings with transparent population, transit, and competitor evidence for tenants and investors.', fa: 'بله. مشاوران و آژانس‌های املاک تجاری از گزارش‌های PDF با برند اختصاصی جابیو استفاده می‌کنند تا برای ملک‌های تجاری خود شواهد شفاف جمعیتی، دسترسی و رقابت به مستاجران و سرمایه‌گذاران ارائه دهند.' }
  },
  {
    q: { en: 'Does Jabio guarantee that a high-scoring location will be profitable?', fa: 'آیا جابیو سودآوری مکان‌های با امتیاز بالا را تضمین می‌کند؟' },
    a: { en: 'No tool can guarantee profitability because rent, execution, service quality, and micro-street visibility happen off the map. Jabio dramatically improves your shortlist so you invest your field research and capital in the strongest areas.', fa: 'هیچ ابزار مکانی نمی‌تواند سودآوری را تضمین کند؛ چون اجاره، کیفیت اجرا و مدیریت بیرون از نقشه اتفاق می‌افتند. جابیو کمک می‌کند به جای آزمون‌وخطای پرهزینه در کل شهر، زمان بازدید میدانی و سرمایه خود را روی مستعدترین محدوده‌ها متمرکز کنید.' }
  }
];

module.exports = {
  BLOG_CATEGORIES,
  BLOG_POSTS,
  BLOG_BY_SLUG,
  CHANGELOG_RELEASES,
  ROADMAP_ITEMS,
  PRICING_PLANS,
  PRICING_MATRIX,
  PRICING_FAQ
};
