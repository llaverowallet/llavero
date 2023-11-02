
export function check<T>(value?: T): T {
    if (value === undefined || value === null || value === '') {
        throw new Error('Required Value');
    }
    return value;
}
