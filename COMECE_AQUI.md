# 🚀 COMECE AQUI - Instalação Rápida

## Para os impacientes: 3 passos

### Passo 1: Execute o script automatizado

#### No macOS/Linux:
```bash
curl -fsSL https://raw.githubusercontent.com/danielmedeiros22/task-manager-app/main/install-complete.sh | bash
```

Ou baixe e execute manualmente:
```bash
git clone https://github.com/danielmedeiros22/task-manager-app.git
cd task-manager-app
chmod +x install-complete.sh
./install-complete.sh
```

#### No Windows (PowerShell):
```powershell
git clone https://github.com/danielmedeiros22/task-manager-app.git
cd task-manager-app
npm install
cd ios && pod install && cd ..
```

### Passo 2: Configurar Firebase (OBRIGATÓRIO)

Depois que o script terminar:

1. **Abra o arquivo `.env`:**
   ```bash
   # macOS/Linux
   nano .env
   
   # Windows (Notepad)
   notepad .env
   ```

2. **Preencha com suas credenciais do Firebase:**
   - Acesse https://console.firebase.google.com
   - Abra seu projeto
   - Vá em "Configurações do projeto" (engrenagem)
   - Copie os valores para o `.env`

3. **Copie os arquivos de configuração:**
   ```bash
   # Para Android:
   cp google-services.json android/app/
   
   # Para iOS (macOS):
   cp GoogleService-Info.plist ios/TaskManager/
   ```

### Passo 3: Rodar o app

#### Terminal 1 - Iniciar servidor:
```bash
cd task-manager-app
npm start
```

Mantenha este terminal aberto. Você verá:
```
Metro Bundler ready.
Press i for iOS, a for android, or q to quit.
```

#### Terminal 2 - Rodar no emulador:

**Android:**
```bash
npm run android
```

**iOS (macOS):**
```bash
npm run ios
```

---

## ✓ Pronto!

Se tudo deu certo, o app deve abrir no seu emulador em alguns segundos.

---

## 🔧 Se algo não funcionar

### "command not found: node"
```bash
# Instale Node.js em https://nodejs.org/
# Versão mínima: 16
node -v  # Deve ser v16+
```

### "command not found: git"
```bash
# Instale Git em https://git-scm.com/
git --version
```

### "Android SDK not found"
```bash
# Defina ANDROID_HOME
export ANDROID_HOME=$HOME/Library/Android/sdk  # macOS
export ANDROID_HOME=$HOME/Android/Sdk          # Linux

# Adicione ao ~/.zshrc ou ~/.bashrc para usar sempre
echo 'export ANDROID_HOME=$HOME/Library/Android/sdk' >> ~/.zshrc
```

### "pod: command not found"
```bash
# Instale CocoaPods (macOS)
sudo gem install cocoapods
```

### "Build failed"
```bash
# Limpe tudo e tente novamente
npm run clean
npm start
```

### "Metro timeout"
```bash
# Limpe o cache do bundler
npm run clean:cache
npm start -- --reset-cache
```

---

## 📱 Testando a Sincronização

Depois que o app estiver rodando:

1. **Abra o app no emulador**
2. **Crie uma tarefa:**
   - Clique em "+ Nova"
   - Preencha o título
   - Clique em "Criar tarefa"

3. **Configure a conta Gmail:**
   - Vá em "Configurações"
   - Preencha com seu email
   - Clique em "Salvar"

4. **Veja as estatísticas:**
   - Volte a "Resumo"
   - Veja as tarefas do dia/semana/mês

---

## 📂 Estrutura do Projeto

```
task-manager-app/
├── src/
│   ├── TaskManager.jsx       ← Componente principal
│   └── services/
│       └── FirebaseService.ts ← Sincronização
├── android/                   ← Código nativo Android
├── ios/                       ← Código nativo iOS
├── .env                       ← Configurações (não fazer commit!)
├── package.json              ← Dependências
└── README.md                 ← Documentação completa
```

---

## 🎯 Comandos Principais

```bash
npm start           # Iniciar servidor Metro
npm run android     # Rodar no Android
npm run ios         # Rodar no iOS (macOS)
npm run lint        # Verificar código
npm run test        # Rodar testes
npm run clean       # Limpeza completa
```

---

## ⚠️ Importante

- **NÃO faça commit do arquivo `.env`** (já está no .gitignore)
- **Revogar o token GitHub** exposto anteriormente
- **Firebase é obrigatório** - configure antes de rodar
- **iOS só funciona em macOS** com Xcode

---

## 🆘 Ainda não funciona?

1. Leia `SETUP_LOCAL.md` (guia completo)
2. Verifique a seção "Troubleshooting" em `README.md`
3. Abra uma issue: https://github.com/danielmedeiros22/task-manager-app/issues

---

## 🎉 Sucesso!

Se o app abriu no emulador e você conseguiu criar uma tarefa:

**Parabéns! 🎊**

Próximos passos:
- [ ] Testar sincronização com conta Google
- [ ] Explorar as funcionalidades
- [ ] Fazer customizações no código
- [ ] Ler a documentação completa

Happy coding! 🚀
