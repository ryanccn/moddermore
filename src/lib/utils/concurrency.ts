import pLimit from "p-limit";

export const autoClientConcurrency = () => {
  switch (window.navigator?.connection?.effectiveType) {
    case "4g": {
      return 10;
    }
    case "3g": {
      return 6;
    }
    case "2g": {
      return 3;
    }
    case "slow-2g": {
      return 1;
    }
    default: {
      return 8;
    }
  }
};

export const clientPLimit = () => pLimit(autoClientConcurrency());
