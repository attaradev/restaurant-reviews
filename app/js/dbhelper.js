/**
 * Common database helper functions.
 */
class DBHelper {

  /**
   * Database URL.
   * Change this to restaurants.json file location on your server.
   */
  static get RESTAURANTS_URL() {
    return `${this.DATABASE_URL}/restaurants/`;
  }

  static get DATABASE_URL() {
    const PORT = 1337
    return `http://localhost:${PORT}`
  }

  static dbPromise() {
    return idb.open('restaurantStore', 1, upgradeDB => {
      upgradeDb.createObjectStore('restaurants', {
        keyPath: 'id'
      });

      const reviewsStore = upgradeDb.createObjectStore('reviews', {
        keyPath: 'id'
      });
      reviewsStore.createIndex('restaurant', 'restaurant_id');
    });
  }


  /**
   * Fetch all restaurants.
   */
  static fetchRestaurants() {
    return this.dbPromise()
      .then(db => {
        const tx = db.transaction('restaurants');
        const restaurantStore = tx.objectStore('restaurants');
        return restaurantStore.getAll();
      })
      .then(restaurants => {
        if (restaurants.length !== 0) {
          return Promise.resolve(restaurants);
        }
        return this.fetchAndCacheRestaurants();
      })
  }

  static fetchAndCacheRestaurants() {
    return fetch(DBHelper.DATABASE_URL + 'restaurants')
      .then(response => response.json())
      .then(restaurants => {
        return this.dbPromise()
          .then(db => {
            const tx = db.transaction('restaurants', 'readwrite');
            const restaurantStore = tx.objectStore('restaurants');
            restaurants.forEach(restaurant => restaurantStore.put(restaurant));

            return tx.complete.then(() => Promise.resolve(restaurants));
          });
      });
  }

  static fetchRestaurantById(id) {
    return DBHelper.fetchRestaurants()
      .then(restaurants => restaurants.find(r => r.id === id));
  }

  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static fetchRestaurantByCuisine(cuisine) {
    return DBHelper.fetchRestaurants()
      .then(restaurants => restaurants.filter(r => r.cuisine_type === cuisine));
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static fetchRestaurantByNeighborhood(neighborhood) {
    return DBHelper.fetchRestaurants()
      .then(restaurants => restaurants.filter(r => r.neighborhood === neighborhood));
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood) {
    return DBHelper.fetchRestaurants()
      .then(restaurants => {
        let results = restaurants;
        if (cuisine !== 'all') { // filter by cuisine
          results = results.filter(r => r.cuisine_type == cuisine);
        }
        if (neighborhood !== 'all') { // filter by neighborhood
          results = results.filter(r => r.neighborhood == neighborhood);
        }
        return results;
      });
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static fetchNeighborhoods() {
    // Fetch all restaurants
    return DBHelper.fetchRestaurants()
      .then(restaurants => {
        // Get all neighborhoods from all restaurants
        const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood)
        // Remove duplicates from neighborhoods
        const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i)
        return uniqueNeighborhoods;
      });
  }

  /**
   * Fetch all cuisines with proper error handling.
   */
  static fetchCuisines(callback) {
    // Fetch all restaurants
    return DBHelper.fetchRestaurants()
      .then(restaurants => {
        // Get all cuisines from all restaurants
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type)
        // Remove duplicates from cuisines
        const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i)
        return uniqueCuisines;
      });
  }
  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return (`./restaurant.html?id=${restaurant.id}`);
  }

  /**
   * Restaurant image URL.
   */
  static imageUrlForRestaurant(restaurant) {
    if (restaurant.photograph === undefined) {
      return (`/img/${restaurant.id}.jpg`);
    } else {
      return (`/img/${restaurant.photograph}.jpg`);
    }
  }

  /**
   * Map marker for a restaurant.
   */
  static mapMarkerForRestaurant(restaurant, map) {
    // https://leafletjs.com/reference-1.3.0.html#marker  
    const marker = new L.marker([restaurant.latlng.lat, restaurant.latlng.lng], {
      title: restaurant.name,
      alt: restaurant.name,
      url: this.urlForRestaurant(restaurant)
    })
    marker.addTo(newMap);
    return marker;
  }

  /**
   * Reviews
   */
  static fetchReviewsByRestaurantId(id) {
    return fetch(`${this.DATABASE_URL}/reviews/?restaurant_id=${id}`)
      .then(response => response.json())
      .then(reviews => {
        this.dbPromise()
          .then(db => {
            if (!db) return;

            let tx = db;
          })
      })
  }

  static updateFavouriteStatus(restaurantId, isFavourite) {
    console.log('changing status to: ', isFavourite);

    fetch(`http://localhost:1337/restaurants/${restaurantId}/?is_favorite=${isFavourite}`, {
        method: 'PUT'
      })
      .then(() => {
        console.log('changed');
        this.dbPromise()
          .then(db => {
            const tx = db.transaction('restaurants', 'readwrite');
            const restaurantsStore = tx.objectStore('restaurants');
            restaurantsStore.get(restaurantId)
              .then(restaurant => {
                restaurant.is_favorite = isFavourite;
                restaurantsStore.put(restaurant);
              });
          })
      })

  }


  /**
   * Fetch all reviews.
   */

  static storeIndexedDB(table, objects) {
    this.dbPromise.then(function (db) {
      if (!db) return;

      let tx = db.transaction(table, 'readwrite');
      const store = tx.objectStore(table);
      if (Array.isArray(objects)) {
        objects.forEach(function (object) {
          store.put(object);
        });
      } else {
        store.put(objects);
      }
    });
  }

  static getStoredObjectById(table, idx, id) {
    return this.dbPromise()
      .then(function (db) {
        if (!db) return;

        const store = db.transaction(table).objectStore(table);
        const indexId = store.index(idx);
        return indexId.getAll(id);
      });
  }

  static fetchReviewsByRestId(id) {
    return fetch(`${DBHelper.DATABASE_URL}reviews/?restaurant_id=${id}`)
      .then(response => response.json())
      .then(reviews => {
        this.dbPromise()
          .then(db => {
            if (!db) return;

            let tx = db.transaction('reviews', 'readwrite');
            const store = tx.objectStore('reviews');
            if (Array.isArray(reviews)) {
              reviews.forEach(function (review) {
                store.put(review);
              });
            } else {
              store.put(reviews);
            }
          });
        console.log('revs are: ', reviews);
        return Promise.resolve(reviews);
      })
      .catch(error => {
        return DBHelper.getStoredObjectById('reviews', 'restaurant', id)
          .then((storedReviews) => {
            console.log('looking for offline stored reviews');
            return Promise.resolve(storedReviews);
          })
      });
  }
}