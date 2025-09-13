import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Researches.css";

const API = axios.create({
  baseURL: "http://127.0.0.1:8000/api/",
});

const RESEARCH_FIELDS = [
  { name: "title", type: "text", placeholder: "Research Title", required: true },
  { name: "author", type: "text", placeholder: "Principal Investigator" },
  { name: "description", type: "textarea", placeholder: "Research Description" },
  { name: "field", type: "text", placeholder: "Research Field" },
  { name: "status", type: "select", options: ["Ongoing", "Completed", "Proposed"] }
];

const Researches = () => {
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
    API.get("research/")
      .then(res => setItems(res.data))
      .catch(() => setError("Failed to fetch research projects"))
      .finally(() => setIsLoading(false));
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setNewItem({ ...newItem, [name]: value });
  };

  const handleSubmit = e => {
    e.preventDefault();
    setIsLoading(true);

    const request = isEditing
      ? API.put(`research/${editingId}/`, newItem)
      : API.post("research/", newItem);

    request
      .then(() => {
        setSuccess(`Research project ${isEditing ? 'updated' : 'created'} successfully!`);
        resetForm();
        fetchItems();
      })
      .catch(() => setError(`Failed to ${isEditing ? 'update' : 'create'} research project.`))
      .finally(() => setIsLoading(false));
  };

  const resetForm = () => {
    setNewItem({});
    setIsEditing(false);
    setEditingId(null);
    setError(null);
    setSuccess(null);
  };

  const handleEdit = item => {
    setNewItem({
      title: item.title || "",
      author: item.author || "",
      description: item.description || "",
      field: item.field || "",
      status: item.status || "Ongoing"
    });
    setIsEditing(true);
    setEditingId(item.id);
    setError(null);
    setSuccess(null);
  };

  const handleDelete = id => {
    if (!window.confirm("Are you sure you want to delete this research project?")) return;

    setIsLoading(true);
    API.delete(`research/${id}/`)
      .then(() => {
        setSuccess("Research project deleted successfully!");
        fetchItems();
      })
      .catch(() => setError("Failed to delete research project."))
      .finally(() => setIsLoading(false));
  };

  const renderFormField = field => {
    switch (field.type) {
      case "textarea":
        return (
          <div key={field.name} className="research-form-group">
            <label>{field.placeholder}</label>
            <textarea
              name={field.name}
              value={newItem[field.name] || ""}
              onChange={handleChange}
              placeholder={field.placeholder}
              rows={4}
            />
          </div>
        );
      case "select":
        return (
          <div key={field.name} className="research-form-group">
            <label>{field.placeholder}</label>
            <select name={field.name} value={newItem[field.name] || ""} onChange={handleChange}>
              <option value="">Select {field.placeholder}</option>
              {field.options.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
        );
      default:
        return (
          <div key={field.name} className="research-form-group">
            <label>{field.placeholder}</label>
            <input
              type={field.type}
              name={field.name}
              value={newItem[field.name] || ""}
              onChange={handleChange}
              placeholder={field.placeholder}
              required={field.required}
            />
          </div>
        );
    }
  };

  return (
    <div className="research-management">
      {error && <div className="alert error">{error} <button onClick={() => setError(null)}>×</button></div>}
      {success && <div className="alert success">{success} <button onClick={() => setSuccess(null)}>×</button></div>}

      <div className="research-form">
        <h3>{isEditing ? "Edit" : "Add New"} Research Project</h3>
        <form onSubmit={handleSubmit} className="research-form-grid">
          {RESEARCH_FIELDS.map(renderFormField)}

          <div className="research-form-actions">
            <button type="submit" disabled={isLoading}>
              {isLoading ? 'Processing...' : (isEditing ? 'Update' : 'Create')}
            </button>
            {isEditing && <button type="button" onClick={resetForm}>Cancel</button>}
          </div>
        </form>
      </div>

      <div className="research-list">
        <h3>Research Projects</h3>
        <button onClick={fetchItems}>Refresh</button>

        {isLoading && items.length === 0 ? (
          <p>Loading...</p>
        ) : items.length === 0 ? (
          <p>No research projects found.</p>
        ) : (
          <div className="research-items-grid">
            {items.map(item => (
              <div key={item.id} className="research-item-card">
                <div className="research-item-header">
                  <h4>{item.title}</h4>
                  <span className={`status status-${item.status?.toLowerCase()}`}>{item.status}</span>
                </div>
                <p><strong>Field:</strong> {item.field}</p>
                <p><strong>Principal Investigator:</strong> {item.author}</p>
                {item.description && <p>{item.description.length > 150 ? item.description.substring(0,150)+"..." : item.description}</p>}
                <div className="research-item-actions">
                  <button onClick={() => handleEdit(item)}>Edit</button>
                  <button onClick={() => handleDelete(item.id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Researches;
