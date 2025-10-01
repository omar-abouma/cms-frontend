import React, { useState, useEffect, useRef } from "react";
import "./News.css";

const API_BASE = "http://localhost:8000";

export default function NewsManagement() {
  const token = localStorage.getItem("access_token");
  const [newsList, setNewsList] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    date: "",
    status: "draft",
    short_text: "",
    full_text: "",
    image: null,
  });
  const [previewUrl, setPreviewUrl] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/news/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setNewsList(data.results || data);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch news");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchNews(); 
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const fd = new FormData();
      Object.entries(formData).forEach(([k,v]) => { 
        if(v !== null && v !== undefined) fd.append(k, v); 
      });

      const url = editingId ? `${API_BASE}/api/news/${editingId}/` : `${API_BASE}/api/news/`;
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });

      if(!res.ok) {
        const data = await res.json();
        throw new Error(data.status ? data.status.join(", ") : "Failed to save news");
      }

      setSuccess(editingId ? "News updated successfully!" : "News created successfully!");
      resetForm();
      fetchNews();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (news) => {
    setEditingId(news.id);
    setFormData({
      title: news.title,
      date: news.date,
      status: news.status,
      short_text: news.short_text,
      full_text: news.full_text,
      image: null
    });
    setPreviewUrl(news.image ? news.image_url || `${API_BASE}${news.image}` : null);
    setError("");
    setSuccess("");
  };

  const handleDelete = async (id) => {
    if(!window.confirm("Are you sure you want to delete this news?")) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/news/${id}/`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if(!res.ok) throw new Error("Failed to delete");
      setNewsList(prev => prev.filter(n => n.id !== id));
      setSuccess("News deleted successfully!");
    } catch(err) { 
      setError(err.message); 
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      title: "",
      date: "",
      status: "draft",
      short_text: "",
      full_text: "",
      image: null,
    });
    setPreviewUrl(null);
    if(fileInputRef.current) fileInputRef.current.value = "";
    setError("");
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData({...formData, image: file});
    setPreviewUrl(file ? URL.createObjectURL(file) : null);
  };

  return (
    <div className={`news-management ${loading ? 'loading' : ''}`}>
      <h2>{editingId ? "Edit News" : "Create News"}</h2>
      
      <form onSubmit={handleSubmit} encType="multipart/form-data" className="news-form">
        <div className="form-row">
          <div className="form-full-width">
            <input 
              type="text" 
              placeholder="News Title" 
              value={formData.title} 
              onChange={(e)=>setFormData({...formData,title:e.target.value})} 
              required
            />
          </div>
        </div>

        <div className="form-row">
          <input 
            type="date" 
            value={formData.date} 
            onChange={(e)=>setFormData({...formData,date:e.target.value})} 
            required
          />
          <select 
            value={formData.status} 
            onChange={(e)=>setFormData({...formData,status:e.target.value})}
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>

        <div className="form-full-width">
          <textarea 
            placeholder="Short Description" 
            value={formData.short_text} 
            onChange={(e)=>setFormData({...formData,short_text:e.target.value})}
            className="short-text"
          />
        </div>

        <div className="form-full-width">
          <textarea 
            placeholder="Full Content" 
            value={formData.full_text} 
            onChange={(e)=>setFormData({...formData,full_text:e.target.value})}
            className="full-text"
          />
        </div>

        <div className="form-full-width">
          <div className="file-input-container">
            <label className="file-input-label">
              Choose Image
              <input 
                ref={fileInputRef}
                type="file" 
                className="file-input"
                accept="image/*" 
                onChange={handleFileChange}
              />
            </label>
            {formData.image && (
              <span className="file-name">{formData.image.name}</span>
            )}
          </div>

          {previewUrl && (
            <div className="image-preview">
              <img src={previewUrl} alt="preview" className="preview-image"/>
            </div>
          )}
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Processing..." : (editingId ? "Update News" : "Create News")}
          </button>
          {editingId && (
            <button type="button" onClick={resetForm} className="btn btn-secondary">
              Cancel
            </button>
          )}
        </div>
      </form>

      <h3>All News ({newsList.length})</h3>
      
      <table className="news-table">
        <thead>
          <tr>
            <th>Image</th>
            <th>Title</th>
            <th>Status</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {newsList.map(news=>(
            <tr key={news.id}>
              <td>
                {news.image ? (
                  <img 
                    src={news.image_url || `${API_BASE}${news.image}`} 
                    alt={news.title}
                    className="table-image"
                  />
                ) : (
                  <span className="no-image">No image</span>
                )}
              </td>
              <td>{news.title}</td>
              <td>
                <span className={`status-badge status-${news.status}`}>
                  {news.status}
                </span>
              </td>
              <td>{news.date}</td>
              <td>
                <div className="table-actions">
                  <button 
                    onClick={()=>handleEdit(news)}
                    className="btn btn-primary btn-small"
                    disabled={loading}
                  >
                    ✏ Edit
                  </button>
                  <button 
                    onClick={()=>handleDelete(news.id)}
                    className="btn btn-danger btn-small"
                    disabled={loading}
                  >
                    🗑 Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {newsList.length === 0 && !loading && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#7f8c8d' }}>
          No news articles found
        </div>
      )}
    </div>
  );
}