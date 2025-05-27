import { translationsEn } from './translations.en';

// Rinomina le traduzioni italiane
const translationsIt = {
  stats: {
    'hp': 'PS',
    'attack': 'Attacco',
    'defense': 'Difesa',
    'special attack': 'Attacco Sp.',
    'special defense': 'Difesa Sp.',
    'speed': 'Velocità'
  },
  ui: {
    'base_stats': 'Statistiche Base',
    'evolution_chain': 'Catena Evolutiva',
    'weight': 'Peso',
    'height': 'Altezza',
    'level': 'Livello',
    'search_placeholder': 'Cerca Pokémon...',
    'all_types': 'Tutti i tipi',
    'play_cry': 'Riproduci Verso',
    'pokedex': 'Pokédex Vue',
    'found_pokemon': 'Pokémon Trovati',
    'search_pokedex': 'Cerca nel Pokédex',
    'api_github': 'API GitHub',
    'loading_pokemon': 'Caricamento Pokémon...',
    'loading': 'Caricamento...',
    'no_results': 'Nessun risultato trovato',
    'pokemon_details': 'Dettagli Pokémon',
    'normal_form': 'Forma Normale',
    'shiny_form': 'Forma Cromatica',
    'abilities': 'Abilità',
    'hidden_ability': 'Abilità Nascosta',
    'measurements': 'Misure',
    'height_unit': 'm',
    'weight_unit': 'kg',
    'forms': 'Forme Alternative',
    'regional_form': 'Forma Regionale',
    'mega_evolution': 'Mega Evoluzione',
    'gigantamax': 'Gigamax',
    'alolan_form': 'Forma Alola',
    'galarian_form': 'Forma Galar',
    'hisuian_form': 'Forma Hisui',
    'paldean_form': 'Forma Paldea'
  },
  types: {
    'normal': 'Normale',
    'fire': 'Fuoco',
    'water': 'Acqua',
    'electric': 'Elettro',
    'grass': 'Erba',
    'ice': 'Ghiaccio',
    'fighting': 'Lotta',
    'poison': 'Veleno',
    'ground': 'Terra',
    'flying': 'Volante',
    'psychic': 'Psico',
    'bug': 'Coleottero',
    'rock': 'Roccia',
    'ghost': 'Spettro',
    'dragon': 'Drago',
    'dark': 'Buio',
    'steel': 'Acciaio',
    'fairy': 'Folletto'
  }
};

// Rileva la lingua del browser
const browserLang = navigator.language.split('-')[0];

// Esporta le traduzioni in base alla lingua
export const translations = browserLang === 'it' ? translationsIt : translationsEn;

// Aggiungi funzione helper per ottenere la lingua corrente
export const getCurrentLanguage = () => browserLang === 'it' ? 'it' : 'en';
