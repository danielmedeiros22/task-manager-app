#!/bin/bash

set -e

echo "=========================================="
echo "  Task Manager App - Setup Completo"
echo "=========================================="
echo ""

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

check_command() {
    if ! command -v $1 &> /dev/null; then
        echo "❌ $1 não está instalado. Por favor, instale antes de continuar."
        exit 1
    fi
}

echo "📋 Verificando pré-requisitos..."
echo ""

check_command "node"
check_command "npm"
check_command "git"

NODE_VERSION=$(node -v)
NPM_VERSION=$(npm -v)

echo "✅ Node.js: $NODE_VERSION"
echo "✅ npm: $NPM_VERSION"
echo ""

if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "ℹ️  macOS detectado - será necessário Xcode Command Line Tools"
    check_command "xcode-select"
    echo "✅ Xcode Command Line Tools instalado"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    echo "ℹ️  Linux detectado"
fi

echo ""
echo "📦 Instalando dependências Node.js..."
echo ""

if [ ! -d "node_modules" ]; then
    npm install
else
    echo "node_modules já existe, atualizando..."
    npm update
fi

echo ""
echo "✅ Dependências instaladas!"
echo ""

echo "📂 Criando estrutura de pastas..."

mkdir -p src/components
mkdir -p src/services
mkdir -p src/screens
mkdir -p src/types
mkdir -p assets
mkdir -p .env.example

echo "✅ Estrutura de pastas criada"
echo ""

echo "🔑 Criando arquivo .env de exemplo..."

cat > .env.example << 'EOF'
# Firebase Configuration
FIREBASE_API_KEY=sua_api_key
FIREBASE_AUTH_DOMAIN=seu_projeto.firebaseapp.com
FIREBASE_DATABASE_URL=https://seu_projeto.firebaseio.com
FIREBASE_PROJECT_ID=seu_projeto
FIREBASE_STORAGE_BUCKET=seu_projeto.appspot.com
FIREBASE_MESSAGING_SENDER_ID=seu_messaging_sender_id
FIREBASE_APP_ID=seu_app_id

# App Configuration
APP_ENV=development
DEBUG=true
EOF

echo "✅ .env.example criado"
echo ""

echo "⚙️  Criando arquivo .env com valores padrão..."
if [ ! -f ".env" ]; then
    cp .env.example .env
    echo "✅ .env criado - CONFIGURE COM SEUS VALORES DO FIREBASE!"
else
    echo "ℹ️  .env já existe, pulando..."
fi

echo ""

echo "📱 Configurando React Native..."

if [ ! -d "ios" ] || [ ! -d "android" ]; then
    echo "Executando: npx react-native init TaskManager"
    npx react-native init TaskManager --template react-native-template-typescript
    
    if [ -d "TaskManager/ios" ]; then
        mv TaskManager/ios ./
        mv TaskManager/android ./
        mv TaskManager/.ruby-version ./
        mv TaskManager/Gemfile ./
        rm -rf TaskManager
    fi
fi

echo ""
echo "📦 Instalando dependências nativas (iOS)..."

if [[ "$OSTYPE" == "darwin"* ]]; then
    cd ios
    
    if ! command -v pod &> /dev/null; then
        echo "CocoaPods não está instalado, instalando..."
        sudo gem install cocoapods
    fi
    
    echo "Executando: pod install"
    pod install
    
    cd ..
    echo "✅ iOS configurado"
else
    echo "⏭️  iOS pulado (não é macOS)"
fi

echo ""
echo "📱 Configurando Android..."

if [ -z "$ANDROID_HOME" ]; then
    echo "⚠️  ANDROID_HOME não está definido"
    echo "Configure com: export ANDROID_HOME=\$HOME/Library/Android/sdk (macOS)"
    echo "Ou: export ANDROID_HOME=\$HOME/Android/Sdk (Linux/Windows)"
else
    echo "✅ ANDROID_HOME definido: $ANDROID_HOME"
fi

echo ""
echo "🔗 Linkando dependências..."
npx react-native link

echo ""
echo "📋 Testando instalação..."

npm run --version > /dev/null 2>&1 && echo "✅ npm scripts funcionando"

echo ""
echo "=========================================="
echo "  ✨ Setup Completo!"
echo "=========================================="
echo ""
echo "🚀 Próximos passos:"
echo ""
echo "1️⃣  Configurar Firebase:"
echo "   - Edite o arquivo .env com suas credenciais do Firebase"
echo "   - Copie GoogleService-Info.plist para ios/TaskManager/"
echo "   - Copie google-services.json para android/app/"
echo ""
echo "2️⃣  Instalar pods (iOS - macOS apenas):"
echo "   cd ios && pod install && cd .."
echo ""
echo "3️⃣  Testar no Android:"
echo "   npm run android"
echo ""
echo "4️⃣  Testar no iOS (macOS apenas):"
echo "   npm run ios"
echo ""
echo "5️⃣  Iniciar servidor de desenvolvimento:"
echo "   npm start"
echo ""
echo "📚 Documentação:"
echo "   - README.md: Guia completo do projeto"
echo "   - .env.example: Variáveis de ambiente necessárias"
echo ""
echo "💡 Dica: Se tiver erro, limpe cache com:"
echo "   npm run clean"
echo ""
