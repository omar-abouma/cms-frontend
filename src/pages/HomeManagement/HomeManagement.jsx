// src/pages/HomeManagement/HomeManagement.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import "./HomeManagement.css"; // optional: use your existing CSS or the CSS from earlier answers

const API_BASE = "http://localhost:8000/api";

const getAuthHeaders = () => {
  const token = localStorage.getItem("access_token") || localStorage.getItem("authToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export default function HomeManagement() {
  // ------------------ Global state ------------------
  const [activeComponent, setActiveComponent] = useState("slides");

  // Data lists
  const [slides, setSlides] = useState([]);
  const [vcMessages, setVcMessages] = useState([]);
  const [services, setServices] = useState([]);
  const [marineSections, setMarineSections] = useState([]);
  const [events, setEvents] = useState([]);
  const [impactOverview, setImpactOverview] = useState([]);

  const [loading, setLoading] = useState(false);

  // ------------------ Forms ------------------
  const [slideForm, setSlideForm] = useState({
    id: null,
    text: "",
    image: null, // File or string (existing)
    order_index: 0,
    is_active: true,
  });

  const [vcForm, setVcForm] = useState({
    id: null,
    name: "",
    title: "",
    image: null,
    video: null,
    message_text: "",
  });

  const [serviceForm, setServiceForm] = useState({ id: null, title: "", description: "", image: null });
  const [marineForm, setMarineForm] = useState({ id: null, title: "", description: "", image: null });
  const [eventForm, setEventForm] = useState({ id: null, title: "", subtitle: "", date: "", image: null, badge: "ZAFIRI" });
  const [impactForm, setImpactForm] = useState({ id: null, impact_type: "visitors", title: "", description: "", icon: null, target: 0 });

  // ------------------ Helpers ------------------
  const getFileUrl = (fileField) => {
    if (!fileField) return null;

    // If it's a File object (new upload)
    if (fileField instanceof File) {
      return URL.createObjectURL(fileField);
    }

    // If it's an object with url property (sometimes backends return nested object)
    if (typeof fileField === "object" && fileField.url) {
      return fileField.url.startsWith("http") ? fileField.url : `${API_BASE.replace("/api","")}${fileField.url}`;
    }

    // If it's a string (existing file path from server)
    if (typeof fileField === "string") {
      // if it's already full URL
      if (fileField.startsWith("http://") || fileField.startsWith("https://")) return fileField;
      // else prepend host (adjust if your backend returns path including host)
      const base = API_BASE.replace("/api", ""); // e.g. http://localhost:8000
      return `${base}${fileField.startsWith("/") ? "" : "/"}${fileField}`;
    }

    return null;
  };

  const isVideoFile = (urlOrName) => {
    if (!urlOrName) return false;
    return /\.(mp4|webm|ogg|mov|mkv)$/i.test(urlOrName.split("?")[0]);
  };

  // ------------------ Fetching ------------------
  const fetchData = async () => {
    setLoading(true);
    try {
      const [
        slidesRes,
        vcRes,
        servicesRes,
        marineRes,
        eventsRes,
        impactRes,
      ] = await Promise.all([
        axios.get(`${API_BASE}/home-slides/`, { headers: getAuthHeaders() }),
        axios.get(`${API_BASE}/home-vc-message/`, { headers: getAuthHeaders() }),
        axios.get(`${API_BASE}/home-services/`, { headers: getAuthHeaders() }),
        axios.get(`${API_BASE}/home-marine/`, { headers: getAuthHeaders() }),
        axios.get(`${API_BASE}/home-events/`, { headers: getAuthHeaders() }),
        axios.get(`${API_BASE}/home-impact/`, { headers: getAuthHeaders() }),
      ]);

      setSlides(slidesRes.data || []);
      setVcMessages(vcRes.data || []);
      setServices(servicesRes.data || []);
      setMarineSections(marineRes.data || []);
      setEvents(eventsRes.data || []);
      setImpactOverview(impactRes.data || []);
    } catch (error) {
      console.error("Fetch Error:", error);
      // optionally show toast
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, []);

  // ------------------ Generic Save Handler ------------------
  const handleSave = async (endpoint, formState, resetFn) => {
    try {
      const formData = new FormData();

      // Append fields from formState
      for (let key in formState) {
        const value = formState[key];
        if (value === null || value === undefined) continue;

        // Files: File instances (for image/video/icon)
        if (value instanceof File) {
          formData.append(key, value);
          continue;
        }

        // Booleans: send as strings (Django expects 'true'/'false' or boolean)
        if (typeof value === "boolean") {
          formData.append(key, value ? "true" : "false");
          continue;
        }

        // Numbers and strings
        if (typeof value === "number" || typeof value === "string") {
          formData.append(key, value);
          continue;
        }

        // Objects (e.g., nested) - skip by default or stringify if needed
      }

      const url = formState.id
        ? `${API_BASE}/${endpoint}/${formState.id}/`
        : `${API_BASE}/${endpoint}/`;

      if (formState.id) {
        // try PUT then PATCH fallback if needed
        try {
          await axios.put(url, formData, {
            headers: { ...getAuthHeaders(), "Content-Type": "multipart/form-data" },
          });
        } catch (putErr) {
          await axios.patch(url, formData, {
            headers: { ...getAuthHeaders(), "Content-Type": "multipart/form-data" },
          });
        }
      } else {
        await axios.post(url, formData, {
          headers: { ...getAuthHeaders(), "Content-Type": "multipart/form-data" },
        });
      }

      // success
      if (typeof resetFn === "function") resetFn();
      fetchData();
      alert("Saved successfully!");
    } catch (error) {
      console.error("Save Error:", error.response ?? error);
      alert("Error saving. See console for details.");
    }
  };

  // ------------------ Delete ------------------
  const handleDelete = async (endpoint, id) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    try {
      await axios.delete(`${API_BASE}/${endpoint}/${id}/`, { headers: getAuthHeaders() });
      fetchData();
      alert("Deleted successfully!");
    } catch (error) {
      console.error("Delete Error:", error);
      alert("Failed to delete item.");
    }
  };

  // ------------------ Edit setters ------------------
  const handleEdit = (formSetter, item) => {
    // copy item into the form; keep file fields as strings (existing) so preview works
    formSetter({
      ...item,
    });
    // scroll to top of form (optional)
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ------------------ Slide-specific helpers ------------------
  const resetSlideForm = () =>
    setSlideForm({ id: null, text: "", image: null, order_index: 0, is_active: true });

  const handleSlideSave = async (e) => {
    e && e.preventDefault && e.preventDefault();
    await handleSave("home-slides", slideForm, resetSlideForm);
  };

  const toggleSlideActive = async (s) => {
    try {
      await axios.patch(
        `${API_BASE}/home-slides/${s.id}/`,
        { is_active: !s.is_active },
        { headers: getAuthHeaders() }
      );
      fetchData();
    } catch (error) {
      console.error("Toggle active error:", error);
      alert("Failed to toggle active state");
    }
  };

  // ------------------ Form input change helper ------------------
  const handleFormChange = (setter) => (e) => {
    const { name, value, files, type, checked } = e.target;
    setter((prev) => ({
      ...prev,
      [name]: files ? files[0] : type === "checkbox" ? checked : value,
    }));
  };

  // ------------------ Render slides list item (image/video + created_at) ------------------
  const renderSlideMedia = (s) => {
    const url = s.image ? getFileUrl(s.image) : null;
    if (!url) return <div className="no-media">— no media —</div>;

    if (isVideoFile(url)) {
      return (
        <video controls width="220" style={{ borderRadius: 8 }}>
          <source src={url} />
          Your browser does not support the video tag.
        </video>
      );
    }

    return <img src={url} alt={s.text || "slide"} width="220" style={{ borderRadius: 8, objectFit: "cover" }} />;
  };

  // ------------------ Main render for each component ------------------
  const renderActiveComponent = () => {
    switch (activeComponent) {
      case "slides":
        return (
          <div className="component-section">
            <div className="component-header">
              <h2>🖼 Slides Management</h2>
            </div>

            <div className="component-content">
              <form className="management-form" onSubmit={handleSlideSave}>
                <div className="form-row">
                  <label>Slide Text / Caption</label>
                  <input
                    type="text"
                    name="text"
                    value={slideForm.text}
                    onChange={(e) => setSlideForm((p) => ({ ...p, text: e.target.value }))}
                    placeholder="Caption / text"
                  />
                </div>

                <div className="form-row">
                  <label>Order Index</label>
                  <input
                    type="number"
                    name="order_index"
                    value={slideForm.order_index}
                    onChange={(e) => setSlideForm((p) => ({ ...p, order_index: Number(e.target.value) }))}
                  />
                </div>

                <div className="form-row">
                  <label>Image or Video (choose file to replace)</label>
                  <input
                    type="file"
                    name="image"
                    accept="image/*,video/*"
                    onChange={(e) => setSlideForm((p) => ({ ...p, image: e.target.files[0] }))}
                  />

                  {/* Preview of selected/new or existing */}
                  {(slideForm.image instanceof File || (slideForm.image && typeof slideForm.image === "string")) && (
                    <div className="file-preview">
                      {slideForm.image ? (
                        isVideoFile(slideForm.image.name || slideForm.image)
                          ? <video controls width="300" src={getFileUrl(slideForm.image)} />
                          : <img src={getFileUrl(slideForm.image)} alt="preview" width="300" />
                      ) : null}
                    </div>
                  )}
                </div>

                <div className="form-row checkbox-row">
                  <label>
                    <input
                      type="checkbox"
                      name="is_active"
                      checked={Boolean(slideForm.is_active)}
                      onChange={(e) => setSlideForm((p) => ({ ...p, is_active: e.target.checked }))}
                    />{" "}
                    Active Slide
                  </label>
                </div>

                <div className="form-actions">
                  <button type="submit">{slideForm.id ? "Update Slide" : "Add Slide"}</button>
                  {slideForm.id && (
                    <button
                      type="button"
                      className="cancel-btn"
                      onClick={() => {
                        resetSlideForm();
                      }}
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>
              </form>

              <hr />

              <div className="items-list">
                {loading ? <p>Loading slides...</p> : slides.length === 0 ? <p>No slides yet.</p> : null}

                {slides.map((s) => (
                  <div key={s.id} className="item-card">
                    <div className="media-col">{renderSlideMedia(s)}</div>

                    <div className="meta-col">
                      <h4 style={{ margin: "0 0 6px 0" }}>{s.text || <em>No caption</em>}</h4>
                      <div>Order: <strong>{s.order_index}</strong></div>
                      <div>
                        Created:{" "}
                        <strong>
                          {s.created_at ? new Date(s.created_at).toLocaleString() : "—"}
                        </strong>
                      </div>
                      <div>
                        Status:{" "}
                        <span className={`status ${s.is_active ? "active" : "inactive"}`}>
                          {s.is_active ? "🟢 Active" : "🔴 Inactive"}
                        </span>
                      </div>
                    </div>

                    <div className="actions-col">
                      <button onClick={() => { handleEdit(setSlideForm, s); }}>
                        Edit
                      </button>
                      <button onClick={() => handleDelete("home-slides", s.id)}>
                        Delete
                      </button>
                      <button onClick={() => toggleSlideActive(s)}>
                        {s.is_active ? "Deactivate" : "Activate"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case "vc-messages":
        return (
          <div className="component-section">
            <div className="component-header"><h2>👨‍💼 DG Messages Management</h2></div>
            <div className="component-content">
              <form className="management-form" onSubmit={(e) => { e.preventDefault(); handleSave("home-vc-message", vcForm, () => setVcForm({ id: null, name: "", title: "", image: null, video: null, message_text: "" })); }}>
                <input type="text" name="name" placeholder="DG Name" value={vcForm.name} onChange={(e) => setVcForm((p) => ({ ...p, name: e.target.value }))} required />
                <input type="text" name="title" placeholder="DG Title" value={vcForm.title} onChange={(e) => setVcForm((p) => ({ ...p, title: e.target.value }))} required />

                <div className="file-input-row">
                  <div>
                    <input type="file" name="image" accept="image/*" onChange={(e) => setVcForm((p) => ({ ...p, image: e.target.files[0] }))} />
                    <div className="file-input-info">Photo</div>
                    {(vcForm.image || vcForm.id) && (
                      <div className="preview-small">
                        <img src={getFileUrl(vcForm.image || vcForm.image)} width="120" alt="vc" />
                      </div>
                    )}
                  </div>

                  <div>
                    <input type="file" name="video" accept="video/*" onChange={(e) => setVcForm((p) => ({ ...p, video: e.target.files[0] }))} />
                    <div className="file-input-info">Optional Video</div>
                    {(vcForm.video || vcForm.video) && (
                      <div className="preview-small">
                        <video controls width="160" src={getFileUrl(vcForm.video)} />
                      </div>
                    )}
                  </div>
                </div>

                <textarea name="message_text" placeholder="Message" value={vcForm.message_text} onChange={(e) => setVcForm((p) => ({ ...p, message_text: e.target.value }))} rows="4" />

                <div className="form-actions">
                  <button type="button" onClick={() => handleSave("home-vc-message", vcForm, () => setVcForm({ id: null, name: "", title: "", image: null, video: null, message_text: "" }))}>
                    {vcForm.id ? "Update DG Message" : "Add DG Message"}
                  </button>
                </div>
              </form>

              <ul className="items-list">
                {vcMessages.map((vc) => (
                  <li key={vc.id} className="item-card">
                    <img src={vc.image ? getFileUrl(vc.image) : ""} width="120" alt={vc.name} style={{ objectFit: "cover", borderRadius: 8 }} />
                    <div className="item-content">
                      <strong>{vc.name}</strong>
                      <div>{vc.title}</div>
                      <div>{vc.message_text?.substring(0, 120)}...</div>
                    </div>
                    <div className="button-group">
                      <button onClick={() => handleEdit(setVcForm, vc)}>Edit</button>
                      <button onClick={() => handleDelete("home-vc-message", vc.id)}>Delete</button>
                      {vc.video && <button onClick={() => window.open(getFileUrl(vc.video), "_blank")}>View Video</button>}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        );

      case "services":
        return (
          <div className="component-section">
            <div className="component-header"><h2>🔧 Services Management</h2></div>
            <div className="component-content">
              <form className="management-form" onSubmit={(e) => { e.preventDefault(); handleSave("home-services", serviceForm, () => setServiceForm({ id: null, title: "", description: "", image: null })); }}>
                <input type="text" name="title" placeholder="Service Title" value={serviceForm.title} onChange={(e) => setServiceForm((p) => ({ ...p, title: e.target.value }))} required />
                <textarea name="description" placeholder="Service Description" value={serviceForm.description} onChange={(e) => setServiceForm((p) => ({ ...p, description: e.target.value }))} required />
                <input type="file" name="image" accept="image/*" onChange={(e) => setServiceForm((p) => ({ ...p, image: e.target.files[0] }))} />
                <div className="form-actions"><button type="button" onClick={() => handleSave("home-services", serviceForm, () => setServiceForm({ id: null, title: "", description: "", image: null }))}>{serviceForm.id ? "Update Service" : "Add Service"}</button></div>
              </form>

              <ul className="items-list">
                {services.map((s) => (
                  <li key={s.id} className="item-card">
                    <img src={s.image ? getFileUrl(s.image) : ""} width="100" height="80" alt={s.title} style={{ objectFit: "cover" }} />
                    <div className="item-content">
                      <strong>{s.title}</strong>
                      <div>{s.description?.substring(0, 120)}...</div>
                    </div>
                    <div className="button-group">
                      <button onClick={() => handleEdit(setServiceForm, s)}>Edit</button>
                      <button onClick={() => handleDelete("home-services", s.id)}>Delete</button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        );

      case "marine":
        return (
          <div className="component-section">
            <div className="component-header"><h2>🐠 Marine Sections</h2></div>
            <div className="component-content">
              <form className="management-form" onSubmit={(e) => { e.preventDefault(); handleSave("home-marine", marineForm, () => setMarineForm({ id: null, title: "", description: "", image: null })); }}>
                <input type="text" name="title" placeholder="Title" value={marineForm.title} onChange={(e) => setMarineForm((p) => ({ ...p, title: e.target.value }))} required />
                <textarea name="description" placeholder="Description" value={marineForm.description} onChange={(e) => setMarineForm((p) => ({ ...p, description: e.target.value }))} required />
                <input type="file" name="image" accept="image/*" onChange={(e) => setMarineForm((p) => ({ ...p, image: e.target.files[0] }))} />
                <div className="form-actions"><button type="button" onClick={() => handleSave("home-marine", marineForm, () => setMarineForm({ id: null, title: "", description: "", image: null }))}>{marineForm.id ? "Update" : "Add"}</button></div>
              </form>

              <ul className="items-list">
                {marineSections.map((m) => (
                  <li key={m.id} className="item-card">
                    <img src={m.image ? getFileUrl(m.image) : ""} width="100" height="80" alt={m.title} style={{ objectFit: "cover" }} />
                    <div className="item-content"><strong>{m.title}</strong><div>{m.description?.substring(0,120)}...</div></div>
                    <div className="button-group"><button onClick={() => handleEdit(setMarineForm, m)}>Edit</button><button onClick={() => handleDelete("home-marine", m.id)}>Delete</button></div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        );

      case "events":
        return (
          <div className="component-section">
            <div className="component-header"><h2>📅 Events</h2></div>
            <div className="component-content">
              <form className="management-form" onSubmit={(e) => { e.preventDefault(); handleSave("home-events", eventForm, () => setEventForm({ id: null, title: "", subtitle: "", date: "", image: null, badge: "ZAFIRI" })); }}>
                <input type="text" name="title" placeholder="Event Title" value={eventForm.title} onChange={(e) => setEventForm((p) => ({ ...p, title: e.target.value }))} required />
                <textarea name="subtitle" placeholder="Subtitle" value={eventForm.subtitle} onChange={(e) => setEventForm((p) => ({ ...p, subtitle: e.target.value }))} required />
                <input type="date" name="date" value={eventForm.date} onChange={(e) => setEventForm((p) => ({ ...p, date: e.target.value }))} required />
                <input type="file" name="image" accept="image/*" onChange={(e) => setEventForm((p) => ({ ...p, image: e.target.files[0] }))} />
                <div className="form-actions"><button type="button" onClick={() => handleSave("home-events", eventForm, () => setEventForm({ id: null, title: "", subtitle: "", date: "", image: null, badge: "ZAFIRI" }))}>{eventForm.id ? "Update Event" : "Add Event"}</button></div>
              </form>

              <ul className="items-list">
                {events.map((ev) => (
                  <li key={ev.id} className="item-card">
                    <img src={ev.image ? getFileUrl(ev.image) : ""} width="100" height="80" alt={ev.title} style={{ objectFit: "cover" }} />
                    <div className="item-content"><strong>{ev.title}</strong><div>{ev.date}</div></div>
                    <div className="button-group"><button onClick={() => handleEdit(setEventForm, ev)}>Edit</button><button onClick={() => handleDelete("home-events", ev.id)}>Delete</button></div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        );

      case "impact":
        return (
          <div className="component-section">
            <div className="component-header"><h2>📊 Impact Overview</h2></div>
            <div className="component-content">
              <form className="management-form" onSubmit={(e) => { e.preventDefault(); handleSave("home-impact", impactForm, () => setImpactForm({ id: null, impact_type: "visitors", title: "", description: "", icon: null, target: 0 })); }}>
                <select name="impact_type" value={impactForm.impact_type} onChange={(e) => setImpactForm((p) => ({ ...p, impact_type: e.target.value }))}>
                  <option value="visitors">Visitors</option>
                  <option value="publications">Publications</option>
                  <option value="projects">Projects</option>
                  <option value="events">Events</option>
                </select>
                <input type="text" name="title" placeholder="Title" value={impactForm.title} onChange={(e) => setImpactForm((p) => ({ ...p, title: e.target.value }))} required />
                <textarea name="description" placeholder="Description" value={impactForm.description} onChange={(e) => setImpactForm((p) => ({ ...p, description: e.target.value }))} required />
                <input type="number" name="target" placeholder="Target" value={impactForm.target} onChange={(e) => setImpactForm((p) => ({ ...p, target: Number(e.target.value) }))} required />
                <input type="file" name="icon" accept="image/*" onChange={(e) => setImpactForm((p) => ({ ...p, icon: e.target.files[0] }))} />
                <div className="form-actions"><button type="button" onClick={() => handleSave("home-impact", impactForm, () => setImpactForm({ id: null, impact_type: "visitors", title: "", description: "", icon: null, target: 0 }))}>{impactForm.id ? "Update Impact" : "Add Impact"}</button></div>
              </form>

              <ul className="items-list">
                {impactOverview.map((i) => (
                  <li key={i.id} className="item-card">
                    <img src={i.icon ? getFileUrl(i.icon) : ""} width="50" height="50" alt={i.title} />
                    <div className="item-content"><strong>{i.title}</strong><div>Type: {i.impact_type} • Target: {i.target}</div></div>
                    <div className="button-group"><button onClick={() => handleEdit(setImpactForm, i)}>Edit</button><button onClick={() => handleDelete("home-impact", i.id)}>Delete</button></div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        );

      default:
        return <div>Select a component</div>;
    }
  };

  // ------------------ Main render ------------------
  return (
    <div className="home-management">
      <nav className="management-nav">
        <h1>Home Page Management</h1>
        <div className="components-bar">
          <button className={activeComponent === "slides" ? "active" : ""} onClick={() => setActiveComponent("slides")}>Slides</button>
          <button className={activeComponent === "vc-messages" ? "active" : ""} onClick={() => setActiveComponent("vc-messages")}>DG Messages</button>
          <button className={activeComponent === "services" ? "active" : ""} onClick={() => setActiveComponent("services")}>Services</button>
          <button className={activeComponent === "marine" ? "active" : ""} onClick={() => setActiveComponent("marine")}>Marine</button>
          <button className={activeComponent === "events" ? "active" : ""} onClick={() => setActiveComponent("events")}>Events</button>
          <button className={activeComponent === "impact" ? "active" : ""} onClick={() => setActiveComponent("impact")}>Impact</button>
        </div>
      </nav>

      <main className="management-main">
        {renderActiveComponent()}
      </main>

      {/* Minimal styles injection if you don't have CSS file.
          You can remove this <style> block if using external CSS. */}
      <style>{`
        .management-nav { padding: 12px 20px; background:#f5f5f7; display:flex; align-items:center; justify-content:space-between; gap:12px; flex-wrap:wrap; }
        .components-bar button { margin-right:8px; padding:8px 12px; border-radius:8px; border:0; background:#e0e0e0; cursor:pointer; }
        .components-bar button.active { background:#007bff; color:#fff; }
        .management-main { padding:20px; }
        .component-section { margin-bottom:32px; }
        .management-form { display:flex; flex-direction:column; gap:10px; max-width:760px; margin-bottom:12px; }
        .management-form input[type="text"], .management-form input[type="number"], .management-form textarea, .management-form select { padding:8px; border-radius:6px; border:1px solid #ccc; width:100%; box-sizing:border-box; }
        .file-input-row { display:flex; gap:16px; align-items:flex-start; }
        .file-input-info { font-size:12px; color:#666; margin-top:6px; }
        .form-actions { display:flex; gap:8px; margin-top:6px; }
        .form-actions button { padding:8px 12px; border-radius:8px; border:0; cursor:pointer; background:#28a745; color:#fff; }
        .cancel-btn { background:#6c757d; }
        .items-list { display:flex; flex-direction:column; gap:14px; margin-top:16px; }
        .item-card { display:flex; gap:12px; align-items:flex-start; background:#fff; padding:12px; border-radius:10px; box-shadow:0 2px 6px rgba(0,0,0,0.06); }
        .media-col { flex:0 0 240px; }
        .meta-col { flex:1; }
        .actions-col { display:flex; flex-direction:column; gap:8px; }
        .actions-col button { padding:8px 10px; border-radius:6px; border:0; cursor:pointer; background:#007bff; color:#fff; }
        .actions-col button:nth-child(2) { background:#dc3545; }
        .actions-col button:nth-child(3) { background:#ffc107; color:#000; }
        .status.active { color:green; font-weight:600; }
        .status.inactive { color:red; font-weight:600; }
        .no-media { color:#888; font-style:italic; padding:12px; border-radius:6px; background:#fafafa; }
        .preview-small img, .preview-small video { border-radius:8px; display:block; margin-top:8px; }
      `}</style>
    </div>
  );
}
