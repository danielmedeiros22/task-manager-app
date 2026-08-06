# Gerenciador de Tarefas - Guia de Instalação

## 📋 Requisitos
- Node.js 16+ e npm/yarn
- React Native CLI
- Xcode (para iOS)
- Android Studio (para Android)
- Conta do Google/Gmail

## 🚀 Instalação Inicial

### 1. Criar projeto React Native
```bash
npx react-native init TaskManager
cd TaskManager
```

### 2. Instalar dependências
```bash
npm install @react-native-async-storage/async-storage
npm install @react-native-community/datetimepicker
npm install date-fns
npm install @react-native-firebase/app
npm install @react-native-firebase/auth
npm install @react-native-firebase/database
```

### 3. Configurar Firebase (Sincronização em Nuvem)

#### Criar projeto no Firebase:
1. Acesse [Firebase Console](https://console.firebase.google.com)
2. Clique em "Criar projeto"
3. Nome: "TaskManager"
4. Ative Google Analytics (opcional)

#### Adicionar app iOS:
1. No console, clique em "iOS"
2. Bundle ID: `com.taskmanager.ios`
3. Baixe `GoogleService-Info.plist`
4. Copie para `ios/TaskManager/`

#### Adicionar app Android:
1. No console, clique em "Android"
2. Package name: `com.taskmanager`
3. SHA-1: Execute `cd android && ./gradlew signingReport`
4. Baixe `google-services.json`
5. Copie para `android/app/`

### 4. Configurar Banco de Dados Realtime Firebase

No Firebase Console:
1. Acesse "Realtime Database"
2. Clique "Criar Banco de Dados"
3. Escolha "Iniciar no modo de teste"
4. Regras de segurança:
```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid"
      }
    }
  }
}
```

## 🔐 Configurar Autenticação Gmail

### iOS
No `ios/TaskManager/Info.plist` adicione:
```xml
<key>CFBundleURLTypes</key>
<array>
  <dict>
    <key>CFBundleURLSchemes</key>
    <array>
      <string>com.googleusercontent.apps.YOUR_CLIENT_ID</string>
    </array>
  </dict>
</array>
```

### Android
No `android/app/build.gradle`:
```gradle
dependencies {
  implementation 'com.google.android.gms:play-services-auth:20.4.0'
}
```

## 📱 Estrutura do Projeto

```
TaskManager/
├── App.tsx
├── src/
│   ├── components/
│   │   ├── TaskCard.tsx
│   │   ├── StatCard.tsx
│   │   └── TaskForm.tsx
│   ├── screens/
│   │   ├── OverviewScreen.tsx
│   │   ├── TasksListScreen.tsx
│   │   └── SettingsScreen.tsx
│   ├── services/
│   │   ├── FirebaseService.ts
│   │   ├── StorageService.ts
│   │   └── SyncService.ts
│   └── types/
│       └── Task.ts
├── android/
├── ios/
└── package.json
```

## 🔄 Sincronização com Nuvem

### LocalStorage (AsyncStorage)
- Armazena tarefas localmente
- Carregamento instantâneo
- Funciona offline

### Firebase Cloud
- Sincroniza entre dispositivos
- Backup automático
- Acesso via conta Gmail
- Real-time updates

## 🛠️ Compilar e Executar

### iOS
```bash
npx react-native run-ios
```

### Android
```bash
npx react-native run-android
```

### Build para produção iOS
```bash
cd ios
pod install
xcodebuild -workspace TaskManager.xcworkspace -scheme TaskManager -configuration Release
```

### Build para produção Android
```bash
cd android
./gradlew assembleRelease
```

## 📊 Funcionalidades Implementadas

✅ **Gerenciamento de Tarefas**
- Criar, editar, deletar tarefas
- Status (Pendente, Em progresso, Concluída)
- Prioridade (Baixa, Média, Alta)
- Datas de vencimento
- Descrições

✅ **Visão Geral**
- Resumo por período (dia, semana, mês)
- Gráficos de progresso
- Próximas tarefas
- Estatísticas em tempo real

✅ **Sincronização**
- AsyncStorage para armazenamento local
- Firebase para nuvem
- Autenticação com Gmail
- Sincronização automática

✅ **Interface**
- Design limpo e responsivo
- Navegação por abas
- Modal para criar tarefas
- Cores intuitivas por status

## 🔒 Segurança

- Dados criptografados no Firebase
- Autenticação OAuth com Google
- Acesso apenas ao próprio usuário
- Conexão HTTPS obrigatória

## 📞 Troubleshooting

### Android não compila
```bash
cd android
./gradlew clean
./gradlew build
```

### iOS não reconhece Firebase
```bash
cd ios
pod deintegrate
pod install
```

### Sincronização não funciona
1. Verifique conexão internet
2. Confirme credenciais Firebase
3. Verifique permissões do banco de dados

## 🎯 Próximas Melhorias

- Notificações push
- Compartilhamento de tarefas
- Categorias/Projetos
- Busca e filtros avançados
- Modo escuro
- Backup automático em nuvem
- Integração com calendário
- Relatórios detalhados

## 📚 Referências

- [React Native Docs](https://reactnative.dev/)
- [Firebase Docs](https://firebase.google.com/docs)
- [AsyncStorage](https://react-native-async-storage.github.io/async-storage/)
- [React Native DateTimePicker](https://github.com/react-native-datetimepicker/datetimepicker)
