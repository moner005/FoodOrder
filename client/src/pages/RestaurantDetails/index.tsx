import { useState } from 'react'
import type { Meal } from '@/types/meal'
import { restaurant, categories, meals } from '@/pages/RestaurantDetails/restaurant.mock'
import { useRestaurantCart } from '@/pages/RestaurantDetails/cartIntegration'
import styles from './RestaurantDetails.module.css'

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: restaurant.currency })
const formatPrice = (priceMinor: number) => money.format(priceMinor / 100)

function FoodImage({ src, alt, hero = false }: { src: string; alt: string; hero?: boolean }) {
  const [failed, setFailed] = useState(false)
  return (
    <div className={`${styles.imageFrame} ${hero ? styles.heroImage : ''}`}>
      {failed ? (
        <div className={styles.imageFallback} role="img" aria-label={alt}>
          <span className="brand-mark" aria-hidden="true">f</span>
        </div>
      ) : <img src={src} alt={alt} loading={hero ? 'eager' : 'lazy'} onError={() => setFailed(true)} />}
    </div>
  )
}

function MealCard({ meal, addMeal }: { meal: Meal; addMeal: ReturnType<typeof useRestaurantCart>['addMeal'] }) {
  return (
    <article className={styles.mealCard} aria-labelledby={`meal-${meal.id}`}>
      <div className={styles.mealVisual}>
        <FoodImage src={meal.imageUrl} alt={meal.name} />
        {!meal.available && <span className={`status-pill ${styles.availability}`}>Sold out today</span>}
      </div>
      <div className={styles.mealBody}>
        <p className="eyebrow">{categories.find((category) => category.id === meal.categoryId)?.name}</p>
        <h3 id={`meal-${meal.id}`}>{meal.name}</h3>
        <p className={styles.mealDescription}>{meal.description}</p>
        {meal.dietaryLabels.length > 0 && <p className={styles.dietary}>{meal.dietaryLabels.join(' · ')}</p>}
        <div className={styles.mealActions}>
          <span className={styles.price}>{formatPrice(meal.priceMinor)}</span>
          <button
            type="button"
            className={`button primary ${styles.addButton}`}
            disabled={!meal.available || !addMeal}
            aria-label={`Add ${meal.name} to cart`}
            onClick={() => {
              if (meal.available && addMeal) addMeal({ mealId: meal.id, quantity: 1, note: '' })
            }}
          >Add to cart <span aria-hidden="true">+</span></button>
        </div>
      </div>
    </article>
  )
}

export default function RestaurantDetailsPage() {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const { addMeal } = useRestaurantCart()
  const visibleMeals = selectedCategory === 'all' ? meals : meals.filter((meal) => meal.categoryId === selectedCategory)

  return (
    <div className={styles.page}>
      <section className={`hero ${styles.restaurantHero}`} aria-labelledby="restaurant-title">
        <div className="hero-copy">
          <p className="eyebrow">{restaurant.cuisine}</p>
          <h1 id="restaurant-title">{restaurant.name}</h1>
          <p>{restaurant.description}</p>
          <div className="hero-actions">
            <a className="button primary" href="#restaurant-menu">Explore the menu <span aria-hidden="true">↗</span></a>
            <a className="button secondary" href="#restaurant-hours">Opening hours</a>
          </div>
        </div>
        <FoodImage src={restaurant.imageUrl} alt="A warmly lit dining room with tables set for dinner" hero />
      </section>

      <section className={styles.information} aria-label="Restaurant information">
        <div>
          <p className="eyebrow">Our neighborhood</p>
          <h2>A little closer to home.</h2>
          <address>{restaurant.address}</address>
          <p className={styles.muted}>{restaurant.cuisine}</p>
        </div>
        <div id="restaurant-hours">
          <p className="eyebrow">Around the table</p>
          <h2>Opening hours</h2>
          <dl className={styles.hours}>
            {restaurant.openingHours.map(({ days, hours }) => <div key={days}><dt>{days}</dt><dd>{hours}</dd></div>)}
          </dl>
        </div>
        <div>
          <p className="eyebrow">To your door</p>
          <h2>Stay in. Eat well.</h2>
          <p className={styles.muted}>Delivery to {restaurant.supportedAreas.join(' & ')}.</p>
          <p className={styles.deliveryTerms}>{formatPrice(restaurant.deliveryFeeMinor)} delivery · {formatPrice(restaurant.minimumSubtotalMinor)} minimum food subtotal</p>
        </div>
      </section>

      <section id="restaurant-menu" className={styles.menu} aria-labelledby="menu-title">
        <header className={`section-heading ${styles.menuHeading}`}>
          <div><p className="eyebrow">Fresh from our kitchen</p><h2 id="menu-title">Find your next favorite.</h2></div>
          <span className="status-pill">Made with care</span>
        </header>
        <div className={styles.filters} role="group" aria-label="Filter meals by category">
          {[{ id: 'all', name: 'All dishes' }, ...categories].map((category) => (
            <button type="button" key={category.id} className={styles.filter} aria-pressed={selectedCategory === category.id} onClick={() => setSelectedCategory(category.id)}>{category.name}</button>
          ))}
        </div>
        <p className={styles.resultCount} role="status" aria-live="polite">{visibleMeals.length} {visibleMeals.length === 1 ? 'dish' : 'dishes'}{selectedCategory === 'all' ? ' to make your day' : ` · ${categories.find((category) => category.id === selectedCategory)?.name}`}</p>
        <div className={styles.mealGrid}>
          {visibleMeals.map((meal) => <MealCard key={meal.id} meal={meal} addMeal={addMeal} />)}
        </div>
        {visibleMeals.length === 0 && <div className="panel"><h2>No dishes in this category</h2><button className="button secondary" type="button" onClick={() => setSelectedCategory('all')}>See all dishes</button></div>}
      </section>
    </div>
  )
}
