let startTime = 0;

export const startTimer = () => {
  startTime = Date.now();
};

export const getTimePassed = () => Date.now() - startTime;
