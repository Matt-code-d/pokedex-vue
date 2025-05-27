<template>
  <div 
    class="pokemon-card" 
    :style="cardBackground"
    @click="$emit('click')"
  >
    <div class="card-header">
      <span class="pokemon-name">{{ formatName(pokemon.name) }}</span>
      <span class="pokemon-id">#{{ pokemon.id }}</span>
    </div>
    <div class="card-body">
      <div class="types">
        <span 
          v-for="type in pokemon.types" 
          :key="type" 
          class="type-badge"
          :style="{ background: typeColors[type] }"
        >
          {{ translate('types', type) }}
        </span>
      </div>
      <img :src="spriteUrl" :alt="pokemon.name" class="pokemon-image" />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { translations } from '../utils/translations';
import { typeColors } from '../utils/typeColors';

const props = defineProps({
  pokemon: Object,
  spriteType: {
    type: String,
    default: 'default'
  }
});

const getTypeGradient = (types) => {
  if (!types || types.length === 0) {
    return 'linear-gradient(135deg, #f4f4f4 0%, #dcdcdc 100%)';
  }

  if (types.length === 1) {
    const color = typeColors[types[0]];
    const lighterColor = color + '99';
    return `linear-gradient(135deg, ${color} 0%, ${lighterColor} 100%)`;
  }

  const color1 = typeColors[types[0]];
  const color2 = typeColors[types[1]];
  
  return `linear-gradient(135deg, 
    ${color1} 0%, 
    ${color1} 85%, 
    ${color2} 65%, 
    ${color2} 35%
  )`;
};

const cardBackground = computed(() => ({
  background: getTypeGradient(props.pokemon.types)
}));

const translate = (category, key) => {
  return translations[category]?.[key] || key;
};

const formatName = (name) => {
  if (!name || typeof name !== 'string') return '';
  return name.split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Aggiungi costanti per i limiti degli sprite
const SPRITE_LIMITS = {
  icons: 807,    // Gen 7 icons limit
  dream: 649     // Dream World sprites limit
};

const spriteUrl = computed(() => {
  // Rimuovi eventuali zeri iniziali dall'id
  const rawId = parseInt(props.pokemon.id.replace(/^0+/, ''));
  
  switch (props.spriteType) {
    case 'icons':
      return rawId <= SPRITE_LIMITS.icons 
        ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-vii/icons/${rawId}.png`
        : props.pokemon.image;
    case 'dream':
      return rawId <= SPRITE_LIMITS.dream
        ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/dream-world/${rawId}.svg`
        : props.pokemon.image;
    case 'official':
      return props.pokemon.artwork || props.pokemon.image;
    default:
      return props.pokemon.image;
  }
});
</script>

<style scoped>
.pokemon-card {
  border-radius: 20px;
  padding: 1.2rem;
  height: 100%;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  box-shadow: 0 8px 16px rgba(0,0,0,0.1);
  backdrop-filter: blur(5px);
  isolation: isolate;
}

.pokemon-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    45deg,
    rgba(255,255,255,0.15) 0%,
    rgba(255,255,255,0.05) 50%,
    rgba(255,255,255,0.15) 100%
  );
  border-radius: inherit;
  z-index: 1;
}

.pokemon-card::after {
  content: '';
  position: absolute;
  inset: 0;
  background: 
    radial-gradient(
      circle at 50% 0%, 
      rgba(255,255,255,0.1) 0%, 
      transparent 70%
    );
  border-radius: inherit;
  z-index: 2;
}

.pokemon-card:hover {
  transform: translateY(-5px) scale(1.02);
  box-shadow: 0 12px 24px rgba(0,0,0,0.15);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.pokemon-name {
  color: white;
  font-size: 1.4rem;
  font-weight: bold;
  text-transform: capitalize;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
}

.pokemon-id {
  color: rgba(255,255,255,0.8);
  font-size: 1.1rem;
  font-weight: bold;
}

.types {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.type-badge {
  padding: 0.3rem 1rem;
  border-radius: 20px;
  color: white;
  font-size: 0.9rem;
  font-weight: 500;
  text-transform: capitalize;
  box-shadow: inset 0 0 20px rgba(0,0,0,0.1);
  text-shadow: 1px 1px 2px rgba(0,0,0,0.3);
}

.pokemon-image {
  width: 120px;
  height: 120px;
  object-fit: contain;
  margin: 0.5rem auto 0;
  filter: drop-shadow(0 4px 8px rgba(0,0,0,0.2));
  transition: transform 0.3s;
  image-rendering: pixelated; /* Solo per gli sprite pixel art */
}

.pokemon-image[data-sprite-type="icons"] {
  width: 40px;
  height: 30px;
  image-rendering: pixelated;
}

.pokemon-image[data-sprite-type="dream"],
.pokemon-image[data-sprite-type="official"] {
  width: 120px;
  height: 120px;
  image-rendering: auto; /* Rimuovi pixelated per artwork */
}

.pokemon-card:hover .pokemon-image {
  transform: scale(1.1);
}
</style>
