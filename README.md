# 🌿 Bonsai Diary — Mobile-First PWA

Aplicação web mobile-first projetada para registrar o ciclo de vida, cultivo e **transferência afetiva (presente)** de bonsais, preservando toda a linha do tempo de cuidados e a carta de simbologia (`双幹 — Sōkan`).

---

## 🛠️ Stack Tecnológica

- **Frontend:** React 18 + TypeScript + Vite + Tailwind CSS + Lucide Icons + React Router DOM v6
- **Backend Integrado & Vercel Serverless:** Node.js + Express (`api/index.ts`)
- **Banco de Dados:** MongoDB Atlas via Mongoose (`users`, `bonsais`, `logs`) + Fallback automático em memória com dados de demonstração caso `MONGODB_URI` ainda não esteja configurado
- **Autenticação:** JWT (`jsonwebtoken`) + Senhas com hash (`bcryptjs`)
- **Upload de Imagens:** Suporte a Cloudinary REST API ou compressão automática em Base64 JPEG via HTML5 Canvas (compatível com captura direta da câmera do smartphone `capture="environment"`)

---

## 🚀 Como Executar Localmente

1. **Instale as dependências:**
   ```bash
   npm install
   ```

2. **(Opcional) Configure as variáveis de ambiente:**
   Copie o arquivo `.env.example` para `.env` e adicione sua string do MongoDB Atlas:
   ```env
   MONGODB_URI=mongodb+srv://<usuario>:<senha>@cluster0.xxxxx.mongodb.net/bonsai-diary?retryWrites=true&w=majority
   JWT_SECRET=sua_chave_secreta_jwt
   ```
   > **Nota:** Se você executar sem configurar o `.env`, o sistema inicia imediatamente com um banco em memória pré-populado com duas contas de demonstração (`cultivador@bonsai.app` e `helena@bonsai.app`, senha `123456`) para você testar todo o fluxo de cultivo e presente na hora!

3. **Inicie o servidor de desenvolvimento (Frontend + API integrados):**
   ```bash
   npm run dev
   ```

---

## ☁️ Deploy na Vercel

O projeto já está estruturado para deploy imediato na **Vercel**:
- O arquivo `vercel.json` direciona todas as chamadas `/api/*` para a Serverless Function em `api/index.ts` e as demais rotas para a SPA React (`index.html`).
- Na painel da Vercel (**Settings → Environment Variables**), configure:
  - `MONGODB_URI`: Sua string de conexão do MongoDB Atlas
  - `JWT_SECRET`: Chave secreta para assinatura dos tokens JWT
  - `VITE_CLOUDINARY_CLOUD_NAME` e `VITE_CLOUDINARY_UPLOAD_PRESET` *(opcionais)*

