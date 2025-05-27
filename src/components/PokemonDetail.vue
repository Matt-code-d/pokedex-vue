<template>
  <div class="pokemon-detail-card" :style="{ background: bgColor }">
    <div class="detail-header">
      <button class="button is-white is-small" @click="closeModal">
        <span class="icon"><i class="fas fa-arrow-left"></i></span>
      </button>
      <span class="detail-title">{{ formatName(pokemon.name) }}</span>
      <span class="detail-id">#{{ pokemon.id?.toString().padStart(3, '0') }}</span>
    </div>
    <div class="detail-img-wrap">
      <!-- Cambiato da currentArtwork a currentSprite -->
      <img :src="currentSprite" :alt="pokemon.name" class="detail-img" />
    </div>
    <div class="detail-content">
      <!-- Gallery -->
      <div class="detail-gallery">
        <div class="artwork-container">
          <img :src="currentArtwork" :alt="pokemon.name" class="artwork" />
        </div>
        <div class="sprites">
          <div class="sprite-container" :class="{active: !isShiny}" @click="setShiny(false)">
            <img :src="normalSprite" :alt="translate('ui', 'normal_form')" />
            <span class="sprite-label">{{ translate('ui', 'normal_form') }}</span>
          </div>
          <div class="sprite-container" :class="{active: isShiny}" @click="setShiny(true)">
            <img :src="currentShinySprite" :alt="translate('ui', 'shiny_form')" />
            <span class="sprite-label">{{ translate('ui', 'shiny_form') }}</span>
          </div>
        </div>
      </div>

      <!-- Types and Basic Info -->
      <div class="detail-types">
        <span 
          v-for="t in currentTypes" 
          :key="t"
          class="type-badge"
          :style="{ background: typeColors[t] }"
        >
          {{ translate('types', t) }}
        </span>
      </div>
      <div class="detail-physical">
        <div>
          <span class="detail-label">{{ translate('ui', 'weight') }}</span>
          <span class="detail-value">{{ formattedWeight }} {{ translate('ui', 'weight_unit') }}</span>
        </div>
        <div>
          <span class="detail-label">{{ translate('ui', 'height') }}</span>
          <span class="detail-value">{{ formattedHeight }} M</span>
        </div>
      </div>

      <!-- Stats Section -->
      <div class="detail-section">
        <span class="detail-section-title">{{ translate('ui', 'base_stats') }}</span>
        <div v-for="stat in currentStats" :key="stat.name" class="stat-row">
          <span class="stat-name">{{ translate('stats', formatStatName(stat.name)) }}</span>
          <div class="stat-bar-wrap">
            <div class="stat-bar-bg">
              <div 
                class="stat-bar" 
                :class="getStatClass(stat.name)"
                :style="{ 
                  width: `${(stat.value / statMax(stat.name)) * 100}%`,
                  backgroundColor: getStatColor(stat.value)
                }"
              ></div>
            </div>
            <span class="stat-value">{{ stat.value }}</span>
          </div>
        </div>
      </div>

      <!-- Evolution Chain -->
      <div v-if="pokemon.evolution" class="detail-section">
        <span class="detail-section-title">{{ translate('ui', 'evolution_chain') }}</span>
        <div class="evolution-chain">
          <div class="evolution-stage" v-for="(stage, index) in evolutionChain" :key="index">
            <div class="pokemon-stage">
              <img :src="stage.image" :alt="stage.name" class="stage-image" />
              <span class="stage-name">{{ formatName(stage.name) }}</span>
              <span v-if="stage.level" class="stage-level">
                {{ translate('ui', 'level') }} {{ stage.level }}
              </span>
            </div>
            <i v-if="index < evolutionChain.length - 1" class="fas fa-arrow-right evolution-arrow"></i>
          </div>
        </div>
      </div>

      <!-- Forms Section -->
      <div v-if="pokemon.forms?.length" class="detail-section">
        <span class="detail-section-title">{{ translate('ui', 'forms') }}</span>
        <div class="forms-grid">
          <div v-for="form in pokemon.forms" 
               :key="form.name"
               class="form-card"
               :class="{active: selectedForm && selectedForm.name === form.name}"
               @click="selectForm(form)">
            <img :src="form.image" :alt="form.name" class="form-image" />
            <div class="form-info">
              <span class="form-name">
                {{ getFormLabel(form.form_name) }}
              </span>
              <div class="form-types">
                <span v-for="type in form.types" 
                      :key="type"
                      class="tag is-small"
                      :class="'type-' + type">
                  {{ translate('types', type) }}
                </span>
              </div>
            </div>
          </div>
          <div v-if="pokemon.forms.length" class="form-card" :class="{active: !selectedForm}" @click="selectForm(null)">
            <img :src="pokemon.artwork" :alt="pokemon.name" class="form-image" />
            <div class="form-info">
              <span class="form-name">{{ translate('ui', 'normal_form') }}</span>
              <div class="form-types">
                <span v-for="type in pokemon.types" 
                      :key="type"
                      class="tag is-small"
                      :class="'type-' + type">
                  {{ translate('types', type) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Sound -->
      <div v-if="pokemon.cry" class="detail-section">
        <button class="button is-dark is-fullwidth" @click="playCry">
          <span class="icon"><i class="fas fa-volume-up"></i></span>
          <span>{{ translate('ui', 'play_cry') }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import { translations } from '../utils/translations';
import { typeColors } from '../utils/typeColors';

const props = defineProps({
  pokemon: {
    type: Object,
    required: true,
    default: () => ({
      id: 0,
      name: '',
      image: '',
      types: [],
      stats: [],
      weight: 0,
      height: 0
    })
  }
});

const emit = defineEmits(['close']);

// Stato per shiny e forma selezionata
const isShiny = ref(false);
const selectedForm = ref(null);

// Cambia shiny
function setShiny(val) {
  isShiny.value = val;
}

// Cambia forma alternativa
function selectForm(form) {
  selectedForm.value = form;
}

// Reset quando si chiude la modale
function closeModal() {
  isShiny.value = false;
  selectedForm.value = null;
  emit('close');
}

// Aggiorna shiny/forma se cambia pokemon
watch(() => props.pokemon, () => {
  isShiny.value = false;
  selectedForm.value = null;
});

// Funzione per ottenere l'artwork ufficiale (normale o shiny) dato un id
function getOfficialArtwork(id, shiny = false) {
  if (!id) return '';
  const num = typeof id === 'string' ? id.replace(/^0+/, '') : id;
  return shiny
    ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/${num}.png`
    : `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${num}.png`;
}

// Artwork corrente
const currentArtwork = computed(() => {
  const getShinyArtwork = (id) => 
    `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/${id}.png`;
  
  const getNormalArtwork = (id) =>
    `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;

  if (selectedForm.value?.id) {
    return isShiny.value ? getShinyArtwork(selectedForm.value.id) : getNormalArtwork(selectedForm.value.id);
  }

  const pokemonId = typeof props.pokemon.id === 'string' 
    ? props.pokemon.id.replace(/^0+/, '') 
    : props.pokemon.id;

  return isShiny.value ? getShinyArtwork(pokemonId) : getNormalArtwork(pokemonId);
});

// Sprite corrente
const currentSprite = computed(() => {
  const getSpriteUrl = (id, shiny = false) => {
    const num = typeof id === 'string' ? id.replace(/^0+/, '') : id;
    return shiny
      ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/${num}.png`
      : `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${num}.png`;
  };

  if (selectedForm.value?.id) {
    return isShiny.value ? getSpriteUrl(selectedForm.value.id, true) : getSpriteUrl(selectedForm.value.id);
  }

  const pokemonId = typeof props.pokemon.id === 'string' 
    ? props.pokemon.id.replace(/^0+/, '') 
    : props.pokemon.id;

  return isShiny.value ? getSpriteUrl(pokemonId, true) : getSpriteUrl(pokemonId);
});
const currentShinySprite = computed(() => {
  const getSpriteUrl = (id) => 
    `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/${id}.png`;

  if (selectedForm.value?.id) {
    return getSpriteUrl(selectedForm.value.id);
  }

  const pokemonId = typeof props.pokemon.id === 'string' 
    ? props.pokemon.id.replace(/^0+/, '') 
    : props.pokemon.id;

  return getSpriteUrl(pokemonId);
});
const normalSprite = computed(() => {
  const getSpriteUrl = (id) => 
    `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;

  if (selectedForm.value?.id) {
    return getSpriteUrl(selectedForm.value.id);
  }

  const pokemonId = typeof props.pokemon.id === 'string' 
    ? props.pokemon.id.replace(/^0+/, '') 
    : props.pokemon.id;

  return getSpriteUrl(pokemonId);
});

// Tipi correnti
const currentTypes = computed(() => {
  if (selectedForm.value) return selectedForm.value.types;
  return props.pokemon.types;
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
    ${color1} 35%, 
    ${color2} 65%, 
    ${color2} 100%
  )`;
};

const bgColor = computed(() => 
  getTypeGradient(currentTypes.value)
);

const formattedWeight = computed(() => {
  return props.pokemon.weight ? (props.pokemon.weight / 10).toFixed(1) : '-';
});

const formattedHeight = computed(() => {
  return props.pokemon.height ? (props.pokemon.height / 10).toFixed(1) : '-';
});

function statMax(name) {
  switch (name) {
    case 'hp': return 255;
    case 'attack': return 190; 
    case 'defense': return 230;
    case 'special-attack': return 194;
    case 'special-defense': return 230;
    case 'speed': return 200;
    default: return 200;
  }
}

const getStatColor = (value) => {
  if (value >= 120) return '#00c853';
  if (value >= 90) return '#64dd17';
  if (value >= 60) return '#ffd600';
  return '#ff3d00';
};

const getStatClass = (name) => {
  const classes = {
    'hp': 'stat-hp',
    'attack': 'stat-attack',
    'defense': 'stat-defense',
    'special-attack': 'stat-special-attack',
    'special-defense': 'stat-special-defense',
    'speed': 'stat-speed'
  };
  return classes[name] || 'stat-default';
};

const playCry = () => {
  if (props.pokemon.cry) {
    new Audio(props.pokemon.cry).play();
  }
};

const evolutionChain = computed(() => {
  const chain = [];
  let current = props.pokemon.evolution;

  while (current) {
    chain.push({
      name: current.species.name,
      image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${current.species.url.split('/').slice(-2, -1)}.png`,
      level: current.evolution_details?.[0]?.min_level || null
    });
    current = current.evolves_to?.[0];
  }

  return chain;
});

