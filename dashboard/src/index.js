import React from 'react';
import ReactDOM from 'react-dom/client';
import * as Sentry from '@sentry/react';
import './index.css';
import App from './App';

if (process.env.REACT_APP_SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.REACT_APP_SENTRY_DSN,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
    tracesSampleRate: parseFloat(process.env.REACT_APP_SENTRY_TRACES_SAMPLE_RATE) || 1.0,
    replaysSessionSampleRate: parseFloat(process.env.REACT_APP_SENTRY_REPLAYS_SESSION_SAMPLE_RATE) || 0.1,
    replaysOnErrorSampleRate: parseFloat(process.env.REACT_APP_SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE) || 1.0,
    environment: process.env.NODE_ENV || 'development',
    enabled: process.env.NODE_ENV === 'production' || process.env.REACT_APP_SENTRY_ENABLED === 'true',
    beforeSend(event, hint) {
      if (event.request) {
        delete event.request.cookies;
      }
      return event;
    },
  });
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
