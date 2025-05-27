<template>
  <div class="pokedex-app">
    <Navbar :pokemon-count="displayPokemons.length" />

    <div class="main-content">
      <div class="search-container">
        <PokedexFilters
          :types="types"
          :search="search"
          :type="selectedType"
          :loading="searching"
          @update:search="debouncedSearch"
          @update:type="selectedType = $event"
        />
      </div>

      <div class="pokemon-grid">
        <transition-group name="fade">
          <div v-for="pokemon in displayPokemons"
               :key="pokemon.id"
               class="pokemon-item">
            <PokemonCard :pokemon="pokemon" @click="selectPokemon(pokemon)" />
          </div>
        </transition-group>
        
        <div ref="intersectionTarget" class="intersection-target"></div>
      </div>

      <div v-if="loading || searching" class="loading-overlay">
        <div class="loading-spinner"></div>
      </div>

      <div v-if="selected" class="modal is-active">
        <div class="modal-background" @click="selected = null"></div>
        <div class="modal-card">
          <PokemonDetail 
            :pokemon="selected"
            @close="selected = null"
          />
        </div>
      </div>
    </div>

    <ScrollToTop />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, onUnmounted } from 'vue';
import axios from 'axios';
import { debounce } from 'lodash-es';
import PokemonCard from '../components/PokemonCard.vue';
import PokedexFilters from '../components/PokedexFilters.vue';
import PokemonDetail from '../components/PokemonDetail.vue';
import Navbar from '../components/Navbar.vue';
import ScrollToTop from '../components/ScrollToTop.vue';
import { translations } from '../utils/translations';

// Constants
const ITEMS_PER_PAGE = 24;
const SEARCH_DEBOUNCE = 500;
const SEARCH_LIMIT = 50;

// State
const allPokemons = ref(new Map());
const allNames = ref([]);
const nextUrl = ref('https://pokeapi.co/api/v2/pokemon?limit=40');
const loading = ref(false);
const searching = ref(false);
const search = ref('');
const selected = ref(null);
const types = ref([]);
const selectedType = ref('');
const currentPage = ref(1);

const displayPokemons = computed(() => {
  let list = Array.from(allPokemons.value.values());
  
  if (search.value) {
    const searchLower = search.value.toLowerCase();
    list = list.filter(p => p.name.includes(searchLower));
  }
  
  if (selectedType.value) {
    list = list.filter(p => p.types.includes(selectedType.value));
  }
  
  return list.sort((a, b) => parseInt(a.id) - parseInt(b.id));
});

const totalPages = computed(() => Math.ceil(displayPokemons.value.length / ITEMS_PER_PAGE));

let observer = null;

const setupInfiniteScroll = () => {
  if (observer) {
    observer.disconnect();
  }

  observer = new IntersectionObserver(
    (entries) => {
      const entry = entries[0];
      if (entry.isIntersecting && !loading.value && nextUrl.value && !search.value && !selectedType.value) {
        console.log('Loading more pokemon...');
        loadMore();
      }
    },
    { 
      root: null,
      threshold: 0,
      rootMargin: '200px'
    }
  );

  if (intersectionTarget.value) {
    observer.observe(intersectionTarget.value);
  }
};

const debouncedSearch = debounce((value) => {
  search.value = value;
  currentPage.value = 1;
  refreshDisplayPokemons();
}, SEARCH_DEBOUNCE);

const fetchTypes = async () => {
  const { data } = await axios.get('https://pokeapi.co/api/v2/type');
  types.value = data.results.map(t => t.name).filter(t => t !== 'unknown' && t !== 'shadow');
};

const fetchAllNames = async () => {
  const { data } = await axios.get('https://pokeapi.co/api/v2/pokemon?limit=2000');
  allNames.value = data.results.map(p => p.name);
};

const fetchEvolutionChain = async (speciesUrl) => {
  try {
    const { data: species } = await axios.get(speciesUrl);
    const { data: evolution } = await axios.get(species.evolution_chain.url);
    return evolution.chain;
  } catch (e) {
    console.error('Error fetching evolution:', e);
    return null;
  }
};

const fetchPokemonForms = async (speciesUrl) => {
  try {
    const { data: species } = await axios.get(speciesUrl);
    const forms = [];

    for (const variety of species.varieties) {
      if (!variety.is_default) {
        const { data: formData } = await axios.get(variety.pokemon.url);
        forms.push({
          name: formData.name,
          image: formData.sprites?.other['official-artwork']?.front_default || formData.sprites?.front_default,
          types: formData.types.map(t => t.type.name)
        });
      }
    }

    if (species.forms_switchable) {
      const { data: formsList } = await axios.get(`https://pokeapi.co/api/v2/pokemon-form?limit=1000`);
      const potentialForms = formsList.results.filter(f => f.name.includes(species.name));
      
      for (const form of potentialForms) {
        const { data: formData } = await axios.get(form.url);
        if (formData.form_name && 
           (formData.form_name.includes('mega') || 
            formData.form_name.includes('galar') ||
            formData.form_name.includes('alola') ||
            formData.form_name.includes('hisui') ||
            formData.form_name.includes('paldea') ||
            formData.form_name.includes('gmax'))) {
          forms.push({
            name: formData.name,
            form_name: formData.form_name,
            image: formData.sprites?.front_default,
            types: formData.types?.map(t => t.type.name) || []
          });
        }
      }
    }

    return forms;
  } catch (e) {
    console.error('Error fetching forms:', e);
    return [];
  }
};

