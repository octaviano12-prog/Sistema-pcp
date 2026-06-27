#!/usr/bin/env node
import('./server/index.js').catch(err => {
  console.error('Failed to start:', err);
  process.exit(1);
});

// Keep process alive
setInterval(() => {}, 1000 * 60 * 60);
