import React, { useState, useEffect } from "react";
import axios from "axios";
import "./News.css";

const API = axios.create({
  baseURL: "http://127.0.0.1:8000/api/",
});

const NEWS_FIELDS = [
  { name: "title", type: "text", placeholder: "News Title", required: true },
  { name: "summary", type: "textarea", placeholder: "News Summary" },
  { name: "content", type: "textarea", placeholder: "Full Content" },
  { name: "image", type: "file", placeholder: "News Image" },
  { name: "status", type: "select", options: ["Draft", "Published"] }
];

const News = () => {
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
      const response = await API.get("news/");
      setItems(response.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching news:", err);
      setError("Failed to fetch news. Please try again.");
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
        await API.put(`news/${editingId}/`, formData, {
          headers: getHeaders()
        });
        setSuccess("News article updated successfully!");
      } else {
        await API.post("news/", formData, {
          headers: getHeaders()
        });
        setSuccess("News article created successfully!");
      }
      
      resetForm();
      fetchItems();
    } catch (err) {
      console.error("Error saving news article:", err);
      setError(`Failed to ${isEditing ? 'update' : 'create'} news article. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (item) => {
    setNewItem({
      title: item.title || "",
      summary: item.summary || "",
      content: item.content || "",
      status: item.status || "Draft"
    });
    
    if (item.image) {
      setImagePreview(item.image);
    }
    
    setIsEditing(true);
    setEditingId(item.id);
    setError(null);
    setSuccess(null);
    
    // Scroll to form
    document.getElementById("news-form").scrollIntoView({ behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this news article?")) return;
    
    setIsLoading(true);
    try {
      await API.delete(`news/${id}/`);
      setSuccess("News article deleted successfully!");
      fetchItems();
    } catch (err) {
      console.error("Error deleting news article:", err);
      setError("Failed to delete news article. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePublishToggle = async (id, currentStatus) => {
    const newStatus = currentStatus === "Published" ? "Draft" : "Published";
    
    setIsLoading(true);
    try {
      await API.patch(`news/${id}/`, { status: newStatus });
      setSuccess(`News article ${newStatus.toLowerCase()} successfully!`);
      fetchItems();
    } catch (err) {
      console.error("Error updating news status:", err);
      setError("Failed to update news status. Please try again.");
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
              rows={field.name === "content" ? "8" : "4"}
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

  const renderNewsTable = () => {
    if (isLoading && items.length === 0) {
      return <div className="loading">Loading news articles...</div>;
    }
    
    if (items.length === 0) {
      return (
        <div className="empty-state">
          <h3>No news articles found</h3>
          <p>Create your first news article to get started</p>
        </div>
      );
    }
    
    return (
      <div className="table-container">
        <table className="news-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Title</th>
              <th>Summary</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id}>
                <td className="table-image">
                  {item.image ? (
                    <img src={item.image} alt={item.title} />
                  ) : (
                    <div className="no-image">No Image</div>
                  )}
                </td>
                <td className="table-title">{item.title}</td>
                <td className="table-summary">{item.summary || "No summary available"}</td>
                <td className="table-status">
                  <span className={`status-badge status-${item.status?.toLowerCase()}`}>
                    {item.status}
                  </span>
                </td>
                <td className="table-actions">
                  <div className="action-buttons">
                    <button 
                      className="btn-publish"
                      onClick={() => handlePublishToggle(item.id, item.status)}
                      disabled={isLoading}
                    >
                      {item.status === "Published" ? "Unpublish" : "Publish"}
                    </button>
                    <button 
                      className="btn-edit"
                      onClick={() => handleEdit(item)}
                      disabled={isLoading}
                    >
                      Edit
                    </button>
                    <button 
                      className="btn-delete"
                      onClick={() => handleDelete(item.id)}
                      disabled={isLoading}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <section className="content-management">
      <div className="content-header">
        <h2>News Management</h2>
        <p>Create and manage news articles for your website</p>
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
          <h3>{isEditing ? 'Edit News Article' : 'Add New News Article'}</h3>
          <form id="news-form" onSubmit={handleSubmit} className="item-form">
            <div className="form-grid">
              {NEWS_FIELDS.map(field => renderFormField(field))}
            </div>
            
            <div className="form-actions">
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={isLoading}
              >
                {isLoading ? 'Processing...' : (isEditing ? 'Update News Article' : 'Create News Article')}
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
            <h3>News Articles</h3>
            <button 
              className="btn-refresh"
              onClick={fetchItems}
              disabled={isLoading}
            >
              Refresh
            </button>
          </div>
          
          {renderNewsTable()}
        </div>
      </div>
    </section>
  );
};

export default News;