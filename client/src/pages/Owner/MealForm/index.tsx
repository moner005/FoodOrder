import { useMemo, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import type { MenuItem } from '../../../types/menu'
import { addMeal, getMealById, updateMeal } from '../../../services/menuStorage'
import { routes } from '@/constants/routes'
import { CATEGORIES } from '@/types/menu'

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

const inputClass =
  'w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20'
const errorClass = 'text-sm text-red-600'

// TEMP: replace with the logged-in owner's restaurantId once the team adds it to the user
const CURRENT_RESTAURANT_ID = 'restaurant-1'
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
      <section className="mx-auto max-w-xl p-6">
        <h1 className="mb-3 text-2xl font-bold">Meal not found</h1>
        <Link className="font-semibold text-emerald-700 hover:underline" to={routes.ownerHome}>
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
    <section className="mx-auto max-w-xl p-6" aria-labelledby="meal-form-title">
      <h1 id="meal-form-title" className="mb-6 text-2xl font-bold">
        {id === undefined ? 'Add meal' : `Edit ${existingMeal?.name}`}
      </h1>

      <form className="space-y-4" onSubmit={handleSubmit} noValidate>
        <div className="space-y-1">
          <label className="block text-sm font-semibold" htmlFor="meal-name">Meal name</label>
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

        <div className="space-y-1">
          <label className="block text-sm font-semibold" htmlFor="meal-description">Description</label>
          <textarea
            className={inputClass}
            id="meal-description"
            name="description"
            rows={3}
            value={values.description}
            onChange={handleChange}
          />
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-semibold" htmlFor="meal-price">Price</label>
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

        <div className="space-y-1">
          <label className="block text-sm font-semibold" htmlFor="meal-image">Image URL</label>
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
              className="mt-2 h-32 w-full rounded-lg object-cover"
              src={values.imageUrl}
              alt="Meal preview"
            />
          ) : null}
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-semibold" htmlFor="meal-category">Category</label>
          <select
            className={inputClass}
            id="meal-category"
            name="category"
            value={values.category}
            onChange={handleChange}
            aria-invalid={Boolean(errors.category)}
          >
            {CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>
          {errors.category ? <p className={errorClass} role="alert">{errors.category}</p> : null}
        </div>

        <label className="flex items-center gap-3 text-sm">
          <input
            className="h-4 w-4"
            type="checkbox"
            checked={values.isAvailable}
            onChange={handleAvailabilityChange}
          />
          Available for ordering
        </label>

        {formError ? <p className={errorClass} role="alert">{formError}</p> : null}

        <div className="flex gap-3 pt-2">
          <button
            className="rounded-lg border border-slate-300 px-5 py-2.5 font-semibold hover:bg-slate-100"
            type="button"
            onClick={() => navigate(routes.ownerHome)}
          >
            Cancel
          </button>
          <button
            className="rounded-lg bg-emerald-700 px-5 py-2.5 font-semibold text-white hover:bg-emerald-800"
            type="submit"
          >
            Save meal
          </button>
        </div>
      </form>
    </section>
  )
}