import React, { useEffect, useState } from 'react';
import './Application.scss';
import { AwsCredentialsForm } from './CredentialsForm/aws-credentials-from';
import { AwsInstall } from './AwsInstall/aws-install';

const Application: React.FC = () => {
  const [darkTheme, setDarkTheme] = useState(true);
  const [showCredentialsForm, setShowCredentialsForm] = useState(true);
  const [accessKeyId, setAccessKeyId] = useState('');
  const [secretAccessKey, setSecretAccessKey] = useState('');

  function handleCredentialsSubmit(accessKeyId: string, secretAccessKey: string) {
    setAccessKeyId(accessKeyId);
    setSecretAccessKey(secretAccessKey);
    setShowCredentialsForm(false);
    //onCredentialsSubmit(accessKeyId, secretAccessKey);
  }

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
    //const app = document.getElementById('app');

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
        <div className="application">
        <div>
      {showCredentialsForm ? (
        <AwsCredentialsForm onSubmit={handleCredentialsSubmit} />
      ) : (
        <AwsInstall accessKeyId={accessKeyId} secretAccessKey={secretAccessKey} />
      )}
    </div>
        </div>
      </div>

      <div className='footer'>
        <div className='center'>
          {/* <button onClick={toggleTheme}>
            {darkTheme ? 'Light Theme' : 'Dark Theme'}
          </button> */}

          Llavero © 2023
        </div>
      </div>
    </div>
  );
};

export default Application;

