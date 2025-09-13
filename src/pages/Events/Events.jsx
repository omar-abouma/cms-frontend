import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Events.css";

// API configuration
const API = axios.create({
  baseURL: "http://127.0.0.1:8000/api/",
});

// Field configurations for Events
const EVENT_FIELDS = [
  { name: "title", type: "text", placeholder: "Event Title", required: true },
  { name: "description", type: "textarea", placeholder: "Event Description" },
  { name: "date", type: "date", placeholder: "Event Date" },
  { name: "time", type: "time", placeholder: "Event Time" },
  { name: "location", type: "text", placeholder: "Location" },
  { name: "image", type: "file", placeholder: "Event Image" },
  { name: "category", type: "select", options: ["Conference", "Workshop", "Seminar", "Webinar", "Meeting"] },
  { name: "attendees", type: "number", placeholder: "Expected Attendees" },
  { name: "status", type: "select", options: ["Upcoming", "Ongoing", "Completed", "Cancelled"] }
];

const Events = () => {
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Fetch events on component mount
  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    setIsLoading(true);
    try {
      const response = await API.get("events/");
      setItems(response.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching events:", err);
      setError("Failed to fetch events. Please try again.");
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
        await API.put(`events/${editingId}/`, formData, {
          headers: getHeaders()
        });
        setSuccess("Event updated successfully!");
      } else {
        await API.post("events/", formData, {
          headers: getHeaders()
        });
        setSuccess("Event created successfully!");
      }
      
      resetForm();
      fetchItems();
    } catch (err) {
      console.error("Error saving event:", err);
      setError(`Failed to ${isEditing ? 'update' : 'create'} event. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (item) => {
    setNewItem({
      title: item.title || "",
      description: item.description || "",
      date: item.date || "",
      time: item.time || "",
      location: item.location || "",
      category: item.category || "",
      attendees: item.attendees || "",
      status: item.status || "Upcoming"
    });
    
    if (item.image) {
      setImagePreview(item.image);
    }
    
    setIsEditing(true);
    setEditingId(item.id);
    setError(null);
    setSuccess(null);
    
    // Scroll to form
    document.getElementById("event-form").scrollIntoView({ behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;
    
    setIsLoading(true);
    try {
      await API.delete(`events/${id}/`);
      setSuccess("Event deleted successfully!");
      fetchItems();
    } catch (err) {
      console.error("Error deleting event:", err);
      setError("Failed to delete event. Please try again.");
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

  const renderEventsGrid = () => {
    if (isLoading && items.length === 0) {
      return <div className="loading">Loading events...</div>;
    }
    
    if (items.length === 0) {
      return (
        <div className="empty-state">
          <h3>No events found</h3>
          <p>Create your first event to get started</p>
        </div>
      );
    }
    
    return (
      <div className="items-grid">
        {items.map(item => (
          <div key={item.id} className="item-card">
            <div className="item-image">
              {item.image ? (
                <img src={item.image} alt={item.title} />
              ) : (
                <div className="no-image">No Image</div>
              )}
            </div>
            <div className="item-details">
              <h3 className="item-title">{item.title}</h3>
              <p className="item-date">{item.date} {item.time && `at ${item.time}`}</p>
              <p className="item-location">{item.location}</p>
              <div className="item-meta">
                <span className={`status-badge status-${item.status?.toLowerCase()}`}>
                  {item.status}
                </span>
                <span className="category-badge">{item.category}</span>
              </div>
              <div className="item-actions">
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
        <h2>Events Management</h2>
        <p>Create and manage events for your website</p>
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
          <h3>{isEditing ? 'Edit Event' : 'Add New Event'}</h3>
          <form id="event-form" onSubmit={handleSubmit} className="item-form">
            <div className="form-grid">
              {EVENT_FIELDS.map(field => renderFormField(field))}
            </div>
            
            <div className="form-actions">
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={isLoading}
              >
                {isLoading ? 'Processing...' : (isEditing ? 'Update Event' : 'Create Event')}
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
            <h3>Events List</h3>
            <button 
              className="btn-refresh"
              onClick={fetchItems}
              disabled={isLoading}
            >
              Refresh
            </button>
          </div>
          
          {renderEventsGrid()}
        </div>
      </div>
    </section>
  );
};

export default Events;