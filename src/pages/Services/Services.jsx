// Services.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Services.css";


const API = axios.create({
  baseURL: "http://127.0.0.1:8000/api/",
});

const SERVICES_FIELDS = [
  { name: "title", type: "text", placeholder: "Service Name", required: true },
  { name: "description", type: "textarea", placeholder: "Service Description" },
  { name: "category", type: "select", options: ["Consulting", "Development", "Training", "Support", "Maintenance"] },
  { name: "price", type: "number", placeholder: "Price" },
  { name: "status", type: "select", options: ["Active", "Inactive"] }
];

const Services = () => {
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = () => {
    setIsLoading(true);
    API.get("services/")
      .then((res) => {
        setItems(res.data);
        setIsLoading(false);
      })
      .catch((err) => {
        setError("Failed to fetch services");
        setIsLoading(false);
      });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewItem({ ...newItem, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    const request = isEditing 
      ? API.put(`services/${editingId}/`, newItem)
      : API.post("services/", newItem);
    
    request
      .then((res) => {
        setSuccess(`Service ${isEditing ? 'updated' : 'created'} successfully!`);
        resetForm();
        fetchItems();
      })
      .catch((err) => {
        setError(`Failed to ${isEditing ? 'update' : 'create'} service. Please try again.`);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const resetForm = () => {
    setNewItem({});
    setIsEditing(false);
    setEditingId(null);
    setError(null);
    setSuccess(null);
  };

  const handleEdit = (item) => {
    setNewItem({
      title: item.title || "",
      description: item.description || "",
      category: item.category || "",
      price: item.price || "",
      status: item.status || "Active"
    });
    
    setIsEditing(true);
    setEditingId(item.id);
    setError(null);
    setSuccess(null);
  };

  const handleDelete = (id) => {
    if (!window.confirm("Are you sure you want to delete this service?")) return;
    
    setIsLoading(true);
    API.delete(`services/${id}/`)
      .then((res) => {
        setSuccess("Service deleted successfully!");
        fetchItems();
      })
      .catch((err) => {
        setError("Failed to delete service. Please try again.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const formatPrice = (price) => {
    if (!price) return "Free";
    return `$${parseFloat(price).toFixed(2)}`;
  };

  const renderFormField = (field) => {
    switch (field.type) {
      case "textarea":
        return (
          <div key={field.name} className="service-form-group">
            <label htmlFor={field.name}>{field.placeholder}</label>
            <textarea
              id={field.name}
              name={field.name}
              value={newItem[field.name] || ""}
              onChange={handleChange}
              placeholder={field.placeholder}
              className="service-form-control service-form-textarea"
              rows="4"
            />
          </div>
        );
      
      case "select":
        return (
          <div key={field.name} className="service-form-group">
            <label htmlFor={field.name}>{field.placeholder}</label>
            <select
              id={field.name}
              name={field.name}
              value={newItem[field.name] || ""}
              onChange={handleChange}
              className="service-form-control service-form-select"
            >
              <option value="">Select {field.placeholder}</option>
              {field.options.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
        );
      
      default:
        return (
          <div key={field.name} className="service-form-group">
            <label htmlFor={field.name}>{field.placeholder}</label>
            <input
              type={field.type}
              id={field.name}
              name={field.name}
              value={newItem[field.name] || ""}
              onChange={handleChange}
              placeholder={field.placeholder}
              className="service-form-control"
              required={field.required}
              min={field.type === "number" ? "0" : undefined}
              step={field.type === "number" ? "0.01" : undefined}
            />
          </div>
        );
    }
  };

  return (
    <section className="service-management">
      {error && (
        <div className="service-alert service-alert-error">
          <span>{error}</span>
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      {success && (
        <div className="service-alert service-alert-success">
          <span>{success}</span>
          <button onClick={() => setSuccess(null)}>×</button>
        </div>
      )}

      <div className="service-form">
        <h3>{isEditing ? "Edit" : "Add New"} Service</h3>
        <form onSubmit={handleSubmit} className="service-form-grid">
          {SERVICES_FIELDS.map(field => renderFormField(field))}
          
          <div className="service-form-actions">
            <button 
              type="submit" 
              className="service-btn service-btn-primary"
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : (isEditing ? 'Update Service' : 'Create Service')}
            </button>
            
            {isEditing && (
              <button 
                type="button" 
                className="service-btn service-btn-secondary"
                onClick={resetForm}
                disabled={isLoading}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="service-list">
        <div className="service-section-header">
          <h3>Services List</h3>
          <button 
            className="service-btn-refresh"
            onClick={fetchItems}
            disabled={isLoading}
          >
            Refresh
          </button>
        </div>
        
        {isLoading && items.length === 0 ? (
          <div className="service-loading">Loading services...</div>
        ) : items.length === 0 ? (
          <div className="service-empty-state">
            <h4>No services found</h4>
            <p>Create your first service to get started</p>
          </div>
        ) : (
          <div className="service-items-grid">
            {items.map(item => (
              <div key={item.id} className="service-item-card">
                <div className="service-item-header">
                  <h4 className="service-item-title">{item.title}</h4>
                  <span className={`service-status-badge service-status-${item.status?.toLowerCase()}`}>
                    {item.status}
                  </span>
                </div>
                
                <div className="service-item-category">
                  <span className="service-category-badge">{item.category}</span>
                </div>
                
                <div className="service-item-price">
                  {formatPrice(item.price)}
                </div>
                
                <div className="service-item-description">
                  <p>{item.description}</p>
                </div>
                
                <div className="service-item-actions">
                  <button 
                    className="service-btn-edit"
                    onClick={() => handleEdit(item)}
                    disabled={isLoading}
                  >
                    Edit
                  </button>
                  <button 
                    className="service-btn-delete"
                    onClick={() => handleDelete(item.id)}
                    disabled={isLoading}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Services;