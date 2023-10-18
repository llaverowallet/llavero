import React from 'react';
import { createRoot } from 'react-dom/client';
import Application from './components/Application';

console.log('Renderer execution started');

// Render application in DOM
createRoot(document.getElementById('app')).render(<Application />);
