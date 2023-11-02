import { EIP155_CHAINS, EIP155_MAINNET_CHAINS, EIP155_TEST_CHAINS, TEIP155Chain } from '@/data/EIP155Data';
import { getChainData } from '@/data/chainsUtil';
import { isAddress, isHexString, toUtf8String } from 'ethers';
/**
 * Converts hex to utf8 string if it is valid bytes
 */
export function convertHexToUtf8(value: string) {
    if (isHexString(value)) {
        return toUtf8String(value)
    }
    return value
}

/**
 * Gets message from various signing request methods by filtering out
 * a value that is not an address (thus is a message).
 * If it is a hex string, it gets converted to utf8 string
 */
export function getSignParamsMessage(params: string[]) {
    const message = params.filter(p => !isAddress(p))[0]
    return convertHexToUtf8(message);
}

/**
 * Gets data from various signTypedData request methods by filtering out
 * a value that is not an address (thus is data).
 * If data is a string convert it to object
 */
export function getSignTypedDataParamsData(params: string[]) {
    const data = params.filter(p => !isAddress(p))[0]
    if (typeof data === 'string') {
        return JSON.parse(data);
    }

    return data;
}

/**
 * Get our address from params checking if params string contains one
 * of our wallet addresses
 */
export function getAddressFromParams(addresses: string[], params: any) {
    const paramsString = JSON.stringify(params);
    let address = '';

    addresses.forEach(addr => {
        if (paramsString.toLowerCase().includes(addr.toLowerCase())) {
            address = addr
        }
    })

    return address;
}

export function getChainRpc(chainId: string) {
    return EIP155_CHAINS[chainId].rpc;
}


export function getKeyId(arn: string) {
    const parts = arn.split('/');
    return parts[parts.length - 1];
}
