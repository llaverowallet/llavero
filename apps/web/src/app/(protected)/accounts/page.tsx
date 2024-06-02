'use client';

import Accounts from '@/features/accounts';
import React from 'react';

const AccountsPage = () => {
  return (
    <>
      <main>
        <Accounts />
      </main>
    </>
  );
};

AccountsPage.displayName = 'AccountPage';

export default AccountsPage;
