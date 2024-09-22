<template>
  <div v-if="selectedPokemon">
    <div class="pokemon-header-wrapper">

      <p class="above small-text">{{ selectedPokemon.jpName }}</p>
      
      <p class="name big-text">
        {{ selectedPokemon.name }}
      </p>

      <!-- <p class="name big-text" :class="`text ${selectedPokemon.types[0].type.name}`">
        {{ selectedPokemon.name }}
      </p> -->

      <p class="name small-text"><br>#{{ selectedPokemon.id }}</p>

      <div class="pokemon-type-label">
        <p :class="`type ${selectedPokemon.types[0].type.name}`">
          {{ selectedPokemon.types[0].type.name }}
        </p>

        <p v-if="selectedPokemon.types.length > 1" 
          :class="`type ${selectedPokemon.types[1].type.name}`">
          {{ selectedPokemon.types[1].type.name }}
        </p>
      </div>
    </div>
    
    <div class="pokemon-img-wrapper">

      <div class="pokedex-img">
        <img :src="selectedPokemon.sprites.other['official-artwork'].front_default" />
      </div>
      
      <div 
      @click="catchPokemon(selectedPokemon)"
      :class="`pokeball-select ${caughtPokemons.includes(selectedPokemon)}`">
        <img src="../../public/assets/pokeball_blue_heavy.svg">
      </div>
    </div>

  <div class="evolution-chain" v-if="evoChain.length > 0">
        <div 
          v-for="stage in evoChain" 
          :key="stage[0]" 
          :class="stage[1] === selectedPokemon.id ? 'selected' : ''"
          @click="handleSelectedPokClick(stage[1] - 1)"
          >
          
          <img class="img-effect clickable evoChainImg"
            :src="pokemons[stage[1] - 1].sprites.other['official-artwork'].front_default"/>
          <p class="name">{{ utils.formatName(stage[0]) }}</p>
          </div>
  </div>
    <Stats v-if="selectedPokemon" 
        :selectedPokemon="selectedPokemon"/>
</div>

</template>

<script setup>
import utils from '@/utils/other';
import { ref, computed, onMounted, watchEffect, watch } from "vue";
import Stats from './Stats.vue';

const props = defineProps({
  selectedPokemon: Object,
  currSpecies: Object,
  currEvoChain: Object,
  pokemons: Object,
  evoChain: Object
});

const emits = defineEmits(['update-selected-pokemon']);

const caughtPokemons = ref(getCaughtPokemons());

function saveCaughtPokemons(data) {
  localStorage.setItem("caughtPokemons", JSON.stringify(data));
}

function getCaughtPokemons() {
  const ids = localStorage.getItem("caughtPokemons");
  return ids ? JSON.parse(ids) : [];
}

function catchPokemon(selectedPokemon) {
  if (!caughtPokemons.value.includes(selectedPokemon.id)) {
    caughtPokemons.value.push(selectedPokemon.id);
    console.log("caught", caughtPokemons.value)
  } else {
    caughtPokemons.value = caughtPokemons.value.filter(id => id !== selectedPokemon.id);
  }
}

const handleSelectedPokClick = (id) => {
  emits('update-selected-pokemon', props.pokemons[id]);
}

watch(caughtPokemons, (newCaught) => {
  saveCaughtPokemons(newCaught);
}, { deep: true });


</script>


<style>
@import "../assets/common.css";

.pokemon-img-wrapper {
  position: relative;
  width: 100%;
}

.above {
  display: flex;
  align-self: flex-start;
  flex-direction: row;
  position: absolute;
  margin: 0 0 10px 13px; 
}

.big-text {
    font-size: 40px;
    font-style: bold;
}

.evolution-chain {
  display: flex;
  justify-content: space-evenly;
  height: 90px;
}

.evolution-chain div {
  display: flex;
  align-items: center;
  flex-direction: column;
}

.evoChainImg {
  height: 50px;
}

.pokemon-header-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  height: 70px;
}

.pokemon-type-label {
  position: absolute;
  top: 0;
  right: 0;
  display: flex;
  margin: auto;
  justify-content: flex-end;
  font-size: 12px;
}

.pokeball-select {
  position: absolute;
  right: 0;
  top: 5px;
  width: 50px;
  height: 50px;
}

.pokeball-select img {
  height: auto;
  max-width: 100%;
}
</style>