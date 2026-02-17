import { useEffect, useMemo, useState } from "react";
import api from "../services/api";

import Prism from "prismjs";
import "prismjs/themes/prism-tomorrow.css";

import "prismjs/components/prism-javascript";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-java";
import "prismjs/components/prism-python";
import "prismjs/components/prism-c";
import "prismjs/components/prism-cpp";
import "prismjs/components/prism-css";
import "prismjs/components/prism-markup";

import { jwtDecode } from "jwt-decode";

function safeDecodeTokenEmail() {
  try {
    const token = localStorage.getItem("token");
    if (!token) return "User";
    const decoded = jwtDecode(token);
    return decoded.email || decoded.username || decoded.sub || "User";
  } catch {
    return "User";
  }
}

function CodeBlock({ code, language }) {
  const lang = (language || "javascript").toLowerCase();

  const prismLangMap = {
    js: "javascript",
    javascript: "javascript",
    jsx: "jsx",
    java: "java",
    py: "python",
    python: "python",
    c: "c",
    cpp: "cpp",
    "c++": "cpp",
    html: "markup",
    markup: "markup",
    css: "css",
  };

  const prismLang = prismLangMap[lang] || "javascript";
  const grammar = Prism.languages[prismLang] || Prism.languages.javascript;

  const highlighted = useMemo(() => {
    return Prism.highlight(code || "", grammar, prismLang);
  }, [code, prismLang, grammar]);

  return (
    <pre className="codeBlock">
      <code
        className={`language-${prismLang}`}
        dangerouslySetInnerHTML={{ __html: highlighted }}
      />
    </pre>
  );
}

