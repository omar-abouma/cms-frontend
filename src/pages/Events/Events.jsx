import React, { useState, useEffect } from "react";
import "./Events.css"; // Import the CSS file

const API_BASE = "http://localhost:8000/api";

export default function CMSEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    start_date: "",
    end_date: "",
    status: "draft",
    image: null,
  });
  const [editingId, setEditingId] = useState(null);

  const token = localStorage.getItem("access_token");

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/events/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setEvents(data.results || data);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch events.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const body = new FormData();
    for (let key in formData) {
      if (formData[key] !== null) body.append(key, formData[key]);
    }

    const url = editingId ? `${API_BASE}/events/${editingId}/` : `${API_BASE}/events/`;
    const method = editingId ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}` },
        body,
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

      setFormData({
        title: "",
        description: "",
        location: "",
        start_date: "",
        end_date: "",
        status: "draft",
        image: null,
      });
      setEditingId(null);
      fetchEvents();
    } catch (err) {
      console.error(err);
      setError("Failed to save event.");
    }
  };

  const handleEdit = (event) => {
    setFormData({
      title: event.title,
      description: event.description,
      location: event.location,
      start_date: event.start_date ? event.start_date.slice(0, 16) : "",
      end_date: event.end_date ? event.end_date.slice(0, 16) : "",
      status: event.status,
      image: null,
    });
    setEditingId(event.id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;
    try {
      const res = await fetch(`${API_BASE}/events/${id}/`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Delete failed");
      fetchEvents();
    } catch (err) {
      console.error(err);
      setError("Failed to delete event.");
    }
  };

  return (
    <div className="cms-events">
      <div className="cms-header">
        <h2>Events Management</h2>
      </div>

      {loading && <div className="loading">Loading events...</div>}
      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="event-form">
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="title">Event Title</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="form-input"
              placeholder="Enter event title"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="location">Location</label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="form-input"
              placeholder="Enter event location"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="start_date">Start Date & Time</label>
            <input
              type="datetime-local"
              id="start_date"
              name="start_date"
              value={formData.start_date}
              onChange={handleChange}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="end_date">End Date & Time</label>
            <input
              type="datetime-local"
              id="end_date"
              name="end_date"
              value={formData.end_date}
              onChange={handleChange}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="status">Status</label>
            <select 
              id="status"
              name="status" 
              value={formData.status} 
              onChange={handleChange}
              className="form-select"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="image">Event Image</label>
            <div className="file-input-wrapper">
              <button type="button" className="file-input-button">
                Choose Image
              </button>
              <input 
                type="file" 
                id="image"
                name="image" 
                onChange={handleChange}
                accept="image/*"
              />
            </div>
          </div>

          <div className="form-group full-width">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="form-textarea"
              placeholder="Enter event description"
              required
            ></textarea>
          </div>
        </div>

        {editingId && events.find((e) => e.id === editingId)?.image && !formData.image && (
          <div className="image-preview">
            <p>Current Image:</p>
            <img
              src={`http://localhost:8000${events.find((e) => e.id === editingId).image}`}
              alt="Current event"
              width="200"
            />
          </div>
        )}

        <div className="form-actions">
          {editingId && (
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={() => {
                setFormData({
                  title: "",
                  description: "",
                  location: "",
                  start_date: "",
                  end_date: "",
                  status: "draft",
                  image: null,
                });
                setEditingId(null);
              }}
            >
              Cancel Edit
            </button>
          )}
          <button type="submit" className="btn btn-primary">
            {editingId ? "Update Event" : "Create Event"}
          </button>
        </div>
      </form>

      <hr className="section-divider" />

      <div className="events-section">
        <h3>Existing Events ({events.length})</h3>
        <ul className="events-list">
          {events.map((event) => (
            <li key={event.id} className="event-item">
              <div className="event-header">
                <h4 className="event-title">{event.title}</h4>
                <div className="event-meta">
                  <span className={`status-badge status-${event.status}`}>
                    {event.status}
                  </span>
                  <span>Start: {event.start_date ? new Date(event.start_date).toLocaleString() : "N/A"}</span>
                </div>
              </div>
              
              <div className="event-details">
                <p><strong>Location:</strong> {event.location}</p>
                <p><strong>Description:</strong> {event.description}</p>
              </div>

              {event.image && (
                <div className="event-image">
                  <img
                    src={`http://localhost:8000${event.image}`}
                    alt={event.title}
                    width="200"
                  />
                </div>
              )}

              <div className="event-actions">
                <button 
                  onClick={() => handleEdit(event)} 
                  className="btn btn-edit"
                >
                  Edit
                </button>
                <button 
                  onClick={() => handleDelete(event.id)} 
                  className="btn btn-delete"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}