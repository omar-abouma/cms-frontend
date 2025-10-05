import React, { useEffect, useState } from "react";
import axios from "axios";
import "./OrganizationStructure.css";

const API_BASE = "http://localhost:8000/api"; 

export default function OrganizationStructureCMS() {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [pdfFile, setPdfFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const getHeaders = () => {
    const token = localStorage.getItem("access_token");
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    };
  };

  // Ensure data is always an array
  const ensureArray = (data) => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (typeof data === "object") return Object.values(data);
    return [];
  };

  // Fetch uploaded files
  const fetchFiles = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/organization-structure-files/`, {
        headers: getHeaders(),
      });
      setUploadedFiles(ensureArray(res.data));
    } catch (err) {
      console.error("Error fetching files:", err);
      setUploadedFiles([]);
      setError("Failed to fetch files");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  // Upload new file
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!pdfFile) return;

    const formData = new FormData();
    formData.append("file", pdfFile);

    try {
      await axios.post(`${API_BASE}/organization-structure-files/`, formData, {
        headers: getHeaders(),
      });
      setPdfFile(null);
      e.target.reset();
      fetchFiles();
    } catch (err) {
      console.error("Upload failed:", err);
      setError("Failed to upload file");
    }
  };

  // Delete file
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this file?")) return;
    try {
      const token = localStorage.getItem("access_token");
      await axios.delete(`${API_BASE}/organization-structure-files/${id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchFiles();
    } catch (err) {
      console.error("Delete failed:", err);
      setError("Failed to delete file");
    }
  };

  return (
    <div className="cms-org-structure">
      <h2>Manage Organization Structure Files</h2>

      {error && (
        <div className="error-message">
          {error} 
          <button onClick={() => setError("")}>×</button>
        </div>
      )}

      {/* Upload form */}
      <form onSubmit={handleUpload} className="upload-form">
        <input
          type="file"
          accept=".pdf,image/*"
          onChange={(e) => setPdfFile(e.target.files[0])}
          required
        />
        <button type="submit" disabled={!pdfFile || loading}>
          {loading ? "Uploading..." : "Upload File"}
        </button>
      </form>

      {/* Uploaded files list */}
      <div className="files-list">
        <h3>Uploaded Files</h3>
        {loading ? (
          <div>Loading files...</div>
        ) : (
          <ul>
            {ensureArray(uploadedFiles).length > 0 ? (
              ensureArray(uploadedFiles).map((f) => {
                // Safety check for null or undefined
                if (!f || !f.file) return null;
                return (
                  <li key={f.id}>
                    <a href={f.file} target="_blank" rel="noreferrer">
                      {f.original_name || `File ${f.id}`}
                    </a>{" "}
                    ({f.file_type || "unknown"}, uploaded {f.uploaded_at ? new Date(f.uploaded_at).toLocaleString() : "unknown"})
                    <button onClick={() => handleDelete(f.id)}>Delete</button>
                  </li>
                );
              })
            ) : (
              <li>No files uploaded yet.</li>
            )}
          </ul>
        )}
      </div>
    </div>
  );
}
