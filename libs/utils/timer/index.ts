let timer = 0;
let globalTimer = 0;

const TWO_WEEKS = 2;
const FIFTEEN_MINUTES = 15;

const MILISECONDS_IN_SECOND = 1000;

const NO_FRACTION_DIGITS = 0;

export const SECONDS_IN_MINUTE = 60;
export const MINUTES_IN_HOUR = 60;
export const SECONDS_IN_HOUR = SECONDS_IN_MINUTE * MINUTES_IN_HOUR;
export const HOURS_IN_DAY = 24;
export const SECONDS_IN_DAY = SECONDS_IN_HOUR * HOURS_IN_DAY;
export const DAYS_IN_WEEK = 7;
export const SECONDS_IN_WEEK = SECONDS_IN_DAY * DAYS_IN_WEEK;

export const TOKEN_COOKIE_MAX_AGE = SECONDS_IN_WEEK * TWO_WEEKS;
export const TOKEN_EXPIRY = SECONDS_IN_MINUTE * FIFTEEN_MINUTES;

export const getCurrentDate = (): number => Date.now();

export const getFutureDate = (time: number): number =>
  Number((Date.now() / MILISECONDS_IN_SECOND).toFixed(NO_FRACTION_DIGITS)) +
  time;

export const setTimers = (): void => {
  timer = Date.now();
  setGlobalTimer();
};

export const setGlobalTimer = (): void => {
  globalTimer = Date.now();
};

export const getPassedTime = (): number => {
  return Date.now() - timer;
};

export const getGlobalPassedTime = (): number => {
  return Date.now() - globalTimer;
};
