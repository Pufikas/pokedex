function formatName(name) {
  if (name[name.length - 2] === '-') {
    if (name.includes('-f')) {
      return name.replace('-f', '\u2640') // female character
    } else {
      return name.replace('-m', '\u2642') // male character
    }
  } else {
    return name.replace('-', '. ')
  }
}

export default {
  formatName,
}
