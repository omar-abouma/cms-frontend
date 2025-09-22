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
    status: "draft", // match backend
    short_text: "",
    full_text: "",
    image: null,
  });
  const [previewUrl, setPreviewUrl] = useState(null);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  // Fetch all news
  const fetchNews = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/news/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setNewsList(data.results || data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchNews(); }, []);

  // Create or Update news
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const fd = new FormData();
      Object.entries(formData).forEach(([k,v]) => { if(v) fd.append(k,v); });

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

      resetForm();
      fetchNews();
    } catch (err) {
      setError(err.message);
    }
  };

  // Edit news
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
  };

  // Delete news
  const handleDelete = async (id) => {
    if(!window.confirm("Delete this news?")) return;
    try {
      const res = await fetch(`${API_BASE}/api/news/${id}/`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if(!res.ok) throw new Error("Failed to delete");
      setNewsList(prev => prev.filter(n => n.id !== id));
    } catch(err) { setError(err.message); }
  };

  // Reset form
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
  };

  return (
    <div className="news-management p-6">
      <h2>{editingId ? "Edit News" : "Create News"}</h2>
      <form onSubmit={handleSubmit} encType="multipart/form-data" className="form">
        <input 
          type="text" 
          placeholder="Title" 
          value={formData.title} 
          onChange={(e)=>setFormData({...formData,title:e.target.value})} 
          required
        />
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
        <textarea 
          placeholder="Short Text" 
          value={formData.short_text} 
          onChange={(e)=>setFormData({...formData,short_text:e.target.value})}
        />
        <textarea 
          placeholder="Full Text" 
          value={formData.full_text} 
          onChange={(e)=>setFormData({...formData,full_text:e.target.value})}
        />
        <input 
          ref={fileInputRef} 
          type="file" 
          accept="image/*" 
          onChange={(e)=>{
            const file=e.target.files[0]; 
            setFormData({...formData,image:file}); 
            setPreviewUrl(file?URL.createObjectURL(file):null);
          }}
        />
        {previewUrl && <img src={previewUrl} alt="preview" width="100" className="my-2"/>}

        <button type="submit">{editingId?"Update":"Create"}</button>
        {editingId && <button onClick={(e)=>{e.preventDefault(); resetForm();}}>Cancel</button>}
        {error && <p className="text-red-600">{error}</p>}
      </form>

      <h3 className="mt-6">All News</h3>
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
              <td>{news.image ? <img src={news.image_url || `${API_BASE}${news.image}`} width="60"/> : "No image"}</td>
              <td>{news.title}</td>
              <td>{news.status}</td>
              <td>{news.date}</td>
              <td>
                <button onClick={()=>handleEdit(news)}>✏ Edit</button>
                <button onClick={()=>handleDelete(news.id)}>🗑 Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
