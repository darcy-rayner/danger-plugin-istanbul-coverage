import { makeCompleteConfiguration } from './config.model';

describe('makeCompleteConfiguration', () => {
    const base = {
        coveragePaths: ['./coverage/coverage-summary.json'],
        reportFileSet: 'all',
        reportMode: 'message',
        entrySortMethod: 'alphabetically',
        numberOfEntries: 10,
        useAbsolutePath: true,
        threshold: {
            statements: 100,
            branches: 100,
            functions: 100,
            lines: 100
        }
    };

    it('returns a default configuration when sent undefined', () => {
        const output = makeCompleteConfiguration();
        expect(output).toEqual(base);
    });

    it('overrides coveragePaths with the value from coveragePath', () => {
        const output = makeCompleteConfiguration({
            coveragePath: 'some-other-path'
        });
        expect(output).toEqual({ ...base, coveragePaths: ['some-other-path'] });
    });

    it('overrides a specific value from the default', () => {
        const output = makeCompleteConfiguration({
            reportMode: 'warn'
        });
        expect(output).toEqual({
            ...base,
            reportMode: 'warn'
        });
    });
});
