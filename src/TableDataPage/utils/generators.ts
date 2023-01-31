type Values<Type> = Type[keyof Type];

export const keys = <T>(a: T): (keyof T)[] => Object.keys(a) as (keyof T)[];

export const values = <T>(a: T): Values<T>[] => Object.values(a);

export const randomInteger = (min: number, max: number) => Math.floor(min + Math.random() * (max + 1 - min));

export const generateNumber = (max = 999999) => randomInteger(0, max);

export const generateString = (max = 999999) => generateNumber(max).toString();

export const generatePrefixString = (prefix?: string) => prefix + generateNumber().toString();

export const generateBoolean = () => Boolean(randomInteger(0, 1));

export const generateDateIsoString = () => new Date(generateNumber()).toISOString();

export const generateRandomWord = (min = 5, max = 10) => {
    const length = randomInteger(min, max);
    const numArray = [];
    for (let i = 0; i < length; i++) {
        numArray.push(randomInteger(0, 1) ? randomInteger(65, 90) : randomInteger(97, 122));
    }
    return String.fromCharCode(...numArray);
};

export const arrayGeneratorFabric =
    <T>(generator: () => T, max = 10) =>
    () =>
        new Array(randomInteger(1, max)).fill(undefined).map(() => generator());

export const generateStringArray = arrayGeneratorFabric(generateString);

export const generateOneOfFabric = <T>(a: T) => {
    const b = values(a);
    return () => b[randomInteger(0, b.length - 1)];
};

export const generateOneOfList =
    <T>(a: T[]) =>
    () =>
        a[randomInteger(0, a.length - 1)];

export const generateSubArray =
    <T>(a: T[]) =>
    () => {
        const count = randomInteger(0, a.length - 1);
        const result: T[] = [];
        while (result.length < count) {
            const newValue = a[randomInteger(0, a.length - 1)];
            if (!result.includes(newValue)) {
                result.push(newValue);
            }
        }
        return result;
    };

export const generateRandomSentence = (maxWords = 3) => arrayGeneratorFabric(generateRandomWord, maxWords)().join(' ');
