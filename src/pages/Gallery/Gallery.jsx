import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Gallery.css";

const API = axios.create({
  baseURL: "http://127.0.0.1:8000/api/",
});

const GALLERY_FIELDS = [
  { name: "title", type: "text", placeholder: "Gallery Title", required: true },
  { name: "description", type: "textarea", placeholder: "Description" },
  { name: "image", type: "file", placeholder: "Gallery Image", required: true },
  { name: "imageCount", type: "number", placeholder: "Number of Images" },
  { name: "status", type: "select", options: ["Active", "Inactive"] }
];

const Gallery = () => {
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    setIsLoading(true);
    try {
      const response = await API.get("gallery/");
      setItems(response.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching gallery items:", err);
      setError("Failed to fetch gallery items. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    
    if (type === "file") {
      const file = files[0];
      setNewItem({ ...newItem, [name]: file });
      
      // Create image preview
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);
      } else {
        setImagePreview(null);
      }
    } else {
      setNewItem({ ...newItem, [name]: value });
    }
  };

  const resetForm = () => {
    setNewItem({});
    setIsEditing(false);
    setEditingId(null);
    setImagePreview(null);
    setError(null);
    setSuccess(null);
  };

  const buildFormData = (data) => {
    const formData = new FormData();
    
    Object.keys(data).forEach(key => {
      if (data[key] !== null && data[key] !== undefined) {
        formData.append(key, data[key]);
      }
    });
    
    return formData;
  };

  const getHeaders = () => {
    return {
      "Content-Type": "multipart/form-data",
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const formData = buildFormData(newItem);
      
      if (isEditing) {
        await API.put(`gallery/${editingId}/`, formData, {
          headers: getHeaders()
        });
        setSuccess("Gallery item updated successfully!");
      } else {
        await API.post("gallery/", formData, {
          headers: getHeaders()
        });
        setSuccess("Gallery item created successfully!");
      }
      
      resetForm();
      fetchItems();
    } catch (err) {
      console.error("Error saving gallery item:", err);
      setError(`Failed to ${isEditing ? 'update' : 'create'} gallery item. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (item) => {
    setNewItem({
      title: item.title || "",
      description: item.description || "",
      imageCount: item.imageCount || "",
      status: item.status || "Active"
    });
    
    if (item.image) {
      setImagePreview(item.image);
    }
    
    setIsEditing(true);
    setEditingId(item.id);
    setError(null);
    setSuccess(null);
    
    // Scroll to form
    document.getElementById("gallery-form").scrollIntoView({ behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this gallery item?")) return;
    
    setIsLoading(true);
    try {
      await API.delete(`gallery/${id}/`);
      setSuccess("Gallery item deleted successfully!");
      fetchItems();
    } catch (err) {
      console.error("Error deleting gallery item:", err);
      setError("Failed to delete gallery item. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const renderFormField = (field) => {
    switch (field.type) {
      case "textarea":
        return (
          <div key={field.name} className="form-group">
            <label htmlFor={field.name}>{field.placeholder}</label>
            <textarea
              id={field.name}
              name={field.name}
              value={newItem[field.name] || ""}
              onChange={handleChange}
              placeholder={field.placeholder}
              className="form-control"
              rows="4"
            />
          </div>
        );
      
      case "select":
        return (
          <div key={field.name} className="form-group">
            <label htmlFor={field.name}>{field.placeholder}</label>
            <select
              id={field.name}
              name={field.name}
              value={newItem[field.name] || ""}
              onChange={handleChange}
              className="form-control"
            >
              <option value="">Select {field.placeholder}</option>
              {field.options.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
        );
      
      case "file":
        return (
          <div key={field.name} className="form-group">
            <label htmlFor={field.name}>{field.placeholder}</label>
            <input
              type="file"
              id={field.name}
              name={field.name}
              onChange={handleChange}
              className="form-control"
              accept="image/*"
              required={field.required}
            />
            {imagePreview && (
              <div className="image-preview">
                <img src={imagePreview} alt="Preview" />
              </div>
            )}
          </div>
        );
      
      default:
        return (
          <div key={field.name} className="form-group">
            <label htmlFor={field.name}>{field.placeholder}</label>
            <input
              type={field.type}
              id={field.name}
              name={field.name}
              value={newItem[field.name] || ""}
              onChange={handleChange}
              placeholder={field.placeholder}
              className="form-control"
              required={field.required}
            />
          </div>
        );
    }
  };

  const renderGalleryGrid = () => {
    if (isLoading && items.length === 0) {
      return <div className="loading">Loading gallery items...</div>;
    }
    
    if (items.length === 0) {
      return (
        <div className="empty-state">
          <h3>No gallery items found</h3>
          <p>Create your first gallery item to get started</p>
        </div>
      );
    }
    
    return (
      <div className="gallery-grid">
        {items.map(item => (
          <div key={item.id} className="gallery-item">
            <div className="gallery-image">
              {item.image ? (
                <img src={item.image} alt={item.title} />
              ) : (
                <div className="no-image">No Image</div>
              )}
            </div>
            <div className="gallery-details">
              <h3 className="gallery-title">{item.title}</h3>
              {item.description && (
                <p className="gallery-description">{item.description}</p>
              )}
              <div className="gallery-meta">
                <span className="image-count">{item.imageCount || 0} images</span>
                <span className={`status-badge status-${item.status?.toLowerCase()}`}>
                  {item.status}
                </span>
              </div>
              <div className="gallery-actions">
                <button 
                  className="btn-edit"
                  onClick={() => handleEdit(item)}
                >
                  Edit
                </button>
                <button 
                  className="btn-delete"
                  onClick={() => handleDelete(item.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <section className="content-management">
      <div className="content-header">
        <h2>Gallery Management</h2>
        <p>Create and manage gallery items for your website</p>
      </div>

      {error && (
        <div className="alert alert-error">
          <span>{error}</span>
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          <span>{success}</span>
          <button onClick={() => setSuccess(null)}>×</button>
        </div>
      )}

      <div className="content-body">
        <div className="form-section">
          <h3>{isEditing ? 'Edit Gallery Item' : 'Add New Gallery Item'}</h3>
          <form id="gallery-form" onSubmit={handleSubmit} className="item-form">
            <div className="form-grid">
              {GALLERY_FIELDS.map(field => renderFormField(field))}
            </div>
            
            <div className="form-actions">
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={isLoading}
              >
                {isLoading ? 'Processing...' : (isEditing ? 'Update Gallery Item' : 'Create Gallery Item')}
              </button>
              
              {isEditing && (
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={resetForm}
                  disabled={isLoading}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="list-section">
          <div className="section-header">
            <h3>Gallery Items</h3>
            <button 
              className="btn-refresh"
              onClick={fetchItems}
              disabled={isLoading}
            >
              Refresh
            </button>
          </div>
          
          {renderGalleryGrid()}
        </div>
      </div>
    </section>
  );
};

export default Gallery;