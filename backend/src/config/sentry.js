const Sentry = require('@sentry/node');
const { nodeProfilingIntegration } = require('@sentry/profiling-node');

function initSentry(app) {
  if (!process.env.SENTRY_DSN) {
    console.warn('⚠️  Sentry DSN not configured. Error tracking disabled.');
    return;
  }

  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    integrations: [
      new Sentry.Integrations.Http({ tracing: true }),
      new Sentry.Integrations.Express({ app }),
      nodeProfilingIntegration(),
    ],
    tracesSampleRate: parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE) || 1.0,
    profilesSampleRate: parseFloat(process.env.SENTRY_PROFILES_SAMPLE_RATE) || 1.0,
    environment: process.env.NODE_ENV || 'development',
    enabled: process.env.NODE_ENV === 'production' || process.env.SENTRY_ENABLED === 'true',
    beforeSend(event, hint) {
      if (event.request) {
        delete event.request.cookies;
        if (event.request.headers) {
          delete event.request.headers.authorization;
          delete event.request.headers.cookie;
        }
      }
      return event;
    },
  });

  console.log('✅ Sentry initialized successfully');
}

function getSentryRequestHandler() {
  return Sentry.Handlers.requestHandler();
}

function getSentryTracingHandler() {
  return Sentry.Handlers.tracingHandler();
}

function getSentryErrorHandler() {
  return Sentry.Handlers.errorHandler({
    shouldHandleError(error) {
      return true;
    },
  });
}

function captureException(error, context = {}) {
  if (process.env.SENTRY_DSN && (process.env.NODE_ENV === 'production' || process.env.SENTRY_ENABLED === 'true')) {
    Sentry.captureException(error, {
      extra: context,
    });
  }
}

function captureMessage(message, level = 'info', context = {}) {
  if (process.env.SENTRY_DSN && (process.env.NODE_ENV === 'production' || process.env.SENTRY_ENABLED === 'true')) {
    Sentry.captureMessage(message, {
      level,
      extra: context,
    });
  }
}

module.exports = {
  initSentry,
  getSentryRequestHandler,
  getSentryTracingHandler,
  getSentryErrorHandler,
  captureException,
  captureMessage,
  Sentry,
};
