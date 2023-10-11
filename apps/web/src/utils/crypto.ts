const getKeyId = (arn: string) => {
    const parts = arn.split('/');
    return parts[parts.length - 1];
}

export { getKeyId };