import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Gallery.css";

export default function GalleryAdmin() {
  const [images, setImages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [newImage, setNewImage] = useState({
    title: "",
    description: "",
    category_id: "",
    file: null,
    preview: null,
  });
  const [editingImage, setEditingImage] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const API = axios.create({
    baseURL: "http://localhost:8000/api/",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("access_token")}`,
    },
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [imagesRes, categoriesRes] = await Promise.all([
        API.get("gallery/"),
        API.get("gallery-categories/"),
      ]);

      const imagesData = imagesRes.data.results || imagesRes.data || [];
      const categoriesData = categoriesRes.data.results || categoriesRes.data || [];

      setImages(Array.isArray(imagesData) ? imagesData : []);
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
    } catch (err) {
      setError("Failed to load data from server.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image" && files.length > 0) {
      const file = files[0];
      setNewImage({
        ...newImage,
        file,
        preview: URL.createObjectURL(file),
      });
    } else {
      setNewImage({ ...newImage, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!newImage.title.trim()) return setError("Title is required!");
    if (!newImage.category_id) return setError("Category is required!");
    if (!newImage.file && !editingImage) return setError("Image file is required!");

    const formData = new FormData();
    formData.append("title", newImage.title);
    formData.append("description", newImage.description);
    formData.append("category_id", newImage.category_id);
    if (newImage.file) formData.append("image", newImage.file);

    try {
      setLoading(true);
      if (editingImage) {
        await API.put(`gallery/${editingImage.id}/`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await API.post("gallery/", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      resetForm();
      fetchData();
    } catch (err) {
      setError("Error saving image. Please check your input.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setNewImage({ title: "", description: "", category_id: "", file: null, preview: null });
    setEditingImage(null);
    setError("");
  };

  const handleEdit = (img) => {
    setEditingImage(img);
    setNewImage({
      title: img.title,
      description: img.description,
      category_id: img.category?.id || img.category_id,
      file: null,
      preview: img.image_url || null,
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this image?")) return;
    try {
      setLoading(true);
      await API.delete(`gallery/${id}/`);
      fetchData();
    } catch (err) {
      setError("Error deleting image.");
    } finally {
      setLoading(false);
    }
  };

  const createSampleCategory = async () => {
    try {
      await API.post("gallery-categories/", {
        name: "General",
        description: "Default category",
        is_active: true,
      });
      fetchData();
    } catch (err) {
      setError("Error creating sample category.");
    }
  };

  return (
    <div className="gallery-admin-wrapper">
      <h1>Gallery Management</h1>

      {error && <div className="error-message">{error}</div>}
      {loading && <div className="loading">Loading...</div>}

      <input
        type="text"
        placeholder="Search images..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="gallery-admin-search"
      />

      <form onSubmit={handleSubmit} className="gallery-admin-form">
        <input
          type="text"
          name="title"
          placeholder="Image Title *"
          value={newImage.title}
          onChange={handleChange}
          required
        />

        <textarea
          name="description"
          placeholder="Image Description"
          value={newImage.description}
          onChange={handleChange}
        />

        <div className="form-group">
          <label htmlFor="category_id">Category *</label>
          {categories.length === 0 ? (
            <div className="no-categories-message">
              <p>No categories found.</p>
              <button type="button" onClick={createSampleCategory}>
                Create Sample Category
              </button>
            </div>
          ) : (
            <select
              id="category_id"
              name="category_id"
              value={newImage.category_id}
              onChange={handleChange}
              required
            >
              <option value="">Select Category *</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name} {!cat.is_active ? "(Inactive)" : ""}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="image">Image File *</label>
          <input
            type="file"
            id="image"
            name="image"
            onChange={handleChange}
            accept="image/*"
          />
          {newImage.preview && (
            <div className="image-preview">
              <img src={newImage.preview} alt="Preview" />
            </div>
          )}
        </div>

        <div className="form-buttons">
          <button type="submit" disabled={loading || categories.length === 0}>
            {loading ? "Saving..." : editingImage ? "Update Image" : "Add Image"}
          </button>
          {editingImage && (
            <button type="button" onClick={resetForm}>
              Cancel Edit
            </button>
          )}
        </div>
      </form>

      <table className="gallery-admin-table">
        <thead>
          <tr>
            <th>Image</th>
            <th>Title</th>
            <th>Description</th>
            <th>Category</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {images.length > 0 ? (
            images
              .filter(
                (img) =>
                  img.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  img.description?.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map((img) => (
                <tr key={img.id}>
                  <td>
                    <img src={img.image_url} alt={img.title} className="table-image" />
                  </td>
                  <td>{img.title}</td>
                  <td>{img.description}</td>
                  <td>{img.category?.name || "No Category"}</td>
                  <td>
                    <button onClick={() => handleEdit(img)}>✏️ Edit</button>
                    <button onClick={() => handleDelete(img.id)}>🗑️ Delete</button>
                  </td>
                </tr>
              ))
          ) : (
            <tr>
              <td colSpan="5">No images found</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
