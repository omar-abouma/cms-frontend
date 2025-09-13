// Publications.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Publications.css";

const API = axios.create({
  baseURL: "http://127.0.0.1:8000/api/",
});

const PUBLICATIONS_FIELDS = [
  { name: "title", type: "text", placeholder: "Publication Title", required: true },
  { name: "author", type: "text", placeholder: "Author" },
  { name: "abstract", type: "textarea", placeholder: "Abstract" },
  { name: "file", type: "file", placeholder: "PDF File" },
  { name: "status", type: "select", options: ["Draft", "Published", "Under Review"] }
];

const Publications = () => {
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [filePreview, setFilePreview] = useState(null);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = () => {
    setIsLoading(true);
    API.get("publications/")
      .then((res) => {
        setItems(res.data);
        setIsLoading(false);
      })
      .catch((err) => {
        setError("Failed to fetch publications");
        setIsLoading(false);
      });
  };

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    
    if (type === "file") {
      const file = files[0];
      setNewItem({ ...newItem, [name]: file });
      
      // Show file info preview
      if (file) {
        setFilePreview({
          name: file.name,
          size: (file.size / 1024).toFixed(2) + ' KB',
          type: file.type
        });
      } else {
        setFilePreview(null);
      }
    } else {
      setNewItem({ ...newItem, [name]: value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    const formData = new FormData();
    Object.keys(newItem).forEach(key => {
      if (newItem[key] !== null && newItem[key] !== undefined) {
        formData.append(key, newItem[key]);
      }
    });
    
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    };
    
    const request = isEditing 
      ? API.put(`publications/${editingId}/`, formData, config)
      : API.post("publications/", formData, config);
    
    request
      .then((res) => {
        setSuccess(`Publication ${isEditing ? 'updated' : 'created'} successfully!`);
        resetForm();
        fetchItems();
      })
      .catch((err) => {
        setError(`Failed to ${isEditing ? 'update' : 'create'} publication. Please try again.`);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const resetForm = () => {
    setNewItem({});
    setIsEditing(false);
    setEditingId(null);
    setFilePreview(null);
    setError(null);
    setSuccess(null);
  };

  const handleEdit = (item) => {
    setNewItem({
      title: item.title || "",
      author: item.author || "",
      abstract: item.abstract || "",
      status: item.status || "Draft"
    });
    
    if (item.file) {
      setFilePreview({
        name: "Current file",
        size: "Already uploaded",
        type: "file"
      });
    }
    
    setIsEditing(true);
    setEditingId(item.id);
    setError(null);
    setSuccess(null);
  };

  const handleDelete = (id) => {
    if (!window.confirm("Are you sure you want to delete this publication?")) return;
    
    setIsLoading(true);
    API.delete(`publications/${id}/`)
      .then((res) => {
        setSuccess("Publication deleted successfully!");
        fetchItems();
      })
      .catch((err) => {
        setError("Failed to delete publication. Please try again.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const renderFormField = (field) => {
    switch (field.type) {
      case "textarea":
        return (
          <div key={field.name} className="pub-form-group">
            <label htmlFor={field.name}>{field.placeholder}</label>
            <textarea
              id={field.name}
              name={field.name}
              value={newItem[field.name] || ""}
              onChange={handleChange}
              placeholder={field.placeholder}
              className="pub-form-control pub-form-textarea"
              rows="4"
            />
          </div>
        );
      
      case "select":
        return (
          <div key={field.name} className="pub-form-group">
            <label htmlFor={field.name}>{field.placeholder}</label>
            <select
              id={field.name}
              name={field.name}
              value={newItem[field.name] || ""}
              onChange={handleChange}
              className="pub-form-control pub-form-select"
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
          <div key={field.name} className="pub-form-group">
            <label htmlFor={field.name}>{field.placeholder}</label>
            <input
              type="file"
              id={field.name}
              name={field.name}
              onChange={handleChange}
              className="pub-form-control"
              accept=".pdf,.doc,.docx"
            />
            {filePreview && (
              <div className="pub-file-preview">
                <div className="pub-file-info">
                  <div className="pub-file-icon">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="pub-file-details">
                    <div className="pub-file-name">{filePreview.name}</div>
                    <div className="pub-file-size">{filePreview.size}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      
      default:
        return (
          <div key={field.name} className="pub-form-group">
            <label htmlFor={field.name}>{field.placeholder}</label>
            <input
              type={field.type}
              id={field.name}
              name={field.name}
              value={newItem[field.name] || ""}
              onChange={handleChange}
              placeholder={field.placeholder}
              className="pub-form-control"
              required={field.required}
            />
          </div>
        );
    }
  };

  return (
    <section className="pub-management">
      {error && (
        <div className="pub-alert pub-alert-error">
          <span>{error}</span>
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      {success && (
        <div className="pub-alert pub-alert-success">
          <span>{success}</span>
          <button onClick={() => setSuccess(null)}>×</button>
        </div>
      )}

      <div className="pub-form">
        <h3>{isEditing ? "Edit" : "Add New"} Publication</h3>
        <form onSubmit={handleSubmit} className="pub-form-grid">
          {PUBLICATIONS_FIELDS.map(field => renderFormField(field))}
          
          <div className="pub-form-actions">
            <button 
              type="submit" 
              className="pub-btn pub-btn-primary"
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : (isEditing ? 'Update Publication' : 'Create Publication')}
            </button>
            
            {isEditing && (
              <button 
                type="button" 
                className="pub-btn pub-btn-secondary"
                onClick={resetForm}
                disabled={isLoading}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="pub-list">
        <h3>Publications List</h3>
        
        {isLoading && items.length === 0 ? (
          <div className="pub-loading">Loading publications...</div>
        ) : items.length === 0 ? (
          <div className="pub-empty-state">
            <h4>No publications found</h4>
            <p>Create your first publication to get started</p>
          </div>
        ) : (
          <table className="pub-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Author</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id}>
                  <td>{item.title}</td>
                  <td>{item.author}</td>
                  <td>
                    <span className={`pub-status-badge pub-status-${item.status?.toLowerCase().replace(' ', '-')}`}>
                      {item.status}
                    </span>
                  </td>
                  <td>
                    <div className="pub-action-buttons">
                      <button 
                        className="pub-btn-edit"
                        onClick={() => handleEdit(item)}
                        disabled={isLoading}
                      >
                        Edit
                      </button>
                      <button 
                        className="pub-btn-delete"
                        onClick={() => handleDelete(item.id)}
                        disabled={isLoading}
                      >
                        Delete
                      </button>
                      {item.file && (
                        <button 
                          className="pub-btn-download"
                          onClick={() => window.open(item.file, '_blank')}
                        >
                          Download
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
};

export default Publications;