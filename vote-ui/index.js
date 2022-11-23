import AppContent from './content/content.js';

const { createApp } = Vue;

const App = createApp({
  components: {
    AppContent,
  },
});

window.addEventListener('load', App.mount('main'));
