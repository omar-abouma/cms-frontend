import React, { useEffect, useState } from 'react';
import './Publications.css';

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";

function authHeaders() {
  const token = localStorage.getItem("access_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export default function PublicationManagement() {
  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    author: '',
    title: '',
    pub_type: 'Journal Article',
    date_published: '',
    abstract: '',
    file: null,
  });

  useEffect(() => {
    fetchPublications();
  }, []);

  function fetchPublications() {
    setLoading(true);
    fetch(`${API_BASE}/api/publications/`, {
      headers: {
        ...authHeaders(),
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch publications");
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setPublications(data);
        } else if (Array.isArray(data.results)) {
          setPublications(data.results);
        } else {
          setPublications([]);
        }
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        setPublications([]);
      })
      .finally(() => setLoading(false));
  }

  function handleChange(e) {
    const { name, value, files } = e.target;
    if (files) {
      setForm((prev) => ({ ...prev, [name]: files[0] }));
      return;
    }
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleEdit(pub) {
    setEditing(pub.id);
    setForm({
      author: pub.author || '',
      title: pub.title || '',
      pub_type: pub.pub_type || 'Journal Article',
      date_published: pub.date_published || '',
      abstract: pub.abstract || '',
      file: null,
    });
  }

  function handleCancel() {
    setEditing(null);
    setForm({
      author: '',
      title: '',
      pub_type: 'Journal Article',
      date_published: '',
      abstract: '',
      file: null,
    });
  }

  function handleSubmit(e) {
    e.preventDefault();
    const formData = new FormData();
    formData.append('author', form.author);
    formData.append('title', form.title);
    formData.append('pub_type', form.pub_type);
    formData.append('date_published', form.date_published);
    formData.append('abstract', form.abstract || '');
    if (form.file) formData.append('file', form.file);

    const method = editing ? 'PATCH' : 'POST';
    const url = editing
      ? `${API_BASE}/api/publications/${editing}/`
      : `${API_BASE}/api/publications/`;

    fetch(url, {
      method,
      headers: {
        ...authHeaders(),
      },
      body: formData,
    })
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(`Error: ${res.status} ${JSON.stringify(body)}`);
        }
        return res.json();
      })
      .then(() => {
        fetchPublications();
        handleCancel();
      })
      .catch((err) => {
        console.error('Submit error', err);
        alert('Error saving publication. See console for details.');
      });
  }

  function handleDelete(id) {
    if (!window.confirm('Are you sure you want to delete this publication?')) return;
    fetch(`${API_BASE}/api/publications/${id}/`, {
      method: 'DELETE',
      headers: {
        ...authHeaders(),
      },
    })
      .then((res) => {
        if (res.status === 204) fetchPublications();
        else throw new Error('Delete failed');
      })
      .catch((err) => {
        console.error(err);
        alert('Failed to delete publication');
      });
  }

  function getTypeClass(pubType) {
    const typeMap = {
      'Journal Article': 'journal',
      'Conference Paper': 'conference',
      'Book Chapter': 'book',
      'Report': 'report',
      'Other': 'other'
    };
    return typeMap[pubType] || 'other';
  }

  return (
    <div className="publication-management">
      <h2>Publication Management</h2>

      {/* FORM SECTION - TOP */}
      <div className="form-section">
        <h3>{editing ? 'Edit Publication' : 'Create New Publication'}</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label>Author</label>
              <input
                name="author"
                value={form.author}
                onChange={handleChange}
                required
                placeholder="Enter author name"
              />
            </div>

            <div className="form-group">
              <label>Title</label>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                required
                placeholder="Enter publication title"
              />
            </div>

            <div className="form-group">
              <label>Type</label>
              <select
                name="pub_type"
                value={form.pub_type}
                onChange={handleChange}
              >
                <option value="Journal Article">Journal Article</option>
                <option value="Conference Paper">Conference Paper</option>
                <option value="Book Chapter">Book Chapter</option>
                <option value="Report">Report</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label>Date Published</label>
              <input
                type="date"
                name="date_published"
                value={form.date_published}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group full-width">
              <label>Abstract</label>
              <textarea
                name="abstract"
                value={form.abstract}
                onChange={handleChange}
                placeholder="Enter publication abstract"
                rows="4"
              />
            </div>

            <div className="form-group full-width">
              <label>File Upload</label>
              <div className="file-input-group">
                <input
                  type="file"
                  name="file"
                  accept=".pdf,.doc,.docx,.pptx"
                  onChange={handleChange}
                />
                <small>Supported formats: PDF, DOC, DOCX, PPTX</small>
              </div>
            </div>
          </div>

          <div className="form-buttons">
            <button type="submit" className="submit-btn">
              {editing ? 'Update Publication' : 'Create Publication'}
            </button>
            {editing && (
              <button type="button" className="cancel-btn" onClick={handleCancel}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* LIST SECTION - BOTTOM */}
      <div className="list-section">
        <h3>Existing Publications</h3>
        
        {loading ? (
          <div className="loading-state">
            <p>Loading publications...</p>
          </div>
        ) : publications.length === 0 ? (
          <div className="empty-state">
            <p>No publications found. Create your first publication above.</p>
          </div>
        ) : (
          <table className="publications-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Author</th>
                <th>Title</th>
                <th>Type</th>
                <th>Date Published</th>
                <th>File</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {publications.map((pub) => (
                <tr key={pub.id}>
                  <td>{pub.id}</td>
                  <td>{pub.author}</td>
                  <td>{pub.title}</td>
                  <td>
                    <span className={`pub-type-badge type-${getTypeClass(pub.pub_type)}`}>
                      {pub.pub_type}
                    </span>
                  </td>
                  <td>{pub.date_published}</td>
                  <td>
                    {pub.file_url ? (
                      <a 
                        href={pub.file_url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="file-link"
                      >
                        📎 View File
                      </a>
                    ) : (
                      <span style={{color: '#95a5a6'}}>—</span>
                    )}
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="edit-btn"
                        onClick={() => handleEdit(pub)}
                      >
                        Edit
                      </button>
                      <button 
                        className="delete-btn"
                        onClick={() => handleDelete(pub.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}