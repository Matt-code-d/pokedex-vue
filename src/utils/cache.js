const CACHE_PREFIX = 'pokedex_';
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours
const MAX_CACHE_SIZE = 500; // Limite massimo di elementi in cache

export const cache = {
  set(key, data) {
    try {
      // Pulisci la cache se supera la dimensione massima
      this.cleanup();
      
      const item = {
        data,
        timestamp: Date.now()
      };
      localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(item));
    } catch (e) {
      // Se la quota è superata, pulisci la cache più vecchia
      if (e.name === 'QuotaExceededError' || e.name === 'QUOTA_EXCEEDED_ERR') {
        this.cleanup(true);
        try {
          localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(item));
        } catch (retryError) {
          console.warn('Cache write failed after cleanup:', retryError);
        }
      } else {
        console.warn('Cache write failed:', e);
      }
    }
  },

  get(key) {
    try {
      const item = localStorage.getItem(CACHE_PREFIX + key);
      if (!item) return null;

      const { data, timestamp } = JSON.parse(item);
      if (Date.now() - timestamp > CACHE_EXPIRY) {
        localStorage.removeItem(CACHE_PREFIX + key);
        return null;
      }

      return data;
    } catch (e) {
      console.warn('Cache read failed:', e);
      return null;
    }
  },

  clear() {
    try {
      Object.keys(localStorage)
        .filter(key => key.startsWith(CACHE_PREFIX))
        .forEach(key => localStorage.removeItem(key));
    } catch (e) {
      console.warn('Cache clear failed:', e);
    }
  },

  cleanup(force = false) {
    try {
      const now = Date.now();
      const cacheItems = Object.keys(localStorage)
        .filter(key => key.startsWith(CACHE_PREFIX))
        .map(key => ({
          key,
          timestamp: JSON.parse(localStorage.getItem(key)).timestamp
        }))
        .sort((a, b) => b.timestamp - a.timestamp);

      if (force || cacheItems.length > MAX_CACHE_SIZE) {
        // Mantieni solo gli elementi più recenti
        cacheItems
          .slice(MAX_CACHE_SIZE)
          .forEach(item => localStorage.removeItem(item.key));
      }

      // Rimuovi anche gli elementi scaduti
      cacheItems.forEach(item => {
        if (now - item.timestamp > CACHE_EXPIRY) {
          localStorage.removeItem(item.key);
        }
      });
    } catch (e) {
      console.warn('Cache cleanup failed:', e);
    }
  }
};
