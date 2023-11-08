"use client";
import { useState } from 'react';


interface FormValues {
  cognitoUrlSuffix: string;
  region: string;
  email: string;
  awsAccessKeyId: string;
  awsSecretAccessKey: string;
}

export default function InstallForm() {
  const [formValues, setFormValues] = useState<FormValues>({
    cognitoUrlSuffix: '',
    region: '',
    email: '',
    awsAccessKeyId: '',
    awsSecretAccessKey: '',
  });
  const [loading, setLoading] = useState(false);
  const [postResult, setPostResult] = useState<null | 'success' | 'error'>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    const response = await fetch('/api/install', {
      method: 'POST',
      body: JSON.stringify(formValues),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (response.ok) {
      setPostResult('success');
    } else {
      setPostResult('error');
    }
    setLoading(false);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormValues((prevValues) => ({
      ...prevValues,
      [name]: value,
    }));
  };

  return (
    <>
      <h1 className="max-w-md mx-auto text-4xl font-bold text-gray-800 mb-8">Llavero</h1>

      <form onSubmit={handleSubmit} className="max-w-md mx-auto">
        <div className="mb-4">
          <label htmlFor="cognitoUrlSuffix" className="block font-medium mb-2">
            Cognito URL Suffix
          </label>
          <input
            type="text"
            name="cognitoUrlSuffix"
            id="cognitoUrlSuffix"
            value={formValues.cognitoUrlSuffix}
            onChange={handleChange}
            className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="region" className="block font-medium mb-2">
            Region
          </label>
          <input
            type="text"
            name="region"
            id="region"
            value={formValues.region}
            onChange={handleChange}
            className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="email" className="block font-medium mb-2">
            Email
          </label>
          <input
            type="email"
            name="email"
            id="email"
            value={formValues.email}
            onChange={handleChange}
            className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="awsAccessKeyId" className="block font-medium mb-2">
            AWS Access Key ID
          </label>
          <input
            type="text"
            name="awsAccessKeyId"
            id="awsAccessKeyId"
            value={formValues.awsAccessKeyId}
            onChange={handleChange}
            className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="awsSecretAccessKey" className="block font-medium mb-2">
            AWS Secret Access Key
          </label>
          <input
            type="text"
            name="awsSecretAccessKey"
            id="awsSecretAccessKey"
            value={formValues.awsSecretAccessKey}
            onChange={handleChange}
            className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
        </div>
        <div className="text-center">
          {!loading && postResult !== 'success' && <button
            type="submit"
            className="inline-block bg-indigo-500 text-white px-4 py-2 rounded-md hover:bg-indigo-600 focus:outline-none focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          >
            Install
          </button>
          }
          {loading && <div className="inline-block bg-indigo-500 text-white px-4 py-2 rounded-md">Installing...</div>}
          {postResult === 'error' && <div className="inline-block bg-red-500 text-white px-4 py-2 rounded-md">Error!</div>}
          {postResult === 'success' && <div className="inline-block bg-green-500 text-white px-4 py-2 rounded-md">Your installation just started. You will get an email with the information when it finishes.</div>}
        </div>
      </form>
    </>
  );
}
