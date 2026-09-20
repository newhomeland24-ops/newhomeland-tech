// Service Worker for Real-Time Lead Notifications
// Enables mobile OS status bar and lock-screen notification alerts (like Instagram / WhatsApp)

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Handle Notification Click (when user taps the notification on phone or desktop)
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetUrl = (event.notification.data && event.notification.data.url) 
    ? event.notification.data.url 
    : '/admin/dashboard';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // If admin portal is already open in a tab, focus it
      for (const client of windowClients) {
        if (client.url.includes('/admin/dashboard') && 'focus' in client) {
          return client.focus();
        }
      }
      // Otherwise open a new tab
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});
