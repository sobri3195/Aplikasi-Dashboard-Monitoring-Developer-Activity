import * as Sentry from '@sentry/react';

export const captureError = (error, context = {}) => {
  if (process.env.REACT_APP_SENTRY_DSN && 
      (process.env.NODE_ENV === 'production' || process.env.REACT_APP_SENTRY_ENABLED === 'true')) {
    Sentry.captureException(error, {
      extra: context,
    });
  } else {
    console.error('Error:', error, context);
  }
};

export const captureMessage = (message, level = 'info', context = {}) => {
  if (process.env.REACT_APP_SENTRY_DSN && 
      (process.env.NODE_ENV === 'production' || process.env.REACT_APP_SENTRY_ENABLED === 'true')) {
    Sentry.captureMessage(message, {
      level,
      extra: context,
    });
  } else {
    console.log(`[${level.toUpperCase()}]`, message, context);
  }
};

export const setUserContext = (user) => {
  if (process.env.REACT_APP_SENTRY_DSN && 
      (process.env.NODE_ENV === 'production' || process.env.REACT_APP_SENTRY_ENABLED === 'true')) {
    Sentry.setUser({
      id: user.id,
      email: user.email,
      username: user.name,
    });
  }
};

export const clearUserContext = () => {
  if (process.env.REACT_APP_SENTRY_DSN && 
      (process.env.NODE_ENV === 'production' || process.env.REACT_APP_SENTRY_ENABLED === 'true')) {
    Sentry.setUser(null);
  }
};

export const addBreadcrumb = (breadcrumb) => {
  if (process.env.REACT_APP_SENTRY_DSN && 
      (process.env.NODE_ENV === 'production' || process.env.REACT_APP_SENTRY_ENABLED === 'true')) {
    Sentry.addBreadcrumb(breadcrumb);
  }
};

export const setContext = (contextName, contextData) => {
  if (process.env.REACT_APP_SENTRY_DSN && 
      (process.env.NODE_ENV === 'production' || process.env.REACT_APP_SENTRY_ENABLED === 'true')) {
    Sentry.setContext(contextName, contextData);
  }
};

export const setTag = (key, value) => {
  if (process.env.REACT_APP_SENTRY_DSN && 
      (process.env.NODE_ENV === 'production' || process.env.REACT_APP_SENTRY_ENABLED === 'true')) {
    Sentry.setTag(key, value);
  }
};

export const startTransaction = (name, op) => {
  if (process.env.REACT_APP_SENTRY_DSN && 
      (process.env.NODE_ENV === 'production' || process.env.REACT_APP_SENTRY_ENABLED === 'true')) {
    return Sentry.startTransaction({ name, op });
  }
  return null;
};
