let restaurant;
var newMap;

/**
 * Initialize map as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', () => {
  initMap();
});

/**
 * Initialize leaflet map
 */
initMap = () => {
  fetchRestaurantFromURL()
    .then((restaurant) => {
      self.newMap = L.map('map', {
        center: [restaurant.latlng.lat, restaurant.latlng.lng],
        zoom: 16,
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
      fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.newMap);
    })
    .catch(error => console.error(error));
}

/**
 * Get current restaurant from page URL.
 */
fetchRestaurantFromURL = () => {
  if (self.restaurant) { // restaurant already fetched!
    return Promise.resolve(self.restaurant);
  }
  const id = parseInt(getParameterByName('id'));
  if (!id || id === NaN) { // no id found in URL
    return Promise.reject('No restaurant id in URL')
  } else {
    return DBHelper.fetchRestaurantById(id)
      .then(restaurant => {
        if (!restaurant) {
          return Promise.reject(`Restaurant with ID ${id} was not found`)
        }
        self.restaurant = restaurant;
        fillRestaurantHTML();
        return restaurant;
      });
  }
}

/**
 * Create restaurant HTML and add it to the webpage
 */
fillRestaurantHTML = (restaurant = self.restaurant) => {
  const name = document.getElementById('restaurant-name');
  name.innerHTML = restaurant.name;

  const address = document.getElementById('restaurant-address');
  address.innerHTML = restaurant.address;

  const image = document.getElementById('restaurant-img');
  image.className = 'restaurant-img'
  image.src = DBHelper.imageUrlForRestaurant(restaurant);

  const cuisine = document.getElementById('restaurant-cuisine');
  cuisine.innerHTML = restaurant.cuisine_type;

  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }
  // fill reviews
  fillReviewsHTML();
}

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
fetchRestaurantFromURL = () => {
  if (self.restaurant) { // restaurant already fetched!
    return Promise.resolve(self.restaurant);
  }
  const id = parseInt(getParameterByName('id'));
  if (!id || id === NaN) { // no id found in URL
    return Promise.reject('No restaurant id in URL')
  } else {
    return DBHelper.fetchRestaurantById(id)
      .then(restaurant => {
        if (!restaurant) {
          return Promise.reject(`Restaurant with ID ${id} was not found`)
        }
        self.restaurant = restaurant;
        fillRestaurantHTML();
        return restaurant;
      });
  }
}

/**
 * Create restaurant HTML and add it to the webpage
 */
fillRestaurantHTML = (restaurant = self.restaurant) => {
  const name = document.getElementById('restaurant-name');
  name.textContent = restaurant.name;
  name.tabIndex = '0';

  // Create favorite icon
  const favIcon = document.createElement('button');
  const isFavorite = restaurant['is_favorite'];
  favIcon.className = 'card-actions-button';
  favIcon.style.background = isFavorite ? `url("/icons/favorite.svg") no-repeat` : `url("/icons/not-favorite.svg") no-repeat`;
  !isFavorite
    ?
    favIcon.setAttribute('arial-label', `Set ${restaurant.name} as a favorite restaurant`) :
    favIcon.setAttribute('arial-label', `Remove ${restaurant.name} as a favorite restaurant`);
  favIcon.id = `favorite-icon-${restaurant.id}`;
  favIcon.tabIndex = '1';
  favIcon.onclick = event => handleFavoriteClick(restaurant.id, !isFavorite);
  document.getElementById('restaurant-info')
    .insertBefore(favIcon, document.getElementById('restaurant-address'));

  const address = document.getElementById('restaurant-address');
  address.innerHTML = restaurant.address;

  const image = document.getElementById('restaurant-img');
  image.className = 'restaurant-img'
  image.src = DBHelper.imageUrlForRestaurant(restaurant);
  // Add alternative text
  image.alt = `photo of ${restaurant.name}`;
  image.tabIndex = '0';

  const cuisine = document.getElementById('restaurant-cuisine');
  cuisine.innerHTML = restaurant.cuisine_type;

  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }

  // fill reviews
  DBHelper.fetchReviewsByRestId(restaurant.id)
    .then(reviews => fillReviewsHTML(reviews));
}

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
  const hours = document.getElementById('restaurant-hours');
  for (let key in operatingHours) {
    const row = document.createElement('tr');
    row.className = 'restaurant-card-table-content';
    row.tabIndex = '0';

    const day = document.createElement('td');
    day.innerHTML = key;
    row.appendChild(day);

    const time = document.createElement('td');
    time.innerHTML = operatingHours[key];
    row.appendChild(time);

    hours.appendChild(row);
  }
}

