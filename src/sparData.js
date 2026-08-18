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
                // 2-3/4" (UNICO) is an 80 Series 8400 path only — see MD8413.
                'no':  { '2': 'SPAR10087', '2-9/16': 'SPAR10063', '2-3/4': 'SPAR11987' },
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

// ---------------------------------------------------------------------------
// McGrory door lines. A thickness is really a door — PRESTO, FUEGO or UNICO —
// so the door name leads wherever a thickness is shown, and each line carries
// its own accent colour so the Full Database can be scanned at a glance.
//
// Device model numbers are deliberately NOT part of a door's identity; they
// change over time and are named on the drawing itself.
// ---------------------------------------------------------------------------
export const doorTypes = {
    '2':      { name: 'PRESTO', thickness: '2"',      slug: 'presto' },
    '2-9/16': { name: 'FUEGO',  thickness: '2-9/16"', slug: 'fuego'  },
    '2-3/4':  { name: 'UNICO',  thickness: '2-3/4"',  slug: 'unico'  },
};

// Display order for door pickers, filter chips and card tags.
export const doorOrder = ['2', '2-9/16', '2-3/4'];

// 8400 / 8500 belong to the 80 Series; PE8400 / PE8500 to the PE80 Series.
// A device is never shown under a series that does not use that name.
const deviceNames = {
    '8400': { '80': '8400', 'PE80': 'PE8400' },
    '8500': { '80': '8500', 'PE80': 'PE8500' },
};

const deviceTypes = {
    '8400': 'Concealed Vertical Rod (CVR)',
    '8500': 'Narrow Stile Rim (RIM)',
};

// What one series calls this device, e.g. ('PE80', '8400') -> 'PE8400'.
export function deviceName(series, device) {
    return deviceNames[device]?.[series] || device;
}

// A SPAR can be shared by both series (e.g. the night latch), so join every
// name that applies: ['80','PE80'] + '8500' -> '8500 / PE8500'.
export function deviceShortName(seriesList, device) {
    const names = [...new Set(seriesList.map((s) => deviceName(s, device)))];
    return names.join(' / ') || device;
}

export function deviceLabel(seriesList, device) {
    const type = deviceTypes[device];
    return type ? `${deviceShortName(seriesList, device)} — ${type}` : deviceShortName(seriesList, device);
}

// Human-readable labels for each selection value.
export const labels = {
    series: {
        '80': '80 Series',
        'PE80': 'PE80 Series (New Generation)',
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
    // Door name first — the thickness is the detail, not the headline.
    thickness: Object.fromEntries(
        Object.entries(doorTypes).map(([key, d]) => [key, `${d.name} Door — ${d.thickness}`])
    ),
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
const drawingNotes = {
    SPAR11987:
        'UNICO door — 2-3/4" thick, offset (12)(55)(56)(43). ' +
        'Kit covers functions 06, 13, 15, 73 and 74.',
};

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
        const img = sparImages[spar] || null;
        return {
            spar,
            special: false,
            images: img ? [img] : [],
            captions: null,
            image: img, // convenience: first page
            note: drawingNotes[spar] || null,
            configRows: null, // derived from labels in the UI
            series: uniq(configs.map((c) => c.series)),
            devices: uniq(configs.map((c) => c.device)),
            funcs: uniq(configs.map((c) => c.func)),
            auxes: uniq(configs.map((c) => c.aux).filter(Boolean)),
            thicknesses: uniq(configs.map((c) => c.thickness)),
            configs,
        };
    });
}

// ---------------------------------------------------------------------------
// Special / standalone SPARs — not part of the 80 or PE80 generator flow.
// These can bundle MULTIPLE documents/pages under a single SPAR#.
// ---------------------------------------------------------------------------
const specialSpars = [
    {
        spar: 'SPAR11757',
        special: true,
        series: ['7000'],
        devices: [],
        funcs: [],
        auxes: [],
        thicknesses: [],
        note: 'Cannot be used with the 16 Function.',
        configRows: [
            { key: 'Series', value: '7000 Series Lock' },
            { key: 'Escutcheon', value: 'NE Escutcheon (from the PE80 series)' },
            { key: 'Application', value: 'Manufacturer’s template — metal door' },
            { key: 'Documents', value: '2 documents · 5 pages' },
        ],
        images: [
            require('./images/spars/SPAR11757_1.jpg'),
            require('./images/spars/SPAR11757_2_p1.jpg'),
            require('./images/spars/SPAR11757_2_p2.jpg'),
            require('./images/spars/SPAR11757_2_p3.jpg'),
            require('./images/spars/SPAR11757_2_p4.jpg'),
        ],
        captions: [
            'Doc 1 — NE Escutcheon part drawing (PP2138-789)',
            'Doc 2 — 7000 Series template, Sheet 1 of 4: Base mechanism / trim',
            'Doc 2 — 7000 Series template, Sheet 2 of 4: Mechanical options (aux control, 16 fn, aluminum door)',
            'Doc 2 — 7000 Series template, Sheet 3 of 4: Electrical options (lever monitoring, EcoFlex, SN series)',
            'Doc 2 — 7000 Series template, Sheet 4 of 4: Electronic latch retraction',
        ],
    },
].map((s) => ({ ...s, image: s.images[0] || null }));

export const sparDatabase = [...buildDatabase(), ...specialSpars];
