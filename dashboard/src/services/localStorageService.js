import { 
  mockDashboardData, 
  mockUsers, 
  mockDevices, 
  mockActivities, 
  mockRepositories, 
  mockAlerts, 
  mockSecuritySettings 
} from './mockData';

const STORAGE_KEYS = {
  USERS: 'devmonitor_users',
  DEVICES: 'devmonitor_devices',
  ACTIVITIES: 'devmonitor_activities',
  REPOSITORIES: 'devmonitor_repositories',
  ALERTS: 'devmonitor_alerts',
  SECURITY_SETTINGS: 'devmonitor_security_settings',
  DASHBOARD: 'devmonitor_dashboard',
  INITIALIZED: 'devmonitor_initialized'
};

class LocalStorageService {
  constructor() {
    this.initializeData();
  }

  initializeData() {
    const initialized = localStorage.getItem(STORAGE_KEYS.INITIALIZED);
    
    if (!initialized) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(mockUsers));
      localStorage.setItem(STORAGE_KEYS.DEVICES, JSON.stringify(mockDevices));
      localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(mockActivities));
      localStorage.setItem(STORAGE_KEYS.REPOSITORIES, JSON.stringify(mockRepositories));
      localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(mockAlerts));
      localStorage.setItem(STORAGE_KEYS.SECURITY_SETTINGS, JSON.stringify(mockSecuritySettings));
      localStorage.setItem(STORAGE_KEYS.DASHBOARD, JSON.stringify(mockDashboardData));
      localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
    }
  }

  getItem(key) {
    try {
      const item = localStorage.getItem(STORAGE_KEYS[key]);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Error getting ${key} from localStorage:`, error);
      return null;
    }
  }

  setItem(key, value) {
    try {
      localStorage.setItem(STORAGE_KEYS[key], JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Error setting ${key} to localStorage:`, error);
      return false;
    }
  }

  getUsers() {
    return this.getItem('USERS') || mockUsers;
  }

  addUser(user) {
    const users = this.getUsers();
    const newUser = {
      ...user,
      id: Math.max(...users.map(u => u.id), 0) + 1,
      createdAt: new Date().toISOString(),
      status: user.status || 'Active'
    };
    users.push(newUser);
    this.setItem('USERS', users);
    return newUser;
  }

  updateUser(id, updates) {
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === id);
    if (index !== -1) {
      users[index] = { ...users[index], ...updates };
      this.setItem('USERS', users);
      return users[index];
    }
    return null;
  }

  deleteUser(id) {
    const users = this.getUsers();
    const filtered = users.filter(u => u.id !== id);
    this.setItem('USERS', filtered);
    return true;
  }

  getDevices() {
    return this.getItem('DEVICES') || mockDevices;
  }

  addDevice(device) {
    const devices = this.getDevices();
    const newDevice = {
      ...device,
      id: Math.max(...devices.map(d => d.id), 0) + 1,
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
      status: device.status || 'PENDING'
    };
    devices.push(newDevice);
    this.setItem('DEVICES', devices);
    return newDevice;
  }

  updateDevice(id, updates) {
    const devices = this.getDevices();
    const index = devices.findIndex(d => d.id === id);
    if (index !== -1) {
      devices[index] = { ...devices[index], ...updates };
      this.setItem('DEVICES', devices);
      return devices[index];
    }
    return null;
  }

  deleteDevice(id) {
    const devices = this.getDevices();
    const filtered = devices.filter(d => d.id !== id);
    this.setItem('DEVICES', filtered);
    return true;
  }

  getActivities() {
    return this.getItem('ACTIVITIES') || mockActivities;
  }

  addActivity(activity) {
    const activities = this.getActivities();
    const newActivity = {
      ...activity,
      id: Math.max(...activities.map(a => a.id), 0) + 1,
      timestamp: new Date().toISOString(),
      isSuspicious: activity.isSuspicious || false
    };
    activities.unshift(newActivity);
    this.setItem('ACTIVITIES', activities);
    return newActivity;
  }

  getRepositories() {
    return this.getItem('REPOSITORIES') || mockRepositories;
  }

  addRepository(repository) {
    const repositories = this.getRepositories();
    const newRepository = {
      ...repository,
      id: Math.max(...repositories.map(r => r.id), 0) + 1,
      createdAt: new Date().toISOString(),
      lastAccessed: new Date().toISOString(),
      isEncrypted: repository.isEncrypted !== undefined ? repository.isEncrypted : false,
      securityStatus: repository.securityStatus || 'SECURE',
      lastActivity: new Date().toISOString()
    };
    repositories.push(newRepository);
    this.setItem('REPOSITORIES', repositories);
    this.updateDashboardStats();
    return newRepository;
  }

  updateRepository(id, updates) {
    const repositories = this.getRepositories();
    const index = repositories.findIndex(r => r.id === id);
    if (index !== -1) {
      repositories[index] = { ...repositories[index], ...updates };
      this.setItem('REPOSITORIES', repositories);
      this.updateDashboardStats();
      return repositories[index];
    }
    return null;
  }

  deleteRepository(id) {
    const repositories = this.getRepositories();
    const filtered = repositories.filter(r => r.id !== id);
    this.setItem('REPOSITORIES', filtered);
    this.updateDashboardStats();
    return true;
  }

  getRepositoryStats() {
    const repositories = this.getRepositories();
    return {
      totalRepositories: repositories.length,
      encryptedRepositories: repositories.filter(r => r.isEncrypted).length,
      compromisedRepositories: repositories.filter(r => r.securityStatus === 'COMPROMISED').length,
      secureRepositories: repositories.filter(r => r.securityStatus === 'SECURE').length,
      warningRepositories: repositories.filter(r => r.securityStatus === 'WARNING').length
    };
  }

  getAlerts() {
    return this.getItem('ALERTS') || mockAlerts;
  }

  addAlert(alert) {
    const alerts = this.getAlerts();
    const newAlert = {
      ...alert,
      id: Math.max(...alerts.map(a => a.id), 0) + 1,
      createdAt: new Date().toISOString(),
      status: alert.status || 'UNREAD'
    };
    alerts.unshift(newAlert);
    this.setItem('ALERTS', alerts);
    return newAlert;
  }

  updateAlert(id, updates) {
    const alerts = this.getAlerts();
    const index = alerts.findIndex(a => a.id === id);
    if (index !== -1) {
      alerts[index] = { ...alerts[index], ...updates };
      this.setItem('ALERTS', alerts);
      return alerts[index];
    }
    return null;
  }

  deleteAlert(id) {
    const alerts = this.getAlerts();
    const filtered = alerts.filter(a => a.id !== id);
    this.setItem('ALERTS', filtered);
    return true;
  }

  getSecuritySettings() {
    return this.getItem('SECURITY_SETTINGS') || mockSecuritySettings;
  }

  updateSecuritySettings(settings) {
    this.setItem('SECURITY_SETTINGS', settings);
    return settings;
  }

  getDashboard() {
    return this.getItem('DASHBOARD') || mockDashboardData;
  }

  updateDashboardStats() {
    const users = this.getUsers();
    const devices = this.getDevices();
    const activities = this.getActivities();
    const repositories = this.getRepositories();
    const alerts = this.getAlerts();

    const dashboard = {
      overview: {
        totalUsers: users.length,
        totalDevices: devices.length,
        totalActivities: activities.length,
        securityScore: this.calculateSecurityScore(repositories, devices, alerts)
      },
      securityStats: {
        authorizedDevices: devices.filter(d => d.status === 'AUTHORIZED').length,
        totalDevices: devices.length,
        pendingDevices: devices.filter(d => d.status === 'PENDING').length,
        suspiciousActivities: activities.filter(a => a.isSuspicious).length,
        criticalAlerts: alerts.filter(a => a.severity === 'CRITICAL' && a.status === 'UNREAD').length,
        encryptedRepos: repositories.filter(r => r.isEncrypted).length
      },
      recentActivities: activities.slice(0, 5),
      recentAlerts: alerts.slice(0, 3),
      activityTrend: this.calculateActivityTrend(activities)
    };

    this.setItem('DASHBOARD', dashboard);
    return dashboard;
  }

  calculateSecurityScore(repositories, devices, alerts) {
    let score = 100;
    
    const compromisedRepos = repositories.filter(r => r.securityStatus === 'COMPROMISED').length;
    const encryptedRepos = repositories.filter(r => r.isEncrypted).length;
    const totalRepos = repositories.length || 1;
    const encryptionRate = encryptedRepos / totalRepos;
    
    const pendingDevices = devices.filter(d => d.status === 'PENDING').length;
    const criticalAlerts = alerts.filter(a => a.severity === 'CRITICAL').length;
    
    score -= (compromisedRepos * 15);
    score -= (pendingDevices * 5);
    score -= (criticalAlerts * 10);
    score -= ((1 - encryptionRate) * 20);
    
    return Math.max(0, Math.min(100, Math.round(score)));
  }

  calculateActivityTrend(activities) {
    const trend = [];
    const days = ['6 days ago', '5 days ago', '4 days ago', '3 days ago', '2 days ago', 'Yesterday', 'Today'];
    
    for (let i = 6; i >= 0; i--) {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - i);
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = new Date(startDate);
      endDate.setHours(23, 59, 59, 999);
      
      const count = activities.filter(a => {
        const activityDate = new Date(a.timestamp);
        return activityDate >= startDate && activityDate <= endDate;
      }).length;
      
      trend.push({
        date: days[6 - i],
        count: count
      });
    }
    
    return trend;
  }

  resetData() {
    Object.keys(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(STORAGE_KEYS[key]);
    });
    this.initializeData();
  }

  exportData() {
    return {
      users: this.getUsers(),
      devices: this.getDevices(),
      activities: this.getActivities(),
      repositories: this.getRepositories(),
      alerts: this.getAlerts(),
      securitySettings: this.getSecuritySettings(),
      dashboard: this.getDashboard()
    };
  }

  importData(data) {
    if (data.users) this.setItem('USERS', data.users);
    if (data.devices) this.setItem('DEVICES', data.devices);
    if (data.activities) this.setItem('ACTIVITIES', data.activities);
    if (data.repositories) this.setItem('REPOSITORIES', data.repositories);
    if (data.alerts) this.setItem('ALERTS', data.alerts);
    if (data.securitySettings) this.setItem('SECURITY_SETTINGS', data.securitySettings);
    if (data.dashboard) this.setItem('DASHBOARD', data.dashboard);
  }
}

const localStorageService = new LocalStorageService();
export default localStorageService;
