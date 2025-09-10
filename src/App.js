import React, { useState, useEffect, useRef } from "react";
import "./App.css";
import Card from "./components/Card";
import Form from "./components/Form";
import Preview from "./components/Preview";
import {
  getArticulos,
  createArticulo,
  deleteArticulo,
} from "./Services/ArticulosServices";

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentView, setCurrentView] = useState("feed");
  const [message, setMessage] = useState(null);

  // === DEMO (solo local, no backend) ===
  const [articlesDemo, setArticlesDemo] = useState([
    {
      id: "demo-1",
      title: "Bicicleta usada",
      description: "En buen estado, lista para rodar 🚴",
      image: "https://picsum.photos/300/200?random=1",
    },
    {
      id: "demo-2",
      title: "Chaqueta de cuero",
      description: "Casi nueva, talla M 🧥",
      image: "https://picsum.photos/300/200?random=2",
    },
  ]);

  // === BACKEND ===
  const [articlesBackend, setArticlesBackend] = useState([]);

  // === REFERENCIAS ===
  const sidebarRef = useRef(null);
  const menuBtnRef = useRef(null);

  // === MÁS ESTADOS ===
  const [toast, setToast] = useState(null);
  const [formData, setFormData] = useState({ title: "", description: "", image: "" });
  const [previewArticle, setPreviewArticle] = useState(null);

  // === CLICK FUERA DEL SIDEBAR ===
  useEffect(() => {
    function handleClickOutside(e) {
      if (
        sidebarOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(e.target) &&
        menuBtnRef.current &&
        !menuBtnRef.current.contains(e.target)
      ) {
        setSidebarOpen(false);
      }
    }
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [sidebarOpen]);

  // === CARGAR BACKEND ===
  useEffect(() => {
    getArticulos()
      .then((data) => setArticlesBackend(data))
      .catch((err) => console.error("Error cargando artículos:", err));
  }, []);

  // === FUNCIONES ===
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newArticle = { id: Date.now(), ...formData };
    setPreviewArticle(newArticle);
    setCurrentView("preview");
    setToast("Artículo guardado exitosamente ✅");
    setTimeout(() => setToast(null), 3000);
  };

  const handleConfirm = async () => {
    try {
      // Guardar en backend
      const created = await createArticulo(previewArticle);
      setArticlesBackend([created, ...articlesBackend]);
      setPreviewArticle(null);
      setFormData({ title: "", description: "", image: "" });
      setCurrentView("feed");
    } catch (error) {
      console.error("Error creando artículo:", error);
    }
  };

  const handleDeletePreview = () => {
    setPreviewArticle(null);
    setCurrentView("form");
  };

  const handleDeleteDirecto = async (id) => {
    if (window.confirm("¿Seguro quieres borrar este artículo?")) {
      if (String(id).startsWith("demo-")) {
        // Solo borra localmente
        setArticlesDemo((prev) => prev.filter((a) => a.id !== id));
      } else {
        // Borra en backend
        try {
          await deleteArticulo(id);
          setArticlesBackend((prev) => prev.filter((a) => a.id !== id));
        } catch (error) {
          console.error("Error eliminando artículo:", error);
        }
      }
      setMessage("El elemento ha sido borrado");
      setTimeout(() => setMessage(null), 3000);
    }
  };

  // Unimos demo + backend
  const allArticles = [...articlesDemo, ...articlesBackend];

  return (
    <div>
      {/* HEADER */}
      <div className="header">
        <div ref={menuBtnRef} className="menu-btn" onClick={toggleSidebar}>☰</div>
        <div className="brand">
          <img src="/logo.png" alt="logo" />
          <h1>Stanew</h1>
        </div>
      </div>

      {/* SIDEBAR */}
      <div ref={sidebarRef} className={`sidebar ${sidebarOpen ? "active" : ""}`}>
        <h3>Menú</h3>
        <ul>
          <li onClick={() => { setSidebarOpen(false); setCurrentView("feed"); }}>Inicio</li>
          <li>Solicitudes</li>
          <li>Perfil</li>
          <li onClick={() => setCurrentView("form")}>Publicar artículo</li>
          <li>Cerrar sesión</li>
        </ul>
      </div>

      {/* CONTENIDO PRINCIPAL */}
      <main style={{ marginTop: "8px" }}>
        {currentView === "feed" && (
          <>
            <h2 className="titulo">Artículos disponibles</h2>
            <div className="articles">
              {allArticles.length > 0 ? (
                allArticles.map((art) => (
                  <Card key={art.id} article={art} onDelete={handleDeleteDirecto} />
                ))
              ) : (
                <p>No hay artículos disponibles</p>
              )}
            </div>
          </>
        )}

        {currentView === "form" && (
          <Form formData={formData} onChange={handleChange} onSubmit={handleSubmit} />
        )}

        {currentView === "preview" && previewArticle && (
          <Preview
            article={previewArticle}
            onConfirm={handleConfirm}
            onDelete={handleDeletePreview}
          />
        )}
      </main>

      {/* TOAST */}
      {toast && <div className="toast">{toast}</div>}
      {message && <div className="alert success">{message}</div>}

      <footer>© 2025 Stanew - Exchange · Sale · Donation</footer>
    </div>
  );
}