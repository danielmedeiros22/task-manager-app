import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Platform,
  StatusBar,
  FlatList,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetime-picker';
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';

const colors = {
  primary: '#4F46E5',
  secondary: '#8B5CF6',
  danger: '#EF4444',
  success: '#10B981',
  warning: '#F59E0B',
  background: '#F9FAFB',
  surface: '#FFFFFF',
  text: '#1F2937',
  textLight: '#6B7280',
  border: '#E5E7EB',
};

const TaskManager = () => {
  const [tasks, setTasks] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentTab, setCurrentTab] = useState('overview');
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    status: 'pending',
    priority: 'medium',
    dueDate: new Date(),
    createdAt: new Date(),
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [emailModalVisible, setEmailModalVisible] = useState(false);

  // Carregar dados ao iniciar
  useEffect(() => {
    loadData();
  }, []);

  // Sincronizar dados com nuvem
  useEffect(() => {
    if (userEmail) {
      syncWithCloud();
    }
  }, [tasks, userEmail]);

  const loadData = async () => {
    try {
      const savedTasks = await AsyncStorage.getItem('tasks');
      const savedEmail = await AsyncStorage.getItem('userEmail');
      
      if (savedTasks) setTasks(JSON.parse(savedTasks));
      if (savedEmail) setUserEmail(savedEmail);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  };

  const syncWithCloud = async () => {
    try {
      // Simular sincronização com Firebase/Gmail
      await AsyncStorage.setItem('tasks', JSON.stringify(tasks));
      console.log('Dados sincronizados com nuvem');
    } catch (error) {
      console.error('Erro ao sincronizar:', error);
    }
  };

  const addTask = async () => {
    if (!newTask.title.trim()) {
      Alert.alert('Erro', 'Por favor, insira um título para a tarefa');
      return;
    }

    const task = {
      id: Date.now().toString(),
      ...newTask,
      createdAt: new Date(),
    };

    const updatedTasks = [...tasks, task];
    setTasks(updatedTasks);
    await AsyncStorage.setItem('tasks', JSON.stringify(updatedTasks));

    setNewTask({
      title: '',
      description: '',
      status: 'pending',
      priority: 'medium',
      dueDate: new Date(),
      createdAt: new Date(),
    });
    setShowModal(false);
  };

  const updateTask = async (id, updates) => {
    const updatedTasks = tasks.map(task =>
      task.id === id ? { ...task, ...updates } : task
    );
    setTasks(updatedTasks);
    await AsyncStorage.setItem('tasks', JSON.stringify(updatedTasks));
  };

  const deleteTask = async (id) => {
    Alert.alert('Deletar tarefa', 'Tem certeza que deseja deletar esta tarefa?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Deletar',
        style: 'destructive',
        onPress: async () => {
          const updatedTasks = tasks.filter(task => task.id !== id);
          setTasks(updatedTasks);
          await AsyncStorage.setItem('tasks', JSON.stringify(updatedTasks));
        },
      },
    ]);
  };

  // Funções de estatísticas
  const getStatsByPeriod = (startDate, endDate) => {
    const filtered = tasks.filter(task => {
      const taskDate = new Date(task.dueDate);
      return taskDate >= startDate && taskDate <= endDate;
    });

    return {
      total: filtered.length,
      completed: filtered.filter(t => t.status === 'completed').length,
      pending: filtered.filter(t => t.status === 'pending').length,
      inProgress: filtered.filter(t => t.status === 'in-progress').length,
    };
  };

  const today = getStatsByPeriod(startOfDay(new Date()), endOfDay(new Date()));
  const thisWeek = getStatsByPeriod(startOfWeek(new Date()), endOfWeek(new Date()));
  const thisMonth = getStatsByPeriod(startOfMonth(new Date()), endOfMonth(new Date()));

  // Renderizar overview
  const renderOverview = () => (
    <ScrollView style={styles.scrollView}>
      <View style={styles.statsContainer}>
        <Text style={styles.sectionTitle}>Resumo geral</Text>

        {/* Cartões de período */}
        <View style={styles.periodStats}>
          <StatCard
            title="Hoje"
            total={today.total}
            completed={today.completed}
            pending={today.pending}
            color={colors.primary}
          />
          <StatCard
            title="Esta semana"
            total={thisWeek.total}
            completed={thisWeek.completed}
            pending={thisWeek.pending}
            color={colors.secondary}
          />
          <StatCard
            title="Este mês"
            total={thisMonth.total}
            completed={thisMonth.completed}
            pending={thisMonth.pending}
            color={colors.warning}
          />
        </View>

        {/* Gráfico de progresso */}
        <View style={styles.progressCard}>
          <Text style={styles.cardTitle}>Progresso geral</Text>
          <View style={styles.progressStats}>
            <ProgressStat
              label="Concluídas"
              value={tasks.filter(t => t.status === 'completed').length}
              total={tasks.length}
              color={colors.success}
            />
            <ProgressStat
              label="Em progresso"
              value={tasks.filter(t => t.status === 'in-progress').length}
              total={tasks.length}
              color={colors.warning}
            />
            <ProgressStat
              label="Pendentes"
              value={tasks.filter(t => t.status === 'pending').length}
              total={tasks.length}
              color={colors.danger}
            />
          </View>
        </View>

        {/* Próximas tarefas */}
        <View style={styles.upcomingCard}>
          <Text style={styles.cardTitle}>Próximas tarefas</Text>
          {tasks
            .filter(t => t.status !== 'completed')
            .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
            .slice(0, 5)
            .map(task => (
              <View key={task.id} style={styles.taskPreview}>
                <View>
                  <Text style={styles.taskPreviewTitle}>{task.title}</Text>
                  <Text style={styles.taskPreviewDate}>
                    {format(new Date(task.dueDate), 'dd/MM/yyyy')}
                  </Text>
                </View>
                <View style={[styles.statusBadge, getStatusColor(task.status)]}>
                  <Text style={styles.statusText}>{getStatusLabel(task.status)}</Text>
                </View>
              </View>
            ))}
        </View>
      </View>
    </ScrollView>
  );

  // Renderizar lista de tarefas
  const renderTasksList = () => (
    <FlatList
      data={tasks}
      keyExtractor={item => item.id}
      renderItem={({ item }) => (
        <View style={styles.taskCard}>
          <View style={styles.taskHeader}>
            <Text style={styles.taskTitle}>{item.title}</Text>
            <TouchableOpacity onPress={() => deleteTask(item.id)}>
              <Text style={styles.deleteBtn}>✕</Text>
            </TouchableOpacity>
          </View>
          {item.description ? (
            <Text style={styles.taskDescription}>{item.description}</Text>
          ) : null}
          <View style={styles.taskFooter}>
            <Text style={styles.taskDate}>
              {format(new Date(item.dueDate), 'dd/MM/yyyy')}
            </Text>
            <TouchableOpacity
              style={[styles.statusSelector, getStatusColor(item.status)]}
              onPress={() => {
                const statuses = ['pending', 'in-progress', 'completed'];
                const currentIndex = statuses.indexOf(item.status);
                const nextStatus = statuses[(currentIndex + 1) % statuses.length];
                updateTask(item.id, { status: nextStatus });
              }}
            >
              <Text style={styles.statusText}>{getStatusLabel(item.status)}</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      contentContainerStyle={styles.listContent}
    />
  );

  // Renderizar configurações
  const renderSettings = () => (
    <ScrollView style={styles.scrollView}>
      <View style={styles.settingsContainer}>
        <Text style={styles.sectionTitle}>Configurações</Text>

        <View style={styles.settingCard}>
          <Text style={styles.settingLabel}>Email da conta</Text>
          <Text style={styles.settingValue}>
            {userEmail || 'Não configurado'}
          </Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => setEmailModalVisible(true)}
          >
            <Text style={styles.buttonText}>
              {userEmail ? 'Alterar email' : 'Configurar email'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.settingCard}>
          <Text style={styles.settingLabel}>Sincronização</Text>
          <Text style={styles.settingValue}>
            Sincronizado com: {userEmail || 'Nenhum email'}
          </Text>
          <TouchableOpacity style={styles.button} onPress={syncWithCloud}>
            <Text style={styles.buttonText}>Sincronizar agora</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.settingCard}>
          <Text style={styles.settingLabel}>Total de tarefas</Text>
          <Text style={styles.settingValue}>{tasks.length}</Text>
        </View>
      </View>
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Gerenciador de Tarefas</Text>
          <Text style={styles.headerSubtitle}>
            {userEmail ? `Conectado a ${userEmail}` : 'Não sincronizado'}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowModal(true)}
        >
          <Text style={styles.addButtonText}>+ Nova</Text>
        </TouchableOpacity>
      </View>

      {/* Conteúdo principal */}
      {currentTab === 'overview' && renderOverview()}
      {currentTab === 'tasks' && renderTasksList()}
      {currentTab === 'settings' && renderSettings()}

      {/* Barra de navegação */}
      <View style={styles.navbar}>
        <NavButton
          label="Resumo"
          active={currentTab === 'overview'}
          onPress={() => setCurrentTab('overview')}
        />
        <NavButton
          label="Tarefas"
          active={currentTab === 'tasks'}
          onPress={() => setCurrentTab('tasks')}
        />
        <NavButton
          label="Configurações"
          active={currentTab === 'settings'}
          onPress={() => setCurrentTab('settings')}
        />
      </View>

      {/* Modal para adicionar tarefa */}
      <Modal visible={showModal} animationType="slide" transparent={false}>
        <View style={styles.container}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowModal(false)}>
              <Text style={styles.closeButton}>← Voltar</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Nova tarefa</Text>
            <View style={{ width: 50 }} />
          </View>

          <ScrollView style={styles.modalContent}>
            <TextInput
              style={styles.input}
              placeholder="Título da tarefa"
              value={newTask.title}
              onChangeText={text => setNewTask({ ...newTask, title: text })}
              placeholderTextColor={colors.textLight}
            />

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Descrição (opcional)"
              value={newTask.description}
              onChangeText={text => setNewTask({ ...newTask, description: text })}
              multiline
              placeholderTextColor={colors.textLight}
            />

            <View style={styles.formGroup}>
              <Text style={styles.label}>Prioridade</Text>
              <View style={styles.optionRow}>
                {['low', 'medium', 'high'].map(priority => (
                  <TouchableOpacity
                    key={priority}
                    style={[
                      styles.optionButton,
                      newTask.priority === priority && styles.optionButtonActive,
                    ]}
                    onPress={() => setNewTask({ ...newTask, priority })}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        newTask.priority === priority && styles.optionTextActive,
                      ]}
                    >
                      {priority === 'low' ? 'Baixa' : priority === 'medium' ? 'Média' : 'Alta'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Data de vencimento</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={styles.dateButtonText}>
                  {format(newTask.dueDate, 'dd/MM/yyyy')}
                </Text>
              </TouchableOpacity>
            </View>

            {showDatePicker && (
              <DateTimePicker
                value={newTask.dueDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(event, date) => {
                  if (date) setNewTask({ ...newTask, dueDate: date });
                  setShowDatePicker(false);
                }}
              />
            )}

            <TouchableOpacity style={styles.submitButton} onPress={addTask}>
              <Text style={styles.submitButtonText}>Criar tarefa</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>

      {/* Modal para configurar email */}
      <Modal visible={emailModalVisible} animationType="fade" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.emailModal}>
            <Text style={styles.emailModalTitle}>Configurar email</Text>
            <TextInput
              style={styles.emailInput}
              placeholder="seu.email@gmail.com"
              value={userEmail}
              onChangeText={setUserEmail}
              keyboardType="email-address"
              placeholderTextColor={colors.textLight}
            />
            <View style={styles.emailModalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setEmailModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={async () => {
                  await AsyncStorage.setItem('userEmail', userEmail);
                  setEmailModalVisible(false);
                }}
              >
                <Text style={styles.confirmButtonText}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

// Componentes auxiliares
const StatCard = ({ title, total, completed, pending, color }) => (
  <View style={[styles.statCard, { borderLeftColor: color }]}>
    <Text style={styles.statTitle}>{title}</Text>
    <View style={styles.statNumbers}>
      <View>
        <Text style={styles.statNumber}>{total}</Text>
        <Text style={styles.statLabel}>Total</Text>
      </View>
      <View>
        <Text style={[styles.statNumber, { color: colors.success }]}>{completed}</Text>
        <Text style={styles.statLabel}>Concluídas</Text>
      </View>
      <View>
        <Text style={[styles.statNumber, { color: colors.danger }]}>{pending}</Text>
        <Text style={styles.statLabel}>Pendentes</Text>
      </View>
    </View>
  </View>
);

const ProgressStat = ({ label, value, total, color }) => {
  const percentage = total > 0 ? (value / total) * 100 : 0;
  return (
    <View style={styles.progressItem}>
      <Text style={styles.progressLabel}>{label}</Text>
      <View style={styles.progressBar}>
        <View
          style={[
            styles.progressFill,
            { width: `${percentage}%`, backgroundColor: color },
          ]}
        />
      </View>
      <Text style={styles.progressValue}>
        {value}/{total}
      </Text>
    </View>
  );
};

const NavButton = ({ label, active, onPress }) => (
  <TouchableOpacity
    style={[styles.navButton, active && styles.navButtonActive]}
    onPress={onPress}
  >
    <Text style={[styles.navButtonText, active && styles.navButtonTextActive]}>
      {label}
    </Text>
  </TouchableOpacity>
);

const getStatusColor = status => {
  switch (status) {
    case 'completed':
      return { backgroundColor: colors.success };
    case 'in-progress':
      return { backgroundColor: colors.warning };
    case 'pending':
      return { backgroundColor: colors.danger };
    default:
      return { backgroundColor: colors.textLight };
  }
};

const getStatusLabel = status => {
  switch (status) {
    case 'completed':
      return 'Concluída';
    case 'in-progress':
      return 'Em progresso';
    case 'pending':
      return 'Pendente';
    default:
      return 'Desconhecido';
  }
};

// Estilos
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: colors.surface,
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  headerSubtitle: {
    fontSize: 12,
    color: colors.textLight,
    marginTop: 4,
  },
  addButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: colors.surface,
    fontWeight: '600',
    fontSize: 14,
  },
  navbar: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  navButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  navButtonActive: {
    borderBottomColor: colors.primary,
  },
  navButtonText: {
    color: colors.textLight,
    fontSize: 14,
    fontWeight: '500',
  },
  navButtonTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  statsContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  periodStats: {
    marginBottom: 16,
  },
  statCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
  },
  statTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textLight,
    marginBottom: 12,
  },
  statNumbers: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: colors.textLight,
    textAlign: 'center',
    marginTop: 4,
  },
  progressCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  progressStats: {
    gap: 12,
  },
  progressItem: {
    marginBottom: 12,
  },
  progressLabel: {
    fontSize: 13,
    color: colors.textLight,
    marginBottom: 6,
    fontWeight: '500',
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressFill: {
    height: '100%',
  },
  progressValue: {
    fontSize: 12,
    color: colors.textLight,
  },
  upcomingCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
  },
  taskPreview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  taskPreviewTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 4,
  },
  taskPreviewDate: {
    fontSize: 12,
    color: colors.textLight,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    color: colors.surface,
    fontSize: 12,
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  taskCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  taskTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  deleteBtn: {
    fontSize: 20,
    color: colors.danger,
    fontWeight: 'bold',
  },
  taskDescription: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 12,
  },
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskDate: {
    fontSize: 12,
    color: colors.textLight,
  },
  statusSelector: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  closeButton: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
    marginBottom: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  optionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  optionButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    alignItems: 'center',
  },
  optionButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  optionText: {
    fontSize: 14,
    color: colors.textLight,
    fontWeight: '500',
  },
  optionTextActive: {
    color: colors.surface,
  },
  dateButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  dateButtonText: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  submitButton: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 32,
  },
  submitButtonText: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: '600',
  },
  settingsContainer: {
    padding: 16,
  },
  settingCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textLight,
    marginBottom: 4,
  },
  settingValue: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
    marginBottom: 12,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: colors.surface,
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emailModal: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 24,
    width: '80%',
  },
  emailModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  emailInput: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
    marginBottom: 16,
  },
  emailModalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: colors.primary,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: colors.surface,
    fontSize: 14,
    fontWeight: '600',
  },
});

export default TaskManager;
