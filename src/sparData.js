// ---------------------------------------------------------------------------
// Shared SPAR data — single source of truth for BOTH the step-by-step
// generator and the "Full Database" tab.
//
// `sparLookupTable` is imported by App.js's generator, so editing a SPAR#
// here updates the generator and the Full DB at the same time.
// ---------------------------------------------------------------------------

// The exact lookup used by the generator.
export const sparLookupTable = {
    '80': {
        '8400': {
            'exit_only': {
                'yes': { '2': 'SPAR10091', '2-9/16': 'SPAR10068' },
                'no':  { '2': 'SPAR10089', '2-9/16': 'SPAR09752' },
            },
            'all_other': {
                'yes': { '2': 'SPAR10086', '2-9/16': 'SPAR10066' },
                'no':  { '2': 'SPAR10087', '2-9/16': 'SPAR10063' },
            },
        },
        '8500': {
            'exit_only':     { '2': 'SPAR10080', '2-9/16': 'SPAR10079' },
            'night_latch':   { '2': 'SPAR10901', '2-9/16': 'SPAR10901' },
            'trim_lockable': { '2': 'SPAR10080', '2-9/16': 'SPAR10079' },
        },
    },
    'PE80': {
        '8400': {
            'exit_only': {
                'yes': { '2': 'SPAR10450', '2-9/16': 'SPAR10452' },
                'no':  { '2': 'SPAR10448', '2-9/16': 'SPAR10451' },
            },
            'all_other': {
                'yes': { '2': 'SPAR10446', '2-9/16': 'SPAR10444' },
                'no':  { '2': 'SPAR10445', '2-9/16': 'SPAR10443' },
            },
        },
        '8500': {
            'exit_only':     { '2': 'SPAR10454', '2-9/16': 'SPAR10453' },
            'night_latch':   { '2': 'SPAR10901', '2-9/16': 'SPAR10901' },
            'trim_lockable': { '2': 'SPAR10454', '2-9/16': 'SPAR10453' },
        },
    },
};

// Human-readable labels for each selection value.
export const labels = {
    series: {
        '80': '80 Series',
        'PE80': 'PE80 Series (New Generation)',
    },
    device: {
        '8400': '8400 / PE8400 — Concealed Vertical Rod (CVR)',
        '8500': '8500 / PE8500 — Narrow Stile Rim (RIM)',
    },
    func: {
        exit_only: '10 – Exit Only',
        night_latch: '04 – Night Latch',
        trim_lockable: 'Trim / Lockable (06, 13, 15, 43, 46, 73, 74)',
        all_other: 'All Other Functions (keyed / trim on exterior)',
    },
    aux: {
        yes: 'With Auxiliary Control (cylinder / thumbturn)',
        no: 'No Auxiliary Control',
    },
    thickness: {
        '2': '2" Door Thickness',
        '2-9/16': '2-9/16" Door Thickness',
    },
};

// Reference photo for each SPAR#, extracted from the McGrory PDFs.
const sparImages = {
    SPAR09752: require('./images/spars/SPAR09752.jpg'),
    SPAR10068: require('./images/spars/SPAR10068.jpg'),
    SPAR10063: require('./images/spars/SPAR10063.jpg'),
    SPAR10066: require('./images/spars/SPAR10066.jpg'),
    SPAR10079: require('./images/spars/SPAR10079.jpg'),
    SPAR10080: require('./images/spars/SPAR10080.jpg'),
    SPAR10086: require('./images/spars/SPAR10086.jpg'),
    SPAR10087: require('./images/spars/SPAR10087.jpg'),
    SPAR10089: require('./images/spars/SPAR10089.jpg'),
    SPAR10091: require('./images/spars/SPAR10091.jpg'),
    SPAR10451: require('./images/spars/SPAR10451.jpg'),
    SPAR10452: require('./images/spars/SPAR10452.jpg'),
    SPAR10443: require('./images/spars/SPAR10443.jpg'),
    SPAR10444: require('./images/spars/SPAR10444.jpg'),
    SPAR10453: require('./images/spars/SPAR10453.jpg'),
    SPAR10454: require('./images/spars/SPAR10454.jpg'),
    SPAR10446: require('./images/spars/SPAR10446.jpg'),
    SPAR10445: require('./images/spars/SPAR10445.jpg'),
    SPAR10448: require('./images/spars/SPAR10448.jpg'),
    SPAR10450: require('./images/spars/SPAR10450.jpg'),
    SPAR10901: require('./images/spars/SPAR10901.jpg'),
};

// Optional "heads up" notes shown on a card (e.g. known drawing discrepancies).
const drawingNotes = {};

// Walk the lookup table and collapse it into one entry per unique SPAR#,
// gathering every configuration path that produces it.
function buildDatabase() {
    const bySpar = {};
    const order = [];

    const add = (spar, config) => {
        if (!bySpar[spar]) {
            bySpar[spar] = { spar, configs: [] };
            order.push(spar);
        }
        bySpar[spar].configs.push(config);
    };

    Object.entries(sparLookupTable).forEach(([series, devices]) => {
        Object.entries(devices).forEach(([device, funcs]) => {
            Object.entries(funcs).forEach(([func, next]) => {
                if (device === '8400') {
                    // next = { aux: { thickness: spar } }
                    Object.entries(next).forEach(([aux, thicknesses]) => {
                        Object.entries(thicknesses).forEach(([thickness, spar]) => {
                            add(spar, { series, device, func, aux, thickness });
                        });
                    });
                } else {
                    // 8500: next = { thickness: spar } (no aux)
                    Object.entries(next).forEach(([thickness, spar]) => {
                        add(spar, { series, device, func, aux: null, thickness });
                    });
                }
            });
        });
    });

    const uniq = (arr) => [...new Set(arr)];

    return order.map((spar) => {
        const configs = bySpar[spar].configs;
        return {
            spar,
            image: sparImages[spar] || null,
            note: drawingNotes[spar] || null,
            series: uniq(configs.map((c) => c.series)),
            devices: uniq(configs.map((c) => c.device)),
            funcs: uniq(configs.map((c) => c.func)),
            auxes: uniq(configs.map((c) => c.aux).filter(Boolean)),
            thicknesses: uniq(configs.map((c) => c.thickness)),
            configs,
        };
    });
}

export const sparDatabase = buildDatabase();
