<template>
  <nav class="navbar is-fixed-top">
    <div class="container">
      <div class="navbar-brand">
        <div class="navbar-item brand-content">
          <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png" 
               alt="Pokéball" 
               class="navbar-logo"
          />
          <div class="title-container">
            <h1 class="title has-text-white is-4 mb-0 ml-2">{{ translate('ui', 'pokedex') }}</h1>
            <span class="subtitle">by matteosantoro.dev</span>
          </div>
        </div>
      </div>

      <div class="navbar-menu">
        <div class="navbar-end">
          <div class="navbar-item">
            <div class="tags has-addons">
              <span class="tag is-dark stats-tag">
                <span class="icon"><i class="fas fa-database"></i></span>
                <span class="ml-1">{{ translate('ui', 'found_pokemon') }}</span>
              </span>
              <span class="tag is-danger stats-number">{{ pokemonCount }}</span>
            </div>
          </div>
          <div class="navbar-item">
            <div class="buttons">
              <a href="https://github.com/Matt-code-d/pokedex-vue" 
                 target="_blank" 
                 class="button is-dark is-small">
                <span class="icon">
                  <i class="fab fa-github"></i>
                </span>
                <span>GitHub</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { translations } from '../utils/translations';

defineProps({
  pokemonCount: {
    type: Number,
    default: 0
  }
});

const translate = (category, key) => {
  return translations[category]?.[key] || key;
};
</script>

<style scoped>
.navbar {
  background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
  box-shadow: 0 2px 12px rgba(0,0,0,0.2);
  padding: 0.5rem;
}

.brand-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.navbar-logo {
  width: 35px;
  height: 35px;
  animation: bounce 2s infinite;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
}

.navbar-item .title {
  font-family: 'system-ui', sans-serif;
  letter-spacing: 1px;
  font-size: 1.5rem;
  background: linear-gradient(to right, #fff, #fffce9);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.title-container {
  display: flex;
  flex-direction: column;
}

.subtitle {
  font-size: 0.8rem;
  color: rgba(255,255,255,0.8);
  margin-left: 0.5rem;
}

.stats-tag {
  background: rgba(0,0,0,0.3);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  font-weight: 500;
}

.stats-number {
  background: #c0392b;
  color: white;
  font-weight: bold;
  min-width: 3rem;
  justify-content: center;
}

.button.is-dark {
  background: rgba(0,0,0,0.3);
  border: 1px solid rgba(255,255,255,0.1);
  color: white;
  transition: all 0.3s ease;
}

.button.is-dark:hover {
  background: rgba(0,0,0,0.5);
  transform: translateY(-1px);
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}

@media (max-width: 768px) {
  .navbar-menu {
    background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
  }
  
  .navbar-item .title {
    font-size: 1.2rem;
  }
}
</style>
