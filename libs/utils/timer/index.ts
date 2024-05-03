let timer = 0;
let globalTimer = 0;

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
