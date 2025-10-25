import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Row, Col, Alert } from "react-bootstrap";
import { FaSave, FaTimes, FaEdit, FaPaperclip } from "react-icons/fa";
import AnexoUploader from "./AnexoUploader";
import RegistroEditor from "./RegistroEditor";

export default function ModalRegistro({
  show,
  onHide,
  registroSelecionado,
  onSalvar,
  categorias,
  tipos,
  modoVisualizacao = false,
}) {
  const [registro, setRegistro] = useState({
    titulo: "",
    conteudo: "",
    tipo: "",
    categoria: "",
    anexos: [],
  });
  const [modoEdicao, setModoEdicao] = useState(false);
  const [erro, setErro] = useState("");

  // 🔹 Inicializa o modal
  useEffect(() => {
    if (registroSelecionado) {
      setRegistro({
        ...registroSelecionado,
        categoria: registroSelecionado.categoria || "",
        tipo: registroSelecionado.tipo || "",
        anexos: registroSelecionado.anexos || [],
      });
      setModoEdicao(!modoVisualizacao);
    } else {
      setRegistro({
        titulo: "",
        conteudo: "",
        tipo: tipos.length > 0 ? tipos[0].id : "",
        categoria: "",
        anexos: [],
      });
      setModoEdicao(true);
    }
    setErro("");
  }, [registroSelecionado, modoVisualizacao, tipos]);

  const handleChange = (e) => {
    setRegistro({ ...registro, [e.target.name]: e.target.value });
    setErro("");
  };

  const handleSalvar = async () => {
    if (!registro.titulo.trim()) {
      setErro("O título é obrigatório!");
      return;
    }

    try {
      // 🔹 CORREÇÃO: Preparar dados para envio SEM campos read-only
      const dadosEnvio = {
        titulo: registro.titulo.trim(),
        conteudo: registro.conteudo || "",
        tipo: registro.tipo || "",
        categoria: registro.categoria || "",
        // 🔹 MANTER O ID se existir (para edição)
        ...(registro.id && { id: registro.id })
      };

      console.log("💾 Enviando dados:", {
        temId: !!registro.id,
        dados: dadosEnvio
      });

      await onSalvar(dadosEnvio);
      setErro("");
    } catch (error) {
      console.error("❌ Erro no handleSalvar:", error);
      setErro(error.response?.data?.message || "Erro ao salvar registro");
    }
  };

  // 🔹 Manipular anexos
  const handleAnexosChange = (novosAnexos) => {
    console.log("📎 Anexos atualizados:", novosAnexos);
    setRegistro({ ...registro, anexos: novosAnexos });
  };

  // 🔹 Obter nome do tipo para o editor
  const getNomeTipo = () => {
    if (!registro.tipo) return "text";
    
    // Se é um ID, buscar o nome nos tipos disponíveis
    if (typeof registro.tipo === 'number' || (typeof registro.tipo === 'string' && registro.tipo.match(/^\d+$/))) {
      const tipoEncontrado = tipos.find(t => t.id == registro.tipo);
      return tipoEncontrado?.nome || "text";
    }
    
    // Se já é o nome do tipo
    return registro.tipo;
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered className="modal-registro">
      <Modal.Header closeButton>
        <Modal.Title>
          {modoVisualizacao
            ? "Visualizando Registro"
            : registroSelecionado
            ? "Editar Registro"
            : "Novo Registro"}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {erro && <Alert variant="danger">{erro}</Alert>}
        
        <Form>
          <Row className="mb-3">
            <Col md={8}>
              <Form.Group>
                <Form.Label>Título *</Form.Label>
                <Form.Control
                  type="text"
                  name="titulo"
                  value={registro.titulo}
                  onChange={handleChange}
                  disabled={!modoEdicao}
                  placeholder="Digite o título do registro"
                  isInvalid={!!erro && !registro.titulo.trim()}
                />
              </Form.Group>
            </Col>

            <Col md={4}>
              <Form.Group>
                <Form.Label>Tipo</Form.Label>
                <Form.Select
                  name="tipo"
                  value={registro.tipo || ""}
                  onChange={handleChange}
                  disabled={!modoEdicao}
                >
                  <option value="">Selecione o tipo...</option>
                  {tipos.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.nome}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Categoria</Form.Label>
                <Form.Select
                  name="categoria"
                  value={registro.categoria || ""}
                  onChange={handleChange}
                  disabled={!modoEdicao}
                >
                  <option value="">Selecione a categoria...</option>
                  {categorias.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nome}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label>Autor</Form.Label>
                <Form.Control
                  type="text"
                  value={registro.autor_nome || "Automático"}
                  disabled
                />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Conteúdo</Form.Label>
            <RegistroEditor
              value={registro.conteudo}
              onChange={(valor) =>
                modoEdicao && setRegistro({ ...registro, conteudo: valor })
              }
              readOnly={!modoEdicao}
              tipo={getNomeTipo()} // 🔹 CORREÇÃO: Usar função para obter nome do tipo
            />
          </Form.Group>

          {/* 🔹 Anexos - Sempre visível, mas editável apenas no modo edição */}
          <div className="mt-3">
            <Form.Label>
              <FaPaperclip className="me-2" />
              Anexos {registro.anexos && registro.anexos.length > 0 && 
                <span className="badge bg-secondary ms-1">{registro.anexos.length}</span>
              }
            </Form.Label>
            
            {modoEdicao ? (
              <AnexoUploader
                anexos={registro.anexos || []}
                onChange={handleAnexosChange}
                registroId={registro.id} // 🔹 CORREÇÃO: Sempre passar registroId
              />
            ) : (
              // 🔹 Visualização de anexos no modo leitura
              <div className="anexos-list">
                {registro.anexos && registro.anexos.length > 0 ? (
                  registro.anexos.map((anexo) => (
                    <div key={anexo.id} className="anexo-item d-flex justify-content-between align-items-center p-2 border rounded mb-2">
                      <div className="d-flex align-items-center">
                        <FaPaperclip className="me-2 text-muted" />
                        <span className="text-truncate" style={{ maxWidth: '200px' }}>
                          {anexo.descricao || anexo.arquivo}
                        </span>
                      </div>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        href={anexo.arquivo_url || anexo.arquivo} // 🔹 CORREÇÃO
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ms-2"
                      >
                        Visualizar
                    </Button>
                    </div>
                  ))
                ) : (
                  <p className="text-muted">Nenhum anexo</p>
                )}
              </div>
            )}
          </div>
        </Form>
      </Modal.Body>

      <Modal.Footer>
        {modoVisualizacao && !modoEdicao && (
          <Button 
            variant="secondary" 
            onClick={() => {
              console.log("✏️ Ativando modo edição");
              setModoEdicao(true);
            }}
          >
            <FaEdit /> Editar
          </Button>
        )}

        {modoEdicao && (
          <Button variant="success" onClick={handleSalvar}>
            <FaSave /> Salvar
          </Button>
        )}

        <Button variant="outline-secondary" onClick={onHide}>
          <FaTimes /> {modoVisualizacao ? "Fechar" : "Cancelar"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}