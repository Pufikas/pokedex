<template>
  <div>
    <!-- name and image for each sorted pokemon -->
    <div class="container-wrapper">
      <SelectedPokemon v-if="selectedPokemon" 
        :selectedPokemon="selectedPokemon"
        :currSpecies="currSpecies"
        :currEvoChain="currEvoChain"
        :evoChain="evoChain"
        :pokemons="pokemons"
        @update-selected-pokemon="updateSelectedPokemon"
        />
      <div class="column">
        <!-- filter form-->
        <form>
          <input type="text" placeholder="Pokémon name" name="name" v-model="searchTerm">
          <div class="right-section">
            <select @change="handleFilter">
              <option disabled="">Order by</option>
              <option value="id-ascending">ID (Low to High)</option>
              <option value="id-descending">ID (High to Low)</option>
              <option value="height-ascending">Height (Short to Tall)</option>
              <option value="height-descending">Height (Tall to Short)</option>
              <option value="weight-ascending">Weight (Light to Heavy)</option>
              <option value="weight-descending">Weight (Heavy to Light)</option>

            </select>
            <select class="type-selection" v-model="selectedType" @change="handleTypeIcon">
              <option disabled="">Filter by type</option>
              <option value="all">all</option>
              <option value="bug">bug</option>
              <option value="dark">dark</option>
              <option value="dragon">dragon</option>
              <option value="electric">electric</option>
              <option value="fairy">fairy</option>
              <option value="fighting">fighting</option>
              <option value="fire">fire</option>
              <option value="flying">flying</option>
              <option value="ghost">ghost</option>
              <option value="grass">grass</option>
              <option value="ground">ground</option>
              <option value="ice">ice</option>
              <option value="normal">normal</option>
              <option value="poison">poison</option>
              <option value="psychic">psychic</option>
              <option value="rock">rock</option>
              <option value="steel">steel</option>
              <option value="water">water</option>
            </select>

            <select v-model="customFilter">
              <option disabled="">Other</option>
              <option value="">NORMAL</option>
              <option value="caught-pokemons">CAUGHT</option>
              <option value="shiny-pokemons">SHINIES</option>
            </select>

            <div :class="`type-icon ` + selectedType" v-if="selectedType !== 'all'">
              <img class="type-icon" :src="'../assets/' + selectedType + '.svg'">
            </div>

          </div>
        </form>


        <!-- filter pokemons -->
        <div class="column column-multiple index">
          <div 
              class="column" 
              v-for="(pokemon, index) in filteredPokemons" 
              :key="pokemon.id" 
              @click="selectPokemon(pokemon)"
              :class="{ 'caught': isCaught(pokemon.id) }"  
            >

            <img class="small-img" :src="filteredPokemonsImages[index]">
            <p class="name">{{ pokemon.name }}</p>
            <p class="pokId">#{{ pokemon.id }}</p>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>


<script setup>
import axios from 'axios';
import { ref, computed, onMounted, watchEffect, watch } from "vue";
import SelectedPokemon from './SelectedPokemon.vue';
import { getCaughtPokemons } from './../utils/storage'

const url = "https://pokeapi.co/api/v2/pokemon-species/";

const type = ['all', 'bug', 'dark', 'dragon', 'electric',
  'fairy', 'fighting', 'fire', 'flying', 'ghost',
  'grass', 'ground', 'ice', 'normal', 'poison',
  'psychic', 'rock', 'steel', 'water'];


const pokemons = ref([]);
const sortedPokemons = ref([]);
const selectedPokemon = ref(null);
const selectedType = ref("all");
const customFilter = ref("");
const searchTerm = ref("");

const currSpecies = ref([]);
const currEvoChain = ref([]);
const evoChain = ref([]);

const caughtPokemons = ref(getCaughtPokemons());
const isCaught = ((pokemonId) => caughtPokemons.value.includes(pokemonId));

const selectPokemon = (pokemon) => {
  selectedPokemon.value = pokemon;
  getEvoData();
  console.log(selectedPokemon.value)
};

