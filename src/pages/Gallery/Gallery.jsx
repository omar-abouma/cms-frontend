import React, { useState, useEffect } from "react";
import axios from "axios";

const GalleryManager = () => {
  const [images, setImages] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Nature");
  const [file, setFile] = useState(null);

  useEffect(() => {
    axios.get("http://localhost:8000/api/gallery/")
      .then(res => setImages(res.data))
      .catch(err => console.error(err));
  }, []);

  const handleUpload = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("category", category);
    formData.append("image", file);

    axios.post("http://localhost:8000/api/gallery/", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then(res => setImages([...images, res.data]))
    .catch(err => console.error(err));
  };

  const handleDelete = (id) => {
    axios.delete(`http://localhost:8000/api/gallery/${id}/`)
      .then(() => setImages(images.filter(img => img.id !== id)))
      .catch(err => console.error(err));
  };

  return (
    <div>
      <h2>Manage Gallery</h2>

      <form onSubmit={handleUpload}>
        <input type="text" placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} />
        <textarea placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} />
        <select value={category} onChange={e => setCategory(e.target.value)}>
          <option>Nature</option>
          <option>Urban</option>
          <option>Abstract</option>
          <option>People</option>
        </select>
        <input type="file" onChange={e => setFile(e.target.files[0])} />
        <button type="submit">Upload</button>
      </form>

      <ul>
        {images.map(img => (
          <li key={img.id}>
            <img src={`http://localhost:8000${img.image}`} alt={img.title} width="100" />
            <p>{img.title} ({img.category})</p>
            <button onClick={() => handleDelete(img.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default GalleryManager;


