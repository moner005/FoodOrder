 import { useState, type SetStateAction } from "react";
import { Link } from "react-router-dom";
import "./Restaurants.css";
const restaurantsData = [
  {
    id: 1,
    name: "Al Forno",
    address: "123 Main Street, Amman",
    rating: 4.8,
    image:
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800",
  },
  {
    id: 2,
    name: "Bella Vita",
    address: "456 King Abdullah St, Amman",
    rating: 4.6,
    image:
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800",
  },
  {
    id: 3,
    name: "The Olive Tree",
    address: "789 Rainbow Street, Amman",
    rating: 4.7,
    image:
      "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800",
  },
  {
    id: 4,
    name: "Café Aroma",
    address: "321 Garden Ave, Amman",
    rating: 4.5,
    image:
      "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800",
  },
  {
    id: 5,
    name: "Pizza House",
    address: "654 Food Lane, Amman",
    rating: 4.6,
    image:
      "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800",
  },
  {
    id: 6,
    name: "La Piazza",
    address: "987 Heritage St, Amman",
    rating: 4.8,
    image:
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800",
  },
  {
    id: 7,
    name: "Golden Fork",
    address: "45 King Street, Amman",
    rating: 4.7,
    image:
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800",
  },
  {
    id: 8,
    name: "Urban Kitchen",
    address: "78 Garden Road, Amman",
    rating: 4.9,
    image:
      "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800",
  },
  {
    id: 9,
    name: "Casa Restaurant",
    address: "90 Rainbow Street, Amman",
    rating: 4.5,
    image:
      "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800",
  },
  {
    id: 10,
    name: "The Garden",
    address: "12 Food Street, Amman",
    rating: 4.6,
    image:
      "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800",
  },
  {
    id: 11,
    name: "Royal Taste",
    address: "34 Main Road, Amman",
    rating: 4.8,
    image:
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800",
  },
  {
    id: 12,
    name: "Olive Garden",
    address: "56 City Center, Amman",
    rating: 4.7,
    image:
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800",
  },
];

const ITEMS_PER_PAGE = 6;

function Restaurants() {
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");

  const filteredRestaurants = restaurantsData.filter((restaurant) =>
    restaurant.name.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(
    filteredRestaurants.length / ITEMS_PER_PAGE
  );

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;

  const currentRestaurants = filteredRestaurants.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  const handleSearch = (e: { target: { value: SetStateAction<string>; }; }) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div className="restaurants-page">

      <section className="restaurants-banner">
        <div className="banner-content">
          <div className="banner-icon">♨</div>
          <div>
            <h1>All Restaurants</h1>
            <p>Discover the best restaurants in your area</p>
          </div>
        </div>
        <div className="restaurants-search">
          <span>⌕</span>
          <input
            type="text"
            placeholder="Search restaurants..."
            value={search}
            onChange={handleSearch}
          />
        </div>
      </section>
      <section className="restaurants-container">
        <div className="restaurants-grid">
          {currentRestaurants.map((restaurant) => (
            <div className="restaurant-card" key={restaurant.id}>
              <div className="restaurant-image-wrapper">
                 <img
                  src={restaurant.image}
                  alt={restaurant.name}
                  className="restaurant-image"
                />
                <div className="restaurant-rating">
                  ★ {restaurant.rating}
                </div>
              </div>
              <div className="restaurant-info">
                <h2>{restaurant.name}</h2>
                <p className="restaurant-address">
                  <span>📍</span>
                  {restaurant.address}
                </p>
                <Link
                  to={`/restaurants/${restaurant.id}/meals`}
                  className="show-meals-btn"
                >
                  Show all meals
                  <span>→</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
        {currentRestaurants.length === 0 && (
          <div className="no-restaurants">
            <h2>No restaurants found</h2>
            <p>Try searching with another name.</p>
          </div>
        )}
        {totalPages > 1 && (
          <div className="restaurants-pagination">
            <button
              onClick={() => setCurrentPage((prev) => prev - 1)}
              disabled={currentPage === 1}
              className="pagination-arrow"
            >
              ‹
            </button>
            {Array.from({ length: totalPages }, (_, index) => (
              <button
                key={index + 1}
                onClick={() => setCurrentPage(index + 1)}
                className={
                  currentPage === index + 1
                    ? "pagination-number active"
                    : "pagination-number"
                }
              >
                {index + 1}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((prev) => prev + 1)}
              disabled={currentPage === totalPages}
              className="pagination-arrow"
            >
              ›
            </button>
          </div>

        )}
      </section>
    </div>
  );
}
export default Restaurants;