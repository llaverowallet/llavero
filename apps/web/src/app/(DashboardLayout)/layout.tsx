"use client";
import { styled, Container, Box } from "@mui/material";
import React, { useEffect, useState } from "react";
import Header from "@/app/(DashboardLayout)/layout/header/Header";
import useInitWalletConnect from "@/hooks/useInitWalletConnect";
import useWalletConnectEventsManager from "@/hooks/useWalletConnectEventsManager";
import { useSession } from "next-auth/react";
import { web3wallet } from "@/utils/walletConnectUtil";
import { RELAYER_EVENTS } from '@walletconnect/core';
import WalletConnectModal from "./components/shared/walletConnectModal";

const MainWrapper = styled("div")(() => ({
  display: "flex",
  minHeight: "100vh",
  width: "100%",
}));

const PageWrapper = styled("div")(() => ({
  display: "flex",
  flexGrow: 1,
  paddingBottom: "60px",
  flexDirection: "column",
  zIndex: 1,
  backgroundColor: "transparent",
}));


export default function RootLayout({
  children,
}: {
  children: React.ReactNode,
}) {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { data: session } = useSession();
  
  const initialized = useInitWalletConnect(session); // Step 1 - Initialize wallets and wallet connect client
  useWalletConnectEventsManager(initialized); // Step 2 - Once initialized, set up wallet connect event manager
  useEffect(() => {
    if (!initialized) return;
    web3wallet.core.relayer.on(RELAYER_EVENTS.connect, () => {
      console.warn('Network connection is restored!', 'success'); //TODO esto abria una tostada
    });

    web3wallet.core.relayer.on(RELAYER_EVENTS.disconnect, () => {
      console.error('Network connection lost...', 'error'); //TODO esto abria una tostada
    });
  }, [initialized]);
  return (
    <MainWrapper className="mainwrapper">
        {/* ------------------------------------------- */}
        {/* Sidebar */}
        {/* ------------------------------------------- */}
        {/* <Sidebar
        isSidebarOpen={isSidebarOpen}
        isMobileSidebarOpen={isMobileSidebarOpen}
        onSidebarClose={() => setMobileSidebarOpen(false)}
      /> */}
        {/* ------------------------------------------- */}
        {/* Main Wrapper */}
        {/* ------------------------------------------- */}
        <PageWrapper className="page-wrapper">
          {/* ------------------------------------------- */}
          {/* Header */}
          {/* ------------------------------------------- */}
          <Header toggleMobileSidebar={() => setMobileSidebarOpen(true)} />
          {/* ------------------------------------------- */}
          {/* PageContent */}
          {/* ------------------------------------------- */}
          <Container
            sx={{
              paddingTop: "20px",
              maxWidth: "1200px",
            }}
          >
            {/* ------------------------------------------- */}
            {/* Page Route */}
            {/* ------------------------------------------- */}
            <Box sx={{ minHeight: "calc(100vh - 170px)" }}>{children}</Box>
            {/* ------------------------------------------- */}
            {/* End Page */}
            {/* ------------------------------------------- */}

            {/* ------------------------------------------- */}
            {/* Footer */}
            {/* ------------------------------------------- */}
            {/* <Footer /> */}
          </Container>
        </PageWrapper>
        <WalletConnectModal />
    </MainWrapper>
  );
}
