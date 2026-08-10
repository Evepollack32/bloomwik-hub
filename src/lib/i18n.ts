// Multi-locale UI dictionary. US English is the default.
// Each locale can host natively-written articles as well as translations.

export type LocaleCode =
  | "en-US" | "en-GB" | "en-IE" | "en-AU" | "en-SG" | "en-PH"
  | "es" | "es-CO" | "fr" | "de" | "de-CH" | "it"
  | "pt-BR" | "pt-PT" | "nl" | "nl-BE"
  | "sv-SE" | "nb-NO" | "fi-FI" | "ja" | "ko";

export const LOCALES: { code: LocaleCode; label: string; native: string; flag: string; rtl?: boolean; region?: string }[] = [
  { code: "en-US", label: "United States",  native: "English (US)",    flag: "🇺🇸", region: "US" },
  { code: "en-GB", label: "United Kingdom", native: "English (UK)",    flag: "🇬🇧", region: "GB" },
  { code: "en-IE", label: "Ireland",        native: "English (IE)",    flag: "🇮🇪", region: "IE" },
  { code: "en-AU", label: "Australia",      native: "English (AU)",    flag: "🇦🇺", region: "AU" },
  { code: "en-SG", label: "Singapore",      native: "English (SG)",    flag: "🇸🇬", region: "SG" },
  { code: "en-PH", label: "Philippines",    native: "English (PH)",    flag: "🇵🇭", region: "PH" },
  { code: "es",    label: "Spain",          native: "Español",         flag: "🇪🇸", region: "ES" },
  { code: "es-CO", label: "Colombia",       native: "Español (CO)",    flag: "🇨🇴", region: "CO" },
  { code: "fr",    label: "France",         native: "Français",        flag: "🇫🇷", region: "FR" },
  { code: "de",    label: "Germany",        native: "Deutsch",         flag: "🇩🇪", region: "DE" },
  { code: "de-CH", label: "Switzerland",    native: "Deutsch (CH)",    flag: "🇨🇭", region: "CH" },
  { code: "it",    label: "Italy",          native: "Italiano",        flag: "🇮🇹", region: "IT" },
  { code: "pt-BR", label: "Brazil",         native: "Português (BR)",  flag: "🇧🇷", region: "BR" },
  { code: "pt-PT", label: "Portugal",       native: "Português (PT)",  flag: "🇵🇹", region: "PT" },
  { code: "nl",    label: "Netherlands",    native: "Nederlands",      flag: "🇳🇱", region: "NL" },
  { code: "nl-BE", label: "Belgium",        native: "Nederlands (BE)", flag: "🇧🇪", region: "BE" },
  { code: "sv-SE", label: "Sweden",         native: "Svenska",         flag: "🇸🇪", region: "SE" },
  { code: "nb-NO", label: "Norway",         native: "Norsk",           flag: "🇳🇴", region: "NO" },
  { code: "fi-FI", label: "Finland",        native: "Suomi",           flag: "🇫🇮", region: "FI" },
  { code: "ja",    label: "Japan",          native: "日本語",           flag: "🇯🇵", region: "JP" },
  { code: "ko",    label: "South Korea",    native: "한국어",           flag: "🇰🇷", region: "KR" },
];

export const LOCALE_CODES = LOCALES.map((l) => l.code) as LocaleCode[];

export function isLocaleCode(v: unknown): v is LocaleCode {
  return typeof v === "string" && (LOCALE_CODES as string[]).includes(v);
}

export const DEFAULT_LOCALE: LocaleCode = "en-US";


type Dict = Record<string, string>;

