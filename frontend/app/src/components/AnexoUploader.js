import React, { useState } from "react";
import { Form, Button, Alert, ListGroup } from "react-bootstrap";
import { FaUpload, FaTrash, FaPaperclip } from "react-icons/fa";
import api from "../services/api";

const AnexoUploader = ({ anexos = [], onChange, registroId }) => {
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validar tamanho do arquivo (ex: 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setErro("Arquivo muito grande. Tamanho máximo: 10MB");
      return;
    }

    setEnviando(true);
    setErro("");

    try {
      const formData = new FormData();
      formData.append("arquivo", file);
      formData.append("descricao", file.name);
      
      // 🔹 CORREÇÃO: Se temos registroId, enviar junto
      if (registroId) {
        formData.append("registro", registroId);
      }

      console.log("📤 Enviando anexo...", { registroId, file: file.name });

      // 🔹 CORREÇÃO: Usar o endpoint correto
      const response = await api.post("/anexos/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("✅ Anexo enviado:", response.data);

      // Adicionar à lista de anexos
      const novosAnexos = [...anexos, response.data];
      onChange(novosAnexos);

      // Limpar input
      event.target.value = "";

    } catch (error) {
      console.error("❌ Erro ao enviar anexo:", error);
      setErro(error.response?.data?.message || "Erro ao enviar arquivo");
    } finally {
      setEnviando(false);
    }
  };

  const removerAnexo = (index) => {
    const novosAnexos = anexos.filter((_, i) => i !== index);
    onChange(novosAnexos);
  };

  return (
    <div className="anexo-uploader">
      {erro && <Alert variant="danger">{erro}</Alert>}
      
      <Form.Group>
        <Form.Label>
          <FaUpload className="me-2" />
          Adicionar Anexo
        </Form.Label>
        <Form.Control
          type="file"
          onChange={handleFileChange}
          disabled={enviando}
          accept=".jpg,.jpeg,.png,.pdf,.txt,.doc,.docx,.xls,.xlsx,.zip,.rar"
        />
        <Form.Text className="text-muted">
          Formatos suportados: imagens, PDF, documentos, planilhas, arquivos compactados (max. 10MB)
        </Form.Text>
      </Form.Group>

      {/* Lista de anexos */}
      {anexos.length > 0 && (
        <div className="mt-3">
          <h6>Anexos ({anexos.length})</h6>
          <ListGroup>
            {anexos.map((anexo, index) => (
              <ListGroup.Item
                key={anexo.id || index}
                className="d-flex justify-content-between align-items-center"
              >
                <div className="d-flex align-items-center">
                  <FaPaperclip className="me-2 text-muted" />
                  <span>{anexo.descricao || anexo.arquivo}</span>
                </div>
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={() => removerAnexo(index)}
                >
                  <FaTrash />
                </Button>
              </ListGroup.Item>
            ))}
          </ListGroup>
        </div>
      )}
    </div>
  );
};

export default AnexoUploader;