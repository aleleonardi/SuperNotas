import React from "react";
import { Card, Button, Badge } from "react-bootstrap";
import { FaEye, FaEdit, FaTrash, FaCode, FaDatabase, FaBug, FaServer, FaFileAlt, FaCalendar, FaUser } from "react-icons/fa";

const RegistroCard = ({ registro, onClick, onEditar, onExcluir }) => {
  
  // 🔹 FUNÇÃO PARA OBTER ÍCONE DINÂMICO baseado no tipo
  const getIconeDinamico = (tipoObj) => {
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

  // 🔹 CONFIGURAÇÃO DINÂMICA baseada nos dados do backend
  const getTipoConfig = () => {
    // Se o registro tem dados de tipo do backend (após migração)
    if (registro.tipo_nome && registro.tipo_cor) {
      const tipoObj = {
        nome: registro.tipo_nome,
        cor: registro.tipo_cor,
        icone: registro.tipo_icone || 'FaFileAlt'
      };
      
      return {
        icone: getIconeDinamico(tipoObj),
        cor: registro.tipo_cor,
        badgeVariant: getBadgeVariant(registro.tipo_nome),
        nome: registro.tipo_nome
      };
    }
    
    // 🔹 FALLBACK para registros antigos (antes da migração)
    const tipoConfigEstatico = {
      Python: {
        icone: <FaCode />,
        cor: "#3572A5",
        badgeVariant: "primary",
        nome: "Python"
      },
      SQL: {
        icone: <FaDatabase />,
        cor: "#00758F", 
        badgeVariant: "info",
        nome: "SQL"
      },
      PowerShell: {
        icone: <FaBug />,
        cor: "#00AEEF",
        badgeVariant: "warning",
        nome: "PowerShell"
      },
      Infraestrutura: {
        icone: <FaServer />,
        cor: "#FF6B35",
        badgeVariant: "danger",
        nome: "Infraestrutura"
      },
      Geral: {
        icone: <FaFileAlt />,
        cor: "#6c757d",
        badgeVariant: "secondary",
        nome: "Geral"
      }
    };

    return tipoConfigEstatico[registro.tipo] || {
      icone: <FaFileAlt />,
      cor: "#6c757d",
      badgeVariant: "secondary",
      nome: registro.tipo || "Geral"
    };
  };

  // 🔹 Função auxiliar para determinar variante do badge
  const getBadgeVariant = (tipoNome) => {
    const variantes = {
      'Python': 'primary',
      'SQL': 'info',
      'PowerShell': 'warning',
      'Infraestrutura': 'danger',
      'Geral': 'secondary'
    };
    return variantes[tipoNome] || 'secondary';
  };

  const config = getTipoConfig();

  // Formatar data
  const formatarData = (dataString) => {
    return new Date(dataString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <Card
      className="shadow-sm h-100 hover-card registro-card"
      style={{ 
        cursor: "pointer",
        borderLeft: `4px solid ${config.cor}`,
        transition: "all 0.3s ease"
      }}
      onClick={() => onClick && onClick(registro)}
    >
      <Card.Body className="d-flex flex-column">
        {/* Cabeçalho com título e ícone */}
        <div className="d-flex justify-content-between align-items-start mb-3">
          <Card.Title 
            className="mb-0 card-title"
            style={{ 
              fontSize: "1.1rem",
              fontWeight: "600",
              color: "#2c3e50",
              flex: 1
            }}
          >
            {registro.titulo}
          </Card.Title>
          <span 
            style={{ 
              color: config.cor,
              fontSize: "1.4rem",
              marginLeft: "10px"
            }}
          >
            {config.icone}
          </span>
        </div>

        {/* Badges de tipo e categoria */}
        <div className="d-flex gap-2 mb-3 flex-wrap">
          <Badge 
            bg={config.badgeVariant}
            style={{ 
              backgroundColor: config.cor,
              border: "none",
              fontSize: "0.75rem",
              padding: "4px 8px"
            }}
          >
            {config.icone} {config.nome}
          </Badge>
          
          {registro.categoria_nome && (
            <Badge 
              bg="light" 
              text="dark"
              style={{
                fontSize: "0.75rem",
                padding: "4px 8px",
                border: "1px solid #dee2e6"
              }}
            >
              📁 {registro.categoria_nome}
            </Badge>
          )}
        </div>

        {/* Informações do autor e data */}
        <div className="mb-3">
          <small className="text-muted d-flex align-items-center mb-1">
            <FaUser className="me-1" size={12} />
            {registro.autor_nome || "Autor"}
          </small>
          <small className="text-muted d-flex align-items-center">
            <FaCalendar className="me-1" size={12} />
            Criado em: {formatarData(registro.criado_em)}
          </small>
        </div>

        {/* Rodapé com visualizações e ações */}
        <div className="mt-auto d-flex justify-content-between align-items-center">
          <small className="text-muted d-flex align-items-center">
            <FaEye className="me-1" style={{ color: config.cor }} />
            <strong style={{ color: config.cor }}>{registro.visualizacoes ?? 0}</strong> visualizações
          </small>

          <div className="d-flex gap-2">
            <Button
              variant="outline-primary"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onEditar && onEditar(registro);
              }}
              style={{ 
                borderColor: config.cor,
                color: config.cor
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = config.cor;
                e.target.style.color = "white";
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = "transparent";
                e.target.style.color = config.cor;
              }}
            >
              <FaEdit />
            </Button>

            <Button
              variant="outline-danger"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onExcluir && onExcluir(registro.id);
              }}
            >
              <FaTrash />
            </Button>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default RegistroCard;