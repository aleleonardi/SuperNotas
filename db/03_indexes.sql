\c sistemati_db

-- Busca full-text
CREATE INDEX IF NOT EXISTS idx_registros_tsv ON registros USING GIN (tsv);

-- Trigram para busca aproximada (ilike rápido)
CREATE INDEX IF NOT EXISTS idx_registros_titulo_trgm ON registros USING GIN (titulo gin_trgm_ops);

-- Opcional: trigram no conteúdo (cuidado com espaço em disco em bases grandes)
-- CREATE INDEX IF NOT EXISTS idx_registros_conteudo_trgm ON registros USING GIN (conteudo_md gin_trgm_ops);

-- Acelera filtros comuns
CREATE INDEX IF NOT EXISTS idx_registros_categoria ON registros(id_categoria);
CREATE INDEX IF NOT EXISTS idx_registros_autor ON registros(id_autor);
CREATE INDEX IF NOT EXISTS idx_anexos_registro ON anexos(id_registro);
CREATE INDEX IF NOT EXISTS idx_favoritos_usuario ON favoritos(id_usuario);
CREATE INDEX IF NOT EXISTS idx_registro_tags_tag ON registro_tags(id_tag);
CREATE INDEX IF NOT EXISTS idx_logs_usuario_data ON logs_acesso(id_usuario, data_hora DESC);

CREATE INDEX IF NOT EXISTS idx_checklists_status ON checklists(status);
CREATE INDEX IF NOT EXISTS idx_checklists_responsavel ON checklists(responsavel);
CREATE INDEX IF NOT EXISTS idx_itens_checklist ON checklists_itens(id_checklist, ordem);
CREATE INDEX IF NOT EXISTS idx_execucoes_checklist ON execucoes_checklist(id_checklist, data_execucao DESC);
