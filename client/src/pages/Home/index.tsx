
import { Link } from 'react-router-dom'
import { routes } from '@/constants/routes'

const categories = [
  { name: 'Burgers', icon: '🍔' },
  { name: 'Pizza', icon: '🍕' },
  { name: 'Chicken', icon: '🍗' },
  { name: 'Desserts', icon: '🍰' },
  { name: 'Drinks', icon: '🥤' },
  { name: 'Healthy', icon: '🥗' },
]

const restaurants = [
  {
    name: 'Burger House',
    cuisine: 'Burgers · Fast Food',
    rating: '4.8',
    time: '20–30 min',
    image:
      'https://images.unsplash.com/photo-1565016050896-d5f362810b48?auto=format&fit=crop&fm=jpg&ixid=NHwxMjA3fDA%3D&ixlib=rb-4.1.0&q=60&w=900',
  },
  {
    name: 'Pizza Palace',
    cuisine: 'Pizza · Italian',
    rating: '4.7',
    time: '25–35 min',
    image:
      'https://images.unsplash.com/photo-1769458313863-af6c3c471066?auto=format&fit=crop&fm=jpg&ixid=NHwxMjA3fDA%3D&ixlib=rb-4.1.0&q=60&w=900',
  },
  {
    name: 'Green Bowl',
    cuisine: 'Healthy · Salads',
    rating: '4.9',
    time: '15–25 min',
    image:
      'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&fm=jpg&ixid=NHwxMjA3fDA%3D&ixlib=rb-4.1.0&q=60&w=900',
  },
]

const meals = [
  {
    name: 'Classic Beef Burger',
    description: 'Juicy beef, cheese and fresh vegetables',
    price: '$8.99',
    rating: '4.8',
    image:
      'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=85',
    badge: 'Popular',
  },
  {
    name: 'Italian Margherita',
    description: 'Fresh tomatoes, mozzarella and basil',
    price: '$10.50',
    rating: '4.9',
    image:
      'https://images.unsplash.com/photo-1579751626657-72bc17010498?auto=format&fit=crop&w=900&q=85',
    badge: 'Special Offer',
  },
  {
    name: 'Crispy Fried Chicken',
    description: 'Golden crispy chicken with special sauce',
    price: '$7.50',
    rating: '4.7',
    image:
      'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=900&q=85',
    badge: 'Best Seller',
  },
]

export default function HomePage() {
  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">WELCOME TO FOODORDER</p>

          <h1>
            Delicious food,
            <br />
            delivered to
            <br />
            your doorstep.
          </h1>

          <p>
            Discover your favorite restaurants and enjoy delicious meals
            delivered right to your door.
          </p>

          <form
            action={routes.meals}
            method="get"
            className="hero-search"
            style={{
              display: 'flex',
              gap: '10px',
              marginTop: '25px',
              maxWidth: '470px',
            }}
          >
            <input
              type="search"
              name="search"
              placeholder="Search for meals or restaurants..."
              aria-label="Search meals or restaurants"
              style={{
                flex: 1,
                minWidth: 0,
                padding: '15px',
                border: '1px solid #eeeeee',
                borderRadius: '10px',
                fontSize: '14px',
                outline: 'none',
              }}
            />

            <button
              type="submit"
              style={{
                padding: '0 22px',
                background: '#f97316',
                color: '#ffffff',
                border: 'none',
                borderRadius: '10px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Search
            </button>
          </form>

          <div className="hero-actions">
            <Link className="button primary" to={routes.meals}>
              Explore Meals
            </Link>

            <Link className="button secondary" to={routes.restaurants}>
              Browse Restaurants
            </Link>
          </div>
        </div>

        {/* Hero Real Food Image */}
        <div className="hero-art">
          <img
            src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1200&q=85"
            alt="Delicious juicy beef burger with fresh ingredients"
            style={{
              width: '100%',
              height: '360px',
              objectFit: 'cover',
              borderRadius: '25px',
              display: 'block',
            }}
          />
        </div>
      </section>

      {/* Food Categories */}
      <section className="categories-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">EXPLORE OUR MENU</p>
            <h2>What's on your mind?</h2>
          </div>
        </div>

        <div className="categories-grid">
          {categories.map((category) => (
            <Link
              to={routes.meals}
              className="category-card"
              key={category.name}
            >
              <span className="category-icon">{category.icon}</span>
              <h3>{category.name}</h3>
            </Link>
          ))}
        </div>
      </section>

      {/* Popular Restaurants */}
      <section className="restaurants-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">OUR TOP PICKS</p>
            <h2>Popular Restaurants</h2>
          </div>

          <Link className="text-link" to={routes.restaurants}>
            View All →
          </Link>
        </div>

        <div className="restaurants-grid">
          {restaurants.map((restaurant) => (
            <Link
              to={routes.restaurants}
              className="restaurant-card"
              key={restaurant.name}
            >
              <div className="restaurant-image">
                <img
                  src={restaurant.image}
                  alt={restaurant.name}
                  loading="lazy"
                  style={{
                    width: '100%',
                    height: '180px',
                    objectFit: 'cover',
                  }}
                />
              </div>

              <div className="restaurant-info">
                <h3>{restaurant.name}</h3>
                <p>{restaurant.cuisine}</p>

                <div className="restaurant-meta">
                  <span>⭐ {restaurant.rating}</span>
                  <span>🕒 {restaurant.time}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Meals */}
      <section className="featured-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">TASTY & DELICIOUS</p>
            <h2>Featured Meals</h2>
          </div>

          <Link className="text-link" to={routes.meals}>
            View All →
          </Link>
        </div>

        <div className="meals-grid">
          {meals.map((meal) => (
            <Link
              to={routes.meals}
              className="meal-card"
              key={meal.name}
            >
              <div className="meal-image">
                <img
                  src={meal.image}
                  alt={meal.name}
                  loading="lazy"
                  style={{
                    width: '100%',
                    height: '190px',
                    objectFit: 'cover',
                  }}
                />

                <span className="meal-badge">{meal.badge}</span>
              </div>

              <div className="meal-info">
                <h3>{meal.name}</h3>
                <p>{meal.description}</p>

                <div className="meal-bottom">
                  <strong>{meal.price}</strong>
                  <span>⭐ {meal.rating}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
