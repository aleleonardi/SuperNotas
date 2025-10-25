import React, { useEffect, useState } from "react";
import { Form } from "react-bootstrap";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight, oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import "../styles/RegistroEditor.css";

export default function RegistroEditor({
  value = "",
  onChange,
  readOnly = false,
  tipo = "text",
}) {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    setIsDarkMode(mediaQuery.matches);
    const listener = (e) => setIsDarkMode(e.matches);
    mediaQuery.addEventListener("change", listener);
    return () => mediaQuery.removeEventListener("change", listener);
  }, []);

  const handleChange = (e) => {
    if (!readOnly && onChange) {
      onChange(e.target.value);
    }
  };

  // 🔹 Define linguagem para syntax highlight
  const getLanguage = () => {
    switch (tipo.toLowerCase()) {
      case "python":
        return "python";
      case "sql":
        return "sql";
      case "powershell":
        return "powershell";
      case "infraestrutura":
        return "bash";
      default:
        return "text";
    }
  };

  return (
    <div className="registro-editor">
      {readOnly ? (
        <div className={`code-viewer ${isDarkMode ? "dark" : "light"}`}>
          <SyntaxHighlighter
            language={getLanguage()}
            style={isDarkMode ? oneDark : oneLight}
            wrapLongLines={true}
            customStyle={{
              backgroundColor: isDarkMode ? "#1e1e1e" : "#f8f9fa",
              borderRadius: "6px",
              padding: "12px",
              fontSize: "0.95rem",
              fontFamily: "Fira Code, monospace",
              border: isDarkMode ? "1px solid #333" : "1px solid #e0e0e0",
            }}
          >
            {value || "# Nenhum conteúdo registrado"}
          </SyntaxHighlighter>
        </div>
      ) : (
        <Form.Control
          as="textarea"
          rows={10}
          value={value || ""}
          onChange={handleChange}
          placeholder="Digite seu conteúdo aqui..."
          className={`editor-textarea ${isDarkMode ? "dark" : "light"}`}
        />
      )}
    </div>
  );
}