const fetchPokemonByName = async (name) => {
  if (!name) return null;
  
  const existingPokemon = Array.from(allPokemons.value.values())
    .find(p => p.name === name);
  if (existingPokemon) return existingPokemon;
  
  searching.value = true;
  try {
    const { data } = await axios.get(`https://pokeapi.co/api/v2/pokemon/${name}`);
    const { data: species } = await axios.get(data.species.url);
    
    const pokemon = {
      id: String(data.id || '0').padStart(3, '0'),
      name: (data.name || '').toLowerCase().replace(/-/g, ' '),
      image: data.sprites?.front_default,
      imageShiny: data.sprites?.front_shiny,
      artwork: data.sprites?.other['official-artwork']?.front_default,
      types: (data.types || [])
        .sort((a, b) => (a.slot || 0) - (b.slot || 0))
        .map(t => t?.type?.name)
        .filter(Boolean)
        .map(t => t.toLowerCase()),
      abilities: (data.abilities || [])
        .map(a => ({
          name: a?.ability?.name?.toLowerCase().replace(/-/g, ' '),
          hidden: a?.is_hidden
        }))
        .filter(a => a.name),
      stats: (data.stats || [])
        .filter(s => s?.stat?.name && s?.base_stat != null)
        .map(s => ({
          name: s.stat.name.toLowerCase().replace(/-/g, ' '),
          value: s.base_stat
        })),
      weight: data.weight || 0,
      height: data.height || 0,
      cry: data.cries?.latest || '',
      species: species,
      evolution: await fetchEvolutionChain(data.species.url),
      forms: await fetchPokemonForms(data.species.url)
    };

    if (!pokemon.types.length) {
      pokemon.types = ['unknown'];
    }

    allPokemons.value.set(pokemon.id, pokemon);

    return pokemon;
  } catch (e) {
    console.error(`Error fetching ${name}:`, e);
    return null;
  } finally {
    searching.value = false;
  }
};

const fetchPokemons = async (url) => {
  loading.value = true;
  try {
    const { data } = await axios.get(url);
    nextUrl.value = data.next;
    
    const promises = data.results.map(pokemon => fetchPokemonByName(pokemon.name));
    const newPokemons = await Promise.all(promises);
    
    newPokemons.filter(Boolean).forEach(pokemon => {
      allPokemons.value.set(pokemon.id, pokemon);
    });
    
  } catch (error) {
    console.error('Error fetching pokemons:', error);
  } finally {
    loading.value = false;
  }
};

async function refreshDisplayPokemons() {
  if (search.value) {
    const searchLower = search.value.toLowerCase();
    const matchingNames = allNames.value
      .filter(n => n.includes(searchLower))
      .slice(0, SEARCH_LIMIT);

    const promises = matchingNames
      .filter(name => !Array.from(allPokemons.value.values()).find(p => p.name === name))
      .map(name => fetchPokemonByName(name));
      
    await Promise.all(promises);
  }

  if (!search.value && selectedType.value) {
    try {
      const { data } = await axios.get(`https://pokeapi.co/api/v2/type/${selectedType.value}`);
      const namesToLoad = data.pokemon
        .map(p => p.pokemon.name)
        .filter(name => !Array.from(allPokemons.value.values()).find(p => p.name === name))
        .slice(0, SEARCH_LIMIT);

      const promises = namesToLoad.map(name => fetchPokemonByName(name));
      await Promise.all(promises);
    } catch (e) {
      console.error('Error loading type pokemon:', e);
    }
  }
}

const loadMore = async () => {
  if (loading.value || !nextUrl.value || search.value || selectedType.value) return;
  
  await fetchPokemons(nextUrl.value);
  setupInfiniteScroll();
};

const selectPokemon = (pokemon) => {
  selected.value = pokemon;
};

const intersectionTarget = ref(null);

onMounted(() => {
  fetchPokemons(nextUrl.value).then(() => {
    fetchTypes();
    fetchAllNames();
    setupInfiniteScroll();
  });
});

onUnmounted(() => {
  if (observer) {
    observer.disconnect();
    observer = null;
  }
});

watch(selectedType, () => {
  currentPage.value = 1;
  refreshDisplayPokemons();
});

const translate = (category, key) => {
  return translations[category]?.[key] || key;
};
</script>

<style scoped>
.pokedex-app {
  min-height: 100vh;
  padding-top: 3.25rem;
  background-color: #f5f5f5;
}

@media (prefers-color-scheme: dark) {
  .pokedex-app {
    background-color: #1a1a1a;
  }

  .search-container {
    background: #2d2d2d;
    box-shadow: 0 2px 12px rgba(0,0,0,0.2);
  }

  .loading-overlay {
    background: rgba(45, 45, 45, 0.9);
  }

  .loading-spinner {
    border-color: #2d2d2d;
  }
}

.main-content {
  padding: 2rem 1rem;
  max-width: 1600px;
  margin: 0 auto;
}

.search-container {
  position: sticky;
  top: 3.25rem;
  z-index: 20;
  background: white;
  padding: 1rem;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.1);
  margin-bottom: 2rem;
}

.pokemon-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
  padding: 1rem;
}

.pokemon-item {
  min-height: 200px;
}

.loading-overlay {
  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(255,255,255,0.9);
  padding: 1rem;
  border-radius: 1rem;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  z-index: 100;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 5px solid #f3f3f3;
  border-top: 5px solid #e74c3c;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.load-more {
  text-align: center;
  margin-top: 3rem;
  padding-bottom: 2rem;
}

.intersection-target {
  width: 100%;
  height: 10px;
  margin: 1rem 0;
  opacity: 0;
}

.modal-card {
  max-width: 90%;
  width: 1400px;
  margin: 2rem auto;
  background: transparent;
  box-shadow: none;
  border: none;
  overflow: visible;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}

@media (max-width: 768px) {
  .pokemon-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 1rem;
  }
}
</style>
