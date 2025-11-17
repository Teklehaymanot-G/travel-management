import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  en: {
    translation: {
      welcome: "Welcome to the Travel App!",
      home: "Home",
      login: "Login",
      logout: "Logout",
      discover: "Discover Your Next Adventure",
      heroDesc:
        "Book exciting travel experiences with our easy-to-use platform. Adventure awaits at your fingertips.",
      getStarted: "Get Started",
      upcomingTravels: "Upcoming Travel Experiences",
      featuredDesc:
        "Explore our handpicked selection of unforgettable journeys",
      viewAllTravels: "View All Travels",
      features: "Features",
      whyChoose: "Why choose our platform",
      easyBooking: "Easy Booking",
      easyBookingDesc:
        "Book your travel experiences in just a few clicks with our intuitive platform.",
      securePayments: "Secure Payments",
      securePaymentsDesc:
        "All transactions are securely processed with multiple payment options.",
      support247: "24/7 Support",
      support247Desc:
        "Our dedicated support team is available around the clock to assist you.",
      aboutSaint: "About Saint",
      readMore: "Read More",
      readLess: "Read Less",
      // Payment rejection dialog keys
      rejection_message_label: "Rejection Message",
      rejection_message_optional: "Rejection Message (optional)",
      rejection_message_placeholder: "Reason for rejection",
      rejection_message_hint: "This message will be visible to the traveler.",
      reject_payment_title: "Reject Payment",
      confirm_reject_submit: "Confirm Reject",
      // Scanner & ticket verification
      scan: "Scan",
      scan_ticket: "Scan Ticket",
      align_qr: "Align QR inside box",
      go_back: "Go Back",
      access_denied: "Access denied",
      no_access: "No access to scan tickets.",
      already_scanned: "Already scanned",
      checked_in_at: "Checked in at",
      ticket_valid: "Ticket valid",
      new_scan: "New Scan",
      scan_failed: "Scan failed",
      camera_permission_denied: "Camera permission denied.",
      grant_permission: "Grant Permission",
    },
  },
  am: {
    translation: {
      welcome: "እንኳን ወደ ትራቨል መተግበሪያ በደህና መጡ!",
      home: "መነሻ",
      login: "ግባ",
      logout: "ውጣ",
      discover: "አዲስ ጉዞዎችን ያግኙ",
      heroDesc:
        "በቀላሉ የሚጠቀሙበትን መድረክ በመጠቀም አስደናቂ የጉዞ ተሞክሮዎችን ይያዙ። ጉዞዎ በእጅዎ ላይ ነው።",
      getStarted: "ጀምር",
      upcomingTravels: "የሚመጡ የጉዞ ተሞክሮዎች",
      featuredDesc: "የልዩ ልዩ ጉዞዎቻችንን ይዘው ያሉትን ይዘምኑ",
      viewAllTravels: "ሁሉንም ጉዞዎች ይመልከቱ",
      features: "ባህሪያት",
      whyChoose: "ለምን መድረካችንን መምረጥ?",
      easyBooking: "ቀላል ቦታ ማስያዣ",
      easyBookingDesc: "በጥቂት እርምጃዎች ውስጥ ጉዞዎትን ይያዙ።",
      securePayments: "ደህና የተጠበቁ ክፍያዎች",
      securePaymentsDesc: "ሁሉም ግብይቶች በደህናነት ይከናወናሉ እና በተለያዩ የክፍያ አማራጮች ይገናኛሉ።",
      support247: "24/7 ድጋፍ",
      support247Desc: "የተሟላ የድጋፍ ቡድናችን ሁልጊዜ ዝግጁ ነው።",
      aboutSaint: "ስለ ጻድቁ",
      readMore: "ተጨማሪ አንብብ",
      readLess: "ያነሰ አንብብ",
      // የክፍያ መቀበል መረጃ ቁልፎች
      rejection_message_label: "የመቀበል መልዕክት",
      rejection_message_optional: "የመቀበል መልዕክት (አማራጭ)",
      rejection_message_placeholder: "የመቀበል ምክንያት",
      rejection_message_hint: "ይህ መልዕክት ለተጓዥው ይታያል።",
      reject_payment_title: "ክፍያ አትቀበል",
      confirm_reject_submit: "መቀበልን አረጋግጥ",
      // ስካነር እና ትኬት ማረጋገጫ
      scan: "ስካን",
      scan_ticket: "ትኬት ይስካኑ",
      align_qr: "QR ኮዱን በሳጥኑ ውስጥ አስቀምጡ",
      go_back: "ወደኋላ ተመለስ",
      access_denied: "መዳረሻ ተከልክሏል",
      no_access: "ለትኬቶች ስካን መድረስ የለዎትም",
      already_scanned: "ቀድሞ ተመርመረ",
      checked_in_at: "ተመዝግቦ በ",
      ticket_valid: "ትኬቱ ተቀባይ ነው",
      new_scan: "አዲስ ስካን",
      scan_failed: "ስካኑ አልተሳካም",
      camera_permission_denied: "የካሜራ ፈቃድ ተከልክሏል።",
      grant_permission: "ፈቃድ ክፈት",
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: "am",
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
