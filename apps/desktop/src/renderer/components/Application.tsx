import React, { useEffect, useState } from 'react';
import './Application.scss';
import { AwsCredentialsForm } from './CredentialsForm/aws-credentials-from';
import { AwsInstall } from './AwsInstall/aws-install';
import { Card, CardContent, Grid, Link, Typography } from '@mui/material';
import logoLlavero from '@assets/llavero-logo.png';

const Application: React.FC = () => {
  const [darkTheme, setDarkTheme] = useState(true);
  const [showCredentialsForm, setShowCredentialsForm] = useState(true);
  const [accessKeyId, setAccessKeyId] = useState('');
  const [secretAccessKey, setSecretAccessKey] = useState('');
  const [showCard, setShowCard] = useState(true);

  function handleCredentialsSubmit(accessKeyId: string, secretAccessKey: string) {
    setAccessKeyId(accessKeyId);
    setSecretAccessKey(secretAccessKey);
    setShowCredentialsForm(false);
    setShowCard(false);
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

  async function openBrowser(url: string) {
    await (window as any).openInBrowser(url);
  }

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
      <Grid xs={10}>
        <img src={logoLlavero} height="150px" />
      </Grid>
      <Grid xs={0}>
        <span>{/* empty */}</span>
      </Grid>
      <Grid xs={2}>
        <span>{/* empty */}</span>
      </Grid>
      <Grid xs={10}>
        <Typography ><h1>Installer</h1> </Typography><br />
      </Grid>
      <Grid xs={0}>
        <span>{/* empty */}</span>
      </Grid>
      <Grid xs={2}>
        <span>{/* empty */}</span>
      </Grid>
      <Grid xs={10} style={{}}>
        {showCard &&
          <>
            <Card sx={{ maxWidth: 600 }}>
              <CardContent>
                <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
                  How to create AWS Credentials
                </Typography>
                <Typography variant="body2">
                  <span>Follow the instructions to create your AWS Credentials </span>
                  <Link onClick={() => openBrowser("https://sst.dev/chapters/create-an-iam-user.html")}>Instructions</Link>
                </Typography>
              </CardContent>
            </Card>

            <br />
          </>
        }
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
          <AwsInstall accessKeyId={accessKeyId} secretAccessKey={secretAccessKey} />
        )}
      </Grid>
      <Grid xs={2}>
        <span>{/* empty */}</span>
      </Grid>
    </Grid>

  );
};

export default Application;

