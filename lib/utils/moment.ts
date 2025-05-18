const moment = require("moment");

export const today = () => moment().date();

export const isBetween = (start: Date, end: Date, date: Date): boolean => {
  const startDate = moment(start);
  const endDate = moment(end);
  const checkDate = moment(date);

  return checkDate.isBetween(startDate, endDate, undefined, "[]");
};

export const isDateRangeOverlapping = (
  desiredStart: Date,
  desiredEnd: Date,
  reservedStart: Date,
  reservedEnd: Date
): boolean => {
  const start1 = moment(desiredStart);
  const end1 = moment(desiredEnd);
  const start2 = moment(reservedStart);
  const end2 = moment(reservedEnd);

  // Checks if two ranges overlap
  return start1.isBefore(end2) && end1.isAfter(start2);
};
