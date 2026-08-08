// 15-language UI dictionary. US English is the default.
// Article body translation is handled at runtime via the AI server function.

export type LocaleCode =
  | "en-US" | "en-GB" | "es" | "fr" | "de" | "it" | "pt-BR"
  | "ja" | "zh" | "ko" | "ar" | "hi" | "ru" | "tr" | "nl";

export const LOCALES: { code: LocaleCode; label: string; native: string; flag: string; rtl?: boolean; region?: string }[] = [
  { code: "en-US", label: "English (US)", native: "English (US)", flag: "🇺🇸", region: "US" },
  { code: "en-GB", label: "English (UK)", native: "English (UK)", flag: "🇬🇧", region: "GB" },
  { code: "es",    label: "Spanish",      native: "Español",       flag: "🇪🇸", region: "ES" },
  { code: "fr",    label: "French",       native: "Français",      flag: "🇫🇷", region: "FR" },
  { code: "de",    label: "German",       native: "Deutsch",       flag: "🇩🇪", region: "DE" },
  { code: "it",    label: "Italian",      native: "Italiano",      flag: "🇮🇹", region: "IT" },
  { code: "pt-BR", label: "Portuguese (BR)", native: "Português (BR)", flag: "🇧🇷", region: "BR" },
  { code: "ja",    label: "Japanese",     native: "日本語",          flag: "🇯🇵", region: "JP" },
  { code: "zh",    label: "Chinese",      native: "中文",            flag: "🇨🇳", region: "CN" },
  { code: "ko",    label: "Korean",       native: "한국어",          flag: "🇰🇷", region: "KR" },
  { code: "ar",    label: "Arabic",       native: "العربية",         flag: "🇸🇦", region: "SA", rtl: true },
  { code: "hi",    label: "Hindi",        native: "हिन्दी",          flag: "🇮🇳", region: "IN" },
  { code: "ru",    label: "Russian",      native: "Русский",        flag: "🇷🇺", region: "RU" },
  { code: "tr",    label: "Turkish",      native: "Türkçe",         flag: "🇹🇷", region: "TR" },
  { code: "nl",    label: "Dutch",        native: "Nederlands",     flag: "🇳🇱", region: "NL" },
];

export const DEFAULT_LOCALE: LocaleCode = "en-US";

type Dict = Record<string, string>;

const en: Dict = {
  brand: "Atlas & Ember",
  tagline: "Stories from every corner of the world",
  nav_home: "Home",
  nav_about: "About",
  nav_contact: "Contact",
  nav_categories: "Categories",
  hero_kicker: "The world, in stories",
  hero_lead: "Travel, fashion, food, technology and culture — written for the curious, translated for everyone.",
  read_story: "Read the story",
  featured: "Featured",
  latest: "Latest stories",
  more_in: "More in",
  see_all: "See all",
  by: "by",
  min_read: "min read",
  translate_btn: "Translate this article",
  translating: "Translating…",
  translated_notice: "AI translation. Original written in English.",
  show_original: "Show original",
  newsletter_title: "The weekly dispatch",
  newsletter_lead: "One handpicked story, delivered to your inbox every Sunday.",
  newsletter_email: "Your email",
  newsletter_join: "Subscribe",
  ad_label: "Advertisement",
  about_title: "About Atlas & Ember",
  contact_title: "Get in touch",
  contact_lead: "Pitches, partnerships, press — we read everything.",
  send: "Send",
  name: "Name",
  email: "Email",
  message: "Message",
  search: "Search",
  rights: "All rights reserved.",
  language: "Language",
  not_found_title: "Page not found",
  back_home: "Back home",
};

