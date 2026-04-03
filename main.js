/* ============================================================
   SNAPIR DESIGN — main.js
   Translations · Animations · Interactions
   ============================================================ */

'use strict';

/* ──────────────────────────────────────────────────────────
   TRANSLATIONS
────────────────────────────────────────────────────────── */
const translations = {

  en: {
    'nav.home':     'Home',
    'nav.services': 'Services',
    'nav.process':  'Process',
    'nav.software': 'Software',
    'nav.about':    'About',
    'nav.contact':  'Contact',

    'hero.eyebrow': '3D Measurement Studio — Bulgaria',
    'hero.headline':'Precision 3D Scanning for Construction Excellence',
    'hero.sub':     'We transform real-world structures into exact digital CAD models using LiDAR technology — powering construction and manufacturing worldwide.',
    'hero.cta1':    'Our Services',
    'hero.cta2':    'See Our Process',
    'hero.stat1':   'Scan accuracy',
    'hero.stat2':   'Points per scan',
    'hero.stat3':   'Expert tools',

    'services.label':       'What We Do',
    'services.heading':     'Precision Services',
    'services.desc':        'From on-site capture to final deliverables — a complete scanning and reverse engineering pipeline.',
    'services.card1.title': 'LiDAR 3D Scanning',
    'services.card1.desc':  'On-site capture of any structure with millimeter precision using the FARO Focus LiDAR scanner — millions of data points in minutes.',
    'services.card2.title': 'Point Cloud Processing',
    'services.card2.desc':  'Registration, cleaning, and alignment of all scans into a single unified point cloud using FARO Scene software.',
    'services.card3.title': 'Reverse Engineering',
    'services.card3.desc':  'Converting scan data into precise, feature-based parametric CAD models using Geomagic Design X — surfaces, solids, and mesh-to-CAD.',
    'services.card4.title': 'Engineering Deliverables',
    'services.card4.desc':  'Final 3D models, assembly designs, and detailed engineering drawings in SolidWorks — ready for manufacturing and construction.',

    'process.label':       'How We Work',
    'process.heading':     'Our Workflow',
    'process.desc':        'A precise five-step pipeline from physical reality to digital precision.',
    'process.step1.title': 'On-Site Capture',
    'process.step1.desc':  'FARO Focus LiDAR scanner captures millions of data points in minutes with millimeter accuracy.',
    'process.step2.title': 'Point Cloud Processing',
    'process.step2.desc':  'FARO Scene registers, cleans, and aligns all scans into one coherent, precise point cloud.',
    'process.step3.title': 'Reverse Engineering',
    'process.step3.desc':  'Geomagic Design X converts the point cloud into parametric, feature-based CAD models.',
    'process.step4.title': 'Engineering & Detailing',
    'process.step4.desc':  'SolidWorks finalizes 3D assemblies and produces detailed engineering drawings.',
    'process.step5.title': 'Delivery',
    'process.step5.desc':  'Clients receive accurate measurements and models ready for manufacturing and construction.',

    'software.label':          'Our Technology',
    'software.heading':        'Tools We Use',
    'software.desc':           'Industry-leading software at every stage of the 3D scanning pipeline.',
    'software.faro.role':      'Point Cloud Registration & Processing',
    'software.faro.desc':      'We use FARO Scene to register, process, and align multiple LiDAR scans into a single, coherent point cloud model ready for reverse engineering.',
    'software.geomagic.role':  'Scan-to-CAD / Reverse Engineering',
    'software.geomagic.desc':  'The industry standard for converting point cloud data into precise, feature-based parametric CAD models — the core of our reverse engineering workflow.',
    'software.solidworks.role':'3D CAD, Assemblies & Engineering Drawings',
    'software.solidworks.desc':'Final 3D modeling, assembly design, and detailed engineering drawings used directly by clients for manufacturing and construction.',

    'about.label':  'Who We Are',
    'about.heading':'About Snapir Design',
    'about.p1':          'Founded in 2016 by Ihsan Serbest, Snapir Design is a Bulgaria-based 3D engineering studio specializing in LiDAR scanning and reverse engineering for construction and manufacturing industries.',
    'about.p2':          'Our primary partner is Snapir — an Israeli leader in precision aluminum construction products including gates, fences, banisters, and architectural elements for private, commercial, and public clients.',
    'about.p3':          'We bridge advanced scanning technology with construction precision — turning real-world structures into exact digital models that power manufacturing and building projects. We are open to new clients globally.',
    'about.founderLabel':'Founder',
    'about.founderSince':'Since 2016',
    'about.badge1':      'Based in Bulgaria',
    'about.badge2':      'Serving clients worldwide',

    'clients.label':           'Our Partners',
    'clients.heading':         'Trusted By',
    'clients.snapir.tag':      'Primary Partner',
    'clients.snapir.country':  'Israel',
    'clients.snapir.desc':     'An established Israeli manufacturer producing high-quality aluminum gates, fences, banisters, and architectural metalwork for private, commercial, and public construction. Precise measurements are the foundation of every product they deliver.',
    'clients.snapir.industry': 'Architectural Metalwork · Aluminum Construction',
    'clients.open.title':      'Open to New Clients',
    'clients.open.desc':       'We work with manufacturers, construction firms, and engineering studios worldwide. Whether you need a single scan or an ongoing partnership — we deliver precision.',
    'clients.open.btn':        'Get In Touch',

    'contact.label':       'Contact',
    'contact.heading':     'Get In Touch',
    'contact.sub':         'Ready to start your next project? Send us a message and we\'ll respond promptly.',
    'contact.location':    'Based in Bulgaria, serving clients worldwide',
    'contact.name':        'Name',
    'contact.namePh':      'Your full name',
    'contact.company':     'Company',
    'contact.companyPh':   'Your company (optional)',
    'contact.email':       'Email',
    'contact.emailPh':     'your@email.com',
    'contact.message':     'Message',
    'contact.messagePh':   'Tell us about your project...',
    'contact.submit':      'Send Message',
    'contact.successTitle':'Message Sent',
    'contact.successText': 'Thank you! We\'ll be in touch with you shortly.',

    'footer.tagline':  '3D Scanning & Reverse Engineering',
    'footer.rights':   '© 2025 Snapir Design. All rights reserved.',
    'footer.location': 'Bulgaria',
  },

  bg: {
    'nav.home':     'Начало',
    'nav.services': 'Услуги',
    'nav.process':  'Процес',
    'nav.software': 'Софтуер',
    'nav.about':    'За нас',
    'nav.contact':  'Контакти',

    'hero.eyebrow': 'Студио за 3D измервания — България',
    'hero.headline':'Прецизно 3D лазерно сканиране за строително съвършенство',
    'hero.sub':     'Превръщаме реални обекти в точни CAD модели чрез LiDAR технология — за производство и строителство по целия свят.',
    'hero.cta1':    'Нашите услуги',
    'hero.cta2':    'Вижте процеса',
    'hero.stat1':   'Точност на сканиране',
    'hero.stat2':   'Точки на сканиране',
    'hero.stat3':   'Експертни инструменти',

    'services.label':       'Какво правим',
    'services.heading':     'Прецизни услуги',
    'services.desc':        'От заснемане на обекта до финална документация — пълен тръбопровод за сканиране и обратно инженерство.',
    'services.card1.title': 'LiDAR 3D лазерно сканиране',
    'services.card1.desc':  'Заснемане на всякакви обекти с милиметрова точност чрез скенера FARO Focus LiDAR — милиони точки за минути.',
    'services.card2.title': 'Обработка на облак от точки',
    'services.card2.desc':  'Регистрация, почистване и изравняване на всички сканирания в един унифициран облак от точки чрез FARO Scene.',
    'services.card3.title': 'Обратно инженерство',
    'services.card3.desc':  'Преобразуване на сканирани данни в прецизни параметрични CAD модели с Geomagic Design X — повърхнини, тела и mesh-to-CAD.',
    'services.card4.title': 'Инженерна документация',
    'services.card4.desc':  'Финални 3D модели, монтажни схеми и детайлни инженерни чертежи в SolidWorks — готови за производство и строителство.',

    'process.label':       'Как работим',
    'process.heading':     'Нашият работен процес',
    'process.desc':        'Прецизен петстепенен тръбопровод — от физическата реалност до цифровата точност.',
    'process.step1.title': 'Заснемане на обекта',
    'process.step1.desc':  'Скенерът FARO Focus LiDAR заснема милиони точки за минути с милиметрова точност.',
    'process.step2.title': 'Обработка на облака от точки',
    'process.step2.desc':  'FARO Scene регистрира, почиства и изравнява всички сканирания в един съгласуван облак от точки.',
    'process.step3.title': 'Обратно инженерство',
    'process.step3.desc':  'Geomagic Design X преобразува облака от точки в параметрични CAD модели с характеристики.',
    'process.step4.title': 'Инженерство и детайлиране',
    'process.step4.desc':  'SolidWorks финализира 3D монтажните схеми и изготвя детайлни инженерни чертежи.',
    'process.step5.title': 'Доставка',
    'process.step5.desc':  'Клиентите получават точни измервания и модели, готови за производство и строителство.',

    'software.label':          'Нашите технологии',
    'software.heading':        'Инструменти, които използваме',
    'software.desc':           'Водещ в индустрията софтуер на всеки етап от тръбопровода за 3D сканиране.',
    'software.faro.role':      'Регистрация и обработка на облак от точки',
    'software.faro.desc':      'Използваме FARO Scene за регистрация, обработка и изравняване на множество LiDAR сканирания в единен, съгласуван облак от точки.',
    'software.geomagic.role':  'Scan-to-CAD / Обратно инженерство',
    'software.geomagic.desc':  'Индустриалният стандарт за преобразуване на данни от облак от точки в прецизни параметрични CAD модели — ядрото на нашия работен процес.',
    'software.solidworks.role':'3D CAD, монтажни схеми и инженерни чертежи',
    'software.solidworks.desc':'Финален 3D модел, монтажно проектиране и детайлни инженерни чертежи, използвани директно от клиентите.',

    'about.label':       'Кои сме ние',
    'about.heading':     'За Snapir Design',
    'about.p1':          'Основана през 2016 г. от Ихсан Сербест, Snapir Design е студио за 3D инженерство, базирано в България, специализирано в LiDAR сканиране и обратно инженерство за строителната и производствената индустрия.',
    'about.p2':          'Нашият основен партньор е Snapir — израелски лидер в прецизни алуминиеви конструкционни продукти, включително порти, огради, парапети и архитектурни елементи.',
    'about.p3':          'Свързваме съвременната технология за сканиране с конструкционна прецизност — превръщаме реални обекти в точни цифрови модели, захранващи производствени и строителни проекти. Отворени сме за нови клиенти по целия свят.',
    'about.founderLabel':'Основател',
    'about.founderSince':'От 2016 г.',
    'about.badge1':      'Базирани в България',
    'about.badge2':      'Обслужваме клиенти по целия свят',

    'clients.label':           'Нашите партньори',
    'clients.heading':         'Доверяват ни се',
    'clients.snapir.tag':      'Основен партньор',
    'clients.snapir.country':  'Израел',
    'clients.snapir.desc':     'Утвърден израелски производител на висококачествени алуминиеви порти, огради, парапети и архитектурни метални конструкции за частни, търговски и обществени строителни проекти. Точните измервания са в основата на всеки техен продукт.',
    'clients.snapir.industry': 'Архитектурни метални конструкции · Алуминиево строителство',
    'clients.open.title':      'Отворени за нови клиенти',
    'clients.open.desc':       'Работим с производители, строителни фирми и инженерни студия по целия свят. Независимо дали ви трябва едно сканиране или дългосрочно партньорство — ние доставяме прецизност.',
    'clients.open.btn':        'Свържете се с нас',

    'contact.label':       'Контакти',
    'contact.heading':     'Свържете се с нас',
    'contact.sub':         'Готови ли сте да започнете следващия си проект? Изпратете ни съобщение и ще отговорим своевременно.',
    'contact.location':    'Базирани в България, обслужваме клиенти по целия свят',
    'contact.name':        'Имe',
    'contact.namePh':      'Вашето пълно имe',
    'contact.company':     'Компания',
    'contact.companyPh':   'Вашата компания (по желание)',
    'contact.email':       'Имейл',
    'contact.emailPh':     'вашият@имейл.com',
    'contact.message':     'Съобщение',
    'contact.messagePh':   'Разкажете ни за вашия проект...',
    'contact.submit':      'Изпрати съобщение',
    'contact.successTitle':'Съобщението е изпратено',
    'contact.successText': 'Благодарим ви! Ще се свържем с вас скоро.',

    'footer.tagline':  '3D сканиране и обратно инженерство',
    'footer.rights':   '© 2025 Snapir Design. Всички права запазени.',
    'footer.location': 'България',
  },

  he: {
    'nav.home':     'בית',
    'nav.services': 'שירותים',
    'nav.process':  'תהליך',
    'nav.software': 'תוכנה',
    'nav.about':    'אודות',
    'nav.contact':  'צרו קשר',

    'hero.eyebrow': 'סטודיו למדידות תלת-ממדיות — בולגריה',
    'hero.headline':'סריקת לייזר תלת-ממדית מדויקת לצוינות בבנייה',
    'hero.sub':     'אנו הופכים מבנים אמיתיים לדגמי CAD מדויקים בטכנולוגיית LiDAR — לייצור ובנייה ברחבי העולם.',
    'hero.cta1':    'השירותים שלנו',
    'hero.cta2':    'ראו את התהליך',
    'hero.stat1':   'דיוק הסריקה',
    'hero.stat2':   'נקודות לסריקה',
    'hero.stat3':   'כלים מקצועיים',

    'services.label':       'מה אנו עושים',
    'services.heading':     'שירותים מדויקים',
    'services.desc':        'מתיעוד באתר ועד תוצרים סופיים — צינור עבודה שלם לסריקה והנדסה לאחור.',
    'services.card1.title': 'סריקת לייזר תלת-ממדית LiDAR',
    'services.card1.desc':  'תיעוד כל מבנה באתר בדיוק מילימטרי באמצעות סורק FARO Focus LiDAR — מיליוני נקודות בדקות.',
    'services.card2.title': 'עיבוד עננת נקודות',
    'services.card2.desc':  'רישום, ניקוי ויישור כל הסריקות לעננת נקודות מאוחדת אחת באמצעות תוכנת FARO Scene.',
    'services.card3.title': 'הנדסה לאחור',
    'services.card3.desc':  'המרת נתוני סריקה לדגמי CAD פרמטריים מדויקים ב-Geomagic Design X — משטחים, גופים ו-Mesh-to-CAD.',
    'services.card4.title': 'תוצרים הנדסיים',
    'services.card4.desc':  'דגמים תלת-ממדיים סופיים, עיצוב מכלולים ושרטוטים הנדסיים מפורטים ב-SolidWorks — מוכנים לייצור ובנייה.',

    'process.label':       'איך אנו עובדים',
    'process.heading':     'תהליך העבודה שלנו',
    'process.desc':        'צינור עבודה מדויק בחמישה שלבים — מהמציאות הפיזית לדיוק דיגיטלי.',
    'process.step1.title': 'תיעוד באתר',
    'process.step1.desc':  'סורק FARO Focus LiDAR לוכד מיליוני נקודות בדקות בדיוק מילימטרי.',
    'process.step2.title': 'עיבוד עננת נקודות',
    'process.step2.desc':  'FARO Scene מרשם, מנקה ומיישר את כל הסריקות לעננת נקודות אחת ומדויקת.',
    'process.step3.title': 'הנדסה לאחור',
    'process.step3.desc':  'Geomagic Design X ממיר את עננת הנקודות לדגמי CAD פרמטריים עם מאפיינים.',
    'process.step4.title': 'הנדסה ופירוט',
    'process.step4.desc':  'SolidWorks מסיים מכלולים תלת-ממדיים ומפיק שרטוטים הנדסיים מפורטים.',
    'process.step5.title': 'מסירה',
    'process.step5.desc':  'הלקוחות מקבלים מדידות ודגמים מדויקים המוכנים לייצור ובנייה.',

    'software.label':          'הטכנולוגיה שלנו',
    'software.heading':        'הכלים בהם אנו משתמשים',
    'software.desc':           'תוכנות מובילות בתעשייה בכל שלב של צינור הסריקה התלת-ממדית.',
    'software.faro.role':      'רישום ועיבוד עננת נקודות',
    'software.faro.desc':      'אנו משתמשים ב-FARO Scene לרישום, עיבוד ויישור סריקות LiDAR מרובות לדגם עננת נקודות מאוחד ומוכן להנדסה לאחור.',
    'software.geomagic.role':  'Scan-to-CAD / הנדסה לאחור',
    'software.geomagic.desc':  'הסטנדרט התעשייתי להמרת נתוני עננת נקודות לדגמי CAD פרמטריים מדויקים — ליבת תהליך ההנדסה לאחור שלנו.',
    'software.solidworks.role':'CAD תלת-ממדי, מכלולים ושרטוטים הנדסיים',
    'software.solidworks.desc':'דגום תלת-ממדי סופי, עיצוב מכלולים ושרטוטים הנדסיים מפורטים המשמשים ישירות את הלקוחות לייצור ובנייה.',

    'about.label':       'מי אנחנו',
    'about.heading':     'אודות Snapir Design',
    'about.p1':          'Snapir Design נוסדה בשנת 2016 על ידי איחסאן סרבסט, וממוקמת בבולגריה. הסטודיו מתמחה בסריקת LiDAR והנדסה לאחור לתעשיות הבנייה והייצור.',
    'about.p2':          'השותף העיקרי שלנו הוא Snapir — מוביל ישראלי במוצרי בנייה מאלומיניום מדויקים, כולל שערים, גדרות, מעקות ואלמנטים אדריכליים ללקוחות פרטיים, מסחריים וציבוריים.',
    'about.p3':          'אנו מגשרים בין טכנולוגיית סריקה מתקדמת לבין דיוק בנייה — הופכים מבנים אמיתיים לדגמים דיגיטליים מדויקים המניעים פרויקטי ייצור ובנייה. אנו פתוחים ללקוחות חדשים ברחבי העולם.',
    'about.founderLabel':'מייסד',
    'about.founderSince':'מאז 2016',
    'about.badge1':      'ממוקמים בבולגריה',
    'about.badge2':      'משרתים לקוחות ברחבי העולם',

    'clients.label':           'השותפים שלנו',
    'clients.heading':         'סומכים עלינו',
    'clients.snapir.tag':      'שותף עיקרי',
    'clients.snapir.country':  'ישראל',
    'clients.snapir.desc':     'יצרן ישראלי מבוסס המייצר שערים, גדרות, מעקות ואלמנטים אדריכליים מאלומיניום איכותיים לפרויקטי בנייה פרטיים, מסחריים וציבוריים. מדידות מדויקות הן הבסיס לכל מוצר שהם מספקים.',
    'clients.snapir.industry': 'עבודות מתכת אדריכליות · בנייה באלומיניום',
    'clients.open.title':      'פתוחים ללקוחות חדשים',
    'clients.open.desc':       'אנו עובדים עם יצרנים, חברות בנייה וסטודיות הנדסה ברחבי העולם. בין אם אתם זקוקים לסריקה אחת או לשותפות מתמשכת — אנו מספקים דיוק.',
    'clients.open.btn':        'צרו קשר',

    'contact.label':       'צור קשר',
    'contact.heading':     'צרו קשר',
    'contact.sub':         'מוכנים להתחיל את הפרויקט הבא שלכם? שלחו לנו הודעה ונחזור אליכם במהרה.',
    'contact.location':    'ממוקמים בבולגריה, משרתים לקוחות ברחבי העולם',
    'contact.name':        'שם',
    'contact.namePh':      'שם מלא',
    'contact.company':     'חברה',
    'contact.companyPh':   'שם החברה (אופציונלי)',
    'contact.email':       'אימייל',
    'contact.emailPh':     'your@email.com',
    'contact.message':     'הודעה',
    'contact.messagePh':   'ספרו לנו על הפרויקט שלכם...',
    'contact.submit':      'שלח הודעה',
    'contact.successTitle':'ההודעה נשלחה',
    'contact.successText': 'תודה! נחזור אליכם בהקדם.',

    'footer.tagline':  'סריקת לייזר תלת-ממדית והנדסה לאחור',
    'footer.rights':   '© 2025 Snapir Design. כל הזכויות שמורות.',
    'footer.location': 'בולגריה',
  },
};

