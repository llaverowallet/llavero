import { EnvVars } from '../../appPreload';
import { useEffect, useState } from 'react';

import * as React from 'react';

interface Props {
    accessKeyId: string;
    secretAccessKey: string;
}

export function AwsInstall({ accessKeyId, secretAccessKey }: Props) {
    const [enVars, setEnVars] = useState<EnvVars>();
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        getuserInfo(accessKeyId, secretAccessKey);
    }, []);

    async function getuserInfo(accessKeyId: string, secretAccessKey: string): Promise<void> {
        if (!accessKeyId || !secretAccessKey) return;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const envVars: EnvVars = await (window as any).setCredentials(accessKeyId, secretAccessKey);
        setEnVars(envVars);
        setLoading(false);
    }

    return (
        <div>
            {loading ? (
                <div className='loading'> Loading...</div>
            ) : (
                <div className='aws-install'>
                    <div className='aws-install__title'>AWS Install</div>
                    <div className='aws-install__content'>
                        <div className='aws-install__content__item'>
                            <div className='aws-install__content__item__title'>AWS Account ID</div>
                            <div className='aws-install__content__item__value'>{enVars?.AWS_ACCOUNT_ID}</div>
                        </div>
                        <div className='aws-install__content__item'>
                            <div className='aws-install__content__item__title'>AWS Identity</div>
                            <div className='aws-install__content__item__value'>{enVars?.IDENTITY}</div>
                        </div>
                        <div className='aws-install__content__item'>
                            <div className='aws-install__content__item__title'>AWS User ID</div>
                            <div className='aws-install__content__item__value'>{enVars?.AWsUserId}</div>
                        </div>
                    </div>
                </div>
            )
    } </div>);
}


