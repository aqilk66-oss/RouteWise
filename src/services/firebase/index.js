// Firebase Service Architecture Placeholders (Stage 1 & 2 preparation)
export const authService = {
  login: async (email, password) => { throw new Error("Implemented in Stage 3"); },
  logout: async () => { throw new Error("Implemented in Stage 3"); },
  register: async (userData) => { throw new Error("Implemented in Stage 3"); },
};

export const userService = {
  getUserProfile: async (uid) => { return null; },
};

export const busService = {
  getActiveBuses: async () => { return []; },
};

export const routeService = {
  getRoutes: async () => { return []; },
};
