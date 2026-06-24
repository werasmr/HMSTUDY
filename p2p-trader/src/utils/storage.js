const STORAGE_KEYS = {
  CARDS: 'p2p_route_cards',
  ROUTES: 'p2p_payout_routes',
  ARCHIVED_ROUTES: 'p2p_archived_payout_routes',
};

export const storage = {
  getCards: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CARDS);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  saveCards: (cards) => {
    localStorage.setItem(STORAGE_KEYS.CARDS, JSON.stringify(cards));
  },

  getRoutes: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ROUTES);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  saveRoutes: (routes) => {
    localStorage.setItem(STORAGE_KEYS.ROUTES, JSON.stringify(routes));
  },

  getArchivedRoutes: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ARCHIVED_ROUTES);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveArchivedRoutes: (routes) => {
    localStorage.setItem(STORAGE_KEYS.ARCHIVED_ROUTES, JSON.stringify(routes));
  },
};
