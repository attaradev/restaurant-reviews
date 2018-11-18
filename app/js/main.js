let restaurants,
  neighborhoods,
  cuisines
var newMap
var markers = []


// REGISTER SERVICE WORKER
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js')
      .then(registration => {
        console.log(`[SERVICE WORKER] Registered successfully! Scope: ${registration.scope}`);
      })
      .catch(error => {
        console.log(`[SERVICE WORKER] Registration failed: ${error}`);
      });
  });
}

/**
 * Fetch neighborhoods and cuisines as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', event => {
  initMap(); // added 
  fetchNeighborhoods();
  fetchCuisines();
});

/**
 * Fetch all neighborhoods and set their HTML.
 */
const fetchNeighborhoods = () => {
  DBHelper.fetchNeighborhoods()
    .then(neighborhoods => {
      self.neighborhoods = neighborhoods;
      fillNeighborhoodsHTML();
    });
}

/**
 * Set neighborhoods HTML.
 */
const fillNeighborhoodsHTML = (neighborhoods = self.neighborhoods) => {
  const select = document.getElementById('neighborhoods-select');
  neighborhoods.forEach(neighborhood => {
    const option = document.createElement('option');
    option.innerHTML = neighborhood;
    option.value = neighborhood;
    select.append(option);
  });
}

/**
 * Fetch all cuisines and set their HTML.
 */
const fetchCuisines = () => {
  DBHelper.fetchCuisines()
    .then(cuisines => {
      self.cuisines = cuisines;
      fillCuisinesHTML();
    });
}

/**
 * Set cuisines HTML.
 */
const fillCuisinesHTML = (cuisines = self.cuisines) => {
  const select = document.getElementById('cuisines-select');

  cuisines.forEach(cuisine => {
    const option = document.createElement('option');
    option.innerHTML = cuisine;
    option.value = cuisine;
    select.append(option);
  });
}

/**
 * Initialize leaflet map, called from HTML.
 */
const initMap = () => {
  self.newMap = L.map('map', {
    center: [40.722216, -73.987501],
    zoom: 12,
    scrollWheelZoom: false
  });
  L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.jpg70?access_token={mapboxToken}', {
    mapboxToken: 'pk.eyJ1IjoibWlrZXB5YXR0YXJhIiwiYSI6ImNqb2x0em14aDBycHEza3FhdmV0aHR0NnEifQ.HIuVE6z3eKDOkeCS903CGQ',
    maxZoom: 18,
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
      '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
      'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    id: 'mapbox.streets'
  }).addTo(newMap);

  updateRestaurants();
}

/**
 * Update page and map for current restaurants.
 */
const updateRestaurants = () => {
  const cSelect = document.getElementById('cuisines-select');
  const nSelect = document.getElementById('neighborhoods-select');

  const cIndex = cSelect.selectedIndex;
  const nIndex = nSelect.selectedIndex;

  const cuisine = cSelect[cIndex].value;
  const neighborhood = nSelect[nIndex].value;

  DBHelper.fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood)
    .then(restaurants => {
      resetRestaurants(restaurants);
      fillRestaurantsHTML();
    })
}

/**
 * Clear current restaurants, their HTML and remove their map markers.
 */
const resetRestaurants = (restaurants) => {
  // Remove all restaurants
  self.restaurants = [];
  const ul = document.getElementById('restaurants-list');
  ul.innerHTML = '';

  // Remove all map markers
  if (self.markers) {
    self.markers.forEach(marker => marker.remove());
  }
  self.markers = [];
  self.restaurants = restaurants;
}

/**
 * Create all restaurants HTML and add them to the webpage.
 */
const fillRestaurantsHTML = (restaurants = self.restaurants) => {
  const ul = document.getElementById('restaurants-list');
  restaurants.forEach(restaurant => {
    ul.append(createRestaurantHTML(restaurant));
  });
  addMarkersToMap();
}

/**
 * Create restaurant HTML.
 */
const createRestaurantHTML = (restaurant) => {
  const li = document.createElement('li');
  li.className = 'restaurant-card';

  // LAZY LOADING IMAGES
  const image = document.createElement('img');
  image.alt = `image of ${restaurant.name} restaurant`;
  const config = {
    threshold: 0.1
  };

  let observer;
  if ('IntersectionObserver' in window) {
    observer = new IntersectionObserver(onChange, config);
    observer.observe(image);
  } else {
    console.log('Intersection Observers not supported', 'color: red');
    loadImage(image);
  }
  const loadImage = image => {
    image.className = 'restaurant-img';
    image.src = DBHelper.imageUrlForRestaurant(restaurant);
  }

  function onChange(changes, observer) {
    changes.forEach(change => {
      if (change.intersectionRatio > 0) {
        loadImage(change.target);
        observer.unobserve(change.target);
      }
    });
  }

  li.append(image);

  // Create a div with class card-primary that contains h2, h3.
  const divCardPrimary = document.createElement('div');
  divCardPrimary.className = 'card-primary';
  const name = document.createElement('h2');
  name.className = 'card-title';
  name.innerHTML = restaurant.name;
  divCardPrimary.append(name);

  // Create favorite icon
  const favIcon = document.createElement('button');
  favIcon.innerHTML = "";
  favIcon.classList.add('card-actions-button');
  favIcon.id = `favorite-icon-${restaurant['id']}`;
  favIcon.onclick = function () {
    const isFavNow = !restaurant.is_favorite;
    DBHelper.updateFavouriteStatus(restaurant.id, isFavNow);
    restaurant.is_favorite = !restaurant.is_favorite;
    DBHelper.changeFavIconClass(favIcon, restaurant.is_favorite);
  };
  DBHelper.changeFavIconClass(favIcon, restaurant.is_favorite);
  divCardPrimary.append(favIcon);

  const neighborhood = document.createElement('h3');
  neighborhood.className = 'card-subtitle';
  neighborhood.innerHTML = restaurant.neighborhood;
  divCardPrimary.append(neighborhood);
  li.append(divCardPrimary);

  // Create a div with class card-secondary that contains further content.
  const divCardSecondary = document.createElement('div');
  divCardSecondary.className = 'card-secondary';
  // Use contact address element.
  // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/address
  const address = document.createElement('address');
  address.className = 'card-secondary-content';
  address.innerHTML = restaurant.address;
  divCardSecondary.append(address);
  li.append(divCardSecondary);

  // Create a div with class card-actions.
  const divCardActions = document.createElement('div');
  divCardActions.className = 'card-actions';
  const more = document.createElement('a');
  more.className = 'card-actions-link';
  more.innerHTML = 'View Details';
  more.href = DBHelper.urlForRestaurant(restaurant);
  divCardActions.append(more);

  li.append(divCardActions);

  return li
}

/**
 * Add markers for current restaurants to the map.
 */
const addMarkersToMap = (restaurants = self.restaurants) => {
  restaurants.forEach(restaurant => {
    // Add marker to the map
    const marker = DBHelper.mapMarkerForRestaurant(restaurant, self.newMap);
    marker.on("click", onClick);

    function onClick() {
      window.location.href = marker.options.url;
    }
    self.markers.push(marker);
  });
}