/* eslint-disable jsx-a11y/alt-text */
import React, { useEffect, useState } from 'react';
import './Application.scss';
import { EnvVars } from '../appPreload';
import { AwsCredentialsForm } from './CredentialsForm/aws-credentials-from';
import { AwsInstall } from './AwsInstall/aws-install';
import { Card, CardContent, Grid, Typography } from '@mui/material';
// eslint-disable-next-line import/no-unresolved, import/no-extraneous-dependencies
import logoLlavero from '@assets/llavero-logo.png';

const Application: React.FC = () => {
  const [darkTheme, setDarkTheme] = useState(true);
  const [showCredentialsForm, setShowCredentialsForm] = useState(true);
  const [accessKeyId, setAccessKeyId] = useState('');
  const [secretAccessKey, setSecretAccessKey] = useState('');
  const [, setShowCard] = useState(true);
  const [credentialsError, setCredentialsError] = useState(false);

  async function handleCredentialsSubmit(
    accessKeyId: string,
    secretAccessKey: string,
  ) {
    setCredentialsError(false);
    if (!(await checkCredentials(accessKeyId, secretAccessKey))) {
      setCredentialsError(true);
      return;
    }
    setAccessKeyId(accessKeyId);
    setSecretAccessKey(secretAccessKey);
    setShowCredentialsForm(false);
    setShowCard(false);
  }

  async function checkCredentials(
    accessKeyId: string,
    secretAccessKey: string,
  ): Promise<boolean> {
    if (!accessKeyId || !secretAccessKey) return false;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const envVars: EnvVars = await (window as any).setCredentials(
        accessKeyId,
        secretAccessKey,
      );
      if (envVars) {
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  /**
   * On component mount
   */
  useEffect(() => {
    const useDarkTheme = parseInt(localStorage.getItem('dark-mode'), 10);
    if (isNaN(useDarkTheme)) {
      setDarkTheme(false);
    } else if (useDarkTheme == 1) {
      setDarkTheme(true);
    } else if (useDarkTheme == 0) {
      setDarkTheme(false);
    }
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

  return (
    <Grid container spacing={2}>
      <Grid xs={12}>
        <span>{/* empty */}</span>
        <br />
        <br />
      </Grid>
      <Grid xs={2}>
        <span>{/* empty */}</span>
      </Grid>
      <Grid xs={2}>
        <img src={logoLlavero} height='90px' />
        <br />
        <br />
      </Grid>
      <Grid xs={8}>
        <Typography>
          <h2>Installer</h2>{' '}
        </Typography>
      </Grid>
      <Grid xs={0}>
        <span>{/* empty */}</span>
      </Grid>
      <Grid xs={2}>
        <span>{/* empty */}</span>
      </Grid>
      <Grid xs={8}>
        {showCredentialsForm ? (
          <AwsCredentialsForm onSubmit={handleCredentialsSubmit} />
        ) : (
          <AwsInstall
            accessKeyId={accessKeyId}
            secretAccessKey={secretAccessKey}
          />
        )}
        {credentialsError && (
          <p>
            <Card>
              <CardContent>
                <Typography variant='h6' color='error'>
                  Invalid credentials
                </Typography>
              </CardContent>
            </Card>
          </p>
        )}
      </Grid>
      <Grid xs={2}>
        <span>{/* empty */}</span>
      </Grid>
    </Grid>
  );
};

export default Application;
