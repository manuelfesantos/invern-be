let timer = 0;
let globalTimer = 0;

export const setTimers = () => {
  globalTimer = Date.now();
  setTimer();
};

export const setTimer = () => {
  timer = Date.now();
};

export const getPassedTime = () => {
  return Date.now() - timer;
};

export const getGlobalPassedTime = () => {
  return Date.now() - globalTimer;
};