// Sposta questa computed property prima del suo utilizzo
// Statistiche correnti
const currentStats = computed(() => {
  if (selectedForm.value) return selectedForm.value.stats;
  return props.pokemon.stats;
});

const formatName = (name) => {
  return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
};

const getFormLabel = (formName) => {
  if (!formName) return '';
  if (formName.includes('mega')) return translate('ui', 'mega_evolution');
  if (formName.includes('gmax')) return translate('ui', 'gigantamax');
  if (formName.includes('alola')) return translate('ui', 'alolan_form');
  if (formName.includes('galar')) return translate('ui', 'galarian_form');
  if (formName.includes('hisui')) return translate('ui', 'hisuian_form');
  if (formName.includes('paldea')) return translate('ui', 'paldean_form');
  return formName;
};

const translate = (category, key) => {
  return translations[category]?.[key] || key;
};

const formatStatName = (name) => {
  return name.replace('special-attack', 'special attack')
            .replace('special-defense', 'special defense');
};
</script>

<style scoped>
.pokemon-detail-card {
  max-width: 600px;
  margin: 0 auto;
  border-radius: 32px;
  overflow: auto;
  background: #fff;
  box-shadow: 0 8px 32px #0002;
  display: flex;
  flex-direction: column;
  min-height: 90vh;
  width: 100%;
}
.detail-header {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.2rem 1.5rem 0.5rem 1.5rem;
  background: transparent;
}
.detail-header::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    45deg,
    rgba(255,255,255,0.15) 0%,
    rgba(255,255,255,0.05) 50%,
    rgba(255,255,255,0.15) 100%
  );
  z-index: 1;
  pointer-events: none;
}
.detail-header::after {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(
    circle at 50% 0%, 
    rgba(255,255,255,0.1) 0%, 
    transparent 70%
  );
  z-index: 2;
  pointer-events: none;
}
.detail-title {
  font-weight: bold;
  font-size: 1.2rem;
  color: #fff;
  letter-spacing: 1px;
}
.detail-id {
  color: #fff;
  font-weight: bold;
  font-size: 1.1rem;
}
.detail-img-wrap {
  display: flex;
  justify-content: center;
  align-items: center;
  background: transparent;
  min-height: 180px;
}
.detail-img {
  width: 160px;
  height: 160px;
  object-fit: contain;
  margin-top: -1.5rem;
  filter: drop-shadow(0 4px 16px #0003);
  max-width: 100%;
  max-height: 100%;
}
.detail-content {
  background: #222;
  border-radius: 32px 32px 0 0;
  padding: 2rem 1.5rem 1.5rem 1.5rem;
  margin-top: -2rem;
  color: #fff;
  flex: 1;
  display: flex;
  flex-direction: column;
}
.detail-name {
  text-align: center;
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  text-transform: lowercase;
  letter-spacing: 1px;
}
.detail-gallery {
  margin: 1rem 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}
.artwork-container {
  width: 200px;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.artwork {
  position: absolute;
  max-width: 100%;
  max-height: 100%;
  width: auto;
  height: auto;
  object-fit: contain;
}
.sprites {
  display: flex;
  gap: 1rem;
}
.sprite-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 5px;
  border-radius: 0.8rem;
  cursor: pointer;
}
.sprite-label {
  margin-top: 0.5rem;
  font-size: 0.9rem;
  color: #fff;
  text-transform: capitalize;
}
.sprites img {
  width: 80px;
  height: 80px;
  object-fit: contain;
  background: rgba(255,255,255,0.1);
  border-radius: 50%;
  padding: 0.5rem;
}
.detail-types {
  display: flex;
  justify-content: center;
  gap: 0.7rem;
  margin-bottom: 1.2rem;
}
.type-badge {
  font-weight: bold;
  border-radius: 16px;
  padding: 0.3em 1.2em;
  color: #fff;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.3);
  border: none;
  box-shadow: inset 0 0 20px rgba(0,0,0,0.1);
}
.detail-physical {
  display: flex;
  justify-content: space-around;
  margin-bottom: 1.5rem;
}
.detail-label {
  font-size: 0.9rem;
  color: #bbb;
  display: block;
}
.detail-value {
  font-size: 1.1rem;
  font-weight: bold;
  color: #fff;
}
.detail-section {
  margin-top: 1.2rem;
}
.detail-section-title {
  font-size: 1.1rem;
  font-weight: bold;
  color: #fff;
  margin-bottom: 0.7rem;
  display: block;
}
.stat-row {
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
}
.stat-name {
  width: 60px;
  font-size: 0.95rem;
  color: #fff;
  font-weight: 500;
}
.stat-bar-wrap {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.stat-bar-bg {
  background: #444;
  border-radius: 8px;
  width: 100%;
  height: 14px;
  overflow: hidden;
  margin-right: 0.3rem;
}
.stat-bar {
  height: 100%;
  border-radius: 8px;
  transition: width 1s ease-out;
}
.stat-hp { background: #ff0000; }
.stat-attack { background: #f08030; }
.stat-defense { background: #f8d030; }
.stat-special-attack { background: #6890f0; }
.stat-special-defense { background: #78c850; }
.stat-speed { background: #f85888; }
.stat-default { background: #a8a878; }
.stat-value {
  min-width: 48px;
  text-align: right;
  font-size: 0.95rem;
  color: #fff;
  font-weight: 500;
}

/* Aggiungi stili per evolution chain... */
.evolution-chain {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 1rem;
  margin: 1rem 0;
  padding: 1rem;
  background: rgba(255,255,255,0.05);
  border-radius: 16px;
}

.evolution-stage {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.pokemon-stage {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.stage-image {
  width: 80px;
  height: 80px;
  object-fit: contain;
  background: rgba(255,255,255,0.1);
  border-radius: 50%;
  padding: 0.5rem;
  transition: transform 0.3s;
}

.stage-image:hover {
  transform: scale(1.1);
}

.stage-name {
  font-size: 1rem;
  font-weight: 500;
  text-transform: capitalize;
}

.stage-level {
  font-size: 0.8rem;
  color: #aaa;
}

.evolution-arrow {
  color: #aaa;
  font-size: 1.5rem;
}

/* Nuovi stili per le forme */
.forms-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  padding: 1rem;
  background: rgba(255,255,255,0.05);
  border-radius: 16px;
}

.form-card {
  background: rgba(0,0,0,0.2);
  border-radius: 12px;
  padding: 1rem;
  text-align: center;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.form-card:hover {
  transform: translateY(-2px);
}

.form-image {
  width: 100px;
  height: 100px;
  object-fit: contain;
  margin-bottom: 0.5rem;
  max-width: 100px;
  max-height: 100px;
}

.form-name {
  display: block;
  font-size: 0.9rem;
  color: #fff;
  margin-bottom: 0.5rem;
}

.form-types {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
}

.sprite-container.active {
  outline: 2px solid #555;
  box-shadow: 0 0 0 2px #84848454;
  padding: 5px;
  border-radius: 0.8rem;
}

.form-card.active {
  border: 2px solid #ffffff;
  box-shadow: 0 0 0 2px #ffd60055;
}

@media (max-width: 480px) {
  .evolution-chain {
    flex-direction: column;
  }

  .evolution-stage {
    flex-direction: column;
  }

  .evolution-arrow {
    transform: rotate(90deg);
  }
}
</style>
