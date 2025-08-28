import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { users } from "../../utils/dummyData";
import { loginAuth } from "../../services/authService";

const LoginModal = ({ visible, onClose }) => {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showRegister, setShowRegister] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  // Registration form state
  const [regName, setRegName] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regError, setRegError] = useState("");
  const [regSuccess, setRegSuccess] = useState("");

  useEffect(() => {
    if (visible) {
      setIsClosing(false);
      // Reset form when modal opens
      if (!showRegister) {
        setPhone("");
        setPassword("");
        setError("");
      }
    }
  }, [visible, showRegister]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 300);
  };

  if (!visible && !isClosing) return null;

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const { data } = await loginAuth(phone, password);
      if (data) {
        login({ ...data?.user, token: data?.token });
        handleClose();
        navigate(data?.user.role === "TRAVELER" ? "/mobile" : "/admin");
      } else {
        setError("የስልክ ቁጥር ወይም የይለፍ ቃል ትክክል አይደለም");
      }
    } catch (err) {
      // Axios error: err.response?.data?.message from backend
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError("እባክዎ ደግመው ይሞክሩ።");
      }
      console.log(err);
    }
  };

  const handleRegister = (e) => {
    e.preventDefault();
    setRegError("");
    setRegSuccess("");
    if (!regName || !regPhone || !regPassword) {
      setRegError("ሙሉ መረጃ ያስገቡ።");
      return;
    }
    // Check if phone already exists
    if (users.find((u) => u.phone === regPhone)) {
      setRegError("ይህ ስልክ ቁጥር ቀድሞ ተመዝግቧል።");
      return;
    }
    // Simulate registration (in real app, send to backend)
    users.push({
      name: regName,
      phone: regPhone,
      password: regPassword,
      role: "TRAVELER",
    });
    setRegSuccess("ምዝገባዎ ተሳክቷል። እባክዎ ይግቡ።");
    setRegName("");
    setRegPhone("");
    setRegPassword("");
    setTimeout(() => {
      setShowRegister(false);
      setRegSuccess("");
    }, 1500);
  };

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center bg-black/60 z-50 transition-opacity duration-300 ${
        isClosing ? "opacity-0" : "opacity-100"
      }`}
      onClick={handleClose}
    >
      <div
        className={`bg-white rounded-xl shadow-2xl w-full max-w-md p-7 relative transition-transform duration-300 ${
          isClosing ? "scale-95" : "scale-100"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-xl bg-gray-100 hover:bg-gray-200 rounded-full w-8 h-8 flex items-center justify-center transition-colors"
          onClick={handleClose}
          aria-label="close"
        >
          ×
        </button>

        {!showRegister ? (
          <>
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">መግቢያ</h2>
              <p className="text-gray-600 mt-1">መለያዎን ይግቡ</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <div className="bg-red-50 text-red-700 rounded-lg px-4 py-3 text-sm flex items-center">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  የስልክ ቁጥር
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  የይለፍ ቃል
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium"
              >
                ግባ
              </button>
            </form>

            <div className="text-center mt-6 text-sm text-gray-600">
              አዲስ መዝግብ?{" "}
              <button
                className="text-blue-600 hover:text-blue-800 hover:underline font-medium transition-colors"
                onClick={() => setShowRegister(true)}
              >
                ይመዝገቡ
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">ምዝገባ</h2>
              <p className="text-gray-600 mt-1">አዲስ መለያ ይፍጠሩ</p>
            </div>

            <form onSubmit={handleRegister} className="space-y-4">
              {regError && (
                <div className="bg-red-50 text-red-700 rounded-lg px-4 py-3 text-sm flex items-center">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {regError}
                </div>
              )}

              {regSuccess && (
                <div className="bg-green-50 text-green-700 rounded-lg px-4 py-3 text-sm flex items-center">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {regSuccess}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ስም
                </label>
                <input
                  type="text"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  የስልክ ቁጥር
                </label>
                <input
                  type="tel"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  የይለፍ ቃል
                </label>
                <input
                  type="password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium"
              >
                ይመዝገቡ
              </button>
            </form>

            <div className="text-center mt-6 text-sm text-gray-600">
              አስቀድሞ መዝግበዋል?{" "}
              <button
                className="text-blue-600 hover:text-blue-800 hover:underline font-medium transition-colors"
                onClick={() => setShowRegister(false)}
              >
                ይግቡ
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default LoginModal;