const getData = async () => {
  try {
    const { data: { results } } = await axios.get('https://pokeapi.co/api/v2/pokemon?limit=151');
    const reqArr = results.map(pokemon => axios.get(pokemon.url));
    const response = await Promise.all(reqArr);
    console.log("res:", response);

    const pokemonArray = response.map(res => res.data).sort((a, b) => a.id - b.id);
    
    // get species.url for fetching jp language
    const speciesReqArr = pokemonArray.map(pokemon => axios.get(pokemon.species.url));
    const speciesRes = await Promise.all(speciesReqArr);
    
    // for each pokemon find a jp name and add it to pokemonArray as a new data
    speciesRes.forEach((speciesRes, i) => {
      const jpName = speciesRes.data.names.find(name => name.language.name === 'ja').name;
      pokemonArray[i].jpName = jpName;
    })

    pokemons.value = pokemonArray;
    sortedPokemons.value = pokemonArray;
    selectedPokemon.value = pokemonArray[0];

    getEvoData();

  } catch (err) {
    console.error('err fetching:', err);
  }
};

const getEvoData = async () => {
  try {
    const { data: speciesData } = await axios.get(url + selectedPokemon.value.name);
    const { data: evolutionData } = await axios.get(speciesData.evolution_chain.url)
    console.log(evolutionData);

    currSpecies.value = speciesData;
    currEvoChain.value = evolutionData;

    console.log("currEvoChain: ", currEvoChain.value);
  } catch (err) {
    console.log(err);
  }
};

const handleFilter = (e) => {
  const [key, order] = e.target.value.split("-");
  const descending = order === "descending";

  const pokemonsCopy = [...pokemons.value];

  pokemonsCopy.sort((a, b) => {
    const valueA = a[key];
    const valueB = b[key];

    // compare values based on type (number or string)
    if (typeof valueA === 'string' || typeof valueB === 'string') {
      return descending ? valueB.localeCompare(valueA) : valueA.localeCompare(valueB);
    } else {
      return (valueA - valueB) * (descending ? -1 : 1);
    }
  });

  sortedPokemons.value = pokemonsCopy;
};

const filteredPokemonsImages = computed(() => {
  const images = filteredPokemons.value.map(pokemon => {
    if (customFilter.value === 'shiny-pokemons') {
      return pokemon.sprites.other['official-artwork'].front_shiny;
    } else if (customFilter.value === 'caught-pokemons') {
      return pokemon.sprites.other['official-artwork'].front_default;
    } else {
      return pokemon.sprites.other['official-artwork'].front_default;
    }
  });
  console.log('filterdimg', images);
  return images;
})

const filteredPokemons = computed(() => {
  return sortedPokemons.value.filter(pokemon => {
    const matchesSearchTerm = pokemon.name.toLowerCase().includes(searchTerm.value.toLowerCase());
    const matchesType = selectedType.value === 'all' || pokemon.types.some(type => type.type.name === selectedType.value);
    const matchesCaught = customFilter.value !== 'caught-pokemons' || caughtPokemons.value.includes(pokemon.id);

    return matchesSearchTerm && matchesType && matchesCaught;
  });
});

const handleTypeIcon = () => {
  console.log('type: ', selectedType.value);
}

const updateSelectedPokemon = (pokemon) => {
    selectedPokemon.value = pokemon;
    console.log("props.selectedPokemon.value", selectedPokemon.value.name)
};



watchEffect(() => {
  console.log("before evochain", evoChain.value);

  if (currEvoChain.value.chain) {
    let curr = currEvoChain.value.chain;
    const tempEvoChain = [];

    tempEvoChain.push([curr.species.name, Number(curr.species.url.split('/')[6])]);

    if (curr.evolves_to.length > 0) {
      for (let i = 0; i < curr.evolves_to.length; i++) {
        tempEvoChain.push([curr.evolves_to[i].species.name, Number(curr.evolves_to[i].species.url.split('/')[6])]);
      }

      if (curr.evolves_to[0].evolves_to.length > 0) {
        tempEvoChain.push([curr.evolves_to[0].evolves_to[0].species.name, Number(curr.evolves_to[0].evolves_to[0].species.url.split('/')[6])]);
      }
    }

    evoChain.value = tempEvoChain.filter(stage => stage[1] <= 151);

    console.log("after EvoChain value:", evoChain.value);
  }
});

onMounted(() => {
  getData();
  getEvoData();
});
</script>


<style>
@import "../assets/common.css";
</style>