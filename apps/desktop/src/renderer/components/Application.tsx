import React, { useEffect, useState } from 'react';
import './Application.scss';
import { icons } from './Icons';

const Application: React.FC = () => {
  const [counter, setCounter] = useState(0);
  const [darkTheme, setDarkTheme] = useState(true);
  const [versions, setVersions] = useState<Record<string, string>>({});

  /**
   * On component mount
   */
  useEffect(() => {
    const useDarkTheme = parseInt(localStorage.getItem('dark-mode'));
    if (isNaN(useDarkTheme)) {
      setDarkTheme(false);
    } else if (useDarkTheme == 1) {
      setDarkTheme(true);
    } else if (useDarkTheme == 0) {
      setDarkTheme(false);
    }

    // Apply verisons
    const app = document.getElementById('app');
    const versions = JSON.parse(app.getAttribute('data-versions'));
    setVersions(versions);
  }, []);

  /**
   * On Dark theme change
   */
  useEffect(() => {
    if (darkTheme) {
      localStorage.setItem('dark-mode', '1');
      document.body.classList.add('dark-mode');
    } else {
      localStorage.setItem('dark-mode', '0');
      document.body.classList.remove('dark-mode');
    }
  }, [darkTheme]);

  /**
   * Toggle Theme
   */
  function toggleTheme() {
    setDarkTheme(!darkTheme);
  }

  return (
    <div id='erwt'>
      <div className='header'>
        <div className='main-heading'>
          <h1 className='themed'>Llavero Installer</h1>
        </div>
        <div className='main-teaser'>
          <div>
            Install information
          </div>
        </div>
        <div className='versions'>
          <div className='item'>
            <div>
              <img className='item-icon' src={icons.electron} /> Electron
            </div>
            <span>{versions?.electron}</span>
          </div>
          <div className='item'>
            <div>
              <img className='item-icon' src={icons.erwt} /> ERWT
            </div>
            <span>{versions?.erwt}</span>
          </div>
          <div className='item'>
            <div>
              <img className='item-icon' src={icons.chrome} /> Chrome
            </div>
            <span>{versions?.chrome}</span>
          </div>
          <div className='item'>
            <div>
              <img className='item-icon' src={icons.license} /> License
            </div>
            <span>{versions?.license}</span>
          </div>
        </div>
      </div>

      <div className='footer'>
        <div className='center'>
          <button onClick={toggleTheme}>
            {darkTheme ? 'Light Theme' : 'Dark Theme'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Application;