/* ──────────────────────────────────────────────────────────
   LANGUAGE SWITCHER
────────────────────────────────────────────────────────── */
let currentLang = 'en';

function setLanguage(lang) {
  if (!translations[lang]) return;
  currentLang = lang;

  const html = document.documentElement;
  html.lang = lang;
  html.dir  = lang === 'he' ? 'rtl' : 'ltr';

  // Update all text nodes
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (translations[lang][key] !== undefined) {
      el.textContent = translations[lang][key];
    }
  });

  // Update placeholder attributes
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (translations[lang][key] !== undefined) {
      el.placeholder = translations[lang][key];
    }
  });

  // Update all lang-btn aria-pressed states
  document.querySelectorAll('.lang-btn').forEach(btn => {
    const pressed = btn.dataset.lang === lang;
    btn.setAttribute('aria-pressed', String(pressed));
    btn.classList.toggle('active', pressed);
  });

  // Re-run typewriter — typewrite() handles its own cancellation
  const headline = document.getElementById('hero-headline');
  if (headline) {
    const newText = translations[lang]['hero.headline'] || '';
    const textEl  = headline.querySelector('.headline-text');
    if (textEl) {
      headline.classList.add('typing');
      typewrite(textEl, newText, 38, () => {
        headline.classList.remove('typing');
      });
    }
  }

  localStorage.setItem('sd-lang', lang);
}

