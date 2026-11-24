/* Centralized 3-level POI Taxonomy for Jabio (17 Main Categories, Subcategories, Sub-subcategories) */
(function (root) {
  'use strict';
  var TAXONOMY_17 = [
    {
      id: 'food_drink',
      fa: 'غذا و نوشیدنی',
      en: 'Food & Drink',
      icon: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2v6a3 3 0 0 1-3 3 3 3 0 0 1-3-3V2M6 2v6a3 3 0 0 0 3 3 3 3 0 0 0 3-3V2M12 11v11"/></svg>',
      subs: [
        {
          fa: 'رستوران و کترینگ', en: 'Restaurants & Catering',
          subsubs: ['رستوران سنتی و چلوکبابی', 'فست‌فود و برگر', 'پیتزا و ایتالیایی', 'رستوران ایرانی و محلی', 'کترینگ و تهیه غذا']
        },
        {
          fa: 'کافه و کافی‌شاپ', en: 'Cafes & Coffee Shops',
          subsubs: ['کافه تخصصی', 'کافه رستوران', 'چایخانه سنتی', 'بستنی و آبمیوه']
        },
        {
          fa: 'شیرینی و نان‌سرا', en: 'Bakery & Confectionery',
          subsubs: ['قنادی و شیرینی‌فروشی', 'نانوایی سنتی و فانتزی', 'آجیل و خشکبار']
        }
      ]
    },
    {
      id: 'retail_shopping',
      fa: 'خرید و فروشگاه‌ها',
      en: 'Retail & Shopping',
      icon: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>',
      subs: [
        {
          fa: 'سوپرمارکت و مواد غذایی', en: 'Groceries & Supermarkets',
          subsubs: ['سوپرمارکت و هایپرمارکت', 'میوه و سبزی‌فروشی', 'پروتئینی (گوشت و مرغ)', 'لبنیات سنتی']
        },
        {
          fa: 'پوشاک و مد', en: 'Fashion & Clothing',
          subsubs: ['پوشاک مردانه و زنانه', 'کیف و کفش', 'پوشاک کودک', 'خرازی و لوازم خیاطی']
        },
        {
          fa: 'لوازم خانگی و دیجیتال', en: 'Home Appliances & Electronics',
          subsubs: ['لوازم خانگی برقی', 'موبایل و کامپیوتر', 'صوتی و تصویری']
        },
        {
          fa: 'مراکز خرید و فروشگاه بزرگ', en: 'Malls & Department Stores',
          subsubs: ['پاساژ و مرکز خرید', 'فروشگاه زنجیره‌ای']
        }
      ]
    },
    {
      id: 'health_medical',
      fa: 'سلامت و پزشکی',
      en: 'Health & Medical',
      icon: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M2 12h20"/></svg>',
      subs: [
        {
          fa: 'داروخانه و تجهیزات پزشکی', en: 'Pharmacies & Medical Supplies',
          subsubs: ['داروخانه روزانه و شبانه‌روزی', 'تجهیزات پزشکی و ارتوپدی', 'عطاری و گیاهان دارویی']
        },
        {
          fa: 'مراکز درمانی و مطب‌ها', en: 'Clinics & Medical Centers',
          subsubs: ['مطب پزشکان متخصص', 'کلینیک تخصصی و درمانگاه', 'بیمارستان و مرکز جراحی']
        },
        {
          fa: 'آزمایشگاه و تصویربرداری', en: 'Labs & Imaging',
          subsubs: ['آزمایشگاه تشخیص طبی', 'رادیولوژی و سونوگرافی']
        }
      ]
    },
    {
      id: 'beauty_hygiene',
      fa: 'زیبایی و بهداشت',
      en: 'Beauty & Hygiene',
      icon: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4-6.2-4.5-6.2 4.5 2.4-7.4L2 9.4h7.6z"/></svg>',
      subs: [
        {
          fa: 'سالن‌های زیبایی', en: 'Beauty Salons',
          subsubs: ['آرایشگاه زنانه', 'آرایشگاه مردانه (باربر)', 'سالن خدمات ناخن و مژه']
        },
        {
          fa: 'لوازم آرایشی و بهداشتی', en: 'Cosmetics & Perfumes',
          subsubs: ['لوازم آرایشی و مراقبت پوست', 'عطر و ادکلن']
        },
        {
          fa: 'سلامت و اسپا', en: 'Spa & Wellness',
          subsubs: ['مرکز ماساژ و اسپا', 'کلینیک پوست و لیزر']
        }
      ]
    },
    {
      id: 'automotive_transport',
      fa: 'خودرو و حمل‌ونقل',
      en: 'Automotive & Transport',
      icon: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="6" width="22" height="12" rx="2"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/></svg>',
      subs: [
        {
          fa: 'خدمات خودرویی', en: 'Automotive Services',
          subsubs: ['تعمیرگاه و مکانیکی', 'کارواش و آپاراتی', 'لوازم یدکی خودرو']
        },
        {
          fa: 'سوخت و انرژی', en: 'Fuel & Energy',
          subsubs: ['پمپ بنزین و گاز (CNG)', 'ایستگاه شارژ خودرو برقی']
        },
        {
          fa: 'حمل‌ونقل عمومی و باربری', en: 'Public Transport & Logistics',
          subsubs: ['ایستگاه مترو و اتوبوس', 'تاکسی سرویس و آژانس', 'باربری و پست']
        }
      ]
    },
    {
      id: 'real_estate_construction',
      fa: 'املاک و ساختمان',
      en: 'Real Estate & Construction',
      icon: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16M9 9h1M14 9h1M9 13h1M14 13h1"/></svg>',
      subs: [
        {
          fa: 'مشاور املاک', en: 'Real Estate Agencies',
          subsubs: ['بنگاه معاملات ملکی', 'دفتر ساختمانی و مهندسی']
        },
        {
          fa: 'مصالح و تجهیزات ساختمانی', en: 'Construction Materials',
          subsubs: ['آهن‌آلات و مصالح', 'لوازم بهداشتی ساختمان', 'دکوراسیون داخلی']
        }
      ]
    },
    {
      id: 'education_research',
      fa: 'آموزش و پژوهش',
      en: 'Education & Research',
      icon: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c0 2 3 3 6 3s6-1 6-3v-5"/></svg>',
      subs: [
        {
          fa: 'مراکز آموزشی رسمی', en: 'Formal Education',
          subsubs: ['مدرسه (دبستان تا دبیرستان)', 'دانشگاه و موسسه آموزش عالی']
        },
        {
          fa: 'آموزشگاه‌ها و مهارت‌آموزی', en: 'Training Institutes',
          subsubs: ['آموزشگاه زبان خارجی', 'آموزشگاه کامپیوتر و فناوری', 'آموزشگاه هنرهای تجسمی و موسیقی']
        }
      ]
    },
    {
      id: 'professional_services',
      fa: 'خدمات حرفه‌ای و کسب‌وکار',
      en: 'Professional Services',
      icon: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>',
      subs: [
        {
          fa: 'خدمات حقوقی و مالی', en: 'Legal & Financial Services',
          subsubs: ['دفتر وکالت و مشاوره حقوقی', 'حسابداری و حسابرسی', 'دفتر اسناد رسمی (محضر)']
        },
        {
          fa: 'خدمات فنی و اداری', en: 'Technical & Admin Services',
          subsubs: ['چاپخانه و تکثیر', 'دفتر فنی و مهندسی', 'ترجمه رسمی']
        }
      ]
    },
    {
      id: 'industry_manufacturing',
      fa: 'صنعت و تولید',
      en: 'Industry & Manufacturing',
      icon: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2 20h20M4 20V10l6 4V4l10 16z"/></svg>',
      subs: [
        {
          fa: 'کارگاه و کارخانه', en: 'Factories & Workshops',
          subsubs: ['کارگاه تولیدی صنعتی', 'انبار و سردخانه']
        }
      ]
    },
    {
      id: 'finance_insurance',
      fa: 'مالی و بیمه',
      en: 'Finance & Insurance',
      icon: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>',
      subs: [
        {
          fa: 'بانک و موسسات مالی', en: 'Banks & Financial Institutions',
          subsubs: ['شعبه بانکی', 'صرافی و خدمات ارزی']
        },
        {
          fa: 'نمایندگی بیمه', en: 'Insurance Agencies',
          subsubs: ['بیمه ایران، آسیا، دانا و...', 'کارگزاری بیمه']
        }
      ]
    },
    {
      id: 'public_government_services',
      fa: 'خدمات عمومی و دولتی',
      en: 'Public & Gov Services',
      icon: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18M3 10h18M12 2l10 7H2l10-7zM5 10v11M19 10v11"/></svg>',
      subs: [
        {
          fa: 'ادارات و سازمان‌ها', en: 'Government Offices',
          subsubs: ['شهرداری و فرمانداری', 'کلانتری و راهنمایی و رانندگی', 'اداره مالیات و تامین اجتماعی']
        }
      ]
    },
    {
      id: 'sports_recreation',
      fa: 'ورزش و تفریح',
      en: 'Sports & Recreation',
      icon: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10zM2 12h20"/></svg>',
      subs: [
        {
          fa: 'باشگاه‌ها و اماکن ورزشی', en: 'Sports Facilities',
          subsubs: ['باشگاه بدنسازی و فیتنس', 'استخر و مجموعه آبی', 'سالن ورزشی چندمنظوره']
        },
        {
          fa: 'مراکز تفریحی', en: 'Recreational Centers',
          subsubs: ['شهربازی و سالن بازی', 'سینما و تئاتر']
        }
      ]
    },
    {
      id: 'culture_arts_tourism',
      fa: 'فرهنگ، هنر و گردشگری',
      en: 'Culture, Arts & Tourism',
      icon: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="13.5" cy="6.5" r=".5"/><circle cx="17.5" cy="10.5" r=".5"/><circle cx="8.5" cy="7.5" r=".5"/><circle cx="6.5" cy="12.5" r=".5"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.504 5.555-5.554C21.965 6.482 17.518 2 12 2z"/></svg>',
      subs: [
        {
          fa: 'گردشگری و اقامت', en: 'Tourism & Travel',
          subsubs: ['آژانس مسافرتی و تور', 'هتل و مهمان‌پذیر', 'جاذبه گردشگری و موزه']
        },
        {
          fa: 'فرهنگی و هنری', en: 'Culture & Arts',
          subsubs: ['گالری هنری و نگارخانه', 'کتابخانه عمومی']
        }
      ]
    },
    {
      id: 'religious_social',
      fa: 'مذهبی و اجتماعی',
      en: 'Religious & Social',
      icon: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>',
      subs: [
        {
          fa: 'اماکن مذهبی', en: 'Religious Sites',
          subsubs: ['مسجد و حسینیه', 'امامزاده و زیارتگاه']
        },
        {
          fa: 'نهادهای اجتماعی', en: 'Social Institutions',
          subsubs: ['خیریه و سمن (NGO)', 'دفتر انجمن‌های مردمی']
        }
      ]
    },
    {
      id: 'nature_geography',
      fa: 'طبیعت و عوارض مکانی',
      en: 'Nature & Geography',
      icon: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M17 5l-5-3-5 3M19 11l-7-3-7 3"/></svg>',
      subs: [
        {
          fa: 'پارک و فضای سبز', en: 'Parks & Green Spaces',
          subsubs: ['پارک شهری و جنگلی', 'میدان و فضای سبز عمومی']
        }
      ]
    },
    {
      id: 'residential_accommodation',
      fa: 'سکونت و اقامت',
      en: 'Residential & Accommodation',
      icon: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
      subs: [
        {
          fa: 'مجتمع‌های مسکونی', en: 'Residential Complexes',
          subsubs: ['مجتمع آپارتمانی', 'شهرک مسکونی']
        }
      ]
    },
    {
      id: 'uncategorized_other',
      fa: 'خارج از دسته‌بندی کسب‌وکارها',
      en: 'Uncategorized / Other',
      icon: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>',
      subs: [
        {
          fa: 'سایر موارد', en: 'Other / Unmapped',
          subsubs: ['ثبت‌نشده (UNMAPPED)', 'نیازمند بازبینی (REVIEW_RAW_LABEL)', 'تأییدشده خودکار (RULE_MAPPED)']
        }
      ]
    }
  ];

  var SUBSUB_EN = {
    'رستوران سنتی و چلوکبابی': 'Traditional Kebab Restaurant',
    'فست‌فود و برگر': 'Fast Food & Burger',
    'پیتزا و ایتالیایی': 'Pizza & Italian',
    'رستوران ایرانی و محلی': 'Local Iranian Restaurant',
    'کترینگ و تهیه غذا': 'Catering & Takeaway',
    'کافه تخصصی': 'Specialty Coffee',
    'کافه رستوران': 'Café-Restaurant',
    'چایخانه سنتی': 'Traditional Tea House',
    'بستنی و آبمیوه': 'Ice Cream & Juice',
    'قنادی و شیرینی‌فروشی': 'Pastry & Confectionery',
    'نانوایی سنتی و فانتزی': 'Traditional & Artisan Bakery',
    'آجیل و خشکبار': 'Nuts & Dried Fruit',
    'سوپرمارکت و هایپرمارکت': 'Supermarket & Hypermarket',
    'میوه و سبزی‌فروشی': 'Fruit & Vegetables',
    'پروتئینی (گوشت و مرغ)': 'Butcher & Poultry',
    'لبنیات سنتی': 'Traditional Dairy',
    'پوشاک مردانه و زنانه': 'Men’s & Women’s Clothing',
    'کیف و کفش': 'Bags & Shoes',
    'پوشاک کودک': 'Kids’ Clothing',
    'خرازی و لوازم خیاطی': 'Haberdashery & Tailoring',
    'لوازم خانگی برقی': 'Home Appliances',
    'موبایل و کامپیوتر': 'Mobile & Computers',
    'صوتی و تصویری': 'Audio & Video Electronics',
    'پاساژ و مرکز خرید': 'Shopping Mall & Arcade',
    'فروشگاه زنجیره‌ای': 'Chain Hypermarket',
    'داروخانه روزانه و شبانه‌روزی': '24h & Daily Pharmacy',
    'تجهیزات پزشکی و ارتوپدی': 'Medical & Orthopaedic Supplies',
    'عطاری و گیاهان دارویی': 'Herbal Medicine & Apothecary',
    'مطب پزشکان متخصص': 'Specialist Medical Office',
    'کلینیک تخصصی و درمانگاه': 'Polyclinic & Medical Center',
    'بیمارستان و مرکز جراحی': 'Hospital & Surgery Center',
    'آزمایشگاه تشخیص طبی': 'Diagnostic Laboratory',
    'رادیولوژی و سونوگرافی': 'Radiology & Ultrasound',
    'آرایشگاه زنانه': 'Women’s Beauty Salon',
    'آرایشگاه مردانه (باربر)': 'Men’s Barbershop',
    'سالن خدمات ناخن و مژه': 'Nail & Lash Studio',
    'لوازم آرایشی و مراقبت پوست': 'Cosmetics & Skincare',
    'عطر و ادکلن': 'Perfume & Cologne Shop',
    'مرکز ماساژ و اسپا': 'Spa & Massage Center',
    'کلینیک پوست و لیزر': 'Skin & Laser Clinic',
    'تعمیرگاه و مکانیکی': 'Auto Repair & Mechanic',
    'کارواش و آپاراتی': 'Car Wash & Tire Service',
    'لوازم یدکی خودرو': 'Auto Spare Parts',
    'پمپ بنزین و گاز (CNG)': 'Fuel & CNG Station',
    'ایستگاه شارژ خودرو برقی': 'EV Charging Station',
    'ایستگاه مترو و اتوبوس': 'Metro & Bus Station',
    'تاکسی سرویس و آژانس': 'Taxi & Ride Agency',
    'باربری و پست': 'Logistics & Courier',
    'بنگاه معاملات ملکی': 'Real Estate Agency',
    'دفتر ساختمانی و مهندسی': 'Construction & Engineering Office',
    'آهن‌آلات و مصالح': 'Construction Materials & Steel',
    'لوازم بهداشتی ساختمان': 'Sanitary Ware & Fittings',
    'دکوراسیون داخلی': 'Interior Design & Decor',
    'مدرسه (دبستان تا دبیرستان)': 'Primary & Secondary School',
    'دانشگاه و موسسه آموزش عالی': 'University & Higher Education',
    'آموزشگاه زبان خارجی': 'Language Institute',
    'آموزشگاه کامپیوتر و فناوری': 'Computer & Tech Institute',
    'آموزشگاه هنرهای تجسمی و موسیقی': 'Art & Music Academy',
    'دفتر وکالت و مشاوره حقوقی': 'Law & Legal Office',
    'حسابداری و حسابرسی': 'Accounting & Audit',
    'دفتر اسناد رسمی (محضر)': 'Notary Public Office',
    'چاپخانه و تکثیر': 'Print & Copy Shop',
    'دفتر فنی و مهندسی': 'Technical & Engineering Desk',
    'ترجمه رسمی': 'Official Translation Office',
    'کارگاه تولیدی صنعتی': 'Industrial Workshop & Factory',
    'انبار و سردخانه': 'Warehouse & Cold Storage',
    'شعبه بانکی': 'Bank Branch',
    'صرافی و خدمات ارزی': 'Currency Exchange',
    'بیمه ایران، آسیا، دانا و...': 'Insurance Agency',
    'کارگزاری بیمه': 'Insurance Brokerage',
    'شهرداری و فرمانداری': 'Municipality & Governorate',
    'کلانتری و راهنمایی و رانندگی': 'Police & Traffic Office',
    'اداره مالیات و تامین اجتماعی': 'Tax & Social Security Office',
    'باشگاه بدنسازی و فیتنس': 'Gym & Fitness Club',
    'استخر و مجموعه آبی': 'Swimming Pool & Aquatics',
    'سالن ورزشی چندمنظوره': 'Multi-Sport Hall',
    'شهربازی و سالن بازی': 'Amusement & Game Center',
    'سینما و تئاتر': 'Cinema & Theater',
    'آژانس مسافرتی و تور': 'Travel & Tour Agency',
    'هتل و مهمان‌پذیر': 'Hotel & Hospitality',
    'جاذبه گردشگری و موزه': 'Tourist Attraction & Museum',
    'گالری هنری و نگارخانه': 'Art Gallery',
    'کتابخانه عمومی': 'Public Library',
    'مسجد و حسینیه': 'Mosque & Religious Center',
    'امامزاده و زیارتگاه': 'Shrine & Pilgrimage Site',
    'خیریه و سمن (NGO)': 'Charity & NGO',
    'دفتر انجمن‌های مردمی': 'Community Association',
    'پارک شهری و جنگلی': 'Urban & Forest Park',
    'میدان و فضای سبز عمومی': 'Public Square & Green Space',
    'مجتمع آپارتمانی': 'Apartment Complex',
    'شهرک مسکونی': 'Residential Township',
    'ثبت‌نشده (UNMAPPED)': 'Unmapped Category',
    'نیازمند بازبینی (REVIEW_RAW_LABEL)': 'Pending Review',
    'تأییدشده خودکار (RULE_MAPPED)': 'Auto-Mapped Place'
  };

  /* Domain-accurate scoring profiles for taxonomy items without a 1:1 concept in GA_TAXONOMY.
     All driver & rival keys map to real OSM layers present in Jabio city snapshots. */
  var PROFILES = {
    retail_general: { id: 'poi_retail_general', aud: ['locals', 'families'], pri: ['foot', 'shopping'], d: { retail: 1.6, mall: 1.4, residents: 1.2, transit: 1.2 }, comp: { retail: 1, fashion: 0.4, grocery: 0.25 } },
    home_appliances: { id: 'poi_home_appliances', aud: ['families', 'locals'], pri: ['car', 'parking', 'shopping'], d: { retail: 1.6, mall: 1.4, residents: 1.3 }, comp: { retail: 1, mall: 0.3 } },
    audio_video: { id: 'poi_audio_video', aud: ['locals', 'students'], pri: ['shopping', 'transit'], d: { retail: 1.6, mall: 1.4, university: 1.1 }, comp: { retail: 1, mall: 0.3 } },
    malls_dept: { id: 'poi_malls_dept', aud: ['families', 'tourists'], pri: ['car', 'parking', 'transit', 'shopping'], d: { retail: 1.5, mall: 1.8, transit: 1.4, residents: 1.2 }, comp: { mall: 1, retail: 0.25 } },
    auto_general: { id: 'poi_auto_general', aud: ['locals'], pri: ['car', 'parking', 'visibility'], d: { transit: 1.5, residents: 1.4, retail: 1.1, office: 0.7 }, comp: { parking: 0.6, transit: 0.3 } },
    auto_repair: { id: 'poi_auto_repair', aud: ['locals'], pri: ['car', 'parking', 'visibility'], d: { residents: 1.5, transit: 1.2, retail: 0.9, office: 0.5 }, comp: { parking: 0.7, retail: 0.15 } },
    carwash: { id: 'poi_carwash', aud: ['locals', 'families'], pri: ['car', 'parking', 'visibility'], d: { residents: 1.7, mall: 1.2, office: 0.8 }, comp: { parking: 0.6 } },
    auto_parts: { id: 'poi_auto_parts', aud: ['locals'], pri: ['car', 'parking', 'visibility'], d: { retail: 1.5, transit: 1.3, residents: 1.2 }, comp: { retail: 0.4, parking: 0.5 } },
    fuel_ev: { id: 'poi_fuel_ev', aud: ['locals'], pri: ['car', 'visibility'], d: { transit: 1.7, residents: 1.4, mall: 1.2, office: 0.6 }, comp: { parking: 0.8, transit: 0.4 } },
    transit_hub: { id: 'poi_transit_hub', aud: ['employees', 'students', 'locals'], pri: ['transit', 'foot'], d: { transit: 2.0, office: 1.4, university: 1.3, retail: 1.2 }, comp: { transit: 1 } },
    taxi_agency: { id: 'poi_taxi_agency', aud: ['locals', 'families'], pri: ['car', 'transit'], d: { residents: 1.8, transit: 1.4, health: 1.1 }, comp: { transit: 0.7 } },
    engineering: { id: 'poi_engineering', aud: ['employees', 'locals'], pri: ['offices', 'car', 'parking'], d: { office: 1.6, bank: 1.3, civic: 1.3, residents: 1.1 }, comp: { office: 0.35 } },
    construction_mat: { id: 'poi_construction_mat', aud: ['locals'], pri: ['car', 'parking', 'visibility'], d: { residents: 1.4, retail: 1.3, office: 0.6 }, comp: { retail: 0.5, parking: 0.4 } },
    interior_decor: { id: 'poi_interior_decor', aud: ['families', 'locals'], pri: ['car', 'parking', 'shopping', 'visibility'], d: { retail: 1.7, residents: 1.4, mall: 1.2 }, comp: { retail: 0.6, fashion: 0.2 } },
    school_formal: { id: 'poi_school_formal', aud: ['families'], pri: ['foot', 'parking'], d: { residents: 1.9, park: 1.3, school: 1.2 }, comp: { school: 1, education: 0.3 } },
    university_formal: { id: 'poi_university_formal', aud: ['students'], pri: ['transit', 'foot'], d: { university: 1.8, transit: 1.6, residents: 1.1 }, comp: { university: 1, education: 0.4 } },
    industry: { id: 'poi_industry', aud: ['employees'], pri: ['car', 'parking'], d: { transit: 1.2, retail: 1.0, office: 0.7, residents: 0.6 }, comp: { office: 0.3, retail: 0.3, parking: 0.5 } },
    warehouse: { id: 'poi_warehouse', aud: ['employees'], pri: ['car', 'parking'], d: { retail: 1.3, transit: 1.2, residents: 0.7, office: 0.5 }, comp: { parking: 0.6, retail: 0.25 } },
    bank_branch: { id: 'poi_bank_branch', aud: ['employees', 'locals'], pri: ['visibility', 'transit', 'foot'], d: { office: 1.6, retail: 1.5, civic: 1.3, mall: 1.2, residents: 1.1 }, comp: { bank: 1 } },
    currency_exchange: { id: 'poi_currency_exchange', aud: ['employees', 'tourists'], pri: ['visibility', 'shopping', 'transit'], d: { bank: 1.7, tourism: 1.5, retail: 1.5, office: 1.4 }, comp: { bank: 0.8 } },
    public_gov: { id: 'poi_public_gov', aud: ['locals', 'employees'], pri: ['transit', 'parking', 'visibility'], d: { residents: 1.6, transit: 1.6, office: 1.3, bank: 1.1 }, comp: { civic: 1 } },
    amusement: { id: 'poi_amusement', aud: ['families', 'students'], pri: ['car', 'parking', 'transit'], d: { park: 1.7, mall: 1.6, leisure: 1.5, residents: 1.3 }, comp: { leisure: 1, park: 0.2 } },
    cinema: { id: 'poi_cinema', aud: ['students', 'families', 'tourists'], pri: ['transit', 'foot', 'shopping'], d: { mall: 1.7, university: 1.5, tourism: 1.4, transit: 1.4, retail: 1.2 }, comp: { leisure: 1, mall: 0.25 } },
    culture_tourism: { id: 'poi_culture_tourism', aud: ['tourists', 'students'], pri: ['foot', 'transit', 'visibility'], d: { tourism: 1.9, park: 1.3, leisure: 1.3, university: 1.2, transit: 1.2 }, comp: { tourism: 1 } },
    hotel: { id: 'poi_hotel', aud: ['tourists', 'employees'], pri: ['transit', 'car', 'parking', 'visibility'], d: { tourism: 2.0, transit: 1.5, mall: 1.2, office: 1.1, park: 1.1 }, comp: { tourism: 1 } },
    museum: { id: 'poi_museum', aud: ['tourists', 'families', 'students'], pri: ['foot', 'transit'], d: { tourism: 1.9, park: 1.5, university: 1.3, transit: 1.3 }, comp: { tourism: 0.8, leisure: 0.3 } },
    religious: { id: 'poi_religious', aud: ['families', 'locals'], pri: ['foot', 'transit'], d: { residents: 1.9, school: 1.3, civic: 1.2, park: 1.1 }, comp: { civic: 0.8 } },
    social_ngo: { id: 'poi_social_ngo', aud: ['locals', 'employees'], pri: ['transit', 'foot'], d: { residents: 1.6, civic: 1.5, university: 1.3, office: 1.2 }, comp: { civic: 0.6, office: 0.2 } },
    parks_nature: { id: 'poi_parks_nature', aud: ['families', 'locals'], pri: ['foot', 'car'], d: { residents: 1.8, school: 1.4, leisure: 1.3, tourism: 1.2 }, comp: { park: 1 } },
    residential: { id: 'poi_residential', aud: ['families', 'locals'], pri: ['transit', 'parking'], d: { school: 1.6, park: 1.6, health: 1.4, transit: 1.4, retail: 1.2, residents: 1.3 }, comp: { office: 0.25 } },
    other_general: { id: 'poi_other_general', aud: ['locals'], pri: ['transit', 'foot'], d: { residents: 1.3, retail: 1.3, office: 1.2, transit: 1.2 }, comp: { retail: 0.5, office: 0.3 } }
  };

  var MAIN_MAP = {
    food_drink: { engineType: 'restaurant', conceptId: '', profile: null },
    retail_shopping: { engineType: 'fashion', conceptId: '', profile: PROFILES.retail_general },
    health_medical: { engineType: 'clinic', conceptId: '', profile: null },
    beauty_hygiene: { engineType: 'beauty', conceptId: '', profile: null },
    automotive_transport: { engineType: 'services', conceptId: '', profile: PROFILES.auto_general },
    real_estate_construction: { engineType: 'services', conceptId: 'realestate', profile: null },
    education_research: { engineType: 'education', conceptId: '', profile: null },
    professional_services: { engineType: 'services', conceptId: '', profile: null },
    industry_manufacturing: { engineType: 'services', conceptId: '', profile: PROFILES.industry },
    finance_insurance: { engineType: 'services', conceptId: '', profile: PROFILES.bank_branch },
    public_government_services: { engineType: 'services', conceptId: '', profile: PROFILES.public_gov },
    sports_recreation: { engineType: 'fitness', conceptId: '', profile: null },
    culture_arts_tourism: { engineType: 'services', conceptId: '', profile: PROFILES.culture_tourism },
    religious_social: { engineType: 'services', conceptId: '', profile: PROFILES.religious },
    nature_geography: { engineType: 'fitness', conceptId: '', profile: PROFILES.parks_nature },
    residential_accommodation: { engineType: 'services', conceptId: '', profile: PROFILES.residential },
    uncategorized_other: { engineType: 'services', conceptId: '', profile: PROFILES.other_general }
  };

  var SUB_MAP = {
    'رستوران و کترینگ': { engineType: 'restaurant', conceptId: '', profile: null },
    'کافه و کافی‌شاپ': { engineType: 'cafe', conceptId: '', profile: null },
    'شیرینی و نان‌سرا': { engineType: 'grocery', conceptId: 'pastry', profile: null },
    'سوپرمارکت و مواد غذایی': { engineType: 'grocery', conceptId: 'supermarket', profile: null },
    'پوشاک و مد': { engineType: 'fashion', conceptId: '', profile: null },
    'لوازم خانگی و دیجیتال': { engineType: 'services', conceptId: 'mobile', profile: null },
    'مراکز خرید و فروشگاه بزرگ': { engineType: 'fashion', conceptId: '', profile: PROFILES.malls_dept },
    'داروخانه و تجهیزات پزشکی': { engineType: 'pharmacy', conceptId: '', profile: null },
    'مراکز درمانی و مطب‌ها': { engineType: 'clinic', conceptId: '', profile: null },
    'آزمایشگاه و تصویربرداری': { engineType: 'clinic', conceptId: 'lab', profile: null },
    'سالن‌های زیبایی': { engineType: 'beauty', conceptId: 'women_salon', profile: null },
    'لوازم آرایشی و بهداشتی': { engineType: 'beauty', conceptId: 'cosmetics', profile: null },
    'سلامت و اسپا': { engineType: 'beauty', conceptId: 'spa', profile: null },
    'خدمات خودرویی': { engineType: 'services', conceptId: '', profile: PROFILES.auto_repair },
    'سوخت و انرژی': { engineType: 'services', conceptId: '', profile: PROFILES.fuel_ev },
    'حمل‌ونقل عمومی و باربری': { engineType: 'services', conceptId: '', profile: PROFILES.transit_hub },
    'مشاور املاک': { engineType: 'services', conceptId: 'realestate', profile: null },
    'مصالح و تجهیزات ساختمانی': { engineType: 'services', conceptId: '', profile: PROFILES.construction_mat },
    'مراکز آموزشی رسمی': { engineType: 'education', conceptId: '', profile: PROFILES.school_formal },
    'آموزشگاه‌ها و مهارت‌آموزی': { engineType: 'education', conceptId: 'language', profile: null },
    'خدمات حقوقی و مالی': { engineType: 'services', conceptId: 'law', profile: null },
    'خدمات فنی و اداری': { engineType: 'services', conceptId: 'print', profile: null },
    'کارگاه و کارخانه': { engineType: 'services', conceptId: '', profile: PROFILES.industry },
    'بانک و موسسات مالی': { engineType: 'services', conceptId: '', profile: PROFILES.bank_branch },
    'نمایندگی بیمه': { engineType: 'services', conceptId: 'insurance', profile: null },
    'ادارات و سازمان‌ها': { engineType: 'services', conceptId: '', profile: PROFILES.public_gov },
    'باشگاه‌ها و اماکن ورزشی': { engineType: 'fitness', conceptId: 'gym', profile: null },
    'مراکز تفریحی': { engineType: 'fitness', conceptId: '', profile: PROFILES.amusement },
    'گردشگری و اقامت': { engineType: 'services', conceptId: '', profile: PROFILES.hotel },
    'فرهنگی و هنری': { engineType: 'education', conceptId: 'art', profile: null },
    'اماکن مذهبی': { engineType: 'services', conceptId: '', profile: PROFILES.religious },
    'نهادهای اجتماعی': { engineType: 'services', conceptId: '', profile: PROFILES.social_ngo },
    'پارک و فضای سبز': { engineType: 'fitness', conceptId: '', profile: PROFILES.parks_nature },
    'مجتمع‌های مسکونی': { engineType: 'services', conceptId: '', profile: PROFILES.residential },
    'سایر موارد': { engineType: 'services', conceptId: '', profile: PROFILES.other_general }
  };

  var SUBSUB_MAP = {
    'رستوران سنتی و چلوکبابی': { engineType: 'restaurant', conceptId: 'traditional', profile: null },
    'فست‌فود و برگر': { engineType: 'restaurant', conceptId: 'fastfood', profile: null },
    'پیتزا و ایتالیایی': { engineType: 'restaurant', conceptId: 'pizza', profile: null },
    'رستوران ایرانی و محلی': { engineType: 'restaurant', conceptId: 'family', profile: null },
    'کترینگ و تهیه غذا': { engineType: 'restaurant', conceptId: 'lunch', profile: null },
    'کافه تخصصی': { engineType: 'cafe', conceptId: 'specialty', profile: null },
    'کافه رستوران': { engineType: 'cafe', conceptId: 'cafe_restaurant', profile: null },
    'چایخانه سنتی': { engineType: 'cafe', conceptId: 'teahouse', profile: null },
    'بستنی و آبمیوه': { engineType: 'cafe', conceptId: 'dessert', profile: null },
    'قنادی و شیرینی‌فروشی': { engineType: 'grocery', conceptId: 'pastry', profile: null },
    'نانوایی سنتی و فانتزی': { engineType: 'grocery', conceptId: 'bakery', profile: null },
    'آجیل و خشکبار': { engineType: 'grocery', conceptId: 'nuts', profile: null },
    'سوپرمارکت و هایپرمارکت': { engineType: 'grocery', conceptId: 'supermarket', profile: null },
    'میوه و سبزی‌فروشی': { engineType: 'grocery', conceptId: 'produce', profile: null },
    'پروتئینی (گوشت و مرغ)': { engineType: 'grocery', conceptId: 'butcher', profile: null },
    'لبنیات سنتی': { engineType: 'grocery', conceptId: 'dairy', profile: null },
    'پوشاک مردانه و زنانه': { engineType: 'fashion', conceptId: 'women', profile: null },
    'کیف و کفش': { engineType: 'fashion', conceptId: 'shoes', profile: null },
    'پوشاک کودک': { engineType: 'fashion', conceptId: 'kids', profile: null },
    'خرازی و لوازم خیاطی': { engineType: 'fashion', conceptId: 'tailor', profile: null },
    'لوازم خانگی برقی': { engineType: 'fashion', conceptId: '', profile: PROFILES.home_appliances },
    'موبایل و کامپیوتر': { engineType: 'services', conceptId: 'mobile', profile: null },
    'صوتی و تصویری': { engineType: 'fashion', conceptId: '', profile: PROFILES.audio_video },
    'پاساژ و مرکز خرید': { engineType: 'fashion', conceptId: '', profile: PROFILES.malls_dept },
    'فروشگاه زنجیره‌ای': { engineType: 'grocery', conceptId: 'hyper', profile: null },
    'داروخانه روزانه و شبانه‌روزی': { engineType: 'pharmacy', conceptId: 'night', profile: null },
    'تجهیزات پزشکی و ارتوپدی': { engineType: 'pharmacy', conceptId: 'equipment', profile: null },
    'عطاری و گیاهان دارویی': { engineType: 'pharmacy', conceptId: 'herbal_ph', profile: null },
    'مطب پزشکان متخصص': { engineType: 'clinic', conceptId: 'gp', profile: null },
    'کلینیک تخصصی و درمانگاه': { engineType: 'clinic', conceptId: 'poly', profile: null },
    'بیمارستان و مرکز جراحی': { engineType: 'clinic', conceptId: 'surgery', profile: null },
    'آزمایشگاه تشخیص طبی': { engineType: 'clinic', conceptId: 'lab', profile: null },
    'رادیولوژی و سونوگرافی': { engineType: 'clinic', conceptId: 'imaging', profile: null },
    'آرایشگاه زنانه': { engineType: 'beauty', conceptId: 'women_salon', profile: null },
    'آرایشگاه مردانه (باربر)': { engineType: 'beauty', conceptId: 'barber', profile: null },
    'سالن خدمات ناخن و مژه': { engineType: 'beauty', conceptId: 'nails', profile: null },
    'لوازم آرایشی و مراقبت پوست': { engineType: 'beauty', conceptId: 'cosmetics', profile: null },
    'عطر و ادکلن': { engineType: 'beauty', conceptId: 'perfume', profile: null },
    'مرکز ماساژ و اسپا': { engineType: 'beauty', conceptId: 'spa', profile: null },
    'کلینیک پوست و لیزر': { engineType: 'beauty', conceptId: 'skin', profile: null },
    'تعمیرگاه و مکانیکی': { engineType: 'services', conceptId: '', profile: PROFILES.auto_repair },
    'کارواش و آپاراتی': { engineType: 'services', conceptId: '', profile: PROFILES.carwash },
    'لوازم یدکی خودرو': { engineType: 'services', conceptId: '', profile: PROFILES.auto_parts },
    'پمپ بنزین و گاز (CNG)': { engineType: 'services', conceptId: '', profile: PROFILES.fuel_ev },
    'ایستگاه شارژ خودرو برقی': { engineType: 'services', conceptId: '', profile: PROFILES.fuel_ev },
    'ایستگاه مترو و اتوبوس': { engineType: 'services', conceptId: '', profile: PROFILES.transit_hub },
    'تاکسی سرویس و آژانس': { engineType: 'services', conceptId: '', profile: PROFILES.taxi_agency },
    'باربری و پست': { engineType: 'services', conceptId: 'courier', profile: null },
    'بنگاه معاملات ملکی': { engineType: 'services', conceptId: 'realestate', profile: null },
    'دفتر ساختمانی و مهندسی': { engineType: 'services', conceptId: '', profile: PROFILES.engineering },
    'آهن‌آلات و مصالح': { engineType: 'services', conceptId: '', profile: PROFILES.construction_mat },
    'لوازم بهداشتی ساختمان': { engineType: 'services', conceptId: '', profile: PROFILES.interior_decor },
    'دکوراسیون داخلی': { engineType: 'services', conceptId: '', profile: PROFILES.interior_decor },
    'مدرسه (دبستان تا دبیرستان)': { engineType: 'education', conceptId: '', profile: PROFILES.school_formal },
    'دانشگاه و موسسه آموزش عالی': { engineType: 'education', conceptId: '', profile: PROFILES.university_formal },
    'آموزشگاه زبان خارجی': { engineType: 'education', conceptId: 'language', profile: null },
    'آموزشگاه کامپیوتر و فناوری': { engineType: 'education', conceptId: 'programming', profile: null },
    'آموزشگاه هنرهای تجسمی و موسیقی': { engineType: 'education', conceptId: 'art', profile: null },
    'دفتر وکالت و مشاوره حقوقی': { engineType: 'services', conceptId: 'law', profile: null },
    'حسابداری و حسابرسی': { engineType: 'services', conceptId: 'accounting', profile: null },
    'دفتر اسناد رسمی (محضر)': { engineType: 'services', conceptId: 'notary', profile: null },
    'چاپخانه و تکثیر': { engineType: 'services', conceptId: 'print', profile: null },
    'دفتر فنی و مهندسی': { engineType: 'services', conceptId: 'coworking', profile: null },
    'ترجمه رسمی': { engineType: 'services', conceptId: 'notary', profile: null },
    'کارگاه تولیدی صنعتی': { engineType: 'services', conceptId: '', profile: PROFILES.industry },
    'انبار و سردخانه': { engineType: 'services', conceptId: '', profile: PROFILES.warehouse },
    'شعبه بانکی': { engineType: 'services', conceptId: '', profile: PROFILES.bank_branch },
    'صرافی و خدمات ارزی': { engineType: 'services', conceptId: '', profile: PROFILES.currency_exchange },
    'بیمه ایران، آسیا، دانا و...': { engineType: 'services', conceptId: 'insurance', profile: null },
    'کارگزاری بیمه': { engineType: 'services', conceptId: 'insurance', profile: null },
    'شهرداری و فرمانداری': { engineType: 'services', conceptId: '', profile: PROFILES.public_gov },
    'کلانتری و راهنمایی و رانندگی': { engineType: 'services', conceptId: '', profile: PROFILES.public_gov },
    'اداره مالیات و تامین اجتماعی': { engineType: 'services', conceptId: '', profile: PROFILES.public_gov },
    'باشگاه بدنسازی و فیتنس': { engineType: 'fitness', conceptId: 'gym', profile: null },
    'استخر و مجموعه آبی': { engineType: 'fitness', conceptId: 'pool', profile: null },
    'سالن ورزشی چندمنظوره': { engineType: 'fitness', conceptId: 'hall', profile: null },
    'شهربازی و سالن بازی': { engineType: 'fitness', conceptId: '', profile: PROFILES.amusement },
    'سینما و تئاتر': { engineType: 'fitness', conceptId: '', profile: PROFILES.cinema },
    'آژانس مسافرتی و تور': { engineType: 'services', conceptId: 'travel', profile: null },
    'هتل و مهمان‌پذیر': { engineType: 'services', conceptId: '', profile: PROFILES.hotel },
    'جاذبه گردشگری و موزه': { engineType: 'services', conceptId: '', profile: PROFILES.museum },
    'گالری هنری و نگارخانه': { engineType: 'education', conceptId: 'art', profile: null },
    'کتابخانه عمومی': { engineType: 'education', conceptId: 'study', profile: null },
    'مسجد و حسینیه': { engineType: 'services', conceptId: '', profile: PROFILES.religious },
    'امامزاده و زیارتگاه': { engineType: 'services', conceptId: '', profile: PROFILES.religious },
    'خیریه و سمن (NGO)': { engineType: 'services', conceptId: '', profile: PROFILES.social_ngo },
    'دفتر انجمن‌های مردمی': { engineType: 'services', conceptId: '', profile: PROFILES.social_ngo },
    'پارک شهری و جنگلی': { engineType: 'fitness', conceptId: '', profile: PROFILES.parks_nature },
    'میدان و فضای سبز عمومی': { engineType: 'fitness', conceptId: '', profile: PROFILES.parks_nature },
    'مجتمع آپارتمانی': { engineType: 'services', conceptId: '', profile: PROFILES.residential },
    'شهرک مسکونی': { engineType: 'services', conceptId: '', profile: PROFILES.residential },
    'ثبت‌نشده (UNMAPPED)': { engineType: 'services', conceptId: '', profile: PROFILES.other_general },
    'نیازمند بازبینی (REVIEW_RAW_LABEL)': { engineType: 'services', conceptId: '', profile: PROFILES.other_general },
    'تأییدشده خودکار (RULE_MAPPED)': { engineType: 'services', conceptId: '', profile: PROFILES.other_general }
  };

  var ENGINE_TO_TAX = {
    restaurant: { mainId: 'food_drink', subFa: 'رستوران و کترینگ', subSubFa: '' },
    cafe: { mainId: 'food_drink', subFa: 'کافه و کافی‌شاپ', subSubFa: '' },
    grocery: { mainId: 'retail_shopping', subFa: 'سوپرمارکت و مواد غذایی', subSubFa: '' },
    fashion: { mainId: 'retail_shopping', subFa: 'پوشاک و مد', subSubFa: '' },
    beauty: { mainId: 'beauty_hygiene', subFa: 'سالن‌های زیبایی', subSubFa: '' },
    pharmacy: { mainId: 'health_medical', subFa: 'داروخانه و تجهیزات پزشکی', subSubFa: '' },
    clinic: { mainId: 'health_medical', subFa: 'مراکز درمانی و مطب‌ها', subSubFa: '' },
    fitness: { mainId: 'sports_recreation', subFa: 'باشگاه‌ها و اماکن ورزشی', subSubFa: '' },
    education: { mainId: 'education_research', subFa: 'آموزشگاه‌ها و مهارت‌آموزی', subSubFa: '' },
    services: { mainId: 'professional_services', subFa: '', subSubFa: '' }
  };

  function findMainById(id) {
    return TAXONOMY_17.filter(function (c) { return c.id === id; })[0] || null;
  }

  function findSubIn(main, subName) {
    if (!main || !subName) return null;
    var q = String(subName).toLowerCase().trim();
    for (var i = 0; i < main.subs.length; i++) {
      var s = main.subs[i];
      if (s.fa.toLowerCase().trim() === q || s.en.toLowerCase().trim() === q) return s;
    }
    return null;
  }

  function resolveSelection(mainId, subName, subSubName) {
    var main = findMainById(mainId) || TAXONOMY_17[0];
    var sub = findSubIn(main, subName);
    var ss = String(subSubName || '').trim();
    if (!sub && ss) {
      for (var i = 0; i < main.subs.length; i++) {
        if (main.subs[i].subsubs.indexOf(ss) >= 0) { sub = main.subs[i]; break; }
      }
    }
    var cfg = (ss && SUBSUB_MAP[ss]) || (sub && SUB_MAP[sub.fa]) || MAIN_MAP[main.id] || { engineType: 'services', conceptId: '', profile: null };
    var labelFa = ss || (sub ? sub.fa : main.fa);
    var labelEn = (ss && SUBSUB_EN[ss]) || (sub ? sub.en : main.en);
    return {
      main: main,
      sub: sub,
      mainId: main.id,
      mainFa: main.fa,
      mainEn: main.en,
      subFa: sub ? sub.fa : '',
      subEn: sub ? sub.en : '',
      subSubFa: ss,
      subSubEn: ss ? (SUBSUB_EN[ss] || ss) : '',
      labelFa: labelFa,
      labelEn: labelEn,
      engineType: cfg.engineType,
      conceptId: cfg.conceptId || '',
      profile: cfg.profile || null
    };
  }

  root.GA_POI_TAXONOMY = {
    categories: TAXONOMY_17,
    subSubEn: SUBSUB_EN,
    findMain: findMainById,
    resolve: resolveSelection,
    findByEngineType: function (engineType, conceptId) {
      if (conceptId) {
        var keys = Object.keys(SUBSUB_MAP);
        for (var i = 0; i < keys.length; i++) {
          var m = SUBSUB_MAP[keys[i]];
          if (m.engineType === engineType && m.conceptId === conceptId) {
            for (var j = 0; j < TAXONOMY_17.length; j++) {
              var cat = TAXONOMY_17[j];
              for (var k = 0; k < cat.subs.length; k++) {
                if (cat.subs[k].subsubs.indexOf(keys[i]) >= 0) {
                  return { mainId: cat.id, subFa: cat.subs[k].fa, subSubFa: keys[i] };
                }
              }
            }
          }
        }
      }
      return ENGINE_TO_TAX[engineType] || { mainId: 'food_drink', subFa: 'کافه و کافی‌شاپ', subSubFa: '' };
    },
    searchPath: function (query) {
      var q = String(query || '').toLowerCase().trim();
      if (!q) return [];
      var results = [];
      TAXONOMY_17.forEach(function (m) {
        m.subs.forEach(function (sub) {
          sub.subsubs.forEach(function (ss) {
            var ssEn = (SUBSUB_EN[ss] || '').toLowerCase();
            if (m.fa.toLowerCase().includes(q) || sub.fa.toLowerCase().includes(q) || ss.toLowerCase().includes(q) || m.en.toLowerCase().includes(q) || sub.en.toLowerCase().includes(q) || ssEn.includes(q)) {
              results.push({ mainId: m.id, mainFa: m.fa, subFa: sub.fa, subSubFa: ss, path: m.fa + ' ← ' + sub.fa + ' ← ' + ss });
            }
          });
        });
      });
      return results;
    }
  };
})(typeof window !== 'undefined' ? window : globalThis);
