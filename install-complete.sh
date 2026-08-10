#!/bin/bash

###############################################
# Task Manager App - SCRIPT COMPLETO DE INSTALAÇÃO
# Este script faz tudo automaticamente
###############################################

set -e

REPO_URL="https://github.com/danielmedeiros22/task-manager-app.git"
PROJECT_DIR="task-manager-app"
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
echo "╔════════════════════════════════════════╗"
echo "║  Task Manager App - Setup Completo     ║"
echo "║  Instalação Automatizada               ║"
echo "╚════════════════════════════════════════╝"
echo -e "${NC}"
echo ""

###############################################
# FUNÇÕES
###############################################

print_step() {
    echo -e "${BLUE}➜${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

check_command() {
    if ! command -v $1 &> /dev/null; then
        print_error "$1 não está instalado"
        return 1
    fi
    return 0
}

###############################################
# 1. VERIFICAR PRÉ-REQUISITOS
###############################################

print_step "ETAPA 1: Verificando pré-requisitos..."
echo ""

if ! check_command "git"; then
    print_error "Git não está instalado. Instale em: https://git-scm.com/download"
    exit 1
fi
print_success "Git"

if ! check_command "node"; then
    print_error "Node.js não está instalado. Instale em: https://nodejs.org/"
    exit 1
fi
NODE_VERSION=$(node -v)
print_success "Node.js $NODE_VERSION"

if ! check_command "npm"; then
    print_error "npm não está instalado"
    exit 1
fi
NPM_VERSION=$(npm -v)
print_success "npm $NPM_VERSION"

echo ""

# Verificar versão do Node
if [[ ! $(node -v) =~ v1[6-9] ]] && [[ ! $(node -v) =~ v2[0-9] ]]; then
    print_warning "Node.js 16+ é recomendado. Você tem $(node -v)"
fi

# Verificar se é macOS
if [[ "$OSTYPE" == "darwin"* ]]; then
    print_success "macOS detectado"
    if ! check_command "xcode-select"; then
        print_error "Xcode Command Line Tools não está instalado"
        exit 1
    fi
    print_success "Xcode Command Line Tools"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    print_success "Linux detectado"
elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]]; then
    print_success "Windows detectado"
else
    print_warning "SO não detectado corretamente"
fi

echo ""

###############################################
# 2. CLONAR REPOSITÓRIO
###############################################

print_step "ETAPA 2: Clonando repositório..."
echo ""

if [ -d "$PROJECT_DIR" ]; then
    print_warning "Diretório $PROJECT_DIR já existe"
    read -p "Deseja remover e clonar novamente? (s/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Ss]$ ]]; then
        rm -rf "$PROJECT_DIR"
        git clone "$REPO_URL" "$PROJECT_DIR"
        print_success "Repositório clonado"
    else
        print_success "Usando diretório existente"
    fi
else
    git clone "$REPO_URL" "$PROJECT_DIR"
    print_success "Repositório clonado"
fi

cd "$PROJECT_DIR"
echo ""

###############################################
# 3. INSTALAR DEPENDÊNCIAS NPM
###############################################

print_step "ETAPA 3: Instalando dependências npm..."
echo ""

npm install
print_success "Dependências npm instaladas"
echo ""

###############################################
# 4. CRIAR ESTRUTURA DE PASTAS
###############################################

print_step "ETAPA 4: Criando estrutura de pastas..."
echo ""

mkdir -p src/components
mkdir -p src/services
mkdir -p src/screens
mkdir -p src/types
mkdir -p assets
print_success "Pastas criadas"
echo ""

###############################################
# 5. CONFIGURAR .ENV
###############################################

print_step "ETAPA 5: Configurando arquivo .env..."
echo ""

if [ -f ".env" ]; then
    print_warning ".env já existe"
else
    cp .env.example .env
    print_success ".env criado"
    echo ""
    print_warning "⚠️  IMPORTANTE:"
    echo "   Você precisa editar o arquivo .env com suas credenciais do Firebase:"
    echo "   - FIREBASE_API_KEY"
    echo "   - FIREBASE_AUTH_DOMAIN"
    echo "   - FIREBASE_DATABASE_URL"
    echo "   - etc..."
    echo ""
    echo "   Abra o arquivo .env e preencha com seus valores."
    echo ""
