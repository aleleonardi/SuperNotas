import React, { useState, useEffect } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { FaCopy, FaCheck, FaEdit, FaTrash, FaTimes, FaPaperclip, FaDownload, FaExternalLinkAlt } from "react-icons/fa";
import "../styles/RegistroModal.css";

export default function RegistroModal({ registro, onClose, onEdit, onDelete }) {
  const [copiado, setCopiado] = useState(false);
  const [anexos, setAnexos] = useState([]);

  // 🔹 CARREGAR ANEXOS quando o modal abrir
  useEffect(() => {
    if (registro && registro.id) {
      carregarAnexos(registro.id);
    }
  }, [registro]);

  // 🔹 Função para carregar anexos do registro
  const carregarAnexos = async (registroId) => {
    try {
      console.log("📥 Carregando anexos para registro:", registroId);
      
      // Se o registro já vem com anexos da lista principal, use-os
      if (registro.anexos && registro.anexos.length > 0) {
        console.log("✅ Anexos já carregados:", registro.anexos);
        setAnexos(registro.anexos);
        return;
      }

      // 🔹 Buscar anexos específicos deste registro
      // Você pode precisar criar um endpoint como /api/registros/{id}/anexos/
      // Ou usar o endpoint geral filtrando por registro
      const response = await fetch(`/api/anexos/?registro=${registroId}`);
      if (response.ok) {
        const dados = await response.json();
        console.log("✅ Anexos carregados da API:", dados);
        setAnexos(dados);
      } else {
        console.warn("⚠️ Não foi possível carregar anexos específicos");
        setAnexos(registro.anexos || []);
      }
    } catch (error) {
      console.error("❌ Erro ao carregar anexos:", error);
      setAnexos(registro.anexos || []);
    }
  };

  // 🔹 Definir linguagem para syntax highlighting
  const getLanguage = () => {
    const tipo = registro.tipo_nome || registro.tipo;
    switch (tipo?.toLowerCase()) {
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

  // 🔹 Copiar conteúdo para clipboard
  const copiarConteudo = async () => {
    try {
      await navigator.clipboard.writeText(registro.conteudo || "");
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch (err) {
      console.error("Erro ao copiar:", err);
    }
  };

  // 🔹 Formatar data
  const formatarData = (dataString) => {
    return new Date(dataString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 🔹 Download de anexo - VERSÃO CORRIGIDA
  const downloadAnexo = (anexo) => {
    try {
      // 🔹 USAR arquivo_url SE EXISTIR, SE NÃO, CONSTRUIR URL
      const url = anexo.arquivo_url || `${window.location.origin}${anexo.arquivo}`;
      
      console.log("📥 Baixando anexo:", url);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = anexo.descricao || anexo.arquivo.split('/').pop();
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("❌ Erro ao baixar anexo:", error);
      // Fallback: abrir em nova aba
      const url = anexo.arquivo_url || `${window.location.origin}${anexo.arquivo}`;
      window.open(url, '_blank');
    }
  };

  // 🔹 Visualizar anexo - VERSÃO CORRIGIDA
  const visualizarAnexo = (anexo) => {
    try {
      // 🔹 USAR arquivo_url SE EXISTIR, SE NÃO, CONSTRUIR URL
      const url = anexo.arquivo_url || `${window.location.origin}${anexo.arquivo}`;
      
      console.log("👁️ Visualizando anexo:", url);
      window.open(url, '_blank');
    } catch (error) {
      console.error("❌ Erro ao visualizar anexo:", error);
    }
  };


  // 🔹 Obter nome do arquivo do anexo
  const getNomeArquivo = (anexo) => {
    if (anexo.descricao) return anexo.descricao;
    if (anexo.arquivo) {
      const partes = anexo.arquivo.split('/');
      return partes[partes.length - 1];
    }
    return "Arquivo sem nome";
  };

  // 🔹 Verificar se é uma imagem
  const isImagem = (anexo) => {
    const nome = getNomeArquivo(anexo).toLowerCase();
    return nome.match(/\.(jpg|jpeg|png|gif|bmp|webp)$/i);
  };

  console.log("🔍 RegistroModal - Registro:", registro);
  console.log("🔍 RegistroModal - Anexos:", anexos);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-conteudo" onClick={(e) => e.stopPropagation()}>
        
        {/* Header com título e botões */}
        <header className="modal-header">
          <div className="modal-title-section">
            <h2>{registro.titulo}</h2>
            <div className="modal-meta-info">
              <span className="tipo-badge" style={{ 
                backgroundColor: registro.tipo_cor || getTipoColor(registro.tipo_nome || registro.tipo) 
              }}>
                {registro.tipo_nome || registro.tipo}
              </span>
              {registro.categoria_nome && (
                <span className="categoria-badge">📁 {registro.categoria_nome}</span>
              )}
            </div>
          </div>
          
          <div className="modal-actions">
            <button 
              className="btn-copiar"
              onClick={copiarConteudo}
              title="Copiar conteúdo"
            >
              {copiado ? <FaCheck color="#28a745" /> : <FaCopy />}
              {copiado ? "Copiado!" : "Copiar"}
            </button>
            
            <button className="btn-editar" onClick={onEdit}>
              <FaEdit /> Editar
            </button>
            
            <button className="btn-excluir" onClick={onDelete}>
              <FaTrash /> Excluir
            </button>
            
            <button className="btn-fechar" onClick={onClose}>
              <FaTimes /> Fechar
            </button>
          </div>
        </header>

        {/* Informações do registro */}
        <div className="registro-info">
          <div className="info-item">
            <strong>Autor:</strong> {registro.autor_nome}
          </div>
          <div className="info-item">
            <strong>Criado em:</strong> {formatarData(registro.criado_em)}
          </div>
          <div className="info-item">
            <strong>Atualizado em:</strong> {formatarData(registro.atualizado_em)}
          </div>
          <div className="info-item">
            <strong>Visualizações:</strong> {registro.visualizacoes}
          </div>
        </div>

        {/* 🔹 Anexos - SEÇÃO CORRIGIDA */}
        {(anexos && anexos.length > 0) && (
          <div className="anexos-section">
            <h5>
              <FaPaperclip className="me-2" />
              Anexos ({anexos.length})
            </h5>
            <div className="anexos-list">
              {anexos.map((anexo, index) => (
                <div key={anexo.id || index} className="anexo-item">
                  <div className="anexo-info">
                    <FaPaperclip className="me-2" />
                    <span className="anexo-nome">{getNomeArquivo(anexo)}</span>
                    {isImagem(anexo) && <span className="badge-imagem">🖼️ Imagem</span>}
                  </div>                  
                  <div className="anexo-actions">
                    <button 
                      className="btn-visualizar"
                      onClick={() => visualizarAnexo(anexo)}
                      title="Visualizar"
                    >
                      <FaExternalLinkAlt />
                    </button>
                    <button 
                      className="btn-download"
                      onClick={() => downloadAnexo(anexo)}
                      title="Download"
                    >
                      <FaDownload />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Conteúdo com syntax highlighting */}
        <main className="modal-content">
          <SyntaxHighlighter
            language={getLanguage()}
            style={atomDark}
            wrapLongLines={true}
            showLineNumbers={true}
            customStyle={{
              borderRadius: "8px",
              padding: "20px",
              fontSize: "0.95rem",
              fontFamily: "'Fira Code', 'Monaco', 'Consolas', monospace",
              backgroundColor: "#1a1a1a",
              margin: 0
            }}
            lineNumberStyle={{
              color: "#666",
              minWidth: "3em"
            }}
          >
            {registro.conteudo || "# Nenhum conteúdo registrado"}
          </SyntaxHighlighter>
        </main>
      </div>
    </div>
  );
}

// 🔹 Função auxiliar para cores dos tipos
function getTipoColor(tipo) {
  const cores = {
    Python: "#3572A5",
    SQL: "#00758F",
    PowerShell: "#00AEEF",
    Infraestrutura: "#FF6B35",
    Geral: "#6c757d"
  };
  return cores[tipo] || "#6c757d";
}