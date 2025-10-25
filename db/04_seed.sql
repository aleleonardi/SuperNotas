\c sistemati_db

-- Grupos
INSERT INTO grupos (nome) VALUES
('Admin'), ('Colaborador'), ('Leitura')
ON CONFLICT (nome) DO NOTHING;

-- Categorias base
INSERT INTO categorias (nome, descricao) VALUES
('Banco de Dados', 'SQL, tuning, backup, restore, manutenção.'),
('Redes', 'Switches, VLANs, firewall, VPN, Wi-Fi.'),
('Servidores', 'Linux, Windows Server, serviços, automação.'),
('ERP', 'Flex/WRPDV/RP Info, integrações, rotinas.'),
('Aplicações', 'Django, React, Node, implantação.'),
('Segurança', 'Hardening, atualizações, antivírus, SIEM.')
ON CONFLICT (nome) DO NOTHING;

-- Tags base (exemplos)
INSERT INTO tags (nome) VALUES
('PostgreSQL'), ('Docker'), ('Linux'), ('Firewall'), ('Django'), ('React')
ON CONFLICT (nome) DO NOTHING;

-- Usuário admin inicial (senha será tratada no Django; aqui é placeholder)
-- Você pode deletar depois e manter apenas o superuser via Django.
INSERT INTO usuarios (nome, email, senha_hash, id_grupo, ativo)
SELECT 'Administrador', 'admin@local', 'hash_a_definir_no_django', id_grupo, TRUE
FROM grupos WHERE nome = 'Admin'
ON CONFLICT (email) DO NOTHING;
