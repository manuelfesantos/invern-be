const FIRST_CHARACTER = 0;
const LAST_CHARACTER = -1;
const ONE = 1;

const TWO_WEEKS = 2;
const THIRTY_MINUTES = 30;
const TEN_MINUTES = 10;
const FIFTEEN_MINUTES = 15;

export const MILLISECONDS_IN_SECOND = 1000;

const NO_FRACTION_DIGITS = 0;

export const NO_MAX_AGE = 0;

const SECONDS_IN_MINUTE = 60;
const MINUTES_IN_HOUR = 60;
const SECONDS_IN_HOUR = SECONDS_IN_MINUTE * MINUTES_IN_HOUR;
const HOURS_IN_DAY = 24;
const SECONDS_IN_DAY = SECONDS_IN_HOUR * HOURS_IN_DAY;
const DAYS_IN_WEEK = 7;
const SECONDS_IN_WEEK = SECONDS_IN_DAY * DAYS_IN_WEEK;

export const TOKEN_COOKIE_MAX_AGE = SECONDS_IN_WEEK * TWO_WEEKS;
export const TOKEN_EXPIRY = SECONDS_IN_MINUTE * FIFTEEN_MINUTES;
export const SESSION_EXPIRY = SECONDS_IN_MINUTE * THIRTY_MINUTES;
export const FORGOT_SECRET_EXPIRY = SECONDS_IN_MINUTE * TEN_MINUTES;

export const getFutureDate = (
  time: number,
  format: "seconds" | "milliseconds" = "seconds",
): number =>
  (Number((Date.now() / MILLISECONDS_IN_SECOND).toFixed(NO_FRACTION_DIGITS)) +
    time) *
  (format === "milliseconds" ? MILLISECONDS_IN_SECOND : ONE);

export const getCurrentTime = (): number => {
  return Date.now();
};

export const getDateTime = (ms?: number): string => {
  const date = ms ? new Date(ms) : new Date();
  return date.toISOString().slice(FIRST_CHARACTER, LAST_CHARACTER);
};