function initLangSwitcher() {
  // Detect stored or browser preference
  const stored   = localStorage.getItem('sd-lang');
  const browser  = navigator.language.slice(0, 2).toLowerCase();
  const detected = stored || (['bg', 'he'].includes(browser) ? browser : 'en');

  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => setLanguage(btn.dataset.lang));
  });

  if (detected !== 'en') {
    setLanguage(detected);
  }
}

/* ──────────────────────────────────────────────────────────
   TYPEWRITER — with cancellation to prevent race conditions
────────────────────────────────────────────────────────── */
let _twCancel = null; // global cancellation token

function typewrite(el, text, speed, onDone) {
  // Cancel any previous running typewriter
  if (_twCancel) { _twCancel.cancelled = true; }
  const token = { cancelled: false };
  _twCancel = token;

  let i = 0;
  el.textContent = '';

  function tick() {
    if (token.cancelled) return;
    if (i < text.length) {
      el.textContent += text[i++];
      setTimeout(tick, speed + Math.random() * 16);
    } else {
      _twCancel = null;
      if (onDone) onDone();
    }
  }
  tick();
}

function initTypewriter() {
  const headline = document.getElementById('hero-headline');
  if (!headline) return;

  const textEl = headline.querySelector('.headline-text');
  if (!textEl) return;

  const original = textEl.textContent.trim();
  textEl.textContent = '';
  headline.classList.add('typing');

  setTimeout(() => {
    typewrite(textEl, original, 38, () => {
      headline.classList.remove('typing');
    });
  }, 700);
}

