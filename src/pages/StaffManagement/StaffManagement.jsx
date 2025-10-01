import React, { useEffect, useState } from "react";
import axios from "axios";
import "./StaffManagement.css";

const StaffManagement = () => {
  const [staffList, setStaffList] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    position: "",
    gender: "Male",
    bio: "",
    image: null,
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [editingStaff, setEditingStaff] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_URL = "http://127.0.0.1:8000/api/staff/";

  // Fetch staff
  const fetchStaff = async () => {
    try {
      const res = await axios.get(API_URL);
      const staff = res.data.results ? res.data.results : res.data;
      console.log("Staff data:", staff); // Debug: angalia data
      setStaffList(staff);
    } catch (err) {
      console.error("Error fetching staff:", err);
      setStaffList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchStaff(); 
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    
    if (name === "image" && files && files[0]) {
      const file = files[0];
      setFormData({ ...formData, image: file });
      
      // Create image preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append("name", formData.name);
    data.append("position", formData.position);
    data.append("gender", formData.gender);
    data.append("bio", formData.bio);
    if (formData.image) data.append("image", formData.image);

    try {
      if (editingStaff) {
        await axios.put(`${API_URL}${editingStaff.id}/`, data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await axios.post(API_URL, data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
      fetchStaff();
      resetForm();
      alert(editingStaff ? "Staff updated successfully!" : "Staff added successfully!");
    } catch (err) {
      console.error("Error saving staff:", err);
      alert("Failed to save staff. Check console.");
    }
  };

  const handleEdit = (staff) => {
    setEditingStaff(staff);
    setFormData({
      name: staff.name,
      position: staff.position,
      gender: staff.gender,
      bio: staff.bio,
      image: null,
    });
    // Set image preview for existing staff
    if (staff.image) {
      setImagePreview(`http://127.0.0.1:8000${staff.image}`);
    } else {
      setImagePreview(null);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this staff member?")) {
      try {
        await axios.delete(`${API_URL}${id}/`);
        fetchStaff();
        alert("Staff deleted successfully!");
      } catch (err) {
        console.error("Error deleting staff:", err);
        alert("Failed to delete staff.");
      }
    }
  };

  const resetForm = () => {
    setFormData({ name: "", position: "", gender: "Male", bio: "", image: null });
    setEditingStaff(null);
    setImagePreview(null);
  };

  // Function to handle image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    
    // Check if it's already a full URL
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    
    // Check if it starts with /media/
    if (imagePath.startsWith('/media/')) {
      return `http://127.0.0.1:8000${imagePath}`;
    }
    
    // Check if it starts with media/ (without slash)
    if (imagePath.startsWith('media/')) {
      return `http://127.0.0.1:8000/${imagePath}`;
    }
    
    // Default case
    return `http://127.0.0.1:8000/media/${imagePath}`;
  };

  if (loading) return <div className="loading">Loading staff data...</div>;

  return (
    <div className="staff-management">
      <h2>🏢 Staff Management System</h2>
      
      <form onSubmit={handleSubmit} className="staff-form">
        <input 
          type="text" 
          name="name" 
          placeholder="Full Name" 
          value={formData.name} 
          onChange={handleChange} 
          required 
        />
        <input 
          type="text" 
          name="position" 
          placeholder="Position/Role" 
          value={formData.position} 
          onChange={handleChange} 
          required 
        />
        <select name="gender" value={formData.gender} onChange={handleChange} required>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
        </select>
        <textarea 
          name="bio" 
          placeholder="Short Biography & Responsibilities..." 
          value={formData.bio} 
          onChange={handleChange} 
          required 
        />
        
        <div className="image-upload-section">
          <label><strong>📸 Staff Photo:</strong></label>
          <input 
            type="file" 
            name="image" 
            onChange={handleChange} 
            accept="image/*" 
          />
          <div className="image-preview">
            {imagePreview ? (
              <img src={imagePreview} alt="Staff Preview" />
            ) : (
              <div className="image-preview-placeholder">
                <i>👤</i>
                <div>Photo Preview</div>
                <small>Image will appear here</small>
              </div>
            )}
          </div>
        </div>
        
        <div className="form-actions">
          <button type="submit">
            {editingStaff ? "🔄 Update Staff" : "➕ Add Staff"}
          </button>
          {editingStaff && (
            <button type="button" onClick={resetForm}>
              ❌ Cancel Edit
            </button>
          )}
        </div>
      </form>

      <h3>📋 Staff Directory</h3>
      {staffList.length > 0 ? (
        <table className="staff-table">
          <thead>
            <tr>
              <th>Photo</th>
              <th>Name</th>
              <th>Position</th>
              <th>Gender</th>
              <th>Bio</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {staffList.map((staff) => {
              const imageUrl = getImageUrl(staff.image);
              console.log(`Staff: ${staff.name}, Image: ${staff.image}, URL: ${imageUrl}`); // Debug
              
              return (
                <tr key={staff.id}>
                  <td>
                    {imageUrl ? (
                      <img 
                        src={imageUrl} 
                        alt={staff.name} 
                        className="staff-image"
                        onError={(e) => {
                          console.error(`Failed to load image: ${imageUrl}`);
                          e.target.style.display = 'none';
                          // Show fallback
                          const fallback = document.getElementById(`fallback-${staff.id}`);
                          if (fallback) fallback.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div 
                      id={`fallback-${staff.id}`}
                      className="no-image" 
                      style={{ display: imageUrl ? 'none' : 'flex' }}
                    >
                      NO IMAGE
                    </div>
                  </td>
                  <td><strong>{staff.name}</strong></td>
                  <td>{staff.position}</td>
                  <td>{staff.gender}</td>
                  <td title={staff.bio}>{staff.bio?.substring(0, 60)}...</td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="edit-btn" 
                        onClick={() => handleEdit(staff)}
                      >
                        ✏️ Edit
                      </button>
                      <button 
                        className="delete-btn" 
                        onClick={() => handleDelete(staff.id)}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      ) : (
        <div className="no-staff">
          <h3>👥 No Staff Members Found</h3>
          <p>Start by adding your first staff member using the form above.</p>
        </div>
      )}
    </div>
  );
};

export default StaffManagement;