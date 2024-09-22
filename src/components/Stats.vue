<template>
    <div v-if="selectedPokemon">
      <div class="stat-columns">
        <!-- Left stats -->
        <div class="column">
          <div
            class="stat-wrapper progress-bar"
            v-for="stat in leftStats"
            :key="stat.name"
          >
            <progress
              :class="`progress small darker ${selectedPokemon.types[0].type.name}`"
              :value="150 - stat.value"
              max="150"
            ></progress>
            <div class="stat-overlay">
              {{ stat.name.toUpperCase() }}: {{ stat.value }}
            </div>
          </div>
        </div>
        <!-- Right stats -->
        <div class="column">
          <div
            class="stat-wrapper progress-bar"
            v-for="stat in rightStats"
            :key="stat.name"
          >
            <progress
              :class="`progress small darker ${selectedPokemon.types[0].type.name}`"
              :value="150 - stat.value"
              max="150"
            ></progress>
            <div class="stat-overlay">
              {{ stat.name.toUpperCase() }}: {{ stat.value }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
<script setup>
import { computed } from "vue";

const props = defineProps({
  selectedPokemon: Object,
});

const stats = computed(() => {
  if (!props.selectedPokemon || !props.selectedPokemon.stats) {
    return [];
  }

  return props.selectedPokemon.stats.map((stat) => ({
    name: stat.stat.name,
    value: stat.base_stat,
  }));
});

const leftStats = computed(() => stats.value.slice(0, 3));
const rightStats = computed(() => stats.value.slice(3, 6));
</script>
  
  
<style>
@import "../assets/common.css";
@import "../assets/types.css";

.progress::-moz-progress-bar {
    background-color: #fff;
}

.progress {
    height: 12px;
    border-radius: 10px;
    -webkit-appearance: none;
    -moz-appearance: none;
    border: none;
    overflow: hidden;
    padding: 0;
    width: 80%;
    transform: rotate(180deg);
}

.darker {
    filter: hue-rotate(30deg);
}

.stat-columns {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.stat-wrapper {
  height: 3vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
} 

.stat-wrapper .stat {
  font-size: 14px;
}

.progress-container {
  position: relative;
  width: 100%;
}

.stat-overlay {
  position: absolute;
  width: 100%;
  text-align: center;
  top: 10%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 11px;
  font-style: bold;
  pointer-events: none;
}

.columns.is-half {
  margin-top: 20px;
}
</style>