/* Hero background is now pure CSS animated orbs — no JS needed */

/* ──────────────────────────────────────────────────────────
   PROGRESS BAR
────────────────────────────────────────────────────────── */
function initProgressBar() {
  const bar = document.getElementById('progress-bar');
  if (!bar) return;

  let ticking = false;

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const scrollTop  = window.scrollY;
        const docHeight  = document.documentElement.scrollHeight - window.innerHeight;
        const pct        = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
        bar.style.width  = `${pct}%`;
        bar.setAttribute('aria-valuenow', Math.round(pct));
        ticking = false;
      });
      ticking = true;
    }
  });
}

/* ──────────────────────────────────────────────────────────
   NAVBAR SCROLL BEHAVIOR
────────────────────────────────────────────────────────── */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  let lastScroll = 0;
  let ticking    = false;

  function update() {
    const y = window.scrollY;
    navbar.classList.toggle('scrolled', y > 40);
    lastScroll = y;
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(update);
      ticking = true;
    }
  }, { passive: true });

  // Initial check
  update();
}

/* ──────────────────────────────────────────────────────────
   MOBILE MENU
────────────────────────────────────────────────────────── */
function initMobileMenu() {
  const hamburger  = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');
  if (!hamburger || !mobileMenu) return;

  function closeMenu() {
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    mobileMenu.classList.remove('open');
    mobileMenu.setAttribute('aria-hidden', 'true');
  }

  hamburger.addEventListener('click', () => {
    const isOpen = hamburger.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', String(isOpen));
    mobileMenu.classList.toggle('open', isOpen);
    mobileMenu.setAttribute('aria-hidden', String(!isOpen));
  });

  // Close on link click
  mobileMenu.querySelectorAll('.mobile-nav-link').forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  // Close on outside click
  document.addEventListener('click', e => {
    if (!hamburger.contains(e.target) && !mobileMenu.contains(e.target)) {
      closeMenu();
    }
  });

  // Close on resize to desktop
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) closeMenu();
  });
}

