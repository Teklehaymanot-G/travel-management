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
      aboutSaint: "ስለ ፀደቁ",
      readMore: "ተጨማሪ አንብብ",
      readLess: "ያነሰ አንብብ",
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
