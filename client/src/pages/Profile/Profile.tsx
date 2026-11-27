
import { useEffect, useState } from "react";
import type { ChangeEvent } from "react";
import { NavLink, useNavigate } from "react-router-dom";

import { apiClient } from "@/services/apiClient";
import {
  getAccessToken,
  saveSession,
} from "@/services/authStorage";
import { useAuthStore } from "@/stores/authStores";

import "./Profile.css";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  address?: string | null;
  role: string;
}

interface OrderSummary {
  id: string;
  total: number | string;
  status: string;
}

interface ProfileUpdateResponse {
  message: string;
  user: UserProfile;
}

type ProfileForm = {
  name: string;
  email: string;
  phone: string;
  address: string;
};

const toFormValues = (user: UserProfile): ProfileForm => ({
  name: user.name,
  email: user.email,
  phone: user.phone ?? "",
  address: user.address ?? "",
});

const Profile = () => {
  const authUser = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const [user, setUser] = useState<UserProfile | null>(null);
  const [draft, setDraft] = useState<ProfileForm>({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [ordersError, setOrdersError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  // Each account has a separate local profile image.
  const imageKey = authUser?.id
    ? `profileImage:${authUser.id}`
    : null;

  const [image, setImage] = useState<string | null>(() =>
    imageKey ? localStorage.getItem(imageKey) : null,
  );

  // Load profile and orders independently.
  useEffect(() => {
    let active = true;

    async function loadProfile() {
      try {
        setLoading(true);
        setError("");
        setOrdersError("");

        const [profileResult, ordersResult] =
          await Promise.allSettled([
            apiClient.get<UserProfile>("auth/profile"),
            apiClient.get<OrderSummary[]>("orders/my-orders"),
          ]);

        if (!active) return;

        if (profileResult.status === "fulfilled") {
          const profile = profileResult.value.data;

          setUser(profile);
          setDraft(toFormValues(profile));
        } else {
          setError(
            profileResult.reason instanceof Error
              ? profileResult.reason.message
              : "Unable to load your profile.",
          );
        }

        if (ordersResult.status === "fulfilled") {
          setOrders(ordersResult.value.data);
        } else {
          setOrdersError(
            ordersResult.reason instanceof Error
              ? ordersResult.reason.message
              : "Unable to load your order statistics.",
          );
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load your account.",
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    if (authUser) {
      loadProfile();
    }

    return () => {
      active = false;
    };
  }, [authUser?.id]);

  // Update profile image.
  const handleImageChange = (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];

    if (!file || !imageKey) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image.");
      event.target.value = "";
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert("Image size must be less than 2MB.");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();

    reader.onloadend = () => {
      if (typeof reader.result !== "string") return;

      try {
        localStorage.setItem(imageKey, reader.result);
        setImage(reader.result);
      } catch {
        alert("Unable to save this image in browser storage.");
      }
    };

    reader.readAsDataURL(file);
  };

  // Remove profile image.
  const handleRemoveImage = () => {
    if (!imageKey) return;

    localStorage.removeItem(imageKey);
    setImage(null);
  };

  // Update draft fields.
  const handleChange = (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const { name, value } = event.target;

    setDraft((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
    setSuccessMessage("");
  };

  // Save profile changes to PostgreSQL.
  const handleSave = async () => {
    if (!user) return;

    if (draft.name.trim().length < 2) {
      setError("Name must contain at least 2 characters.");
      return;
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.email.trim())
    ) {
      setError("Please enter a valid email address.");
      return;
    }

    if (
      draft.phone.trim() &&
      !/^\+?[0-9\s-]{7,20}$/.test(draft.phone.trim())
    ) {
      setError("Please enter a valid phone number.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccessMessage("");

      const payload = {
        name: draft.name.trim(),
        email: draft.email.trim().toLowerCase(),
        address: draft.address.trim(),
        ...(draft.phone.trim()
          ? { phone: draft.phone.trim() }
          : {}),
      };

      const response =
        await apiClient.patch<ProfileUpdateResponse>(
          "auth/profile",
          payload,
        );

      const updatedUser = response.data.user;

      // Update React state.
      setUser(updatedUser);
      setDraft(toFormValues(updatedUser));

      // Update the stored session without losing the token.
      const token = getAccessToken();

      if (token) {
        saveSession(
          { ...updatedUser, address: updatedUser.address ?? "" },
          token,
        );
      }

      // Update Zustand so other components see the new name/email.
      useAuthStore.setState({
        user: { ...updatedUser, address: updatedUser.address ?? "" },
      });

      setIsEditing(false);
      setSuccessMessage("Profile updated successfully!");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update your profile.",
      );
    } finally {
      setSaving(false);
    }
  };

  // Cancel editing.
  const handleCancel = () => {
    if (!user) return;

    setDraft(toFormValues(user));
    setIsEditing(false);
    setError("");
    setSuccessMessage("");
  };

  // Logout.
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (loading && authUser) {
    return (
      <div className="profile-page">
        <div className="profile-container">
          <p>Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!authUser || !user || error && !user) {
    return (
      <div className="profile-page">
        <div className="profile-container">
          <h2>Unable to load profile</h2>
          <p>
            {!authUser
              ? "Please log in to view your profile."
              : error || "User information is unavailable."}
          </p>

          <button
            className="login-btn"
            onClick={() => navigate("/login")}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const completedOrders = orders.filter(
    (order) => order.status.toUpperCase() === "DELIVERED",
  ).length;

  const activeOrders = orders.filter((order) =>
    [
      "PENDING",
      "CONFIRMED",
      "PREPARING",
      "READY",
      "OUT_FOR_DELIVERY",
    ].includes(order.status.toUpperCase()),
  ).length;

  return (
    <div className="profile-page">

      {/* Welcome Section */}
      <section className="profile-banner">

        <div className="profile-avatar">

          {image ? (
            <img src={image} alt="Profile" />
          ) : (
            <span>
              {(user.name.trim().charAt(0) || "U").toUpperCase()}
            </span>
          )}

          <label
            htmlFor="profile-upload"
            className="camera-button"
          >
            📷
          </label>

          <input
            id="profile-upload"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            hidden
          />

          {image && (
            <button
              className="remove-photo"
              onClick={handleRemoveImage}
              title="Remove Profile Photo"
              type="button"
            >
              ✕
            </button>
          )}

        </div>

        <div className="welcome-text">
          <h2>Welcome back,</h2>
          <h1>{user.name}</h1>
          <p>Good food, good mood! ♥</p>
        </div>

      </section>

      {/* Profile Content */}
      <div className="profile-container">

        {/* Sidebar */}
        <aside className="profile-sidebar">

          <button
            className="sidebar-item active"
            type="button"
          >
            👤 My Profile
          </button>

          <NavLink to="/orders" className="sidebar-item">
            🛒 My Orders
          </NavLink>

          <button
            className="sidebar-item"
            type="button"
            disabled
            title="Favorites feature is not connected yet"
          >
            ♥ My Favorites
          </button>

          <button
            className="sidebar-item"
            type="button"
            onClick={() => setIsEditing(true)}
          >
            📍 My Addresses
          </button>

          <button
            className="sidebar-item"
            type="button"
            onClick={() => setIsEditing(true)}
          >
            ⚙ Account Settings
          </button>

          <button
            className="sidebar-item logout"
            type="button"
            onClick={handleLogout}
          >
            ↪ Log Out
          </button>

        </aside>

        {/* Main Profile */}
        <main className="profile-content">

          <div className="profile-heading">

            <h2>👤 Profile Information</h2>

            {!isEditing && (
              <button
                className="edit-button"
                type="button"
                onClick={() => {
                  setDraft(toFormValues(user));
                  setIsEditing(true);
                  setError("");
                  setSuccessMessage("");
                }}
              >
                ✎ Edit Profile
              </button>
            )}

          </div>

          {successMessage && (
            <p role="status">
              {successMessage}
            </p>
          )}

          {error && (
            <p role="alert">
              {error}
            </p>
          )}

          {ordersError && (
            <p role="status">
              Order statistics unavailable: {ordersError}
            </p>
          )}

          <div className="profile-fields">

            {/* Name */}
            <div className="profile-field">
              <span>👤</span>

              <div>
                <label>Full Name</label>

                {isEditing ? (
                  <input
                    name="name"
                    value={draft.name}
                    onChange={handleChange}
                    maxLength={100}
                  />
                ) : (
                  <p>{user.name}</p>
                )}
              </div>
            </div>

            {/* Phone */}
            <div className="profile-field">
              <span>📱</span>

              <div>
                <label>Phone Number</label>

                {isEditing ? (
                  <input
                    name="phone"
                    type="tel"
                    value={draft.phone}
                    onChange={handleChange}
                  />
                ) : (
                  <p>{user.phone || "Not added yet"}</p>
                )}
              </div>
            </div>

            {/* Email */}
            <div className="profile-field">
              <span>✉</span>

              <div>
                <label>Email Address</label>

                {isEditing ? (
                  <input
                    name="email"
                    type="email"
                    value={draft.email}
                    onChange={handleChange}
                  />
                ) : (
                  <p>{user.email}</p>
                )}
              </div>
            </div>

            {/* Address */}
            <div className="profile-field">
              <span>📍</span>

              <div>
                <label>Address</label>

                {isEditing ? (
                  <input
                    name="address"
                    value={draft.address}
                    onChange={handleChange}
                    maxLength={300}
                  />
                ) : (
                  <p>{user.address || "Not added yet"}</p>
                )}
              </div>
            </div>

            {/* Role */}
            <div className="profile-field">
              <span>🔐</span>

              <div>
                <label>Account Role</label>
                <p>{user.role}</p>
              </div>
            </div>

          </div>

          {/* Edit Actions */}
          {isEditing && (
            <div className="edit-actions">

              <button
                className="save-button"
                type="button"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>

              <button
                className="cancel-button"
                type="button"
                onClick={handleCancel}
                disabled={saving}
              >
                Cancel
              </button>

            </div>
          )}

          <hr />

          {/* Real Account Statistics */}
          <h2 className="statistics-heading">
            📊 Account Statistics
          </h2>

          <div className="statistics">

            <div className="stat-card">
              <span>🛍️</span>

              <div>
                <h3>{orders.length}</h3>
                <p>Total Orders</p>
              </div>
            </div>

            <div className="stat-card">
              <span>✓</span>

              <div>
                <h3>{completedOrders}</h3>
                <p>Completed Orders</p>
              </div>
            </div>

            <div className="stat-card">
              <span>🚚</span>

              <div>
                <h3>{activeOrders}</h3>
                <p>Active Orders</p>
              </div>
            </div>

          </div>

        </main>

      </div>

    </div>
  );
};

export default Profile;