/* ──────────────────────────────────────────────────────────
   SMOOTH SCROLL (nav links)
────────────────────────────────────────────────────────── */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const id = link.getAttribute('href').slice(1);
      if (!id) return;
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      const navH    = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 72;
      const top     = target.getBoundingClientRect().top + window.scrollY - navH;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
}

/* ──────────────────────────────────────────────────────────
   INTERSECTION OBSERVER (scroll animations)
────────────────────────────────────────────────────────── */
function initScrollAnimations() {
  // Hero elements — trigger immediately
  document.querySelectorAll('.animate-hero').forEach(el => {
    el.classList.add('visible');
  });

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
  );

  document.querySelectorAll('.animate-on-scroll, .animate-step').forEach(el => {
    io.observe(el);
  });
}

/* ──────────────────────────────────────────────────────────
   CONTACT FORM — Formspree
   Setup: go to https://formspree.io, sign up free, create a
   form for snapirdesignbg@gmail.com, then paste your Form ID
   (the part after /f/) into FORMSPREE_ID below.
────────────────────────────────────────────────────────── */
const FORMSPREE_ID = 'xvzvbebr';

function initContactForm() {
  const form    = document.getElementById('contact-form');
  const success = document.getElementById('form-success');
  if (!form || !success) return;

  function showSuccess() {
    form.hidden = true;
    success.removeAttribute('hidden');
    success.hidden = false;
    form.reset();
  }

  function showFieldError(field) {
    field.style.borderColor = '#C4973A';
    field.addEventListener('input', () => { field.style.borderColor = ''; }, { once: true });
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nameEl  = form.querySelector('#f-name');
    const emailEl = form.querySelector('#f-email');
    const msgEl   = form.querySelector('#f-message');
    const btn     = form.querySelector('button[type="submit"]');

    // Validate
    let valid = true;
    [nameEl, emailEl, msgEl].forEach(f => { if (f && !f.value.trim()) { showFieldError(f); valid = false; } });
    if (emailEl && emailEl.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailEl.value)) {
      showFieldError(emailEl); valid = false;
    }
    if (!valid) return;

    // Submit
    const origText    = btn ? btn.textContent : '';
    if (btn) { btn.disabled = true; btn.textContent = '···'; }

    try {
      const res = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
        method:  'POST',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name:    nameEl  ? nameEl.value.trim()  : '',
          company: (form.querySelector('#f-company') || {}).value || '',
          email:   emailEl ? emailEl.value.trim()  : '',
          message: msgEl   ? msgEl.value.trim()    : '',
        }),
      });

      if (res.ok) {
        showSuccess();
      } else {
        const data = await res.json().catch(() => ({}));
        const msg  = (data.errors || []).map(er => er.message).join(', ') || 'Submission failed. Please email us directly.';
        if (btn) { btn.disabled = false; btn.textContent = origText; }
        alert(msg);
      }
    } catch {
      // Network error fallback — open mail client
      if (btn) { btn.disabled = false; btn.textContent = origText; }
      const subject = encodeURIComponent('Inquiry from Snapir Design website');
      const body    = encodeURIComponent(
        `Name: ${nameEl?.value}\nEmail: ${emailEl?.value}\nMessage: ${msgEl?.value}`
      );
      window.location.href = `mailto:snapirdesignbg@gmail.com?subject=${subject}&body=${body}`;
    }
  });
}

/* ──────────────────────────────────────────────────────────
   MARQUEE — pause on reduced motion preference
────────────────────────────────────────────────────────── */
function initMarquee() {
  const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  const track = document.querySelector('.marquee-track');
  if (!track) return;

  function applyMotion(reduced) {
    track.style.animationPlayState = reduced ? 'paused' : 'running';
  }

  applyMotion(mq.matches);
  mq.addEventListener('change', e => applyMotion(e.matches));
}

/* ──────────────────────────────────────────────────────────
   ACTIVE NAV LINK HIGHLIGHT
────────────────────────────────────────────────────────── */
function initActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');
  const navH     = 80;

  const io = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          navLinks.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
          });
        }
      });
    },
    { rootMargin: `-${navH}px 0px -60% 0px`, threshold: 0 }
  );

  sections.forEach(s => io.observe(s));
}

/* ──────────────────────────────────────────────────────────
   INIT
────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initLangSwitcher();
  initTypewriter();
  initProgressBar();
  initNavbar();
  initMobileMenu();
  initSmoothScroll();
  initScrollAnimations();
  initContactForm();
  initMarquee();
  initActiveNav();
});
