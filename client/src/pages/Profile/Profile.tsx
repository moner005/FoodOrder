import { useState } from "react";
import "./Profile.css";

interface User {
  name: string;
  phone: string;
  email: string;
  address: string;
}

const Profile = () => {
  const [user, setUser] = useState<User>(() => {
    const savedUser = localStorage.getItem("userProfile");

    return savedUser
      ? JSON.parse(savedUser)
      : {
          name: "Your Name",
          phone: "",
          email: "",
          address: "",
        };
  });

  const [image, setImage] = useState<string | null>(
    localStorage.getItem("profileImage")
  );

  const [isEditing, setIsEditing] = useState(false);

  const handleImageChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert("Image size must be less than 2MB.");
      return;
    }

    const reader = new FileReader();

    reader.onloadend = () => {
      const imageUrl = reader.result as string;

      setImage(imageUrl);
      localStorage.setItem("profileImage", imageUrl);
    };

    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
  setImage(null);
  localStorage.removeItem("profileImage");
};

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setUser({
      ...user,
      [event.target.name]: event.target.value,
    });
  };

  const handleSave = () => {
    localStorage.setItem("userProfile", JSON.stringify(user));
    setIsEditing(false);
  };

  return (
    <div className="profile-page">

      {/* Welcome Section */}
      <section className="profile-banner">

      <div className="profile-avatar">

  {image ? (
    <img src={image} alt="Profile" />
  ) : (
    <span>
      {user.name.charAt(0).toUpperCase()}
    </span>
  )}

  <label htmlFor="profile-upload" className="camera-button">
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
          <p>Good food, good mood! ♡</p>
        </div>

      </section>

      {/* Profile Content */}
      <div className="profile-container">

        {/* Sidebar */}
        <aside className="profile-sidebar">

          <button className="sidebar-item active">
            👤 My Profile
          </button>

          <button className="sidebar-item">
            🛒 My Orders
          </button>

          <button className="sidebar-item">
            ♡ My Favorites
          </button>

          <button className="sidebar-item">
            📍 My Addresses
          </button>

          <button className="sidebar-item">
            ⚙ Account Settings
          </button>

          <button className="sidebar-item logout">
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
                onClick={() => setIsEditing(true)}
              >
                ✎ Edit Profile
              </button>
            )}

          </div>

          <div className="profile-fields">

            <div className="profile-field">
              <span>👤</span>
              <div>
                <label>Full Name</label>

                {isEditing ? (
                  <input
                    name="name"
                    value={user.name}
                    onChange={handleChange}
                  />
                ) : (
                  <p>{user.name}</p>
                )}
              </div>
            </div>
            <div className="profile-field">
              <span>📞</span>
              <div>
                <label>Phone Number</label>

                {isEditing ? (
                  <input
                    name="phone"
                    value={user.phone}
                    onChange={handleChange}
                  />
                ) : (
                  <p>{user.phone || "Not added yet"}</p>
                )}
              </div>
            </div>

            <div className="profile-field">
              <span>✉</span>
              <div>
                <label>Email Address</label>

                {isEditing ? (
                  <input
                    name="email"
                    type="email"
                    value={user.email}
                    onChange={handleChange}
                  />
                ) : (
                  <p>{user.email || "Not added yet"}</p>
                )}
              </div>
            </div>

            <div className="profile-field">
              <span>📍</span>
              <div>
                <label>Address</label>

                {isEditing ? (
                  <input
                    name="address"
                    value={user.address}
                    onChange={handleChange}
                  />
                ) : (
                  <p>{user.address || "Not added yet"}</p>
                )}
              </div>
            </div>

          </div>

          {isEditing && (
            <div className="edit-actions">

              <button
                className="save-button"
                onClick={handleSave}
              >
                Save Changes
              </button>

              <button
                className="cancel-button"
                onClick={() => {
                  const saved = localStorage.getItem("userProfile");

                  if (saved) setUser(JSON.parse(saved));

                  setIsEditing(false);
                }}
              >
                Cancel
              </button>

            </div>
          )}

          <hr />

          {/* Statistics */}
          <h2 className="statistics-heading">
            📊 Account Statistics
          </h2>

          <div className="statistics">

            <div className="stat-card">
              <span>🛍️</span>
              <div>
                <h3>12</h3>
                <p>Total Orders</p>
              </div>
            </div>

            <div className="stat-card">
              <span>♥</span>
              <div>
                <h3>8</h3>
                <p>Favorite Items</p>
              </div>
            </div>

            <div className="stat-card">
              <span>⭐</span>
              <div>
                <h3>4.8</h3>
                <p>Account Rating</p>
              </div>
            </div>

          </div>

        </main>

      </div>

    </div>
  );
};

export default Profile;