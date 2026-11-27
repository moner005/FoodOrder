import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { apiClient } from "@/services/apiClient";
import "./Restaurants.css";

interface Restaurant {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  address?: string | null;
  phone?: string | null;
  image?: string | null;
  status: string;
}

const ITEMS_PER_PAGE = 6;

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800";

function Restaurants() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadRestaurants() {
      try {
        setLoading(true);
        setError("");

        const response = await apiClient.get<Restaurant[]>("restaurants");

        if (isMounted) {
          setRestaurants(response.data);
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err instanceof Error ? err.message : "Could not load restaurants.",
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadRestaurants();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredRestaurants = useMemo(
    () =>
      restaurants.filter((restaurant) =>
        restaurant.name.toLowerCase().includes(search.toLowerCase()),
      ),
    [restaurants, search],
  );

  const totalPages = Math.ceil(filteredRestaurants.length / ITEMS_PER_PAGE);

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;

  const currentRestaurants = filteredRestaurants.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE,
  );

  const handleSearch = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  return (
    <div className="restaurants-page">
      <section className="restaurants-banner">
        <div className="banner-content">
          <div className="banner-icon">✦</div>
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
            onChange={(event) => handleSearch(event.target.value)}
          />
        </div>
      </section>

      <section className="restaurants-container">
        {loading && (
          <div className="no-restaurants">
            <h2>Loading restaurants...</h2>
          </div>
        )}

        {!loading && error && (
          <div className="no-restaurants">
            <h2>Unable to load restaurants</h2>
            <p>{error}</p>
            <button type="button" onClick={() => window.location.reload()}>
              Try again
            </button>
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="restaurants-grid">
              {currentRestaurants.map((restaurant) => (
                <div className="restaurant-card" key={restaurant.id}>
                  <div className="restaurant-image-wrapper">
                    <img
                      src={restaurant.image || FALLBACK_IMAGE}
                      alt={restaurant.name}
                      className="restaurant-image"
                    />

                    <div className="restaurant-rating">Active</div>
                  </div>

                  <div className="restaurant-info">
                    <h2>{restaurant.name}</h2>

                    <p className="restaurant-address">
                      <span>📍</span>
                      {restaurant.address || "Address not provided"}
                    </p>

                    {restaurant.description && <p>{restaurant.description}</p>}

                    <Link
                      to={`/meals?restaurantId=${encodeURIComponent(restaurant.id)}`}
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
                <h2>
                  {search
                    ? "No restaurants found"
                    : "No active restaurants available"}
                </h2>
                <p>
                  {search
                    ? "Try searching with another name."
                    : "Approved restaurants will appear here."}
                </p>
              </div>
            )}

            {totalPages > 1 && (
              <div className="restaurants-pagination">
                <button
                  onClick={() => setCurrentPage((previous) => previous - 1)}
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
                  onClick={() => setCurrentPage((previous) => previous + 1)}
                  disabled={currentPage === totalPages}
                  className="pagination-arrow"
                >
                  ›
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}

export default Restaurants;
