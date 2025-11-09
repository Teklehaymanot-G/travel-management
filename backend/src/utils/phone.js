function normalizeEthiopianPhone(input) {
  if (!input) return null;
  let p = ("" + input).replace(/\s|-/g, "");
  // Remove leading 00
  if (p.startsWith("00")) p = "+" + p.slice(2);
  // Handle +2510xxxxxxxxx (user typed local leading 0 after country code)
  if (/^\+2510\d{9}$/.test(p)) {
    p = "+251" + p.slice(5); // drop the extra 0
  }
  // If starts with 09xxxxxxxx -> +2519xxxxxxxx
  if (/^0\d{9}$/.test(p)) {
    if (p.startsWith("09")) {
      return "+251" + p.slice(1);
    }
    return null;
  }
  // 9xxxxxxxx (9 digits) -> +2519xxxxxxxx
  if (/^9\d{8}$/.test(p)) {
    return "+251" + p;
  }
  // 2519xxxxxxxx -> +2519xxxxxxxx
  if (/^251\d{9}$/.test(p)) {
    return "+" + p;
  }
  // +2519xxxxxxxx already in E.164
  if (/^\+251\d{9}$/.test(p)) {
    return p;
  }
  return null;
}

function isValidEthiopianMobile(e164) {
  return /^\+2519\d{8}$/.test(e164);
}

module.exports = { normalizeEthiopianPhone, isValidEthiopianMobile };