export default function Dashboard() {
  const [snippets, setSnippets] = useState([]);

  const [title, setTitle] = useState("");
  const [language, setLanguage] = useState("js");
  const [description, setDescription] = useState("");
  const [code, setCode] = useState("");
  const [tagsText, setTagsText] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);

  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [msg, setMsg] = useState("");

  const [view, setView] = useState("all"); // all | favorites
  const [filterLang, setFilterLang] = useState("");

  const profileName = safeDecodeTokenEmail();

  const logout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  const loadSnippets = async () => {
    try {
      const res = await api.get("/snippets");
      setSnippets(res.data);
    } catch {
      setMsg("Failed to load snippets");
    }
  };

  useEffect(() => {
    loadSnippets();
  }, []);

  const makePayload = () => ({
    title,
    language,
    code,
    description,
    tags: tagsText.split(",").map((t) => t.trim()).filter(Boolean),
    isFavorite,
  });

  const resetForm = () => {
    setEditingId(null);
    setTitle("");
    setLanguage("js");
    setDescription("");
    setCode("");
    setTagsText("");
    setIsFavorite(false);
  };

  const createSnippet = async () => {
    setMsg("");
    try {
      const res = await api.post("/snippets", makePayload());
      setSnippets((prev) => [res.data, ...prev]);
      resetForm();
    } catch (e) {
      setMsg(e?.response?.data?.message || "Create failed");
    }
  };

  const startEdit = (s) => {
    setEditingId(s._id);
    setTitle(s.title || "");
    setLanguage(s.language || "js");
    setDescription(s.description || "");
    setCode(s.code || "");
    setTagsText((s.tags || []).join(", "));
    setIsFavorite(!!s.isFavorite);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const updateSnippet = async () => {
    setMsg("");
    try {
      const res = await api.put(`/snippets/${editingId}`, makePayload());
      setSnippets((prev) => prev.map((x) => (x._id === editingId ? res.data : x)));
      resetForm();
    } catch (e) {
      setMsg(e?.response?.data?.message || "Update failed");
    }
  };

  const deleteSnippet = async (id) => {
    try {
      await api.delete(`/snippets/${id}`);
      setSnippets((prev) => prev.filter((s) => s._id !== id));
    } catch {
      setMsg("Delete failed");
    }
  };

  const toggleFavorite = async (id) => {
    try {
      const res = await api.patch(`/snippets/${id}/favorite`);
      setSnippets((prev) => prev.map((x) => (x._id === id ? res.data : x)));
    } catch {
      setMsg("Favorite update failed");
    }
  };

  const searchSnippets = async () => {
    try {
      const url = search ? `/snippets?q=${encodeURIComponent(search)}` : "/snippets";
      const res = await api.get(url);
      setSnippets(res.data);
    } catch {
      setMsg("Search failed");
    }
  };

  const visibleSnippets = useMemo(() => {
    let data = [...snippets];

    if (view === "favorites") data = data.filter((s) => s.isFavorite);

    if (filterLang.trim()) {
      const l = filterLang.trim().toLowerCase();
      data = data.filter((s) => (s.language || "").toLowerCase() === l);
    }

    return data;
  }, [snippets, view, filterLang]);

  return (
    <div className="appShell">
      <aside className="sidebar">
        <div className="brand">DevSnippet Vault</div>

        <button
          className={`sideBtn ${view === "all" ? "active" : ""}`}
          onClick={() => setView("all")}
        >
          📄 All Snippets
        </button>

        <button
          className={`sideBtn ${view === "favorites" ? "active" : ""}`}
          onClick={() => setView("favorites")}
        >
          ⭐ Favorites
        </button>

        <div className="sideSection">
          <div className="sideLabel">Language Filter</div>
          <input
            className="sideInput"
            placeholder="e.g. js / java / python"
            value={filterLang}
            onChange={(e) => setFilterLang(e.target.value)}
          />
          <button className="sideSmall" onClick={() => setFilterLang("")}>
            Clear
          </button>
        </div>

        <div className="sideFooter">
          <button className="btn danger" onClick={logout}>Logout</button>
        </div>
      </aside>

      <main className="main">
        <header className="navbar">
          <div>
            <div className="navTitle">Dashboard</div>
            <div className="navSub">
              Welcome, <b>{profileName}</b>
            </div>
          </div>
          <div className="navRight">
            <button className="btn" onClick={loadSnippets}>↻ Refresh</button>
          </div>
        </header>

        {msg && <div className="msg">{msg}</div>}

        <section className="card">
          <h2>{editingId ? "Edit Snippet" : "Add Snippet"}</h2>

          <div className="grid2">
            <div>
              <label>Title</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Hello JS" />
            </div>

            <div>
              <label>Language</label>
              <input value={language} onChange={(e) => setLanguage(e.target.value)} placeholder="js / java / python" />
            </div>
          </div>

          <div className="grid2">
            <div>
              <label>Tags</label>
              <input value={tagsText} onChange={(e) => setTagsText(e.target.value)} placeholder="test, js" />
            </div>

            <div>
              <label>Description</label>
              <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="My first snippet" />
            </div>
          </div>

          <div>
            <label>Code</label>
            <textarea value={code} onChange={(e) => setCode(e.target.value)} placeholder='console.log("Hello World");' />
          </div>

          <div className="row" style={{ justifyContent: "space-between" }}>
            <label className="checkRow">
              <input
                type="checkbox"
                checked={isFavorite}
                onChange={(e) => setIsFavorite(e.target.checked)}
              />
              <span>Mark as Favorite</span>
            </label>

            <div className="row">
              {editingId ? (
                <>
                  <button className="btn primary" onClick={updateSnippet}>Update</button>
                  <button className="btn" onClick={resetForm}>Cancel</button>
                </>
              ) : (
                <button className="btn primary" onClick={createSnippet}>Save Snippet</button>
              )}
            </div>
          </div>
        </section>

        <section className="card">
          <h2>Search</h2>
          <div className="row">
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="bubble / java / keyword..." />
            <button className="btn" onClick={searchSnippets}>Search</button>
            <button className="btn" onClick={() => { setSearch(""); loadSnippets(); }}>Reset</button>
          </div>
        </section>

        <section className="list">
          {visibleSnippets.map((s) => (
            <div key={s._id} className="card">
              <div className="snippetTop">
                <div>
                  <h3 style={{ margin: 0 }}>{s.title}</h3>
                  {s.description && <div className="muted">{s.description}</div>}
                </div>

                <div className="badges">
                  {s.isFavorite && <span className="badge star">⭐</span>}
                  <span className="badge">{s.language}</span>
                </div>
              </div>

              <CodeBlock code={s.code} language={s.language} />

              <div className="tags">
                {(s.tags || []).map((t) => (
                  <span key={t} className="tag">#{t}</span>
                ))}
              </div>

              <div className="row">
                <button className="btn" onClick={() => toggleFavorite(s._id)}>
                  {s.isFavorite ? "⭐ Unfavorite" : "☆ Favorite"}
                </button>

                <button className="btn" onClick={() => startEdit(s)}>Edit</button>
                <button className="btn danger" onClick={() => deleteSnippet(s._id)}>Delete</button>
              </div>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
