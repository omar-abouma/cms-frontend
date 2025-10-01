import React, { useEffect, useState } from "react";
import axios from "axios";
import "./ServicesManagement.css";

// ✅ Modal form component for Add/Edit
function ServiceModal({ service, onClose, onSave }) {
  const [formData, setFormData] = useState({
    title: service?.title || "",
    description: service?.description || "",
    image: null
  });
  const [loading, setLoading] = useState(false);

  const API_URL = "http://127.0.0.1:8000/api/services/";

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image") setFormData({ ...formData, image: files[0] });
    else setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = new FormData();
      data.append("title", formData.title);
      data.append("description", formData.description);
      if (formData.image) data.append("image", formData.image);

      if (service?.id) {
        await axios.put(`${API_URL}${service.id}/`, data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await axios.post(API_URL, data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      onSave();
      onClose();
    } catch (err) {
      console.error("Error saving service:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h2>{service?.id ? "Edit Service" : "Add New Service"}</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="title"
            placeholder="Service Title"
            value={formData.title}
            onChange={handleChange}
            required
          />
          <textarea
            name="description"
            placeholder="Service Description"
            value={formData.description}
            onChange={handleChange}
            required
          ></textarea>
          <input type="file" name="image" accept="image/*" onChange={handleChange} />
          <div className="modal-actions">
            <button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save"}
            </button>
            <button type="button" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ✅ Main Services Management Component
export default function ServicesManagement() {
  const [services, setServices] = useState([]);
  const [editingService, setEditingService] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const API_URL = "http://127.0.0.1:8000/api/services/";

  const fetchServices = async () => {
    try {
      const res = await axios.get(API_URL);
      setServices(res.data.results ? res.data.results : res.data);
    } catch (err) {
      console.error("Error fetching services:", err);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this service?")) return;
    try {
      await axios.delete(`${API_URL}${id}/`);
      fetchServices();
    } catch (err) {
      console.error("Error deleting service:", err);
    }
  };

  const filteredServices = services.filter(service =>
    service.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="services-admin-container">
      <h1>Services Management</h1>

      <div className="top-bar">
        <button className="add-btn" onClick={() => setEditingService({})}>
          Add New Service
        </button>
        <input
          type="text"
          placeholder="Search by title..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <table className="services-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Description</th>
            <th>Image</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredServices.length > 0 ? (
            filteredServices.map(service => (
              <tr key={service.id}>
                <td>{service.title}</td>
                <td>{service.description}</td>
                <td>
                  {service.image && (
                    <img src={service.image} alt={service.title} width="80" />
                  )}
                </td>
                <td>
                  <button onClick={() => setEditingService(service)}>Edit</button>
                  <button onClick={() => handleDelete(service.id)}>Delete</button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4">No services found.</td>
            </tr>
          )}
        </tbody>
      </table>

      {editingService && (
        <ServiceModal
          service={editingService}
          onClose={() => setEditingService(null)}
          onSave={fetchServices}
        />
      )}
    </div>
  );
}
