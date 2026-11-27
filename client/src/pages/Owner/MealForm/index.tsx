
import { useEffect, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import {
  Link,
  useLocation,
  useNavigate,
  useParams,
} from 'react-router-dom';

import { apiClient } from '@/services/apiClient';
import { routes } from '@/constants/routes';
import { useAuthStore } from '@/stores/authStores';

type MealFormValues = {
  name: string;
  description: string;
  price: string;
  imageUrl: string;
  categoryId: string;
  isAvailable: boolean;
};

type MealFormErrors = Partial<
  Record<keyof MealFormValues, string>
>;

interface ApiRestaurant {
  id: string;
  name: string;
  status: string;
}

interface ApiCategory {
  id: string;
  name: string;
}

interface ApiMeal {
  id: string;
  restaurantId: string;
  name: string;
  description?: string | null;
  price: number | string;
  image?: string | null;
  isAvailable: boolean;
  updatedAt: string;
  categoryId?: string;
  category?: {
    id: string;
    name: string;
  };
}

const initialFormValues: MealFormValues = {
  name: '',
  description: '',
  price: '',
  imageUrl: '',
  categoryId: '',
  isAvailable: true,
};

function validate(values: MealFormValues): MealFormErrors {
  const errors: MealFormErrors = {};

  if (!values.name.trim()) {
    errors.name = 'Please enter the meal name.';
  }

  if (!values.price.trim()) {
    errors.price = 'Please enter the price.';
  } else {
    const price = Number(values.price);

    if (!Number.isFinite(price) || price <= 0) {
      errors.price = 'Price must be a number greater than 0.';
    }
  }

  if (!values.categoryId) {
    errors.categoryId = 'Please choose a category.';
  }

  return errors;
}

const inputClass = 'input';
const errorClass = 'form-error';

export default function MealForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === 'ADMIN';

  const requestedRestaurantId =
    (location.state as { restaurantId?: string } | null)
      ?.restaurantId ?? '';

  const [restaurants, setRestaurants] = useState<ApiRestaurant[]>([]);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState('');

  const [categories, setCategories] = useState<ApiCategory[]>([]);

  const [values, setValues] =
    useState<MealFormValues>(initialFormValues);

  const [errors, setErrors] = useState<MealFormErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [existingMealName, setExistingMealName] = useState('');
  const [existingMealUpdatedAt, setExistingMealUpdatedAt] = useState('');

  const [loading, setLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const selectedRestaurant = restaurants.find(
    (restaurant) => restaurant.id === selectedRestaurantId,
  );

  // Load restaurants and existing meal when editing.
  useEffect(() => {
    let active = true;

    async function initializeForm() {
      try {
        setLoading(true);
        setLoadError('');

        const restaurantResponse =
          await apiClient.get<ApiRestaurant[]>(isAdmin ? 'restaurants/admin/all' : 'restaurants/my-restaurants');

        const ownedRestaurants = restaurantResponse.data;

        if (!active) return;

        setRestaurants(ownedRestaurants);

        if (ownedRestaurants.length === 0) {
          throw new Error(
            'No restaurants are linked to your account.',
          );
        }

        if (id) {
          const mealResponse = await apiClient.get<ApiMeal>(
            `meals/manage/${encodeURIComponent(id)}`,
          );

          if (!active) return;

          const meal = mealResponse.data;

          // Ensure the meal belongs to one of this owner's restaurants.
          const belongsToOwner = ownedRestaurants.some(
            (restaurant) => restaurant.id === meal.restaurantId,
          );

          if (!belongsToOwner) {
            throw new Error(
              'You do not have permission to edit this meal.',
            );
          }

          setSelectedRestaurantId(meal.restaurantId);
          setExistingMealName(meal.name);
          setExistingMealUpdatedAt(meal.updatedAt);

          setValues({
            name: meal.name,
            description: meal.description ?? '',
            price: String(meal.price),
            imageUrl: meal.image ?? '',
            categoryId: meal.categoryId ?? meal.category?.id ?? '',
            isAvailable: meal.isAvailable,
          });
        } else {
          const requestedRestaurant = ownedRestaurants.find(
            (restaurant) =>
              restaurant.id === requestedRestaurantId,
          );

          const chosenRestaurant =
            requestedRestaurant ??
            ownedRestaurants.find(
              (restaurant) => restaurant.status === 'ACTIVE',
            ) ??
            ownedRestaurants[0];

          setSelectedRestaurantId(chosenRestaurant.id);
        }
      } catch (err) {
        if (active) {
          setLoadError(
            err instanceof Error
              ? err.message
              : 'Unable to load meal form.',
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    initializeForm();

    return () => {
      active = false;
    };
  }, [id, requestedRestaurantId, isAdmin]);

  // Load real categories for the selected restaurant.
  useEffect(() => {
    let active = true;

    async function loadCategories() {
      if (!selectedRestaurantId) {
        setCategories([]);
        return;
      }

      try {
        setCategoriesLoading(true);
        setFormError(null);

        const response = await apiClient.get<ApiCategory[]>(
          `categories/manage/restaurant/${encodeURIComponent(selectedRestaurantId)}`,
        );

        if (active) {
          setCategories(response.data);
        }
      } catch (err) {
        if (active) {
          setCategories([]);
          setFormError(
            err instanceof Error
              ? err.message
              : 'Unable to load restaurant categories.',
          );
        }
      } finally {
        if (active) {
          setCategoriesLoading(false);
        }
      }
    }

    loadCategories();

    return () => {
      active = false;
    };
  }, [selectedRestaurantId]);

  function handleChange(
    event: ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) {
    const { name, value } = event.target;

    setValues((current) => ({
      ...current,
      [name]: value,
    }));

    setErrors((current) => ({
      ...current,
      [name]: undefined,
    }));

    setFormError(null);
  }

  function handleAvailabilityChange(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    setValues((current) => ({
      ...current,
      isAvailable: event.target.checked,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validationErrors = validate(values);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    if (!selectedRestaurantId || !selectedRestaurant) {
      setFormError('Please select a restaurant.');
      return;
    }

    if (!id && selectedRestaurant.status !== 'ACTIVE' && !isAdmin) {
      setFormError(
        'You cannot add meals to an inactive restaurant.',
      );
      return;
    }

    if (categories.length === 0) {
      setFormError(
        'This restaurant has no categories. Create a category first.',
      );
      return;
    }

    const data = {
      name: values.name.trim(),
      description: values.description.trim(),
      price: Number(values.price),
      image: values.imageUrl.trim(),
      categoryId: values.categoryId,
      isAvailable: values.isAvailable,
    };

    try {
      setSaving(true);
      setFormError(null);

      if (id) {
        await apiClient.patch(`meals/${id}`, { ...data, expectedUpdatedAt: existingMealUpdatedAt });
      } else {
        await apiClient.post('meals', {
          ...data,
          restaurantId: selectedRestaurantId,
        });
      }

      navigate(routes.ownerHome);
    } catch (err) {
      setFormError(
        err instanceof Error
          ? err.message
          : 'Could not save the meal. Please try again.',
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <section className="meal-form-page">
        <p>Loading meal information...</p>
      </section>
    );
  }

  if (loadError) {
    return (
      <section className="meal-form-page">
        <h1 className="meal-form-title">
          Unable to load meal
        </h1>

        <p className={errorClass}>{loadError}</p>

        <Link className="text-link" to={routes.ownerHome}>
          Back to your menu
        </Link>
      </section>
    );
  }

  return (
    <section
      className="meal-form-page"
      aria-labelledby="meal-form-title"
    >
      <h1 id="meal-form-title" className="meal-form-title">
        {id === undefined
          ? 'Add meal'
          : `Edit ${existingMealName}`}
      </h1>

      <form
        className="meal-form"
        onSubmit={handleSubmit}
        noValidate
      >
        {/* Restaurant */}
        <div className="form-field">
          <label className="form-label" htmlFor="meal-restaurant">
            Restaurant
          </label>

          <select
            className={inputClass}
            id="meal-restaurant"
            value={selectedRestaurantId}
            disabled={Boolean(id) || restaurants.length === 1}
            onChange={(event) => {
              setSelectedRestaurantId(event.target.value);
              setValues((current) => ({
                ...current,
                categoryId: '',
              }));
            }}
          >
            {restaurants.map((restaurant) => (
              <option key={restaurant.id} value={restaurant.id}>
                {restaurant.name}
              </option>
            ))}
          </select>

          {selectedRestaurant && (
            <small>
              Restaurant status: {selectedRestaurant.status}
            </small>
          )}
        </div>

        {/* Meal name */}
        <div className="form-field">
          <label className="form-label" htmlFor="meal-name">
            Meal name
          </label>

          <input
            className={inputClass}
            id="meal-name"
            name="name"
            type="text"
            value={values.name}
            onChange={handleChange}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={
              errors.name ? 'meal-name-error' : undefined
            }
          />

          {errors.name && (
            <p className={errorClass} id="meal-name-error">
              {errors.name}
            </p>
          )}
        </div>

        {/* Description */}
        <div className="form-field">
          <label
            className="form-label"
            htmlFor="meal-description"
          >
            Description
          </label>

          <textarea
            className={inputClass}
            id="meal-description"
            name="description"
            rows={3}
            value={values.description}
            onChange={handleChange}
          />
        </div>

        {/* Price */}
        <div className="form-field">
          <label className="form-label" htmlFor="meal-price">
            Price
          </label>

          <input
            className={inputClass}
            id="meal-price"
            name="price"
            type="number"
            step="0.01"
            min="0.01"
            value={values.price}
            onChange={handleChange}
            aria-invalid={Boolean(errors.price)}
            aria-describedby={
              errors.price ? 'meal-price-error' : undefined
            }
          />

          {errors.price && (
            <p className={errorClass} id="meal-price-error">
              {errors.price}
            </p>
          )}
        </div>

        {/* Image */}
        <div className="form-field">
          <label className="form-label" htmlFor="meal-image">
            Image URL
          </label>

          <input
            className={inputClass}
            id="meal-image"
            name="imageUrl"
            type="text"
            placeholder="/assets/meals/pizza.jpg"
            value={values.imageUrl}
            onChange={handleChange}
          />

          {values.imageUrl.trim() && (
            <img
              className="form-image"
              src={values.imageUrl}
              alt="Selected meal image"
              onError={(event) => {
                event.currentTarget.style.display = 'none';
              }}
              onLoad={(event) => {
                event.currentTarget.style.display = 'block';
              }}
            />
          )}
        </div>

        {/* Real database categories */}
        <div className="form-field">
          <label
            className="form-label"
            htmlFor="meal-category"
          >
            Category
          </label>

          <select
            className={inputClass}
            id="meal-category"
            name="categoryId"
            value={values.categoryId}
            onChange={handleChange}
            disabled={categoriesLoading || categories.length === 0}
            aria-invalid={Boolean(errors.categoryId)}
          >
            <option value="">
              {categoriesLoading
                ? 'Loading categories...'
                : categories.length === 0
                  ? 'No categories available'
                  : 'Choose a category'}
            </option>

            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>

          {errors.categoryId && (
            <p className={errorClass}>
              {errors.categoryId}
            </p>
          )}

          {!categoriesLoading && categories.length === 0 && (
            <p className={errorClass}>
              Create a category for this restaurant before adding meals.
            </p>
          )}
        </div>

        {/* Availability */}
        <label className="checkbox-field">
          <input
            type="checkbox"
            checked={values.isAvailable}
            onChange={handleAvailabilityChange}
          />
          Available for ordering
        </label>

        {formError && (
          <p className={errorClass} role="alert">
            {formError}
          </p>
        )}

        {/* Actions */}
        <div className="form-actions">
          <button
            className="button secondary"
            type="button"
            disabled={saving}
            onClick={() => navigate(routes.ownerHome)}
          >
            Cancel
          </button>

          <button
            className="button primary"
            type="submit"
            disabled={
              saving ||
              categoriesLoading ||
              categories.length === 0
            }
          >
            {saving
              ? 'Saving...'
              : id
                ? 'Update meal'
                : 'Save meal'}
          </button>
        </div>
      </form>
    </section>
  );
}
