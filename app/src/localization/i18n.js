import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { Platform } from "react-native";
let languageDetector;
if (Platform.OS !== "web") {
  const AsyncStorage =
    require("@react-native-async-storage/async-storage").default;
  languageDetector = {
    type: "languageDetector",
    async: true,
    detect: async (callback) => {
      try {
        const savedLanguage = await AsyncStorage.getItem("user-language");
        callback(savedLanguage || "en");
      } catch (error) {
        callback("en");
      }
    },
    init: () => {},
    cacheUserLanguage: async (lng) => {
      try {
        await AsyncStorage.setItem("user-language", lng);
      } catch (error) {
        console.error("Error saving language", error);
      }
    },
  };
}

// Translation resources
const resources = {
  en: {
    translation: {
      welcome: "Welcome to TravelEase",
      sign_in: "Sign in with your phone number",
      phone_number: "Phone Number",
      continue: "Continue",
      terms:
        "By continuing, you agree to our Terms of Service and Privacy Policy",
      verify_phone: "Verify Your Phone",
      enter_code: "Enter the 6-digit code sent to",
      verify: "Verify",
      resend_code: "Resend OTP",
      resend_in: "Resend code in",
      didnt_receive: "Didn't receive the code?",
      discover: "Discover Your Next Adventure",
      all: "All",
      upcoming: "Upcoming",
      active: "Active",
      completed: "Completed",
      book_trip: "Book Your Trip",
      travelers: "Travelers",
      traveler_count: "{{count}} Traveler",
      traveler_count_plural: "{{count}} Travelers",
      name: "Name",
      age: "Age",
      continue_payment: "Continue to Payment",
      trip_price: "Trip Price",
      taxes_fees: "Taxes & Fees",
      total: "Total",
      my_tickets: "My Tickets",
      no_tickets: "No tickets yet",
      book_first: "Book your first adventure to get started",
      explore_travels: "Explore Travels",
      travel_ticket: "Travel Ticket",
      tap_details: "Tap for details",
      profile: "Profile",
      language: "Language",
      logout: "Logout",
      english: "English",
      amharic: "Amharic",
      change_language: "Change Language",
      save: "Save",
      cancel: "Cancel",

      booking_confirmed: "Booking Confirmed!",
      confirmation_message: "Your booking for {{title}} is confirmed",
      booking_details: "Booking Details",
      travelers_list: "Travelers",
      view_tickets: "View My Tickets",
      view_travel_details: "View Travel Details",
      travel: "Travel",
      dates: "Dates",
      total_price: "Total Price",
      comment_question: "What time does the tour start on the first day?",
      comment_answer: "The tour starts at 9:00 AM at the hotel lobby.",
      write_comment: "Write your comment...",
      send: "Send",
      no_comments: "No comments yet",
      be_first_comment: "Be the first to comment",
      itinerary: "Itinerary",
      hotel_info: "Hotel Information",
      travel_insurance: "Travel Insurance",
      visa_requirements: "Visa Requirements",
      downloading: "Downloading",
      important_info: "Important Information",
      document_info:
        "Please download and print all required documents before your travel date. Some documents may need to be presented at immigration or hotel check-in.",
      description: "Description",
      multiple_destinations: "Multiple Destinations",
      requirements: "Requirements",
      view_comments: "View Comments",
      view_documents: "View Documents",
      book_now: "Book Now",
      per_person: "per person",
    },
  },
  am: {
    translation: {
      welcome: "እንኳን ወደ TravelEase በደህና መጡ",
      sign_in: "በስልክ ቁጥርዎ ይግቡ",
      phone_number: "ስልክ ቁጥር",
      continue: "ቀጥል",
      terms: "በመቀጠል የአገልግሎት ውል እና የግላዊነት ፖሊሲ ተቀባይ ነዎት።",
      verify_phone: "ስልክዎን ያረጋግጡ",
      enter_code: "ወደ የተላከው 6-አሃዝ ኮድ ያስገቡ",
      verify: "አረጋግጥ",
      resend_code: "OTP እንደገና ላክ",
      resend_in: "በ {{seconds}} ሰከንድ ውስጥ እንደገና ላክ",
      didnt_receive: "ኮዱ አልደረሰዎትም?",
      discover: "ቀጣዩን ልምምድዎን ያግኙ",
      all: "ሁሉም",
      upcoming: "የሚመጡ",
      active: "ንቁ",
      completed: "የተጠናቀቀ",
      book_trip: "ጉዞዎን ያቅዱ",
      travelers: "ጉዞ አድራጊዎች",
      traveler_count: "{{count}} ጉዞ አድራጊ",
      traveler_count_plural: "{{count}} ጉዞ አድራጊዎች",
      name: "ስም",
      age: "እድሜ",
      continue_payment: "ወደ ክፍያ ቀጥል",
      trip_price: "የጉዞ ዋጋ",
      taxes_fees: "ታክስ እና ክፍያዎች",
      total: "ጠቅላላ",
      my_tickets: "የእኔ ትኬቶች",
      no_tickets: "እስካሁን ትኬት የለም",
      book_first: "ለመጀመር የመጀመሪያዎን ልምምድ ያቅዱ",
      explore_travels: "ጉዞዎችን ያስሱ",
      travel_ticket: "የጉዞ ትኬት",
      tap_details: "ለዝርዝሮች ይንኩ",
      profile: "መገለጫ",
      language: "ቋንቋ",
      logout: "ውጣ",
      english: "እንግሊዝኛ",
      amharic: "አማርኛ",
      change_language: "ቋንቋ ቀይር",
      save: "አስቀምጥ",
      cancel: "ሰርዝ",

      booking_confirmed: "ቦኪንግ ተረጋግጧል!",
      confirmation_message: "ለ {{title}} የቦኪንግ ሂደትዎ ተረጋግጧል",
      booking_details: "የቦኪንግ ዝርዝሮች",
      travelers_list: "ጉዞ አድራጊዎች",
      view_tickets: "ትኬቶቼን ይመልከቱ",
      view_travel_details: "የጉዞ ዝርዝሮችን ይመልከቱ",
      travel: "ጉዞ",
      dates: "ቀኖች",
      total_price: "ጠቅላላ ዋጋ",
      comment_question: "በመጀመሪያው ቀን ጉዞው በምን ሰዓት ይጀምራል?",
      comment_answer: "ጉዞው በሆቴሉ ሊቢ በጠዋት 9፡00 ይጀምራል።",
      write_comment: "አስተያየትዎን ይጻፉ...",
      send: "ላክ",
      no_comments: "እስካሁን አስተያየት የለም",
      be_first_comment: "አስተያየት ለመስጠት የመጀመሪያዎቹ ይሁኑ",
      itinerary: "የጉዞ መርሃ ግብር",
      hotel_info: "የሆቴል መረጃ",
      travel_insurance: "የጉዞ ኢንሹራንስ",
      visa_requirements: "የቪዛ መስፈርቶች",
      downloading: "በማውረድ ላይ",
      important_info: "አስፈላጊ መረጃ",
      document_info:
        "ከጉዞ ቀንዎ በፊት ሁሉንም አስፈላጊ ሰነዶች አውርደው ያትሙ። አንዳንድ ሰነዶች በስደት ወይም በሆቴል ቼክ-ኢን ጊዜ ሊቀርቡ ይችላሉ።",
      description: "መግለጫ",
      multiple_destinations: "በርካታ መዳረሻዎች",
      requirements: "ማስፈልጊያዎች",
      view_comments: "አስተያየቶችን ይመልከቱ",
      view_documents: "ሰነዶችን ይመልከቱ",
      book_now: "አሁኑኑ ያቅዱ",
      per_person: "በአንድ ሰው",
    },
  },
};

i18n
  .use(languageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
    compatibilityJSON: "v3",
  });

export default i18n;
