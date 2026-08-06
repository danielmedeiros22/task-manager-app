# Setup Local - Task Manager App

## 📋 Pré-requisitos

### Obrigatório (para ambos iOS e Android)
- Node.js 16+ ([download](https://nodejs.org/))
- npm 8+ (vem com Node.js)
- Git ([download](https://git-scm.com/))
- Uma conta do GitHub com acesso ao repositório

### Para Android
- Android Studio 4.2+ ([download](https://developer.android.com/studio))
- Android SDK (instalado com Android Studio)
- JDK 11 ou superior ([download](https://www.oracle.com/java/))

### Para iOS (apenas macOS)
- macOS 12.0+
- Xcode 13+ ([download na App Store](https://apps.apple.com/br/app/xcode/id497799835))
- CocoaPods (`sudo gem install cocoapods`)
- Ruby 2.7+

## 🚀 Instalação Passo a Passo

### 1. Clonar o repositório

```bash
git clone https://github.com/danielmedeiros22/task-manager-app.git
cd task-manager-app
```

### 2. Executar script de setup (Recomendado)

```bash
chmod +x setup.sh
./setup.sh
```

Ou fazer manualmente:

### 3. Instalar dependências Node.js (Manual)

```bash
npm install
```

### 4. Criar arquivo .env

```bash
cp .env.example .env
```

Edite `.env` com suas credenciais do Firebase:

```env
FIREBASE_API_KEY=sua_api_key_aqui
FIREBASE_AUTH_DOMAIN=seu-projeto.firebaseapp.com
FIREBASE_DATABASE_URL=https://seu-projeto.firebaseio.com
FIREBASE_PROJECT_ID=seu-projeto
FIREBASE_STORAGE_BUCKET=seu-projeto.appspot.com
FIREBASE_MESSAGING_SENDER_ID=seu_messaging_sender_id
FIREBASE_APP_ID=seu_app_id
```

## 🔧 Configuração por Plataforma

### Android

#### 1. Definir ANDROID_HOME

**Linux/macOS:**
```bash
export ANDROID_HOME=$HOME/Library/Android/sdk  # macOS
export ANDROID_HOME=$HOME/Android/Sdk          # Linux
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

Adicione ao seu `~/.bash_profile` ou `~/.zshrc`:
```bash
echo 'export ANDROID_HOME=$HOME/Library/Android/sdk' >> ~/.bash_profile
```

**Windows:**
```
Adicione em Variáveis de Ambiente do Sistema:
ANDROID_HOME=C:\Users\VossoUsuario\AppData\Local\Android\Sdk
```

#### 2. Copiar arquivo de configuração do Firebase

```bash
cp google-services.json android/app/
```

#### 3. Configurar gradle.properties

`android/gradle.properties`:
```properties
org.gradle.jvmargs=-Xmx2048m -XX:MaxPermSize=512m

android.useAndroidX=true
android.enableJetifier=true

MYAPP_RELEASE_STORE_FILE=my-release-key.keystore
MYAPP_RELEASE_KEY_ALIAS=my-key-alias
MYAPP_RELEASE_STORE_PASSWORD=***
MYAPP_RELEASE_KEY_PASSWORD=***
```

#### 4. Criar emulador (opcional, se não tiver dispositivo)

```bash
# Listar devices disponíveis
emulator -list-avds

# Criar novo (via Android Studio ou CLI)
sdkmanager "system-images;android-31;google_apis;x86_64"
avdmanager create avd -n Pixel4 -k "system-images;android-31;google_apis;x86_64"

# Iniciar emulador
emulator -avd Pixel4
```

#### 5. Testar Android

```bash
npm run android
```

### iOS (apenas macOS)

#### 1. Copiar arquivo de configuração do Firebase

```bash
cp GoogleService-Info.plist ios/TaskManager/
```

#### 2. Instalar CocoaPods

```bash
sudo gem install cocoapods
cd ios
pod install
cd ..
```

#### 3. Abrir projeto no Xcode

```bash
open ios/TaskManager.xcworkspace
```

⚠️ **Importante:** Abra o arquivo `.xcworkspace`, não `.xcodeproj`

#### 4. Configurar Signing & Capabilities

1. Selecione o projeto no Xcode
2. Vá para "Build Settings"
3. Configure "Team" com sua Apple Developer Account
4. Configure o Bundle Identifier: `com.taskmanager.ios`

#### 5. Testar iOS

```bash
npm run ios
```

Ou pelo Xcode:
1. Selecione o scheme TaskManager
2. Selecione um simulator (iPhone 13, 14, etc)
3. Pressione Run (cmd + R)

## 💻 Rodando o Projeto

### Iniciar servidor Metro (necessário)

```bash
npm start
```

Mantenha este terminal aberto.

### Em outro terminal, escolha a plataforma:

**Android:**
```bash
npm run android
```

**iOS:**
```bash
npm run ios
```

**Desenvolvimento com hot reload:**
```bash
npm run dev
```

## 🧹 Limpeza e Troubleshooting

### Limpar cache do bundler
```bash
npm run clean:cache
```

### Limpeza completa (Android)
```bash
cd android && ./gradlew clean && cd ..
rm -rf node_modules
npm install
```

### Limpeza completa (iOS)
```bash
cd ios
rm -rf Pods
rm -rf Podfile.lock
pod install
cd ..
```

### Erro: "Build failed" (Android)

```bash
cd android
./gradlew clean
./gradlew build
cd ..
```

### Erro: "Pod install fails" (iOS)

```bash
cd ios
rm -rf Pods
rm -rf Podfile.lock
pod repo update
pod install
cd ..
```

### Erro: "Metro bundler timeout"

1. Aumente o timeout:
```bash
npm start -- --reset-cache
```

2. Limpe o cache manualmente:
```bash
rm -rf /tmp/metro-bundler-cache-*
```

### Erro: "Cannot find module"

```bash
# Limpe node_modules e reinstale
rm -rf node_modules package-lock.json
npm install
```

## 🔍 Verificar Instalação

```bash
# Verificar Node
node -v  # v16+

# Verificar npm
npm -v   # 8+

# Verificar dependências instaladas
npm list --depth=0

# Verificar Firebase config
cat .env | grep FIREBASE
```

## 📱 Testando no Dispositivo Real

### Android

1. Conecte via USB e ative "USB Debugging" nas configurações do desenvolvedor
2. Execute:
```bash
adb devices
npm run android
```

### iOS

1. Conecte o iPhone via cabo USB
2. Abra Xcode: `open ios/TaskManager.xcworkspace`
3. Selecione seu dispositivo em "Build Settings"
4. Pressione Run

## 📚 Scripts Úteis

```bash
npm run lint          # Verificar código
npm run lint:fix      # Corrigir erros de lint
npm run test          # Rodar testes
npm run type-check    # Verificar tipos TypeScript
npm run clean         # Limpeza completa
npm run clean:all     # Limpeza agressiva (macOS)
```

## 🆘 Pedir Ajuda

Se tiver problemas:

1. Verifique a seção de Troubleshooting
2. Verifique os logs:
   - Android: `adb logcat`
   - iOS: Xcode Console
3. Abra uma issue no GitHub
4. Verifique versões instaladas com os comandos da seção "Verificar Instalação"

## ✅ Próximos Passos

- [ ] Configurar Firebase
- [ ] Testar no emulador Android
- [ ] Testar no emulador iOS (macOS)
- [ ] Sincronizar com conta Gmail
- [ ] Adicionar tarefas de teste
- [ ] Verificar armazenamento local

## 📖 Referências

- [React Native Docs](https://reactnative.dev/docs/getting-started)
- [Firebase Setup](https://firebase.google.com/docs/react-native/setup)
- [Android Studio Setup](https://developer.android.com/studio/intro)
- [Xcode Help](https://developer.apple.com/support/xcode/)
- [CocoaPods Guide](https://guides.cocoapods.org/)