fi

###############################################
# 6. CONFIGURAR ANDROID
###############################################

print_step "ETAPA 6: Verificando configuração Android..."
echo ""

if [ -z "$ANDROID_HOME" ]; then
    print_warning "ANDROID_HOME não está definido"
    echo ""
    echo "Configure com um dos comandos abaixo:"
    if [[ "$OSTYPE" == "darwin"* ]]; then
        echo "  export ANDROID_HOME=\$HOME/Library/Android/sdk"
        echo "  echo 'export ANDROID_HOME=\$HOME/Library/Android/sdk' >> ~/.zshrc"
    else
        echo "  export ANDROID_HOME=\$HOME/Android/Sdk"
        echo "  echo 'export ANDROID_HOME=\$HOME/Android/Sdk' >> ~/.bashrc"
    fi
    echo ""
else
    print_success "ANDROID_HOME configurado: $ANDROID_HOME"
fi

echo ""

###############################################
# 7. CONFIGURAR iOS (macOS)
###############################################

if [[ "$OSTYPE" == "darwin"* ]]; then
    print_step "ETAPA 7: Configurando iOS (CocoaPods)..."
    echo ""
    
    if ! check_command "pod"; then
        print_warning "CocoaPods não está instalado"
        read -p "Deseja instalar CocoaPods? (s/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Ss]$ ]]; then
            sudo gem install cocoapods
            print_success "CocoaPods instalado"
        fi
    else
        print_success "CocoaPods já instalado"
    fi
    
    echo ""
    print_step "Instalando pods do iOS..."
    cd ios
    pod install
    cd ..
    print_success "Pods instalados"
    echo ""
else
    print_warning "iOS pulado (não é macOS)"
    echo ""
fi

###############################################
# 8. VERIFICAÇÃO FINAL
###############################################

print_step "ETAPA 8: Verificação final..."
echo ""

# Verificar package.json
if [ -f "package.json" ]; then
    print_success "package.json encontrado"
fi

# Verificar node_modules
if [ -d "node_modules" ]; then
    print_success "node_modules instalado"
fi

# Verificar .env
if [ -f ".env" ]; then
    print_success ".env configurado"
fi

# Verificar estrutura
if [ -d "src" ]; then
    print_success "src/ criado"
fi

echo ""

###############################################
# 9. PRÓXIMOS PASSOS
###############################################

echo -e "${GREEN}╔════════════════════════════════════════╗"
echo "║  ✓ Setup Completo!                    ║"
echo "╚════════════════════════════════════════╝${NC}"
echo ""

echo -e "${YELLOW}📋 PRÓXIMOS PASSOS:${NC}"
echo ""

echo "1️⃣  Configurar Firebase:"
echo "   - Abra: $PROJECT_DIR/.env"
echo "   - Preencha com suas credenciais do Firebase"
echo "   - Copie google-services.json para android/app/"
echo "   - Copie GoogleService-Info.plist para ios/TaskManager/ (macOS)"
echo ""

echo "2️⃣  Iniciar servidor de desenvolvimento:"
echo "   cd $PROJECT_DIR"
echo "   npm start"
echo ""

echo "3️⃣  Em outro terminal, escolha a plataforma:"
echo "   npm run android     # Para Android"
echo "   npm run ios         # Para iOS (macOS)"
echo ""

echo "4️⃣  Comandos úteis:"
echo "   npm run lint        # Verificar código"
echo "   npm run test        # Rodar testes"
echo "   npm run clean       # Limpeza completa"
echo ""

echo -e "${BLUE}📚 Documentação:${NC}"
echo "   - SETUP_LOCAL.md - Guia detalhado"
echo "   - README.md - Visão geral do projeto"
echo "   - .env.example - Todos os parâmetros"
echo ""

echo -e "${YELLOW}⚠️  IMPORTANTE:${NC}"
echo "   - Revogar o token GitHub que foi exposto"
echo "   - Editar .env com suas credenciais ANTES de rodar"
echo "   - NÃO fazer commit de .env no GitHub"
echo ""

echo -e "${GREEN}✓ Pronto para começar!${NC}"
echo ""
