module.exports = function generateUniqueNumber(prefix = "GLDPK-") {
  const randomNumber = Math.floor(100000 + Math.random() * 900000);
  const timestamp = Date.now();
  return `${prefix}${randomNumber}${timestamp}`;
};
