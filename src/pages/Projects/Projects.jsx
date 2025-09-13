import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Projects.css";

const API = axios.create({
  baseURL: "http://127.0.0.1:8000/api/",
});

const PROJECT_FIELDS = [
  { name: "title", type: "text", placeholder: "Project Title", required: true },
  { name: "description", type: "textarea", placeholder: "Project Description" },
  { name: "team", type: "text", placeholder: "Team Members" },
  { name: "startDate", type: "date", placeholder: "Start Date" },
  { name: "endDate", type: "date", placeholder: "End Date" },
  { name: "status", type: "select", options: ["Planning", "In Progress", "Completed", "On Hold"] }
];

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [newProject, setNewProject] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const res = await API.get("projects/");
      setProjects(res.data);
      setError(null);
    } catch (err) {
      setError("Failed to fetch projects");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewProject({ ...newProject, [name]: value });
  };

  const resetForm = () => {
    setNewProject({});
    setIsEditing(false);
    setEditingId(null);
    setError(null);
    setSuccess(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (isEditing) {
        await API.put(`projects/${editingId}/`, newProject);
        setSuccess("Project updated successfully!");
      } else {
        await API.post("projects/", newProject);
        setSuccess("Project created successfully!");
      }
      resetForm();
      fetchProjects();
    } catch (err) {
      setError("Failed to save project");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (project) => {
    setNewProject(project);
    setIsEditing(true);
    setEditingId(project.id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this project?")) return;
    setIsLoading(true);
    try {
      await API.delete(`projects/${id}/`);
      setSuccess("Project deleted successfully!");
      fetchProjects();
    } catch {
      setError("Failed to delete project");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="projects-management">
      <h2>Projects Management</h2>
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <form className="project-form" onSubmit={handleSubmit}>
        {PROJECT_FIELDS.map((field) => (
          <div key={field.name} className="form-group">
            <label>{field.placeholder}</label>
            {field.type === "textarea" ? (
              <textarea
                name={field.name}
                value={newProject[field.name] || ""}
                onChange={handleChange}
                rows="3"
              />
            ) : field.type === "select" ? (
              <select
                name={field.name}
                value={newProject[field.name] || ""}
                onChange={handleChange}
              >
                <option value="">Select {field.placeholder}</option>
                {field.options.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            ) : (
              <input
                type={field.type}
                name={field.name}
                value={newProject[field.name] || ""}
                onChange={handleChange}
              />
            )}
          </div>
        ))}
        <div className="form-actions">
          <button type="submit" disabled={isLoading}>
            {isEditing ? "Update Project" : "Create Project"}
          </button>
          {isEditing && <button type="button" onClick={resetForm}>Cancel</button>}
        </div>
      </form>

      <div className="projects-list">
        <h3>Projects List</h3>
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Team</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project) => (
              <tr key={project.id}>
                <td>{project.title}</td>
                <td>{project.team}</td>
                <td>{project.status}</td>
                <td>
                  <button onClick={() => handleEdit(project)}>Edit</button>
                  <button onClick={() => handleDelete(project.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default Projects;
