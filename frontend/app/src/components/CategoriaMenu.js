import React, { useEffect, useState } from "react";
import { Button, ListGroup, Modal, Form, Spinner } from "react-bootstrap";
import api from "../services/api";

export default function CategoriaMenu({ onSelect, selecionada, onRefresh }) {
  const [categorias, setCategorias] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [novaCategoria, setNovaCategoria] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [salvando, setSalvando] = useState(false);

  const carregarCategorias = async () => {
    try {
      setCarregando(true);
      const response = await api.get("/categorias/");
      setCategorias(response.data);
    } catch (err) {
      console.error("Erro ao carregar categorias:", err);
    } finally {
      setCarregando(false);
    }
  };

  const criarCategoria = async () => {
    if (!novaCategoria.trim()) return;
    try {
      setSalvando(true);
      await api.post("/categorias/", { nome: novaCategoria });
      setNovaCategoria("");
      setShowModal(false);
      await carregarCategorias();
      if (onRefresh) onRefresh(); // atualiza também a tela principal
    } catch (err) {
      console.error("Erro ao criar categoria:", err);
    } finally {
      setSalvando(false);
    }
  };

  useEffect(() => {
    carregarCategorias();
  }, []);

  return (
    <div className="p-3 bg-light rounded shadow-sm">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="mb-0">Categorias</h5>
        <Button
          size="sm"
          variant="outline-primary"
          onClick={() => setShowModal(true)}
        >
          + Nova
        </Button>
      </div>

      {carregando ? (
        <div className="text-center py-3">
          <Spinner animation="border" size="sm" /> Carregando...
        </div>
      ) : (
        <ListGroup>
          <ListGroup.Item
            action
            active={selecionada === null}
            onClick={() => onSelect && onSelect(null)}
          >
            Todas
          </ListGroup.Item>
          {categorias.map((cat) => (
            <ListGroup.Item
              key={cat.id}
              action
              active={selecionada === cat.nome || selecionada === cat.id}
              onClick={() => onSelect && onSelect(cat.nome)}
            >
              {cat.nome}
            </ListGroup.Item>
          ))}
        </ListGroup>
      )}

      {/* Modal de criação */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Criar Categoria</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Control
            type="text"
            placeholder="Nome da categoria"
            value={novaCategoria}
            onChange={(e) => setNovaCategoria(e.target.value)}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowModal(false)}
            disabled={salvando}
          >
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={criarCategoria}
            disabled={!novaCategoria.trim() || salvando}
          >
            {salvando ? (
              <>
                <Spinner animation="border" size="sm" /> Salvando...
              </>
            ) : (
              "Salvar"
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
