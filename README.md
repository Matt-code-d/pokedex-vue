# Pokédex Vue

A modern Pokédex web application built with Vue 3 and Vite, featuring a responsive design, infinite scroll, and dark mode support.

## Features

- 🔍 Real-time search with debouncing
- 🏷️ Filter Pokémon by type
- ♾️ Infinite scroll loading
- 🌓 Dark mode support
- 📱 Fully responsive design
- 🔊 Pokémon cry playback
- 🎨 Type-based color schemes
- 📊 Detailed statistics view
- 🔄 Evolution chain visualization
- 🎭 Alternative forms support
- 🌟 Normal/Shiny sprite toggle

## Tech Stack

- Vue 3 with Composition API
- Vite for blazing fast development
- Bulma CSS framework
- Axios for API requests
- Lodash for utilities
- Font Awesome icons

## Getting Started

```bash
# Clone the repository
git clone https://github.com/Matt-code-d/pokedex-vue.git

# Navigate to project folder
cd pokedex-vue

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Project Structure

```bash
pokedex-vue/
├── public/              # Static assets
│   ├── favicon.svg
│   └── robots.txt
├── src/
│   ├── assets/          # Asset files like images and fonts
│   ├── components/      # Vue components
│   ├── composables/     # Composition API functions
│   ├── router/          # Vue Router files
│   ├── store/           # Vuex store files
│   ├── views/           # View components for routes
│   └── App.vue          # Main App component
├── index.html           # Main HTML file
├── package.json          # Project metadata and dependencies
└── vite.config.js       # Vite configuration
```

## API Reference

### PokéAPI

The application uses the [PokéAPI](https://pokeapi.co/) to fetch Pokémon data. Check their documentation for available endpoints and data structure.

## License & Credits

### Author
Developed by [matteosantoro.dev](https://matteosantoro.dev)

### Usage Terms
This project is released under a custom license with the following terms:

- ✅ You are permitted to modify and adapt the code
- ✅ You must document any modifications made
- ❌ Commercial use is strictly prohibited without explicit permission
- ❌ Redistribution without proper attribution is not allowed
- ℹ️ All derivative works must maintain these restrictions

For full license terms, see [LICENSE.md](LICENSE.md)

### Pokémon Disclaimer
Pokémon and all related marks are registered trademarks of Nintendo, Game Freak, and The Pokémon Company. This project is not affiliated with or endorsed by these companies.

All Pokémon data and assets are served via [PokéAPI](https://pokeapi.co/) and are not included in this repository.