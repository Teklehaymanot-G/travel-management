import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import TravelGrid from "../../components/public/TravelGrid";
// import { travels } from "../../utils/dummyData";
import { useEffect, useState } from "react";
import saintImg from "../../assets/saint.jpeg";
import { getPublicTravels } from "../../services/homeService";
import { fullSaintHistory, saintHistory } from "../../utils/constants";
import LoginModal from "../auth/LoginPage";

const HomePage = () => {
  const { t, i18n } = useTranslation();
  const [showFullHistory, setShowFullHistory] = useState(false);
  const [showLogin, setShowLogin] = useState(false); // Add state for modal

  // Set Amharic as default language on mount
  useEffect(() => {
    if (i18n.language !== "am") {
      i18n.changeLanguage("am");
    }
  }, [i18n]);

  const [travels, setTravels] = useState([]);

  useEffect(() => {
    const fetchTravels = async () => {
      const data = await getPublicTravels();
      setTravels(data?.data || []);
    };
    fetchTravels();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <LoginModal visible={showLogin} onClose={() => setShowLogin(false)} />

      {/* Language Switcher */}
      <div className="absolute top-4 right-4 z-10">
        {i18n.language === "am" ? (
          <button
            onClick={() => i18n.changeLanguage("en")}
            className="mr-2 px-2 py-1 border rounded text-white bg-blue-600 hover:bg-blue-700"
          >
            EN
          </button>
        ) : (
          <button
            onClick={() => i18n.changeLanguage("am")}
            className="px-2 py-1 border rounded text-white bg-blue-600 hover:bg-blue-700"
          >
            AM
          </button>
        )}
      </div>
      {/* Hero Section */}
      <div className="relative bg-blue-700 text-white">
        <div className="max-w-7xl mx-auto px-4 py-24 sm:px-6 lg:px-8">
          <div className="flex flex-row items-center justify-between">
            {/* Saint Image */}
            <div className="flex justify-center pt-8">
              <img
                src={saintImg}
                alt="Saint"
                className="h-72 w-auto rounded shadow-lg"
              />
            </div>
            <div className="text-center">
              <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
                {t("discover")}
              </h1>
              <p className="mt-6 max-w-lg mx-auto text-xl text-blue-100">
                {t("heroDesc")}
              </p>
              <div className="mt-10 flex justify-center">
                <button
                  onClick={() => setShowLogin(true)}
                  className="px-8 py-3 border border-transparent text-base font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50 md:py-4 md:text-lg md:px-10"
                >
                  {t("getStarted")}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Saint History Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              {t("aboutSaint")}
            </h2>
          </div>
          <div className="bg-gray-50 p-6 rounded-lg shadow-md">
            <div className="prose max-w-none text-gray-700">
              <p className="whitespace-pre-line">
                {showFullHistory
                  ? `${saintHistory}\n\n${fullSaintHistory}`
                  : saintHistory}
              </p>
              <button
                onClick={() => setShowFullHistory(!showFullHistory)}
                className="mt-4 text-blue-600 hover:text-blue-800 font-medium"
              >
                {showFullHistory ? t("readLess") : t("readMore")}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Travels */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              {t("upcomingTravels")}
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
              {t("featuredDesc")}
            </p>
          </div>

          <TravelGrid travels={travels} />

          <div className="mt-12 text-center">
            <button
              onClick={() => setShowLogin(true)}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              {t("viewAllTravels")}
              <svg
                className="ml-2 -mr-1 h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">
              {t("features")}
            </h2>
            <p className="mt-2 text-3xl font-extrabold text-gray-900 sm:text-4xl">
              {t("whyChoose")}
            </p>
          </div>
          <div className="mt-16">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {[
                {
                  title: t("easyBooking"),
                  description: t("easyBookingDesc"),
                  icon: "ticket",
                },
                {
                  title: t("securePayments"),
                  description: t("securePaymentsDesc"),
                  icon: "shield",
                },
                {
                  title: t("support247"),
                  description: t("support247Desc"),
                  icon: "support",
                },
              ].map((feature, index) => (
                <div key={index} className="bg-white p-6 rounded-lg shadow-md">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                      <svg
                        className="h-6 w-6 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
                        />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">
                        {feature.title}
                      </h3>
                      <p className="mt-2 text-gray-500">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
