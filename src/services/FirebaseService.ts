import '@react-native-firebase/app';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import database from '@react-native-firebase/database';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
  createdAt: string;
  userId?: string;
}

class FirebaseService {
  private currentUser: FirebaseAuthTypes.User | null = null;

  constructor() {
    this.initializeAuth();
  }

  // Inicializar autenticação
  private initializeAuth() {
    auth().onAuthStateChanged(user => {
      this.currentUser = user;
      if (user) {
        console.log('Usuário autenticado:', user.email);
      }
    });
  }

  // Login com Gmail
  async loginWithGoogle() {
    try {
      const { user } = await auth().signInWithEmailAndPassword(
        'temp@gmail.com', 
        'password'
      );
      this.currentUser = user || null;
      return user;
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      throw error;
    }
  }

  // Login com email/senha
  async loginWithEmail(email: string, password: string) {
    try {
      const { user } = await auth().signInWithEmailAndPassword(email, password);
      this.currentUser = user || null;
      return user;
    } catch (error) {
      console.error('Erro ao fazer login com email:', error);
      throw error;
    }
  }

  // Criar conta
  async signUp(email: string, password: string) {
    try {
      const { user } = await auth().createUserWithEmailAndPassword(email, password);
      this.currentUser = user || null;
      return user;
    } catch (error) {
      console.error('Erro ao criar conta:', error);
      throw error;
    }
  }

  // Logout
  async logout() {
    try {
      await auth().signOut();
      this.currentUser = null;
      return true;
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      throw error;
    }
  }

  // Obter usuário atual
  getCurrentUser() {
    return this.currentUser;
  }

  // Sincronizar tarefas com Firebase
  async syncTasksToCloud(tasks: Task[]) {
    try {
      if (!this.currentUser) {
        console.warn('Usuário não autenticado, salvando localmente apenas');
        return false;
      }

      const userId = this.currentUser.uid;
      const tasksRef = database().ref(`users/${userId}/tasks`);
      
      // Preparar dados para Firebase
      const tasksData = tasks.reduce((acc, task) => {
        acc[task.id] = {
          ...task,
          dueDate: task.dueDate.toString(),
          createdAt: task.createdAt.toString(),
        };
        return acc;
      }, {} as Record<string, any>);

      // Enviar para Firebase
      await tasksRef.set(tasksData);
      console.log('Tarefas sincronizadas com sucesso');
      return true;
    } catch (error) {
      console.error('Erro ao sincronizar tarefas:', error);
      return false;
    }
  }

  // Obter tarefas da nuvem
  async getTasksFromCloud(): Promise<Task[]> {
    try {
      if (!this.currentUser) {
        console.warn('Usuário não autenticado');
        return [];
      }

      const userId = this.currentUser.uid;
      const tasksRef = database().ref(`users/${userId}/tasks`);
      const snapshot = await tasksRef.once('value');
      
      if (!snapshot.exists()) {
        return [];
      }

      const tasksData = snapshot.val();
      const tasks: Task[] = Object.entries(tasksData).map(([id, data]: [string, any]) => ({
        id,
        ...data,
        dueDate: new Date(data.dueDate),
        createdAt: new Date(data.createdAt),
      }));

      return tasks;
    } catch (error) {
      console.error('Erro ao obter tarefas da nuvem:', error);
      return [];
    }
  }

  // Adicionar tarefa na nuvem
  async addTaskToCloud(task: Task): Promise<boolean> {
    try {
      if (!this.currentUser) {
        return false;
      }

      const userId = this.currentUser.uid;
      const taskRef = database().ref(`users/${userId}/tasks/${task.id}`);
      
      await taskRef.set({
        ...task,
        dueDate: task.dueDate.toString(),
        createdAt: task.createdAt.toString(),
      });

      console.log('Tarefa adicionada na nuvem:', task.id);
      return true;
    } catch (error) {
      console.error('Erro ao adicionar tarefa na nuvem:', error);
      return false;
    }
  }

  // Atualizar tarefa na nuvem
  async updateTaskInCloud(taskId: string, updates: Partial<Task>): Promise<boolean> {
    try {
      if (!this.currentUser) {
        return false;
      }

      const userId = this.currentUser.uid;
      const taskRef = database().ref(`users/${userId}/tasks/${taskId}`);
      
      const processedUpdates = {
        ...updates,
        dueDate: updates.dueDate?.toString?.() || updates.dueDate,
        createdAt: updates.createdAt?.toString?.() || updates.createdAt,
      };

      await taskRef.update(processedUpdates);
      console.log('Tarefa atualizada na nuvem:', taskId);
      return true;
    } catch (error) {
      console.error('Erro ao atualizar tarefa na nuvem:', error);
      return false;
    }
  }

