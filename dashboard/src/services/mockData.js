export const mockDashboardData = {
  overview: {
    totalUsers: 6,
    totalDevices: 12,
    totalActivities: 156,
    securityScore: 85
  },
  securityStats: {
    authorizedDevices: 10,
    totalDevices: 12,
    pendingDevices: 2,
    suspiciousActivities: 3,
    criticalAlerts: 1,
    encryptedRepos: 8
  },
  recentActivities: [
    {
      id: 1,
      activityType: 'GIT_PUSH',
      user: { email: 'admin@devmonitor.com', name: 'Admin User' },
      repository: 'project-alpha',
      device: { deviceName: 'MacBook Pro' },
      timestamp: new Date().toISOString(),
      isSuspicious: false
    },
    {
      id: 2,
      activityType: 'GIT_CLONE',
      user: { email: 'developer@devmonitor.com', name: 'Developer User' },
      repository: 'project-beta',
      device: { deviceName: 'Dell Laptop' },
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      isSuspicious: false
    },
    {
      id: 3,
      activityType: 'REPO_COPY',
      user: { email: 'john.doe@example.com', name: 'John Doe' },
      repository: 'secret-project',
      device: { deviceName: 'Unknown Device' },
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      isSuspicious: true
    },
    {
      id: 4,
      activityType: 'GIT_COMMIT',
      user: { email: 'jane.smith@example.com', name: 'Jane Smith' },
      repository: 'frontend-app',
      device: { deviceName: 'HP Workstation' },
      timestamp: new Date(Date.now() - 10800000).toISOString(),
      isSuspicious: false
    },
    {
      id: 5,
      activityType: 'GIT_PULL',
      user: { email: 'alex.johnson@example.com', name: 'Alex Johnson' },
      repository: 'backend-api',
      device: { deviceName: 'Lenovo Laptop' },
      timestamp: new Date(Date.now() - 14400000).toISOString(),
      isSuspicious: false
    }
  ],
  recentAlerts: [
    {
      id: 1,
      severity: 'CRITICAL',
      message: 'Unauthorized repository access detected',
      activity: {
        user: { email: 'john.doe@example.com' },
        device: { deviceName: 'Unknown Device' }
      },
      createdAt: new Date(Date.now() - 7200000).toISOString()
    },
    {
      id: 2,
      severity: 'WARNING',
      message: 'New device pending authorization',
      activity: {
        user: { email: 'developer@devmonitor.com' },
        device: { deviceName: 'iPad Pro' }
      },
      createdAt: new Date(Date.now() - 10800000).toISOString()
    },
    {
      id: 3,
      severity: 'INFO',
      message: 'Large file commit detected',
      activity: {
        user: { email: 'jane.smith@example.com' },
        device: { deviceName: 'HP Workstation' }
      },
      createdAt: new Date(Date.now() - 18000000).toISOString()
    }
  ],
  activityTrend: [
    { date: '6 days ago', count: 18 },
    { date: '5 days ago', count: 22 },
    { date: '4 days ago', count: 19 },
    { date: '3 days ago', count: 25 },
    { date: '2 days ago', count: 28 },
    { date: 'Yesterday', count: 24 },
    { date: 'Today', count: 20 }
  ]
};

export const mockUsers = [
  {
    id: 1,
    name: 'Admin User',
    email: 'admin@devmonitor.com',
    role: 'Admin',
    status: 'Active',
    createdAt: new Date(Date.now() - 86400000 * 30).toISOString()
  },
  {
    id: 2,
    name: 'Developer User',
    email: 'developer@devmonitor.com',
    role: 'Developer',
    status: 'Active',
    createdAt: new Date(Date.now() - 86400000 * 25).toISOString()
  },
  {
    id: 3,
    name: 'Viewer User',
    email: 'viewer@devmonitor.com',
    role: 'Viewer',
    status: 'Active',
    createdAt: new Date(Date.now() - 86400000 * 20).toISOString()
  },
  {
    id: 4,
    name: 'John Doe',
    email: 'john.doe@example.com',
    role: 'Developer',
    status: 'Active',
    createdAt: new Date(Date.now() - 86400000 * 15).toISOString()
  },
  {
    id: 5,
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    role: 'Developer',
    status: 'Active',
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString()
  },
  {
    id: 6,
    name: 'Alex Johnson',
    email: 'alex.johnson@example.com',
    role: 'Admin',
    status: 'Active',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString()
  }
];

export const mockDevices = [
  {
    id: 1,
    deviceName: 'MacBook Pro',
    deviceId: 'device-001',
    user: { email: 'admin@devmonitor.com', name: 'Admin User' },
    status: 'AUTHORIZED',
    lastActive: new Date().toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 30).toISOString()
  },
  {
    id: 2,
    deviceName: 'Dell Laptop',
    deviceId: 'device-002',
    user: { email: 'developer@devmonitor.com', name: 'Developer User' },
    status: 'AUTHORIZED',
    lastActive: new Date(Date.now() - 3600000).toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 25).toISOString()
  },
  {
    id: 3,
    deviceName: 'HP Workstation',
    deviceId: 'device-003',
    user: { email: 'jane.smith@example.com', name: 'Jane Smith' },
    status: 'AUTHORIZED',
    lastActive: new Date(Date.now() - 7200000).toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 20).toISOString()
  },
  {
    id: 4,
    deviceName: 'iPad Pro',
    deviceId: 'device-004',
    user: { email: 'developer@devmonitor.com', name: 'Developer User' },
    status: 'PENDING',
    lastActive: new Date(Date.now() - 10800000).toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    id: 5,
    deviceName: 'Lenovo Laptop',
    deviceId: 'device-005',
    user: { email: 'alex.johnson@example.com', name: 'Alex Johnson' },
    status: 'AUTHORIZED',
    lastActive: new Date(Date.now() - 14400000).toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 15).toISOString()
  },
  {
    id: 6,
    deviceName: 'Unknown Device',
    deviceId: 'device-006',
    user: { email: 'john.doe@example.com', name: 'John Doe' },
    status: 'PENDING',
    lastActive: new Date(Date.now() - 18000000).toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString()
  }
];

