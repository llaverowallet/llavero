import React, { useState } from 'react';

interface Props {
    onSubmit: (accessKeyId: string, secretAccessKey: string) => void;
}

export function AwsCredentialsForm({ onSubmit }: Props) {
    const [accessKeyId, setAccessKeyId] = useState('');
    const [secretAccessKey, setSecretAccessKey] = useState('');

    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        onSubmit(accessKeyId, secretAccessKey);
    }

    return (
        <form onSubmit={handleSubmit}>
            <label>
                AWS Access Key ID:
                <input type="text" value={accessKeyId} onChange={(e) => setAccessKeyId(e.target.value)} />
            </label>
            <br />
            <label>
                AWS Secret Access Key:
                <input type="text" value={secretAccessKey} onChange={(e) => setSecretAccessKey(e.target.value)} />
            </label>
            <br />
            <button type="submit">Submit</button>
        </form>
    );
}