/**
 * Create all reviews HTML and add them to the webpage.
 */
fillReviewsHTML = (reviews = self.restaurant.reviews) => {
  const container = document.getElementById('reviews-container');
  const ul = document.getElementById('reviews-list');
  const title = document.createElement('h3');
  title.className = 'reviews-title'
  title.innerHTML = 'Reviews';
  container.insertBefore(title, ul);

  // Add review button
  const addReview = document.createElement('button');
  addReview.textContent = 'Add review';
  addReview.setAttribute('type', 'button');
  addReview.setAttribute('class', 'btn');
  addReview.setAttribute('id', 'add-review');
  addReview.onclick = event => openReviewModal();
  container.appendChild(addReview);

  // TODO: test with no reviews.
  if (!reviews) {
    const noReviews = document.createElement('p');
    noReviews.textContent = 'No reviews yet!';
    ul.append(noReviews);
    return;
  }

  reviews.forEach(review => {
    ul.appendChild(createReviewHTML(review));
  });
  container.appendChild(ul);
}

/**
 * Create review HTML and add it to the webpage.
 *
 * https://developer.mozilla.org/en-US/docs/Web/API/ParentNode/append
 * https://developer.mozilla.org/en-US/docs/Web/API/Node/appendChild
 */

createReviewHTML = (review) => {
  const li = document.createElement('li');
  li.className = 'review-card';

  // Create a div with class card-primary that contains h2, h3.
  const divCardPrimary = document.createElement('div');
  divCardPrimary.className = 'card-primary';
  // Restaurant name.
  const name = document.createElement('h2');
  name.className = 'card-title';
  name.innerHTML = review.name;
  divCardPrimary.appendChild(name);
  // Review date.
  const date = document.createElement('h3');
  date.className = 'card-subtitle';
  date.textContent = new Date(review.createdAt).toLocaleString();
  divCardPrimary.appendChild(date);
  li.appendChild(divCardPrimary);

  // Create a div with class review-card-rating.
  const divCardActions = document.createElement('div');
  divCardActions.className = 'review-card-rating';
  const rating = document.createElement('p');
  rating.className = 'review-card-rating-content';
  rating.textContent = `Rating: ${review.rating}`;
  divCardActions.append(rating);
  li.appendChild(divCardActions);

  // Create a div with class card-secondary that contains further content.
  const divCardSecondary = document.createElement('div');
  divCardSecondary.className = 'card-secondary';
  // Review text.
  const comments = document.createElement('p');
  comments.className = 'card-secondary-content';
  comments.textContent = review.comments;
  divCardSecondary.appendChild(comments);
  li.appendChild(divCardSecondary);

  return li;
}

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
fillBreadcrumb = (restaurant = self.restaurant) => {
  const breadcrumb = document.getElementById('breadcrumb');
  const li = document.createElement('li');
  li.className = 'breadcrumb';
  li.innerHTML = restaurant.name;
  // a11y - indicate current page
  // https://www.w3.org/TR/wai-aria-practices/examples/breadcrumb/index.html -->
  li.setAttribute('aria-current', 'page');
  breadcrumb.setAttribute('aria-label', 'Breadcrumb');
  breadcrumb.appendChild(li);
}

/**
 * Get a parameter by name from page URL.
 */
getParameterByName = (name, url) => {
  if (!url)
    url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results)
    return null;
  if (!results[2])
    return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
};

// Handle Modal
const modal = document.getElementById('reviewModal');
// const modalBtn = document.getElementById('add-review');
const closeModalBtn = document.getElementById('closeBtn');
// const modalContent = document.querySelector('.modal-content');

// modalBtn.addEventListener('click', openReviewModal);
closeModalBtn.addEventListener('click', closeModal);
window.addEventListener('click', close);

function openReviewModal() {
  modal.style.display = 'block';
}

function closeModal() {
  modal.style.display = 'none';
}

function close(ev) {
  if (ev.target == modal) {
    closeModal();
  }
}