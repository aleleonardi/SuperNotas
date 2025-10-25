\c sistemati_db

-- Tabelas de apoio (grupos, categorias, tags)
CREATE TABLE IF NOT EXISTS grupos (
  id_grupo        SERIAL PRIMARY KEY,
  nome            VARCHAR(50) UNIQUE NOT NULL,   -- Admin, Colaborador, Leitura
  criado_em       TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS categorias (
  id_categoria    SERIAL PRIMARY KEY,
  nome            VARCHAR(80) UNIQUE NOT NULL,   -- Banco de Dados, Redes, Servidores, ERP, etc.
  descricao       TEXT,
  criado_em       TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tags (
  id_tag          SERIAL PRIMARY KEY,
  nome            VARCHAR(60) UNIQUE NOT NULL
);

-- Usuários
CREATE TABLE IF NOT EXISTS usuarios (
  id_usuario      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome            VARCHAR(120) NOT NULL,
  email           VARCHAR(160) UNIQUE NOT NULL,
  senha_hash      VARCHAR(255) NOT NULL,
  id_grupo        INTEGER NOT NULL REFERENCES grupos(id_grupo) ON UPDATE CASCADE,
  ativo           BOOLEAN NOT NULL DEFAULT TRUE,
  data_criacao    TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Logs de acesso/ações
CREATE TABLE IF NOT EXISTS logs_acesso (
  id_log          BIGSERIAL PRIMARY KEY,
  id_usuario      UUID REFERENCES usuarios(id_usuario) ON UPDATE CASCADE ON DELETE SET NULL,
  acao            VARCHAR(60) NOT NULL,              -- login, consulta, edicao, exclusao, download, upload etc.
  detalhes        TEXT,
  ip_origem       INET,
  data_hora       TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Registros de conhecimento
CREATE TABLE IF NOT EXISTS registros (
  id_registro     UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  titulo          VARCHAR(180) NOT NULL,
  conteudo_md     TEXT NOT NULL,                     -- markdown / texto rico
  id_categoria    INTEGER REFERENCES categorias(id_categoria) ON UPDATE CASCADE,
  id_autor        UUID NOT NULL REFERENCES usuarios(id_usuario) ON UPDATE CASCADE,
  criado_em       TIMESTAMP NOT NULL DEFAULT NOW(),
  atualizado_em   TIMESTAMP NOT NULL DEFAULT NOW(),
  -- full-text em português
  tsv             tsvector GENERATED ALWAYS AS (
    to_tsvector('portuguese', coalesce(titulo, '') || ' ' || coalesce(conteudo_md, ''))
  ) STORED
);

-- Ao atualizar um registro, atualize updated_at
CREATE OR REPLACE FUNCTION set_atualizado_em()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_registros_set_updated ON registros;
CREATE TRIGGER tr_registros_set_updated
BEFORE UPDATE ON registros
FOR EACH ROW EXECUTE FUNCTION set_atualizado_em();

-- Versões de registros
CREATE TABLE IF NOT EXISTS registros_versoes (
  id_versao       BIGSERIAL PRIMARY KEY,
  id_registro     UUID NOT NULL REFERENCES registros(id_registro) ON UPDATE CASCADE ON DELETE CASCADE,
  conteudo_md     TEXT NOT NULL,
  id_autor        UUID REFERENCES usuarios(id_usuario) ON UPDATE CASCADE,
  data_versao     TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Tabela de relação N:N entre registros e tags
CREATE TABLE IF NOT EXISTS registro_tags (
  id_registro   UUID NOT NULL REFERENCES registros(id_registro) ON UPDATE CASCADE ON DELETE CASCADE,
  id_tag        INTEGER NOT NULL REFERENCES tags(id_tag) ON UPDATE CASCADE ON DELETE CASCADE,
  PRIMARY KEY (id_registro, id_tag)
);

-- Anexos vinculados a registros
CREATE TABLE IF NOT EXISTS anexos (
  id_anexo        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_registro     UUID NOT NULL REFERENCES registros(id_registro) ON UPDATE CASCADE ON DELETE CASCADE,
  nome_arquivo    VARCHAR(240) NOT NULL,
  caminho_arquivo TEXT NOT NULL,         -- ex.: /media/registros/uuid/nome.ext
  mime_type       VARCHAR(120),
  tamanho_bytes   BIGINT,
  checksum_sha256 CHAR(64),
  data_upload     TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Favoritos (N:N usuário x registro)
CREATE TABLE IF NOT EXISTS favoritos (
  id_usuario    UUID NOT NULL REFERENCES usuarios(id_usuario) ON UPDATE CASCADE ON DELETE CASCADE,
  id_registro   UUID NOT NULL REFERENCES registros(id_registro) ON UPDATE CASCADE ON DELETE CASCADE,
  favoritado_em TIMESTAMP NOT NULL DEFAULT NOW(),
  PRIMARY KEY (id_usuario, id_registro)
);

-- Checklists (rotinas)
CREATE TYPE status_checklist AS ENUM ('ativo','concluido','arquivado');
CREATE TYPE status_item AS ENUM ('pendente','feito','observacao');
CREATE TYPE resultado_execucao AS ENUM ('ok','falha','observacao');

CREATE TABLE IF NOT EXISTS checklists (
  id_checklist    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  titulo          VARCHAR(160) NOT NULL,
  descricao       TEXT,
  criado_por      UUID NOT NULL REFERENCES usuarios(id_usuario) ON UPDATE CASCADE,
  responsavel     UUID REFERENCES usuarios(id_usuario) ON UPDATE CASCADE,
  status          status_checklist NOT NULL DEFAULT 'ativo',
  criado_em       TIMESTAMP NOT NULL DEFAULT NOW(),
  atualizado_em   TIMESTAMP NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS tr_checklists_set_updated ON checklists;
CREATE TRIGGER tr_checklists_set_updated
BEFORE UPDATE ON checklists
FOR EACH ROW EXECUTE FUNCTION set_atualizado_em();

CREATE TABLE IF NOT EXISTS checklists_itens (
  id_item         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_checklist    UUID NOT NULL REFERENCES checklists(id_checklist) ON UPDATE CASCADE ON DELETE CASCADE,
  descricao_item  TEXT NOT NULL,
  ordem           INTEGER NOT NULL DEFAULT 1,
  status_item     status_item NOT NULL DEFAULT 'pendente',
  observacao      TEXT
);

CREATE TABLE IF NOT EXISTS execucoes_checklist (
  id_execucao     UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_checklist    UUID NOT NULL REFERENCES checklists(id_checklist) ON UPDATE CASCADE ON DELETE CASCADE,
  id_usuario      UUID REFERENCES usuarios(id_usuario) ON UPDATE CASCADE,
  data_execucao   TIMESTAMP NOT NULL DEFAULT NOW(),
  resultado       resultado_execucao NOT NULL DEFAULT 'ok',
  observacao      TEXT
);
