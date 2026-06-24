const STORAGE_KEYS = {
  CARDS: 'p2p_cards',
  DEALS: 'p2p_deals',
  ARCHIVED_DEALS: 'p2p_archived_deals',
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

  getDeals: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DEALS);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  saveDeals: (deals) => {
    localStorage.setItem(STORAGE_KEYS.DEALS, JSON.stringify(deals));
  },

  getArchivedDeals: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ARCHIVED_DEALS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveArchivedDeals: (deals) => {
    localStorage.setItem(STORAGE_KEYS.ARCHIVED_DEALS, JSON.stringify(deals));
  },
};
