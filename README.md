# 🧠 SuperNotas

**SuperNotas** é um sistema interno desenvolvido para registro, organização e consulta de anotações técnicas, voltado para equipes de **TI, infraestrutura e desenvolvimento**.  
Permite salvar códigos (Python, SQL, PowerShell etc.), scripts, instruções operacionais e documentações rápidas de forma segura e categorizada.

---

## 🚀 Tecnologias

### Backend
- 🐍 **Django** + Django REST Framework  
- 🔐 Autenticação com **JWT (SimpleJWT)**
- 🗄️ Banco de dados **PostgreSQL**
- 📦 Executado via **Docker Compose**

### Frontend
- ⚛️ **React.js** com **Bootstrap**
- 📡 Integração via **Axios**
- 📝 Edição e visualização de registros
- 🏷️ Filtros por categoria e tipo (Python, SQL, Infra, etc.)
- 📎 Upload de anexos (PDFs, imagens, logs, scripts)

---

## 🧩 Estrutura do Projeto

supernotas/
├── backend/
│ ├── core/ # Configurações Django
│ ├── usuarios/ # App de autenticação e permissões
│ ├── registros/ # App principal (notas e categorias)
│ ├── permissoes/ # Controle de acessos e tokens temporários
│ ├── manage.py
│ └── requirements.txt
│
├── frontend/
│ ├── src/
│ │ ├── pages/ # RegistrosPage, LoginPage etc.
│ │ ├── components/ # RegistroCard, ModalRegistro etc.
│ │ ├── services/ # Integração com API via Axios
│ │ └── styles/ # Estilos personalizados
│ └── package.json
│
└── infra/
├── docker-compose.yml
├── Dockerfile (backend e frontend)
└── .env

## ⚙️ Configuração e Execução

### 🧱 Pré-requisitos
- Docker e Docker Compose instalados
- Git configurado
- Porta **8002** (backend) e **3002** (frontend) livres

### 🔧 Subindo os containers

```bash
cd infra
docker compose up -d --build

Após inicializar:

Backend → http://localhost:8002

Frontend → http://localhost:3002

PgAdmin → http://localhost:8082

🔑 Acesso e Autenticação

Crie o superusuário:

docker compose run backend python manage.py createsuperuser


Acesse o painel admin:
👉 http://localhost:8002/admin

Gere o token JWT com:

POST http://localhost:8002/api/token/
{
  "username": "admin",
  "password": "sua_senha"
}

🧠 Funcionalidades Principais

✅ Login com autenticação JWT
✅ Criação, edição e exclusão de notas
✅ Contador de visualizações
✅ Filtro por tipo e categoria
✅ Upload de anexos
✅ Compartilhamento com permissões
✅ Interface responsiva e moderna

🖥️ Interface
Tela	Descrição
Login	Autenticação de usuários
Painel de Notas	Lista de registros com filtros e contador de visualizações
Editor	Edição com destaque de sintaxe
Visualização	Modo leitura sem edição, ideal para consulta
Anexos	Upload e visualização de arquivos associados à nota

👨‍💻 Autor

Alexandre Leonardi
Gerente de TI — Supermercados Santos