// Native-language UI strings for the language switcher and core nav.
// Article bodies stay in English and are AI-translated on demand.
const overrides: Partial<Record<LocaleCode, Partial<Dict>>> = {
  "en-GB": { translated_notice: "AI translation. Original written in English." },
  es: { nav_home: "Inicio", nav_about: "Acerca", nav_contact: "Contacto", nav_categories: "Categorías", read_story: "Leer historia", featured: "Destacado", latest: "Últimas historias", more_in: "Más en", see_all: "Ver todo", by: "por", min_read: "min de lectura", translate_btn: "Traducir este artículo", translating: "Traduciendo…", show_original: "Ver original", newsletter_title: "El boletín semanal", newsletter_lead: "Una historia seleccionada, en tu bandeja cada domingo.", newsletter_email: "Tu correo", newsletter_join: "Suscribirme", ad_label: "Publicidad", contact_lead: "Propuestas, colaboraciones, prensa — leemos todo.", send: "Enviar", name: "Nombre", email: "Correo", message: "Mensaje", search: "Buscar", rights: "Todos los derechos reservados.", language: "Idioma", not_found_title: "Página no encontrada", back_home: "Volver al inicio", hero_kicker: "El mundo, en historias", hero_lead: "Viajes, moda, comida, tecnología y cultura — para los curiosos, traducidos para todos." },
  fr: { nav_home: "Accueil", nav_about: "À propos", nav_contact: "Contact", nav_categories: "Catégories", read_story: "Lire l'article", featured: "À la une", latest: "Derniers articles", more_in: "Plus dans", see_all: "Tout voir", by: "par", min_read: "min de lecture", translate_btn: "Traduire cet article", translating: "Traduction…", show_original: "Voir l'original", newsletter_title: "La dépêche hebdomadaire", newsletter_lead: "Une histoire choisie, livrée chaque dimanche.", newsletter_email: "Votre e-mail", newsletter_join: "S'abonner", ad_label: "Publicité", send: "Envoyer", name: "Nom", email: "E-mail", message: "Message", search: "Rechercher", rights: "Tous droits réservés.", language: "Langue", not_found_title: "Page introuvable", back_home: "Retour à l'accueil", hero_kicker: "Le monde, en récits", hero_lead: "Voyage, mode, gastronomie, technologie et culture — écrits pour les curieux, traduits pour tous." },
  de: { nav_home: "Start", nav_about: "Über uns", nav_contact: "Kontakt", nav_categories: "Kategorien", read_story: "Artikel lesen", featured: "Empfohlen", latest: "Neueste Artikel", more_in: "Mehr aus", see_all: "Alle ansehen", by: "von", min_read: "Min. Lesezeit", translate_btn: "Artikel übersetzen", translating: "Übersetze…", show_original: "Original anzeigen", newsletter_title: "Wöchentliche Depesche", newsletter_lead: "Eine ausgewählte Geschichte, jeden Sonntag im Postfach.", newsletter_email: "Ihre E-Mail", newsletter_join: "Abonnieren", ad_label: "Werbung", send: "Senden", name: "Name", email: "E-Mail", message: "Nachricht", search: "Suche", rights: "Alle Rechte vorbehalten.", language: "Sprache", not_found_title: "Seite nicht gefunden", back_home: "Zur Startseite", hero_kicker: "Die Welt, in Geschichten", hero_lead: "Reisen, Mode, Essen, Technik und Kultur — für Neugierige geschrieben, für alle übersetzt." },
  it: { nav_home: "Home", nav_about: "Chi siamo", nav_contact: "Contatti", nav_categories: "Categorie", read_story: "Leggi l'articolo", featured: "In evidenza", latest: "Ultime storie", more_in: "Altro in", see_all: "Vedi tutto", by: "di", min_read: "min di lettura", translate_btn: "Traduci articolo", translating: "Traduzione…", show_original: "Mostra originale", newsletter_title: "Il dispaccio settimanale", newsletter_lead: "Una storia scelta, ogni domenica nella tua casella.", newsletter_email: "La tua email", newsletter_join: "Iscriviti", ad_label: "Pubblicità", send: "Invia", name: "Nome", email: "Email", message: "Messaggio", search: "Cerca", rights: "Tutti i diritti riservati.", language: "Lingua", not_found_title: "Pagina non trovata", back_home: "Torna alla home", hero_kicker: "Il mondo, in storie", hero_lead: "Viaggi, moda, cibo, tecnologia e cultura — per i curiosi, tradotti per tutti." },
  "pt-BR": { nav_home: "Início", nav_about: "Sobre", nav_contact: "Contato", nav_categories: "Categorias", read_story: "Ler matéria", featured: "Em destaque", latest: "Últimas matérias", more_in: "Mais em", see_all: "Ver tudo", by: "por", min_read: "min de leitura", translate_btn: "Traduzir artigo", translating: "Traduzindo…", show_original: "Ver original", newsletter_title: "O boletim semanal", newsletter_lead: "Uma matéria escolhida, todo domingo no seu e-mail.", newsletter_email: "Seu e-mail", newsletter_join: "Assinar", ad_label: "Publicidade", send: "Enviar", name: "Nome", email: "E-mail", message: "Mensagem", search: "Buscar", rights: "Todos os direitos reservados.", language: "Idioma", not_found_title: "Página não encontrada", back_home: "Voltar ao início", hero_kicker: "O mundo, em histórias", hero_lead: "Viagem, moda, comida, tecnologia e cultura — para os curiosos, traduzidos para todos." },
  ja: { nav_home: "ホーム", nav_about: "私たちについて", nav_contact: "お問い合わせ", nav_categories: "カテゴリー", read_story: "記事を読む", featured: "特集", latest: "最新の記事", more_in: "他の", see_all: "すべて見る", by: "著者:", min_read: "分で読める", translate_btn: "この記事を翻訳", translating: "翻訳中…", show_original: "原文を表示", newsletter_title: "週刊ダイジェスト", newsletter_lead: "厳選した1記事を、毎週日曜にお届け。", newsletter_email: "メールアドレス", newsletter_join: "登録", ad_label: "広告", send: "送信", name: "お名前", email: "メール", message: "メッセージ", search: "検索", rights: "無断複写・転載を禁じます。", language: "言語", not_found_title: "ページが見つかりません", back_home: "ホームへ戻る", hero_kicker: "世界を、物語で。", hero_lead: "旅・ファッション・食・テクノロジー・文化 — 好奇心のための、すべての人へ翻訳された記事。" },
  zh: { nav_home: "首页", nav_about: "关于", nav_contact: "联系", nav_categories: "分类", read_story: "阅读文章", featured: "精选", latest: "最新文章", more_in: "更多", see_all: "查看全部", by: "作者", min_read: "分钟阅读", translate_btn: "翻译此文", translating: "翻译中…", show_original: "显示原文", newsletter_title: "每周快报", newsletter_lead: "每周日精选一篇,直达您的邮箱。", newsletter_email: "您的邮箱", newsletter_join: "订阅", ad_label: "广告", send: "发送", name: "姓名", email: "邮箱", message: "留言", search: "搜索", rights: "版权所有。", language: "语言", not_found_title: "页面未找到", back_home: "返回首页", hero_kicker: "世界,以故事为名", hero_lead: "旅行、时尚、美食、科技、文化——为好奇者而写,翻译给所有人。" },
  ko: { nav_home: "홈", nav_about: "소개", nav_contact: "문의", nav_categories: "카테고리", read_story: "기사 읽기", featured: "특집", latest: "최신 기사", more_in: "더 보기", see_all: "전체 보기", by: "글쓴이", min_read: "분 읽기", translate_btn: "번역하기", translating: "번역 중…", show_original: "원문 보기", newsletter_title: "주간 다이제스트", newsletter_lead: "엄선한 한 편을 매주 일요일에 보내드립니다.", newsletter_email: "이메일", newsletter_join: "구독", ad_label: "광고", send: "보내기", name: "이름", email: "이메일", message: "메시지", search: "검색", rights: "모든 권리 보유.", language: "언어", not_found_title: "페이지를 찾을 수 없습니다", back_home: "홈으로", hero_kicker: "세계를 이야기로", hero_lead: "여행·패션·음식·기술·문화 — 호기심을 위해 쓰고, 모두를 위해 번역합니다." },
  ar: { nav_home: "الرئيسية", nav_about: "عنّا", nav_contact: "تواصل", nav_categories: "الأقسام", read_story: "اقرأ المقال", featured: "مميّز", latest: "أحدث القصص", more_in: "المزيد في", see_all: "عرض الكل", by: "بقلم", min_read: "دقيقة قراءة", translate_btn: "ترجم هذا المقال", translating: "جارٍ الترجمة…", show_original: "عرض الأصل", newsletter_title: "النشرة الأسبوعية", newsletter_lead: "قصة مختارة في صندوق بريدك كل أحد.", newsletter_email: "بريدك", newsletter_join: "اشترك", ad_label: "إعلان", send: "إرسال", name: "الاسم", email: "البريد", message: "الرسالة", search: "بحث", rights: "جميع الحقوق محفوظة.", language: "اللغة", not_found_title: "الصفحة غير موجودة", back_home: "العودة للرئيسية", hero_kicker: "العالم، في حكايات", hero_lead: "سفر وأزياء وطعام وتقنية وثقافة — للفضوليّين، ومترجمة للجميع." },
  hi: { nav_home: "होम", nav_about: "परिचय", nav_contact: "संपर्क", nav_categories: "श्रेणियाँ", read_story: "लेख पढ़ें", featured: "विशेष", latest: "नवीनतम लेख", more_in: "और देखें", see_all: "सभी देखें", by: "द्वारा", min_read: "मिनट पठन", translate_btn: "इस लेख का अनुवाद करें", translating: "अनुवाद हो रहा है…", show_original: "मूल देखें", newsletter_title: "साप्ताहिक डाइजेस्ट", newsletter_lead: "हर रविवार चुनी हुई एक कहानी।", newsletter_email: "आपका ईमेल", newsletter_join: "सदस्य बनें", ad_label: "विज्ञापन", send: "भेजें", name: "नाम", email: "ईमेल", message: "संदेश", search: "खोज", rights: "सर्वाधिकार सुरक्षित।", language: "भाषा", not_found_title: "पेज नहीं मिला", back_home: "होम पर वापस", hero_kicker: "दुनिया, कहानियों में", hero_lead: "यात्रा, फैशन, भोजन, तकनीक और संस्कृति — जिज्ञासुओं के लिए, सबके लिए अनुवादित।" },
  ru: { nav_home: "Главная", nav_about: "О нас", nav_contact: "Контакты", nav_categories: "Категории", read_story: "Читать материал", featured: "Главное", latest: "Свежие материалы", more_in: "Ещё в", see_all: "Все материалы", by: "автор", min_read: "мин чтения", translate_btn: "Перевести статью", translating: "Перевод…", show_original: "Показать оригинал", newsletter_title: "Еженедельная рассылка", newsletter_lead: "Один отобранный материал каждое воскресенье.", newsletter_email: "Ваш e-mail", newsletter_join: "Подписаться", ad_label: "Реклама", send: "Отправить", name: "Имя", email: "E-mail", message: "Сообщение", search: "Поиск", rights: "Все права защищены.", language: "Язык", not_found_title: "Страница не найдена", back_home: "На главную", hero_kicker: "Мир — в историях", hero_lead: "Путешествия, мода, еда, технологии и культура — для любопытных, переведено для всех." },
  tr: { nav_home: "Anasayfa", nav_about: "Hakkımızda", nav_contact: "İletişim", nav_categories: "Kategoriler", read_story: "Yazıyı oku", featured: "Öne çıkan", latest: "Son yazılar", more_in: "Daha fazla", see_all: "Tümünü gör", by: "yazar", min_read: "dk okuma", translate_btn: "Bu yazıyı çevir", translating: "Çevriliyor…", show_original: "Orijinali göster", newsletter_title: "Haftalık bülten", newsletter_lead: "Her pazar seçilmiş bir yazı, e-postanızda.", newsletter_email: "E-postanız", newsletter_join: "Abone ol", ad_label: "Reklam", send: "Gönder", name: "Ad", email: "E-posta", message: "Mesaj", search: "Ara", rights: "Tüm hakları saklıdır.", language: "Dil", not_found_title: "Sayfa bulunamadı", back_home: "Anasayfaya dön", hero_kicker: "Dünya, hikâyelerle", hero_lead: "Seyahat, moda, yemek, teknoloji ve kültür — meraklılar için, herkes için çevrildi." },
  nl: { nav_home: "Home", nav_about: "Over ons", nav_contact: "Contact", nav_categories: "Categorieën", read_story: "Lees artikel", featured: "Uitgelicht", latest: "Nieuwste verhalen", more_in: "Meer in", see_all: "Alles bekijken", by: "door", min_read: "min lezen", translate_btn: "Vertaal artikel", translating: "Vertalen…", show_original: "Toon origineel", newsletter_title: "Wekelijkse depêche", newsletter_lead: "Eén uitgekozen verhaal, elke zondag.", newsletter_email: "Je e-mail", newsletter_join: "Abonneer", ad_label: "Advertentie", send: "Versturen", name: "Naam", email: "E-mail", message: "Bericht", search: "Zoeken", rights: "Alle rechten voorbehouden.", language: "Taal", not_found_title: "Pagina niet gevonden", back_home: "Terug naar home", hero_kicker: "De wereld, in verhalen", hero_lead: "Reizen, mode, eten, technologie en cultuur — voor de nieuwsgierigen, vertaald voor iedereen." },
};

export function t(locale: LocaleCode, key: keyof typeof en): string {
  const o = overrides[locale]?.[key];
  if (o) return o;
  return en[key];
}

export function htmlLangFor(locale: LocaleCode): string {
  return locale;
}