  // Deletar tarefa da nuvem
  async deleteTaskFromCloud(taskId: string): Promise<boolean> {
    try {
      if (!this.currentUser) {
        return false;
      }

      const userId = this.currentUser.uid;
      const taskRef = database().ref(`users/${userId}/tasks/${taskId}`);
      
      await taskRef.remove();
      console.log('Tarefa deletada da nuvem:', taskId);
      return true;
    } catch (error) {
      console.error('Erro ao deletar tarefa da nuvem:', error);
      return false;
    }
  }

  // Ouvir mudanças em tempo real
  onTasksChanged(callback: (tasks: Task[]) => void) {
    try {
      if (!this.currentUser) {
        console.warn('Usuário não autenticado');
        return () => {};
      }

      const userId = this.currentUser.uid;
      const tasksRef = database().ref(`users/${userId}/tasks`);

      const unsubscribe = tasksRef.on('value', snapshot => {
        if (snapshot.exists()) {
          const tasksData = snapshot.val();
          const tasks: Task[] = Object.entries(tasksData).map(([id, data]: [string, any]) => ({
            id,
            ...data,
            dueDate: new Date(data.dueDate),
            createdAt: new Date(data.createdAt),
          }));
          callback(tasks);
        } else {
          callback([]);
        }
      });

      // Retornar função para remover listener
      return () => {
        tasksRef.off('value', unsubscribe);
      };
    } catch (error) {
      console.error('Erro ao ouvir mudanças:', error);
      return () => {};
    }
  }

  // Obter email do usuário
  getUserEmail(): string | null {
    return this.currentUser?.email || null;
  }

  // Verificar se está autenticado
  isAuthenticated(): boolean {
    return this.currentUser !== null;
  }
}

// Serviço de sincronização
class SyncService {
  private firebaseService: FirebaseService;
  private syncInterval: NodeJS.Timeout | null = null;
  private isSyncing = false;

  constructor() {
    this.firebaseService = new FirebaseService();
  }

  // Iniciar sincronização automática
  startAutoSync(interval: number = 5000) {
    this.syncInterval = setInterval(() => {
      this.syncWithCloud();
    }, interval);
  }

  // Parar sincronização automática
  stopAutoSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  // Sincronizar com nuvem
  async syncWithCloud() {
    if (this.isSyncing) return;

    try {
      this.isSyncing = true;

      // Obter tarefas locais
      const localTasksJson = await AsyncStorage.getItem('tasks');
      const localTasks = localTasksJson ? JSON.parse(localTasksJson) : [];

      // Sincronizar com Firebase se autenticado
      if (this.firebaseService.isAuthenticated()) {
        await this.firebaseService.syncTasksToCloud(localTasks);
        console.log('Sincronização com nuvem concluída');
      }

      this.isSyncing = false;
    } catch (error) {
      console.error('Erro durante sincronização:', error);
      this.isSyncing = false;
    }
  }

  // Obter dados da nuvem e mesclar com local
  async mergeCloudData() {
    try {
      // Obter tarefas locais
      const localTasksJson = await AsyncStorage.getItem('tasks');
      const localTasks = localTasksJson ? JSON.parse(localTasksJson) : [];

      // Obter tarefas da nuvem
      const cloudTasks = await this.firebaseService.getTasksFromCloud();

      // Mesclar: tarefas da nuvem sobrescrevem as locais com mesmo ID
      const mergedTasks = [...localTasks];
      
      cloudTasks.forEach(cloudTask => {
        const index = mergedTasks.findIndex(t => t.id === cloudTask.id);
        if (index >= 0) {
          mergedTasks[index] = cloudTask;
        } else {
          mergedTasks.push(cloudTask);
        }
      });

      // Salvar merged tasks
      await AsyncStorage.setItem('tasks', JSON.stringify(mergedTasks));
      return mergedTasks;
    } catch (error) {
      console.error('Erro ao mesclar dados:', error);
      return [];
    }
  }

  // Obter serviço Firebase
  getFirebaseService() {
    return this.firebaseService;
  }
}

export const firebaseService = new FirebaseService();
export const syncService = new SyncService();

export default {
  firebaseService,
  syncService,
};