export const mockActivities = [
  {
    id: 1,
    activityType: 'GIT_PUSH',
    user: { id: 1, email: 'admin@devmonitor.com', name: 'Admin User' },
    device: { id: 1, deviceName: 'MacBook Pro' },
    repository: 'project-alpha',
    timestamp: new Date().toISOString(),
    isSuspicious: false,
    metadata: { branch: 'main', commits: 3 }
  },
  {
    id: 2,
    activityType: 'GIT_CLONE',
    user: { id: 2, email: 'developer@devmonitor.com', name: 'Developer User' },
    device: { id: 2, deviceName: 'Dell Laptop' },
    repository: 'project-beta',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    isSuspicious: false,
    metadata: { size: '150MB' }
  },
  {
    id: 3,
    activityType: 'REPO_COPY',
    user: { id: 4, email: 'john.doe@example.com', name: 'John Doe' },
    device: { id: 6, deviceName: 'Unknown Device' },
    repository: 'secret-project',
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    isSuspicious: true,
    metadata: { destination: '/external/drive' }
  }
];

export const mockRepositories = [
  {
    id: 1,
    name: 'project-alpha',
    path: '/repos/project-alpha',
    isEncrypted: true,
    lastAccessed: new Date().toISOString(),
    user: { email: 'admin@devmonitor.com' },
    createdAt: new Date(Date.now() - 86400000 * 60).toISOString()
  },
  {
    id: 2,
    name: 'project-beta',
    path: '/repos/project-beta',
    isEncrypted: true,
    lastAccessed: new Date(Date.now() - 3600000).toISOString(),
    user: { email: 'developer@devmonitor.com' },
    createdAt: new Date(Date.now() - 86400000 * 45).toISOString()
  },
  {
    id: 3,
    name: 'frontend-app',
    path: '/repos/frontend-app',
    isEncrypted: true,
    lastAccessed: new Date(Date.now() - 7200000).toISOString(),
    user: { email: 'jane.smith@example.com' },
    createdAt: new Date(Date.now() - 86400000 * 30).toISOString()
  },
  {
    id: 4,
    name: 'backend-api',
    path: '/repos/backend-api',
    isEncrypted: true,
    lastAccessed: new Date(Date.now() - 10800000).toISOString(),
    user: { email: 'alex.johnson@example.com' },
    createdAt: new Date(Date.now() - 86400000 * 25).toISOString()
  },
  {
    id: 5,
    name: 'secret-project',
    path: '/repos/secret-project',
    isEncrypted: false,
    lastAccessed: new Date(Date.now() - 14400000).toISOString(),
    user: { email: 'john.doe@example.com' },
    createdAt: new Date(Date.now() - 86400000 * 20).toISOString()
  }
];

export const mockAlerts = [
  {
    id: 1,
    severity: 'CRITICAL',
    message: 'Unauthorized repository access detected',
    activity: {
      id: 3,
      user: { email: 'john.doe@example.com', name: 'John Doe' },
      device: { deviceName: 'Unknown Device' },
      repository: 'secret-project'
    },
    status: 'UNREAD',
    createdAt: new Date(Date.now() - 7200000).toISOString()
  },
  {
    id: 2,
    severity: 'WARNING',
    message: 'New device pending authorization',
    activity: {
      id: 2,
      user: { email: 'developer@devmonitor.com', name: 'Developer User' },
      device: { deviceName: 'iPad Pro' }
    },
    status: 'UNREAD',
    createdAt: new Date(Date.now() - 10800000).toISOString()
  },
  {
    id: 3,
    severity: 'INFO',
    message: 'Large file commit detected',
    activity: {
      id: 1,
      user: { email: 'jane.smith@example.com', name: 'Jane Smith' },
      device: { deviceName: 'HP Workstation' },
      repository: 'frontend-app'
    },
    status: 'READ',
    createdAt: new Date(Date.now() - 18000000).toISOString()
  }
];

export const mockSecuritySettings = {
  deviceAuthRequired: true,
  suspiciousActivityDetection: true,
  autoBlockUnauthorized: false,
  encryptionRequired: true,
  alertsEnabled: true,
  maxFailedAttempts: 3
};

export const isDemoMode = () => {
  const token = localStorage.getItem('token');
  return token && token.startsWith('demo-token-');
};

export const getMockResponse = (endpoint, method = 'GET', data = null) => {
  if (!isDemoMode()) {
    return null;
  }

  const responses = {
    '/api/dashboard/overview': { data: mockDashboardData },
    '/api/users': { data: mockUsers },
    '/api/devices': { data: mockDevices },
    '/api/activities': { data: mockActivities },
    '/api/repositories': { data: mockRepositories },
    '/api/alerts': { data: mockAlerts },
    '/api/security/settings': { data: mockSecuritySettings }
  };

  return responses[endpoint] || { data: {} };
};
