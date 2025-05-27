<template>
  <div class="columns is-multiline is-mobile">
    <div class="column is-12-mobile is-8-tablet">
      <div class="field has-addons">
        <div class="control is-expanded has-icons-left">
          <input
            class="input is-medium"
            type="text"
            :placeholder="translate('ui', 'search_placeholder')"
            :value="search"
            @input="$emit('update:search', $event.target.value)"
          />
          <span class="icon is-left">
            <i class="fas fa-search"></i>
          </span>
        </div>
        <div class="control">
          <button class="button is-medium is-danger" @click="$emit('update:search', '')">
            <span class="icon">
              <i class="fas fa-times"></i>
            </span>
          </button>
        </div>
      </div>
    </div>
    <div class="column is-12-mobile is-4-tablet">
      <div class="field">
        <div class="control is-expanded">
          <div class="select is-medium is-fullwidth">
            <select :value="type" @change="$emit('update:type', $event.target.value)">
              <option value="">{{ translate('ui', 'all_types') }}</option>
              <option v-for="t in types" :key="t" :value="t">
                {{ translate('types', t) }}
              </option>
            </select>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { translations } from '../utils/translations';

defineProps({
  types: Array,
  search: String,
  type: String
});
defineEmits(['update:search', 'update:type']);

const translate = (category, key) => {
  return translations[category]?.[key] || key;
};
</script>
