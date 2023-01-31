import { AnySchema, number, array, object, string, TestContext } from 'yup';
import { parse, compareAsc } from 'date-fns';

import { INTEGER_ERROR_MESSAGE, FLOAT_ERROR_MESSAGE, DATE_REGEX, TIME_REGEX, OPTIONAL_TIME_REGEX } from './constants';

const nonNegativeNumber = number().typeError('Необходимо ввести число').min(0, 'Число должно быть 0 или больше');

const nonNegativeBoundedNumber = nonNegativeNumber.max(999999, 'Число должно быть меньше миллиона');

const positiveNumber = number()
    .typeError('Необходимо ввести число')
    .min(1, 'Число должно быть 1 или больше')
    .max(999999, 'Число должно быть меньше миллиона');

const priority = positiveNumber.max(5, 'Число должно быть 5 или меньше');

const percentageNumber = nonNegativeNumber.typeError(FLOAT_ERROR_MESSAGE).max(100, 'Число должно быть < 100');

const optionalNonNegativeNumber = nonNegativeBoundedNumber.optional();

const integerNumber = number().typeError(INTEGER_ERROR_MESSAGE).integer(INTEGER_ERROR_MESSAGE);

const floatNumber = number().typeError(FLOAT_ERROR_MESSAGE);

const nonNegativeFloat = nonNegativeNumber.test(
    'float',
    'После запятой должно быть не более 1 знака',
    (num) => num !== undefined && Number(Number.parseFloat(String(num)).toFixed(1)) * 10 === num * 10
);

const positiveFloat = positiveNumber.test(
    'float',
    'После запятой должно быть не более 1 знака',
    (num) => num !== undefined && Number(Number.parseFloat(String(num)).toFixed(1)) * 10 === num * 10
);

const multiSelectRequire = array().min(1, 'Необходимо выбрать значения');

const selectRequire = object().typeError('Необходимо выбрать значение');

const dateTime = object({
    time: string().matches(TIME_REGEX, {
        message: 'Необходимо ввести корректное время',
    }),
    date: string().matches(DATE_REGEX, {
        message: 'Необходимо ввести корректную дату',
    }),
});

const onlyDateRequired = object({
    time: string().matches(OPTIONAL_TIME_REGEX, {
        message: 'Время введено неверно',
    }),
    date: string().matches(DATE_REGEX, {
        message: 'Дата введена неверно',
    }),
});

const time = string().matches(TIME_REGEX, {
    message: 'Необходимо ввести корректное время',
    excludeEmptyString: true,
});

const dateRangeValidator = (_: any, { parent: { from, to } }: TestContext) => {
    const dateStart = typeof from === 'string' ? from : from.date;
    const dateEnd = typeof to === 'string' ? to : to.date;
    const timeEnd = to.time || '00:00';
    const timeStart = from.time || '00:00';
    if (dateStart && dateEnd) {
        const dateTimeEnd = parse(`${dateEnd} ${timeEnd}`, 'yyyy-MM-dd HH:mm', new Date());
        const dateTimeStart = parse(`${dateStart} ${timeStart}`, 'yyyy-MM-dd HH:mm', new Date());
        return compareAsc(dateTimeEnd, dateTimeStart) >= 0;
    }

    return true;
};

const timeRangeValidator = (_: any, { parent: { timeFrom = '', timeTo = '' } }: TestContext) => {
    const isTimeStartValid = TIME_REGEX.test(timeFrom);
    const isTimeEndValid = TIME_REGEX.test(timeTo);
    if (isTimeStartValid && isTimeEndValid) {
        const dateTimeEnd = parse(`${timeTo}`, 'HH:mm', new Date());
        const dateTimeStart = parse(`${timeFrom}`, 'HH:mm', new Date());
        return compareAsc(dateTimeEnd, dateTimeStart) >= 0;
    }

    return false;
};

const dateTimeRange = object().test('isRangeValid', 'Диапазон задан некорректно', dateRangeValidator);

const dateRange = string().test('isRangeValid', 'Диапазон задан некорректно', dateRangeValidator);

const timeRange = string().test('isRangeValid', 'Диапазон времени задан некорректно', timeRangeValidator);

const validationSchemas = {
    nonNegativeNumber,
    positiveNumber,
    nonNegativeFloat,
    positiveFloat,
    integerNumber,
    floatNumber,
    multiSelectRequire,
    selectRequire,
    dateTime,
    time,
    percentageNumber,
    optionalNonNegativeNumber,
    nonNegativeBoundedNumber,
    priority,
    dateRange,
    dateTimeRange,
    onlyDateRequired,
    timeRange,
};

export default validationSchemas;

export const isCustomSchema = (schema: AnySchema | keyof typeof validationSchemas): schema is AnySchema =>
    typeof schema !== 'string';

export type ValidationSchema = keyof typeof validationSchemas;
