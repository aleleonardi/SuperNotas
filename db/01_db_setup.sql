-- 1) Usuário e Banco
DO $$
BEGIN
   IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'sistemati_user') THEN
      CREATE ROLE sistemati_user LOGIN PASSWORD 'mude_esta_senha' NOSUPERUSER NOCREATEDB NOCREATEROLE;
   END IF;
END$$;

DO $$
BEGIN
   IF NOT EXISTS (SELECT FROM pg_database WHERE datname = 'sistemati_db') THEN
      CREATE DATABASE sistemati_db OWNER sistemati_user ENCODING 'UTF8' LC_COLLATE 'pt_BR.UTF-8' LC_CTYPE 'pt_BR.UTF-8' TEMPLATE template0;
   END IF;
END$$;

-- 2) Extensões (rodar dentro do DB)
\c sistemati_db

CREATE EXTENSION IF NOT EXISTS pg_trgm;         -- trigram para buscas aproximadas
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";     -- geração de UUIDs (se quiser usar no banco)
