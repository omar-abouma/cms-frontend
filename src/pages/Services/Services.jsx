import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Services.css";

const BASE_URL = "http://localhost:8000/api"; // Update if different

// Reusable Input
const Input = ({ label, ...rest }) => (
  <div className="form-group">
    <label>{label}</label>
    <input {...rest} className="form-control" />
  </div>
);

// Infrastructure Form
const InfrastructureForm = ({ onSubmit, formData, setFormData, isEditing, cancelEdit }) => (
  <form onSubmit={onSubmit}>
    <Input
      label="Title"
      type="text"
      value={formData.title || ""}
      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
    />
    <Input
      label="Description"
      type="text"
      value={formData.desc || ""}
      onChange={(e) => setFormData({ ...formData, desc: e.target.value })}
    />
    <Input
      label="Link"
      type="text"
      value={formData.link || ""}
      onChange={(e) => setFormData({ ...formData, link: e.target.value })}
    />
    <Input
      label="Image"
      type="file"
      onChange={(e) => setFormData({ ...formData, image: e.target.files[0] })}
    />
    <button type="submit" className="btn btn-primary">{isEditing ? "Update" : "Create"}</button>
    {isEditing && <button type="button" onClick={cancelEdit} className="btn btn-secondary">Cancel</button>}
  </form>
);

// WhyChoose Form
const WhyChooseForm = ({ onSubmit, formData, setFormData, isEditing, cancelEdit }) => (
  <form onSubmit={onSubmit}>
    <Input
      label="Icon (emoji)"
      type="text"
      value={formData.icon || ""}
      onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
    />
    <Input
      label="Title"
      type="text"
      value={formData.title || ""}
      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
    />
    <Input
      label="Description"
      type="text"
      value={formData.desc || ""}
      onChange={(e) => setFormData({ ...formData, desc: e.target.value })}
    />
    <button type="submit" className="btn btn-primary">{isEditing ? "Update" : "Create"}</button>
    {isEditing && <button type="button" onClick={cancelEdit} className="btn btn-secondary">Cancel</button>}
  </form>
);

export default function ServicesCMS() {
  const [infraItems, setInfraItems] = useState([]);
  const [whyItems, setWhyItems] = useState([]);

  const [selectedTab, setSelectedTab] = useState("infrastructure");

  const [formData, setFormData] = useState({});
  const [editingId, setEditingId] = useState(null);

  // Fetch Data
  const fetchInfrastructure = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/admin-infrastructure/`);
      setInfraItems(res.data);
    } catch (err) {
      console.error("Infra Fetch Error:", err);
    }
  };

  const fetchWhyChoose = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/admin-whychoose/`);
      setWhyItems(res.data);
    } catch (err) {
      console.error("WhyChoose Fetch Error:", err);
    }
  };

  useEffect(() => {
    fetchInfrastructure();
    fetchWhyChoose();
  }, []);

  // Create or Update
  const handleSubmit = async (e) => {
    e.preventDefault();
    const isInfra = selectedTab === "infrastructure";

    const endpoint = isInfra ? "admin-infrastructure" : "admin-whychoose";
    const data = new FormData();

    Object.entries(formData).forEach(([key, value]) => data.append(key, value));

    try {
      let res;
      if (editingId) {
        res = await axios.put(`${BASE_URL}/${endpoint}/${editingId}/`, data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        res = await axios.post(`${BASE_URL}/${endpoint}/`, data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      setFormData({});
      setEditingId(null);
      isInfra ? fetchInfrastructure() : fetchWhyChoose();
    } catch (err) {
      console.error("Save Error:", err.response?.data || err.message);
    }
  };

  const handleDelete = async (id) => {
    const isInfra = selectedTab === "infrastructure";
    const endpoint = isInfra ? "admin-infrastructure" : "admin-whychoose";
    if (!window.confirm("Are you sure you want to delete this item?")) return;

    try {
      await axios.delete(`${BASE_URL}/${endpoint}/${id}/`);
      isInfra ? fetchInfrastructure() : fetchWhyChoose();
    } catch (err) {
      console.error("Delete Error:", err);
    }
  };

  const handleEdit = (item) => {
    setFormData(item);
    setEditingId(item.id);
  };

  const cancelEdit = () => {
    setFormData({});
    setEditingId(null);
  };

  return (
    <div className="services-cms-container">
      <h2>Services CMS Management</h2>

      <div className="tab-buttons">
        <button
          className={selectedTab === "infrastructure" ? "active" : ""}
          onClick={() => { setSelectedTab("infrastructure"); cancelEdit(); }}
        >
          Service Infrastructure
        </button>
        <button
          className={selectedTab === "whychoose" ? "active" : ""}
          onClick={() => { setSelectedTab("whychoose"); cancelEdit(); }}
        >
          Why Choose Us
        </button>
      </div>

      <div className="form-section">
        {selectedTab === "infrastructure" ? (
          <InfrastructureForm
            onSubmit={handleSubmit}
            formData={formData}
            setFormData={setFormData}
            isEditing={!!editingId}
            cancelEdit={cancelEdit}
          />
        ) : (
          <WhyChooseForm
            onSubmit={handleSubmit}
            formData={formData}
            setFormData={setFormData}
            isEditing={!!editingId}
            cancelEdit={cancelEdit}
          />
        )}
      </div>

      <div className="items-list">
        {(selectedTab === "infrastructure" ? infraItems : whyItems).map((item) => (
          <div className="card" key={item.id}>
            {item.image_url && <img src={item.image_url} alt={item.title} />}
            <div className="card-body">
              <h4>{item.title}</h4>
              <p>{item.desc}</p>
              {item.icon && <span>{item.icon}</span>}
              {item.link && <a href={item.link}>{item.link}</a>}
              <div className="actions">
                <button onClick={() => handleEdit(item)}>Edit</button>
                <button onClick={() => handleDelete(item.id)}>Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
