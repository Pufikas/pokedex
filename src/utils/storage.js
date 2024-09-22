export function setCaughtIds(data) {
  localStorage.setItem("caughtPokemons", JSON.stringify(data));
}

export function getCaughtPokemons() {
  const ids = localStorage.getItem("caughtPokemons");
  return ids ? JSON.parse(ids) : [];
}

