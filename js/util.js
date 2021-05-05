function getBadgeColor() {
  const badgeColor = [
    "badge-primary",
    "badge-secondary",
    "badge-success",
    "badge-danger",
    "badge-warning",
    "badge-info",
    "badge-light",
    "badge-dark"
  ];
  return badgeColor[getRandomInt(badgeColor.length)];
}

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

const FisherYates = (array) => {
  const swap = (i, j) => {
    [array[i], array[j]] = [array[j], array[i]];
  };

  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    swap(j, i);
  }
  return array;
};

const shuffle = (array) => {
  const impl = FisherYates;
  return impl(array);
};

const fetchJson = async (resource) => {
  let response = await fetch(resource);
  return await response.json();
};