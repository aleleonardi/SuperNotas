import React, { useEffect, useState } from "react";
import api from "../services/api";
import { Button, Container, Row, Col, Spinner, Form, Navbar, Nav } from "react-bootstrap";
import { FaPlus, FaCode, FaDatabase, FaBug, FaSearch, FaSignOutAlt, FaServer, FaFileAlt } from "react-icons/fa";
import ModalRegistro from "../components/ModalRegistro";
import RegistroModal from "../components/RegistroModal";
import CategoriaMenu from "../components/CategoriaMenu";
import RegistroCard from "../components/RegistroCard";
import "../styles/RegistrosPage.css";

export default function RegistrosPage() {
  const [registros, setRegistros] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [tipos, setTipos] = useState([]);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState(null);
  const [tipoSelecionado, setTipoSelecionado] = useState(null);
  const [termoPesquisa, setTermoPesquisa] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [registroSelecionado, setRegistroSelecionado] = useState(null);
  const [modoVisualizacao, setModoVisualizacao] = useState(false);

  // 🔹 FUNÇÃO PARA OBTER ÍCONES DINÂMICOS - ADICIONE AQUI
  const getIconeTipo = (tipoObj) => {
    if (!tipoObj) return <FaFileAlt color="#6c757d" />;
    
    const icones = {
      'FaCode': <FaCode color={tipoObj.cor || "#3572A5"} />,
      'FaDatabase': <FaDatabase color={tipoObj.cor || "#00758F"} />,
      'FaBug': <FaBug color={tipoObj.cor || "#00AEEF"} />,
      'FaServer': <FaServer color={tipoObj.cor || "#FF6B35"} />,
      'FaFileAlt': <FaFileAlt color={tipoObj.cor || "#6c757d"} />
    };
    
    return icones[tipoObj.icone] || <FaFileAlt color={tipoObj.cor || "#6c757d"} />;
  };


  // 🔹 Carregar registros, categorias e tipos
  const carregarDados = async () => {
    try {
      const [resRegistros, resCategorias, resTipos] = await Promise.all([
        api.get("/registros/"),
        api.get("/categorias/"),
        api.get("/tipos/") // Novo endpoint para tipos
      ]);
      setRegistros(resRegistros.data);
      setCategorias(resCategorias.data);
      setTipos(resTipos.data);
    } catch (err) {
      console.error("Erro ao carregar dados:", err);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  // 🔹 Filtragem com pesquisa - VERSÃO CORRIGIDA
const filtrarRegistros = () =>
  registros.filter((r) => {
    const matchCategoria = !categoriaSelecionada || r.categoria_nome === categoriaSelecionada;
    
    // 🔹 CORREÇÃO: Comparar com tipo_nome em vez de tipo
    const matchTipo = !tipoSelecionado || r.tipo_nome === tipoSelecionado;
    
    const matchPesquisa = !termoPesquisa || 
      r.titulo.toLowerCase().includes(termoPesquisa.toLowerCase()) ||
      r.conteudo.toLowerCase().includes(termoPesquisa.toLowerCase());
    
    console.log("🔍 Filtro:", {
      registro: r.titulo,
      tipo: r.tipo_nome,
      tipoSelecionado,
      matchTipo,
      matchCategoria,
      matchPesquisa
    });
    
    return matchCategoria && matchTipo && matchPesquisa;
  });

  // 🔹 Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  // 🔹 Abrir modal de visualização
  const abrirVisualizacao = async (registro) => {
    try {
      const id = registro.id;
      
      // Abre o modal IMEDIATAMENTE
      setRegistroSelecionado(registro);
      setModoVisualizacao(true);
      setMostrarModal(true);
      
      // Busca dados atualizados em segundo plano
      try {
        const atualizado = await api.get(`/registros/${id}/`);
        setRegistros((prev) =>
          prev.map((r) =>
            r.id === id
              ? { ...r, visualizacoes: atualizado.data.visualizacoes }
              : r
          )
        );
        setRegistroSelecionado(atualizado.data);
      } catch (apiError) {
        console.error("Erro ao buscar dados atualizados:", apiError);
      }
    } catch (error) {
      console.error("Erro ao abrir visualização:", error);
      setRegistroSelecionado(registro);
      setModoVisualizacao(true);
      setMostrarModal(true);
    }
  };

  // 🔹 Abrir modal de novo registro
  const abrirModalNovo = () => {
    setRegistroSelecionado(null);
    setModoVisualizacao(false);
    setMostrarModal(true);
  };

  // 🔹 Abrir modal de edição
  const abrirModalEditar = (registro) => {
    setRegistroSelecionado(registro);
    setModoVisualizacao(false);
    setMostrarModal(true);
  };

  // 🔹 Salvar (criar ou editar) - VERSÃO CORRIGIDA
  const salvarRegistro = async (registro) => {
    try {
      console.log("💾 Salvando registro:", registro);
      
      if (registro.id) {
        // 🔹 EDIÇÃO: Usar PUT para atualizar
        console.log("📝 Editando registro existente, ID:", registro.id);
        await api.put(`/registros/${registro.id}/`, registro);
      } else {
        // 🔹 CRIAÇÃO: Usar POST para novo
        console.log("🆕 Criando novo registro");
        await api.post(`/registros/`, registro);
      }
      
      // Recarregar os dados
      await carregarDados();
      setMostrarModal(false);
      
      console.log("✅ Registro salvo com sucesso!");
      
    } catch (error) {
      console.error("❌ Erro ao salvar:", error);
      console.error("❌ Detalhes do erro:", error.response?.data);
    }
  };

  // 🔹 Excluir
  const excluirRegistro = async (id) => {
    if (!window.confirm("Deseja realmente excluir este registro?")) return;
    try {
      await api.delete(`/registros/${id}/`);
      await carregarDados();
      setMostrarModal(false);
    } catch (error) {
      console.error("Erro ao excluir registro:", error);
    }
  };

  // 🔹 Fechar modal
  const fecharModal = () => {
    setMostrarModal(false);
    setRegistroSelecionado(null);
    setModoVisualizacao(false);
  };

  return (
    <div className="registros-container">
      {/* NAVBAR SUPERIOR */}
      <Navbar bg="dark" variant="dark" className="px-3">
        <Navbar.Brand>Sistema de Registros Técnicos</Navbar.Brand>
        <Nav className="ms-auto">
          <Button variant="outline-light" onClick={handleLogout}>
            <FaSignOutAlt className="me-2" />
            Sair
          </Button>
        </Nav>
      </Navbar>

      <Container fluid className="registros-page">
        <Row>
          {/* SIDEBAR */}
          <Col md={3} lg={2} className="sidebar">
            <h5 className="sidebar-title"> </h5>
            <CategoriaMenu
              categorias={categorias}
              selecionada={categoriaSelecionada}
              onSelect={setCategoriaSelecionada}
              onRefresh={carregarDados}
            />

            <h5 className="sidebar-title mt-4">Tipos</h5>
            <div className="tipos-lista">
              {tipos.map((t) => (
                <div
                  key={t.nome}
                  className={`tipo-item ${tipoSelecionado === t.nome ? "ativo" : ""}`}
                  onClick={() => {
                    console.log("🎯 Tipo clicado:", t.nome, "Selecionado atual:", tipoSelecionado);
                    setTipoSelecionado(tipoSelecionado === t.nome ? null : t.nome);
                  }}
                >
                  <span className="tipo-icone">{getIconeTipo(t)}</span>
                  <span>{t.nome}</span>
                </div>
              ))}
            </div>
          </Col>

          {/* CONTEÚDO PRINCIPAL */}
          <Col md={9} lg={10} className="conteudo">
            {/* BARRA SUPERIOR COM PESQUISA */}
            <div className="top-bar d-flex justify-content-between align-items-center mb-4">
              <h4>Registros</h4>
              <div className="d-flex gap-3 align-items-center">
                <div className="search-box">
                  <FaSearch className="search-icon" />
                  <Form.Control
                    type="text"
                    placeholder="      Pesquisar título ou conteúdo..."
                    value={termoPesquisa}
                    onChange={(e) => setTermoPesquisa(e.target.value)}
                    className="search-input"
                  />
                </div>
                <Button variant="primary" onClick={abrirModalNovo}>
                  <FaPlus /> Nova Nota
                </Button>
              </div>
            </div>

            {carregando ? (
              <div className="text-center mt-5">
                <Spinner animation="border" variant="primary" />
              </div>
            ) : (
              <Row>
                {filtrarRegistros().map((registro) => (
                  <Col md={6} lg={4} key={registro.id} className="mb-4">
                    <RegistroCard
                      registro={registro}
                      onClick={() => abrirVisualizacao(registro)}
                      onEditar={() => abrirModalEditar(registro)}
                      onExcluir={() => excluirRegistro(registro.id)}
                    />
                  </Col>
                ))}
                {filtrarRegistros().length === 0 && (
                  <p className="text-muted mt-5 text-center">
                    Nenhum registro encontrado.
                  </p>
                )}
              </Row>
            )}
          </Col>
        </Row>

        {/* MODAIS */}
        {mostrarModal && modoVisualizacao && registroSelecionado && (
          <RegistroModal
            registro={registroSelecionado}
            onClose={fecharModal}
            onEdit={() => {
              setModoVisualizacao(false);
              // Mantém o modal aberto mas muda para modo edição
            }}
            onDelete={() => {
              excluirRegistro(registroSelecionado.id);
              fecharModal();
            }}
          />
        )}

        {mostrarModal && !modoVisualizacao && (
          <ModalRegistro
            show={mostrarModal}
            onHide={fecharModal}
            registroSelecionado={registroSelecionado}
            onSalvar={salvarRegistro}
            categorias={categorias}
            tipos={tipos} // Passa tipos para o modal
            modoVisualizacao={modoVisualizacao}
          />
        )}
      </Container>
    </div>
  );
}

// 🔹 Função para ícones dos tipos
function getIconeTipo(tipoObj) {
  if (!tipoObj) return <FaFileAlt color="#6c757d" />;
  
  const icones = {
    'FaCode': <FaCode color={tipoObj.cor || "#3572A5"} />,
    'FaDatabase': <FaDatabase color={tipoObj.cor || "#00758F"} />,
    'FaBug': <FaBug color={tipoObj.cor || "#00AEEF"} />,
    'FaServer': <FaServer color={tipoObj.cor || "#FF6B35"} />,
    'FaFileAlt': <FaFileAlt color={tipoObj.cor || "#6c757d"} />
  };
  
  return icones[tipoObj.icone] || <FaFileAlt color={tipoObj.cor || "#6c757d"} />;
}