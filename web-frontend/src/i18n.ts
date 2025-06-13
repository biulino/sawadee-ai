import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Translation resources
const resources = {
  en: {
    translation: {
      // Navigation & Common
      welcome: "Welcome",
      home: "Home",
      reservations: "Reservations",
      activities: "Activities",
      services: "Services",
      about: "About",
      contact: "Contact",
      profile: "Profile",
      help: "Help",
      login: "Login",
      logout: "Logout",
      register: "Register",
      loading: "Loading...",
      error: "Error",
      success: "Success",
      cancel: "Cancel",
      save: "Save",
      delete: "Delete",
      edit: "Edit",
      add: "Add",
      search: "Search",
      
      // Hotel Landing Page
      hotelTitle: "SawadeeAI Luxury Hotel",
      welcomeHeading: "Welcome to Paradise",
      welcomeSubtitle: "Experience luxury and comfort like never before",
      assistantPrompt: "How can I help you today?",
      assistantButtonText: "Chat with AI Assistant",
      exploreServices: "Explore Our Services",
      bookNow: "Book Now",
      learnMore: "Learn More",
      
      // Check-in Process
      checkinWelcome: "Welcome to AI Check-in",
      checkinSubtitle: "Your quick and secure check-in process will take just a few minutes",
      checkinSteps: "Process Steps:",
      step1: "Upload your passport photo",
      step2: "Complete liveness verification",
      step3: "Confirm identity verification",
      step4: "Check-in process completed",
      startCheckin: "Start Check-in",
      
      // Passport Upload
      passportUpload: "Upload Passport Photo",
      passportInstructions: "Take or upload a clear photo of your passport information page",
      selectFile: "Select File",
      changePhoto: "Change Photo",
      continue: "Continue",
      imageQuality: "Image Quality:",
      excellent: "EXCELLENT",
      good: "GOOD",
      fair: "FAIR",
      poor: "POOR",
      
      // Liveness Check
      livenessCheck: "Liveness Verification",
      livenessInstructions: "Show your face to the camera for security verification",
      passportInfo: "Passport Information:",
      fullName: "Full Name:",
      passportNumber: "Passport Number:",
      nationality: "Nationality:",
      startVerification: "Start Verification",
      
      // Chat Widget
      chatPlaceholder: "Type your message...",
      sendMessage: "Send",
      aiAssistant: "AI Assistant",
      chatError: "Sorry, an error occurred.",
      
      // Admin Panel
      adminPanel: "Admin Panel",
      adminSubtitle: "Landing page management",
      configuration: "Configuration",
      banners: "Banners",
      shortcuts: "Shortcuts",
      hotelTitleField: "Hotel Title",
      welcomeHeadingField: "Welcome Heading",
      welcomeSubtitleField: "Welcome Subtitle",
      assistantPromptField: "Assistant Prompt",
      assistantButtonField: "Assistant Button Text",
      primaryColor: "Primary Color",
      secondaryColor: "Secondary Color",
      
      // Language Switcher
      language: "Language",
      changeLanguage: "Change Language",
      
      // SaaS Platform
      saasDemo: "SaaS Demo",
      aiCheckin: "AI Check-in",
      backOffice: "Back Office",
      tenantManagement: "Tenant Management",
      multiTenant: "Multi-Tenant Platform",
      
      // Errors and Messages
      errorOccurred: "An error occurred",
      tryAgain: "Please try again",
      networkError: "Network error",
      invalidData: "Invalid data",
      unauthorized: "Unauthorized access",
      
      // Status
      active: "Active",
      inactive: "Inactive",
      pending: "Pending",
      completed: "Completed",
      processing: "Processing...",
      
      // Recommendations
      recommendations: "Recommendations",
      recommendedHotels: "Recommended Hotels",
      viewDetails: "View Details",
      pricePerNight: "Price per night",
      rating: "Rating",
      
      // Common UI
    }
  },
  pt: {
    translation: {
      // Navigation & Common
      welcome: "Bem-vindo",
      home: "Início",
      reservations: "Reservas",
      activities: "Atividades",
      services: "Serviços",
      about: "Sobre",
      contact: "Contato",
      login: "Entrar",
      logout: "Sair",
      register: "Registrar",
      loading: "Carregando...",
      error: "Erro",
      success: "Sucesso",
      cancel: "Cancelar",
      save: "Salvar",
      delete: "Excluir",
      edit: "Editar",
      add: "Adicionar",
      search: "Pesquisar",
      
      // Hotel Landing Page
      hotelTitle: "Hotel de Luxo SawadeeAI",
      welcomeHeading: "Bem-vindo ao Paraíso",
      welcomeSubtitle: "Experimente luxo e conforto como nunca antes",
      assistantPrompt: "Como posso ajudá-lo hoje?",
      assistantButtonText: "Conversar com Assistente IA",
      exploreServices: "Explore Nossos Serviços",
      bookNow: "Reserve Agora",
      learnMore: "Saiba Mais",
      
      // Check-in Process
      checkinWelcome: "Bem-vindo ao Check-in IA",
      checkinSubtitle: "Seu processo de check-in rápido e seguro levará apenas alguns minutos",
      checkinSteps: "Etapas do Processo:",
      step1: "Carregue a foto do seu passaporte",
      step2: "Complete a verificação de vida",
      step3: "Confirme a verificação de identidade",
      step4: "Processo de check-in concluído",
      startCheckin: "Iniciar Check-in",
      
      // Language Switcher
      language: "Idioma",
      changeLanguage: "Alterar Idioma"
    }
  },
  th: {
    translation: {
      // Navigation & Common
      welcome: "ยินดีต้อนรับ",
      home: "หน้าแรก",
      reservations: "การจอง",
      activities: "กิจกรรม",
      services: "บริการ",
      about: "เกี่ยวกับเรา",
      contact: "ติดต่อ",
      login: "เข้าสู่ระบบ",
      logout: "ออกจากระบบ",
      register: "สมัครสมาชิก",
      loading: "กำลังโหลด...",
      error: "ข้อผิดพลาด",
      success: "สำเร็จ",
      cancel: "ยกเลิก",
      save: "บันทึก",
      delete: "ลบ",
      edit: "แก้ไข",
      add: "เพิ่ม",
      search: "ค้นหา",
      
      // Hotel Landing Page
      hotelTitle: "โรงแรมหรู สวัสดี",
      welcomeHeading: "ยินดีต้อนรับสู่สวรรค์",
      welcomeSubtitle: "สัมผัสความหรูหราและความสะดวกสบายอย่างที่ไม่เคยมีมาก่อน",
      assistantPrompt: "วันนี้ฉันช่วยอะไรคุณได้บ้าง?",
      assistantButtonText: "แชทกับผู้ช่วย AI",
      exploreServices: "สำรวจบริการของเรา",
      bookNow: "จองเลย",
      learnMore: "เรียนรู้เพิ่มเติม",
      
      // Language Switcher
      language: "ภาษา",
      changeLanguage: "เปลี่ยนภาษา"
    }
  },
  es: {
    translation: {
      // Navigation & Common
      welcome: "Bienvenido",
      home: "Inicio",
      reservations: "Reservas",
      activities: "Actividades",
      services: "Servicios",
      about: "Acerca de",
      contact: "Contacto",
      login: "Iniciar Sesión",
      logout: "Cerrar Sesión",
      register: "Registrarse",
      loading: "Cargando...",
      error: "Error",
      success: "Éxito",
      cancel: "Cancelar",
      save: "Guardar",
      delete: "Eliminar",
      edit: "Editar",
      add: "Agregar",
      search: "Buscar",
      
      // Hotel Landing Page
      hotelTitle: "Hotel de Lujo SawadeeAI",
      welcomeHeading: "Bienvenido al Paraíso",
      welcomeSubtitle: "Experimente lujo y comodidad como nunca antes",
      assistantPrompt: "¿Cómo puedo ayudarte hoy?",
      assistantButtonText: "Chatear con Asistente IA",
      exploreServices: "Explorar Nuestros Servicios",
      bookNow: "Reservar Ahora",
      learnMore: "Saber Más",
      
      // Language Switcher
      language: "Idioma",
      changeLanguage: "Cambiar Idioma"
    }
  },
  de: {
    translation: {
      // Navigation & Common
      welcome: "Willkommen",
      home: "Startseite",
      reservations: "Reservierungen",
      activities: "Aktivitäten",
      services: "Dienstleistungen",
      about: "Über uns",
      contact: "Kontakt",
      login: "Anmelden",
      logout: "Abmelden",
      register: "Registrieren",
      loading: "Laden...",
      error: "Fehler",
      success: "Erfolg",
      cancel: "Abbrechen",
      save: "Speichern",
      delete: "Löschen",
      edit: "Bearbeiten",
      add: "Hinzufügen",
      search: "Suchen",
      
      // Hotel Landing Page
      hotelTitle: "SawadeeAI Luxushotel",
      welcomeHeading: "Willkommen im Paradies",
      welcomeSubtitle: "Erleben Sie Luxus und Komfort wie nie zuvor",
      assistantPrompt: "Wie kann ich Ihnen heute helfen?",
      assistantButtonText: "Mit KI-Assistent chatten",
      exploreServices: "Unsere Dienstleistungen erkunden",
      bookNow: "Jetzt buchen",
      learnMore: "Mehr erfahren",
      
      // Language Switcher
      language: "Sprache",
      changeLanguage: "Sprache ändern"
    }
  },
  zh: {
    translation: {
      // Navigation & Common
      welcome: "欢迎",
      home: "首页",
      reservations: "预订",
      activities: "活动",
      services: "服务",
      about: "关于我们",
      contact: "联系我们",
      login: "登录",
      logout: "登出",
      register: "注册",
      loading: "加载中...",
      error: "错误",
      success: "成功",
      cancel: "取消",
      save: "保存",
      delete: "删除",
      edit: "编辑",
      add: "添加",
      search: "搜索",
      
      // Hotel Landing Page
      hotelTitle: "萨瓦迪豪华酒店",
      welcomeHeading: "欢迎来到天堂",
      welcomeSubtitle: "体验前所未有的奢华与舒适",
      assistantPrompt: "今天我能为您做些什么？",
      assistantButtonText: "与AI助手聊天",
      exploreServices: "探索我们的服务",
      bookNow: "立即预订",
      learnMore: "了解更多",
      
      // Language Switcher
      language: "语言",
      changeLanguage: "更改语言"
    }
  },
  ar: {
    translation: {
      // Navigation & Common
      welcome: "أهلاً وسهلاً",
      home: "الرئيسية",
      reservations: "الحجوزات",
      activities: "الأنشطة",
      services: "الخدمات",
      about: "عنا",
      contact: "اتصل بنا",
      login: "تسجيل الدخول",
      logout: "تسجيل الخروج",
      register: "التسجيل",
      loading: "جاري التحميل...",
      error: "خطأ",
      success: "نجح",
      cancel: "إلغاء",
      save: "حفظ",
      delete: "حذف",
      edit: "تعديل",
      add: "إضافة",
      search: "بحث",
      
      // Hotel Landing Page
      hotelTitle: "فندق ساوادي الفاخر",
      welcomeHeading: "مرحباً بكم في الجنة",
      welcomeSubtitle: "اختبروا الفخامة والراحة كما لم تختبروها من قبل",
      assistantPrompt: "كيف يمكنني مساعدتك اليوم؟",
      assistantButtonText: "تحدث مع المساعد الذكي",
      exploreServices: "استكشف خدماتنا",
      bookNow: "احجز الآن",
      learnMore: "اعرف المزيد",
      
      // Language Switcher
      language: "اللغة",
      changeLanguage: "تغيير اللغة"
    }
  },
  hi: {
    translation: {
      // Navigation & Common
      welcome: "स्वागत है",
      home: "होम",
      reservations: "आरक्षण",
      activities: "गतिविधियाँ",
      services: "सेवाएं",
      about: "हमारे बारे में",
      contact: "संपर्क",
      login: "लॉगिन",
      logout: "लॉगआउट",
      register: "पंजीकरण",
      loading: "लोड हो रहा है...",
      error: "त्रुटि",
      success: "सफलता",
      cancel: "रद्द करें",
      save: "सेव करें",
      delete: "डिलीट करें",
      edit: "संपादित करें",
      add: "जोड़ें",
      search: "खोजें",
      
      // Hotel Landing Page
      hotelTitle: "सवाडी लक्जरी होटल",
      welcomeHeading: "स्वर्ग में आपका स्वागत है",
      welcomeSubtitle: "पहले कभी न अनुभव की गई विलासिता और आराम का अनुभव करें",
      assistantPrompt: "आज मैं आपकी कैसे सहायता कर सकता हूं?",
      assistantButtonText: "AI सहायक से चैट करें",
      exploreServices: "हमारी सेवाओं का अन्वेषण करें",
      bookNow: "अभी बुक करें",
      learnMore: "और जानें",
      
      // Language Switcher
      language: "भाषा",
      changeLanguage: "भाषा बदलें"
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development',
    
    interpolation: {
      escapeValue: false, // React already protects from XSS
    },
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
  });

export default i18n;
