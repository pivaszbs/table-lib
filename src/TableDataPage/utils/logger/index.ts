/* eslint-disable */

class Logger {
    public error(error: Error | string) {
        console.log(
            '%c Error ',
            'background: red; border-radius: 12px; padding: 4px; color: white; font-weight: 900',
            '\n',
            error
        );
    }

    public info(...args: any) {
        console.log(
            '%c INFO ',
            'background: blue; border-radius: 12px; padding: 4px; color: white; font-weight: 900',
            '\n',
            ...args
        );
    }

    public arguments(...args: any) {
        console.log(
            '%c ARGUMENTS ',
            'background: green; border-radius: 12px; padding: 4px; color: white; font-weight: 900',
            '\n',
            ...args
        );
    }

    public response(...args: any) {
        console.log(
            '%c RESPONSE ',
            'background: black; border-radius: 12px; padding: 4px; color: white; font-weight: 900',
            '\n',
            ...args
        );
    }

    public msg(...args: any) {
        console.log(
            '%c WS MSG ',
            'background: black; border-radius: 12px; padding: 4px; color: white; font-weight: 900',
            '\n',
            ...args
        );
    }

    public warn(...args: any) {
        console.warn(
            '%c WARNING ',
            'background: orange; border-radius: 12px; padding: 4px; color: white; font-weight: 900',
            '\n',
            ...args
        );
    }
}

export default new Logger();