const en: Dict = {
  brand: "Atlas & Ember",
  tagline: "Stories from every corner of the world",
  nav_home: "Home",
  nav_about: "About",
  nav_contact: "Contact",
  nav_categories: "Categories",
  all_categories: "All categories",
  all_categories_lead: "Every desk at Atlas & Ember — pick a beat and start reading.",
  sponsored: "Sponsored",
  offers_title: "Offers we like",

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
  ko: { nav_home: "홈", nav_about: "소개", nav_contact: "문의", nav_categories: "카테고리", read_story: "기사 읽기", featured: "특집", latest: "최신 기사", more_in: "더 보기", see_all: "전체 보기", by: "글쓴이", min_read: "분 읽기", translate_btn: "번역하기", translating: "번역 중…", show_original: "원문 보기", newsletter_title: "주간 다이제스트", newsletter_lead: "엄선한 한 편을 매주 일요일에 보내드립니다.", newsletter_email: "이메일", newsletter_join: "구독", ad_label: "광고", send: "보내기", name: "이름", email: "이메일", message: "메시지", search: "검색", rights: "모든 권리 보유.", language: "언어", not_found_title: "페이지를 찾을 수 없습니다", back_home: "홈으로", hero_kicker: "세계를 이야기로", hero_lead: "여행·패션·음식·기술·문화 — 호기심을 위해 쓰고, 모두를 위해 번역합니다." },
  nl: { nav_home: "Home", nav_about: "Over ons", nav_contact: "Contact", nav_categories: "Categorieën", read_story: "Lees artikel", featured: "Uitgelicht", latest: "Nieuwste verhalen", more_in: "Meer in", see_all: "Alles bekijken", by: "door", min_read: "min lezen", translate_btn: "Vertaal artikel", translating: "Vertalen…", show_original: "Toon origineel", newsletter_title: "Wekelijkse depêche", newsletter_lead: "Eén uitgekozen verhaal, elke zondag.", newsletter_email: "Je e-mail", newsletter_join: "Abonneer", ad_label: "Advertentie", send: "Versturen", name: "Naam", email: "E-mail", message: "Bericht", search: "Zoeken", rights: "Alle rechten voorbehouden.", language: "Taal", not_found_title: "Pagina niet gevonden", back_home: "Terug naar home", hero_kicker: "De wereld, in verhalen", hero_lead: "Reizen, mode, eten, technologie en cultuur — voor de nieuwsgierigen, vertaald voor iedereen." },
  "pt-PT": { nav_home: "Início", nav_about: "Sobre", nav_contact: "Contacto", nav_categories: "Categorias", read_story: "Ler artigo", featured: "Em destaque", latest: "Últimos artigos", more_in: "Mais em", see_all: "Ver tudo", by: "por", min_read: "min de leitura", translate_btn: "Traduzir artigo", translating: "A traduzir…", show_original: "Ver original", newsletter_title: "A newsletter semanal", newsletter_lead: "Um artigo escolhido, todos os domingos.", newsletter_email: "O seu e-mail", newsletter_join: "Subscrever", ad_label: "Publicidade", send: "Enviar", name: "Nome", email: "E-mail", message: "Mensagem", search: "Pesquisar", rights: "Todos os direitos reservados.", language: "Idioma", not_found_title: "Página não encontrada", back_home: "Voltar ao início", hero_kicker: "O mundo, em histórias", hero_lead: "Viagens, moda, gastronomia, tecnologia e cultura." },
  "sv-SE": { nav_home: "Hem", nav_about: "Om oss", nav_contact: "Kontakt", nav_categories: "Kategorier", read_story: "Läs artikeln", featured: "Utvalt", latest: "Senaste artiklarna", more_in: "Mer i", see_all: "Visa alla", by: "av", min_read: "min läsning", translate_btn: "Översätt artikeln", translating: "Översätter…", show_original: "Visa original", newsletter_title: "Veckans nyhetsbrev", newsletter_lead: "En utvald berättelse, varje söndag.", newsletter_email: "Din e-post", newsletter_join: "Prenumerera", ad_label: "Annons", send: "Skicka", name: "Namn", email: "E-post", message: "Meddelande", search: "Sök", rights: "Alla rättigheter förbehållna.", language: "Språk", not_found_title: "Sidan hittades inte", back_home: "Till startsidan", hero_kicker: "Världen, i berättelser", hero_lead: "Resor, mode, mat, teknik och kultur — för nyfikna." },
  "nb-NO": { nav_home: "Hjem", nav_about: "Om oss", nav_contact: "Kontakt", nav_categories: "Kategorier", read_story: "Les artikkelen", featured: "Utvalgt", latest: "Siste artikler", more_in: "Mer i", see_all: "Se alle", by: "av", min_read: "min lesing", translate_btn: "Oversett artikkelen", translating: "Oversetter…", show_original: "Vis original", newsletter_title: "Ukentlig nyhetsbrev", newsletter_lead: "En utvalgt historie, hver søndag.", newsletter_email: "Din e-post", newsletter_join: "Abonner", ad_label: "Annonse", send: "Send", name: "Navn", email: "E-post", message: "Melding", search: "Søk", rights: "Alle rettigheter reservert.", language: "Språk", not_found_title: "Fant ikke siden", back_home: "Til forsiden", hero_kicker: "Verden, i fortellinger", hero_lead: "Reise, mote, mat, teknologi og kultur — for de nysgjerrige." },
  "fi-FI": { nav_home: "Etusivu", nav_about: "Tietoa", nav_contact: "Yhteystiedot", nav_categories: "Kategoriat", read_story: "Lue juttu", featured: "Nostot", latest: "Uusimmat jutut", more_in: "Lisää aiheesta", see_all: "Näytä kaikki", by: "kirjoittanut", min_read: "min lukuaika", translate_btn: "Käännä artikkeli", translating: "Käännetään…", show_original: "Näytä alkuperäinen", newsletter_title: "Viikkokirje", newsletter_lead: "Yksi valittu juttu joka sunnuntai.", newsletter_email: "Sähköpostisi", newsletter_join: "Tilaa", ad_label: "Mainos", send: "Lähetä", name: "Nimi", email: "Sähköposti", message: "Viesti", search: "Haku", rights: "Kaikki oikeudet pidätetään.", language: "Kieli", not_found_title: "Sivua ei löytynyt", back_home: "Takaisin etusivulle", hero_kicker: "Maailma tarinoina", hero_lead: "Matkailu, muoti, ruoka, teknologia ja kulttuuri — uteliaille." },
};

/** Base language of a locale code: "es-CO" -> "es". */
export function baseLanguage(locale: LocaleCode | string): string {
  return String(locale).split("-")[0];
}

export function t(locale: LocaleCode, key: keyof typeof en): string {
  const exact = overrides[locale]?.[key];
  if (exact) return exact;
  // Fall back to the base language dictionary (en-AU -> en, es-CO -> es).
  const base = baseLanguage(locale) as LocaleCode;
  const inherited = overrides[base]?.[key];
  if (inherited) return inherited;
  return en[key];
}

export function htmlLangFor(locale: LocaleCode): string {
  return locale;
}
