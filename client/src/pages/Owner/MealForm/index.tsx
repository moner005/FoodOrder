import { useMemo, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { MENU_CATEGORIES } from '@/types/menu'
import type { MenuItem } from '@/types/menu'
import { addMeal, getMealById, updateMeal } from '@/services/menuStorage'
import { CURRENT_RESTAURANT_ID } from '@/constants/restaurant'
import { routes } from '@/constants/routes'

type MealFormValues = {
  name: string
  description: string
  price: string
  imageUrl: string
  category: MenuItem['category']
  isAvailable: boolean
}

type MealFormErrors = Partial<Record<keyof MealFormValues, string>>

const initialFormValues: MealFormValues = {
  name: '',
  description: '',
  price: '',
  imageUrl: '',
  category: 'starters',
  isAvailable: true,
}

function mealToFormValues(meal: MenuItem): MealFormValues {
  return {
    name: meal.name,
    description: meal.description,
    price: String(meal.price),
    imageUrl: meal.imageUrl,
    category: meal.category,
    isAvailable: meal.isAvailable,
  }
}

function validate(values: MealFormValues): MealFormErrors {
  const errors: MealFormErrors = {}

  if (!values.name.trim()) {
    errors.name = 'Please enter the meal name.'
  }

  if (!values.price.trim()) {
    errors.price = 'Please enter the price.'
  } else {
    const price = Number(values.price)
    if (Number.isNaN(price) || price <= 0) {
      errors.price = 'Price must be a number greater than 0.'
    }
  }

  if (!values.category) {
    errors.category = 'Please choose a category.'
  }

  return errors
}

const inputClass = 'input'
const errorClass = 'form-error'

export default function MealForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const existingMeal = useMemo(() => (id ? getMealById(id) : undefined), [id])

  const [values, setValues] = useState<MealFormValues>(() =>
    existingMeal ? mealToFormValues(existingMeal) : initialFormValues,
  )
  const [errors, setErrors] = useState<MealFormErrors>({})
  const [formError, setFormError] = useState<string | null>(null)

  if (id !== undefined && !existingMeal) {
    return (
      <section className="meal-form-page">
        <h1 className="meal-form-title">Meal not found</h1>
        <Link className="text-link" to={routes.ownerHome}>
          Back to your menu
        </Link>
      </section>
    )
  }

  function handleChange(
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) {
    const { name, value } = event.target
    setValues((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: undefined }))
    setFormError(null)
  }

  function handleAvailabilityChange(event: ChangeEvent<HTMLInputElement>) {
    setValues((current) => ({ ...current, isAvailable: event.target.checked }))
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const validationErrors = validate(values)

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    const data = {
      name: values.name.trim(),
      description: values.description.trim(),
      price: Number(values.price),
      imageUrl: values.imageUrl.trim(),
      category: values.category,
      isAvailable: values.isAvailable,
    }

    const result = id ? updateMeal(id, data) : addMeal(CURRENT_RESTAURANT_ID, data)
    if (!result.ok) {
      setFormError(result.message ?? 'Could not save the meal. Please try again.')
      return
    }

    navigate(routes.ownerHome)
  }

  return (
    <section className="meal-form-page" aria-labelledby="meal-form-title">
      <h1 id="meal-form-title" className="meal-form-title">
        {id === undefined ? 'Add meal' : `Edit ${existingMeal?.name}`}
      </h1>

      <form className="meal-form" onSubmit={handleSubmit} noValidate>
        <div className="form-field">
          <label className="form-label" htmlFor="meal-name">Meal name</label>
          <input
            className={inputClass}
            id="meal-name"
            name="name"
            type="text"
            value={values.name}
            onChange={handleChange}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? 'meal-name-error' : undefined}
          />
          {errors.name ? <p className={errorClass} id="meal-name-error" role="alert">{errors.name}</p> : null}
        </div>

        <div className="form-field">
          <label className="form-label" htmlFor="meal-description">Description</label>
          <textarea
            className={inputClass}
            id="meal-description"
            name="description"
            rows={3}
            value={values.description}
            onChange={handleChange}
          />
        </div>

        <div className="form-field">
          <label className="form-label" htmlFor="meal-price">Price</label>
          <input
            className={inputClass}
            id="meal-price"
            name="price"
            type="number"
            step="0.01"
            min="0"
            value={values.price}
            onChange={handleChange}
            aria-invalid={Boolean(errors.price)}
            aria-describedby={errors.price ? 'meal-price-error' : undefined}
          />
          {errors.price ? <p className={errorClass} id="meal-price-error" role="alert">{errors.price}</p> : null}
        </div>

        <div className="form-field">
          <label className="form-label" htmlFor="meal-image">Image URL</label>
          <input
            className={inputClass}
            id="meal-image"
            name="imageUrl"
            type="text"
            placeholder="/assets/meals/pizza.jpg"
            value={values.imageUrl}
            onChange={handleChange}
          />
          {values.imageUrl.trim() ? (
            <img
              className="form-preview"
              src={values.imageUrl}
              alt="Meal preview"
            />
          ) : null}
        </div>

        <div className="form-field">
          <label className="form-label" htmlFor="meal-category">Category</label>
          <select
            className={inputClass}
            id="meal-category"
            name="category"
            value={values.category}
            onChange={handleChange}
            aria-invalid={Boolean(errors.category)}
          >
            {MENU_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>
          {errors.category ? <p className={errorClass} role="alert">{errors.category}</p> : null}
        </div>

        <label className="checkbox-field">
          <input
            type="checkbox"
            checked={values.isAvailable}
            onChange={handleAvailabilityChange}
          />
          Available for ordering
        </label>

        {formError ? <p className={errorClass} role="alert">{formError}</p> : null}

        <div className="form-actions">
          <button
            className="button secondary"
            type="button"
            onClick={() => navigate(routes.ownerHome)}
          >
            Cancel
          </button>
          <button
            className="button primary"
            type="submit"
          >
            Save meal
          </button>
        </div>
      </form>
    </section>
  )
}