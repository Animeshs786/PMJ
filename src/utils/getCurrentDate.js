function getCurrentDate() {
  const today = new Date();
  const options = {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  };
  const formatter = new Intl.DateTimeFormat("en-GB", options);
  const formattedParts = formatter.formatToParts(today);

  const dateParts = formattedParts.reduce((acc, part) => {
    acc[part.type] = part.value;
    return acc;
  }, {});

  return `${dateParts.year}-${dateParts.month}-${dateParts.day} ${dateParts.hour}:${dateParts.minute}:${dateParts.second}`;
}

module.exports = getCurrentDate;