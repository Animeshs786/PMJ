function generateShareLink(url, userReferralCode) {
  return `${url}?ref=${userReferralCode}`;
}

module.exports = {
  generateShareLink,
};
