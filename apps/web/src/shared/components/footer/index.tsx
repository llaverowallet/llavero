import Link from 'next/link';
import React from 'react';

const Footer = () => {
  return (
    <footer className='bg-white dark:bg-gray-800 border-t-2 px-4 xl:px-0'>
      <div className='w-full mx-auto max-w-screen-xl py-4 md:flex md:items-center md:justify-between'>
        <span className='text-sm text-gray-500 sm:text-center dark:text-gray-400'>
          © 2023{' '}
          <Link href='#' className='hover:underline'>
            Llavero™
          </Link>
          . All Rights Reserved.
        </span>
        <div className='flex flex-wrap items-center mt-3 text-sm font-medium text-gray-500 dark:text-gray-400 sm:mt-0'>
          <Link href='#' className='mr-4 hover:underline md:mr-6 '>
            About
          </Link>

          <Link href='#' className='hover:underline'>
            Privacy Policy
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
