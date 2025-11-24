import React, { useState, useEffect, useRef, memo } from 'react'; // Import memo
import images from './images/images';
import './index.css';

// By wrapping the component in React.memo, we prevent it from re-rendering
// if its props (isVisible, title, etc.) have not changed.
const Step = memo(React.forwardRef(({ number, title, children, isVisible }, ref) => {
    return (
        <div ref={ref} className={`step-card ${isVisible ? 'visible' : 'hidden'}`}>
            {isVisible && (
                <div>
                    <h2>
                        <span>{number}</span>
                        {title}
                    </h2>
                    {children}
                </div>
            )}
        </div>
    );
}));

// Memoizing the RadioCard means that only the cards that are actually
// changing (e.g., the one being checked) will re-render.
const RadioCard = memo(({ name, value, label, sublabel, checked, onChange, disabled, imageUrl }) => {
    return (
        <div className="radio-card">
            <input
                type="radio"
                name={name}
                id={`${name}_${value}`}
                value={value}
                checked={checked}
                onChange={onChange}
                disabled={disabled}
            />
            <label
                htmlFor={`${name}_${value}`}
                className={`${checked ? 'checked' : ''} ${disabled ? 'disabled' : ''} ${imageUrl ? 'image-card' : ''}`}
            >
                {imageUrl && (
                    <img
                        src={imageUrl}
                        alt={label}
                        onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/200x150/1a202c/e2e8f0?text=Image+Error'; }}
                    />
                )}
                {label && <span>{label}</span>}
                {sublabel && <span className="sublabel">{sublabel}</span>}
            </label>
        </div>
    );
});

// A helper hook to get the previous value of a prop or state.
function usePrevious(value) {
    const ref = useRef();
    useEffect(() => {
        ref.current = value;
    });
    return ref.current;
}


// Main App Component
export default function App() {
    // State to hold user selections
    const [series, setSeries] = useState(null);
    const [device, setDevice] = useState(null);
    const [func, setFunc] = useState(null);
    const [auxLatch, setAuxLatch] = useState(null);
    const [thickness, setThickness] = useState(null);
    const [sparNumber, setSparNumber] = useState(null);

    // Refs for each step to enable scrolling
    const step2Ref = useRef(null);
    const step3Ref = useRef(null);
    const step4Ref = useRef(null);
    const step5Ref = useRef(null);
    const resultRef = useRef(null);

    // This effect will run when all required selections are made
    useEffect(() => {
        if (device === '8400') {
            if (series && func && auxLatch && thickness) {
                generateSpar();
            } else {
                setSparNumber(null);
            }
        } else if (device === '8500') {
            // Logic for 8500 now requires function selection
            if (series && func && thickness) {
                generateSpar();
            } else {
                setSparNumber(null);
            }
        } else {
            setSparNumber(null);
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [series, device, func, auxLatch, thickness]);

    // Determine visibility of each step
    const isStep1Visible = true;
    const isStep2Visible = series !== null;
    // Step 3 is now visible for both 8400 and 8500
    const isStep3Visible = device !== null;
    const isStep4Visible = device === '8400' && func !== null;
    // Step 5 is visible if 8500 function is selected OR if 8400 auxLatch is selected
    const isStep5Visible = (device === '8500' && func !== null) || (device === '8400' && auxLatch !== null);

    // Calculate the correct step number for Step 5
    const step5Number = device === '8400' ? 5 : 3;

    // Get the previous visibility state to trigger scroll only when a step becomes visible
    const prevIsStep2Visible = usePrevious(isStep2Visible);
    const prevIsStep3Visible = usePrevious(isStep3Visible);
    const prevIsStep4Visible = usePrevious(isStep4Visible);
    const prevIsStep5Visible = usePrevious(isStep5Visible);
    const prevSparNumber = usePrevious(sparNumber);

    // Generic scroll function
    const scrollToRef = (ref) => {
        if (ref.current) {
            // A timeout to ensure the element is rendered and ready for the scroll
            setTimeout(() => {
                ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
        }
    };

    // Auto-scroll effects for each step
    useEffect(() => {
        if (!prevIsStep2Visible && isStep2Visible) {
            scrollToRef(step2Ref);
        }
    }, [isStep2Visible, prevIsStep2Visible]);

    useEffect(() => {
        if (!prevIsStep3Visible && isStep3Visible) {
            scrollToRef(step3Ref);
        }
    }, [isStep3Visible, prevIsStep3Visible]);

    useEffect(() => {
        if (!prevIsStep4Visible && isStep4Visible) {
            scrollToRef(step4Ref);
        }
    }, [isStep4Visible, prevIsStep4Visible]);

    useEffect(() => {
        if (!prevIsStep5Visible && isStep5Visible) {
            scrollToRef(step5Ref);
        }
    }, [isStep5Visible, prevIsStep5Visible]);

    useEffect(() => {
        if (!prevSparNumber && sparNumber) {
            scrollToRef(resultRef);
        }
    }, [sparNumber, prevSparNumber]);

    // Function to generate the SPAR# based on selections
    const generateSpar = () => {
        const sparLookupTable = {
            '80': {
                '8400': {
                    'exit_only': {
                        'yes': {
                            '2': 'SPAR10091',
                            '2-9/16': 'SPAR10068',
                        },
                        'no': {
                            '2': 'SPAR10089',
                            '2-9/16': 'SPAR09752',
                        },
                    },
                    'all_other': {
                        'yes': {
                            '2': 'SPAR10086',
                            '2-9/16': 'SPAR10066',
                        },
                        'no': {
                            '2': 'SPAR10087',
                            '2-9/16': 'SPAR10063',
                        },
                    },
                },
                '8500': {
                    // New Function Groupings for 8500 devices
                    'exit_only': { // 8510 function (Original SPARs)
                        '2': 'SPAR10080',
                        '2-9/16': 'SPAR10079',
                    },
                    'night_latch': { // 04 function
                        '2': 'SPAR10901', // PLACEHOLDER: Please replace with correct SPAR#
                        '2-9/16': 'SPAR10901', // PLACEHOLDER: Please replace with correct SPAR#
                    },
                    'trim_lockable': { // 06/13/15/43/46/73/74 functions
                        '2': 'SPAR10080',
                        '2-9/16': 'SPAR10079',
                    },
                },
            },
            'PE80': {
                '8400': {
                    'exit_only': {
                        'yes': {
                            '2': 'SPAR10450',
                            '2-9/16': 'SPAR10452',
                        },
                        'no': {
                            '2': 'SPAR10448',
                            '2-9/16': 'SPAR10451',
                        },
                    },
                    'all_other': {
                        'yes': {
                            '2': 'SPAR10446',
                            '2-9/16': 'SPAR10444',
                        },
                        'no': {
                            '2': 'SPAR10445',
                            '2-9/16': 'SPAR10443',
                        },
                    },
                },
                '8500': {
                    // PE80 8500 now uses the same function structure
                    'exit_only': { // 8510 function (Original SPARs)
                        '2': 'SPAR10454',
                        '2-9/16': 'SPAR10453',
                    },
                    'night_latch': { // 04 function
                        '2': 'SPAR10901',
                        '2-9/16': 'SPAR10901',

                    },
                    'trim_lockable': { // 06/13/15/43/46/73/74 functions
                        '2': 'SPAR10454',
                        '2-9/16': 'SPAR10453',

                    },
                },
            },
        };

        let generatedSpar;

        if (device === '8400') {
            generatedSpar = sparLookupTable[series][device][func][auxLatch][thickness];
        } else {
            // Logic for the 8500 device: uses function and thickness, but no auxLatch
            generatedSpar = sparLookupTable[series][device][func][thickness];
        }

        setSparNumber(generatedSpar);
    };

    // Function to reset the form to its initial state
    const handleReset = () => {
        setSeries(null);
        setDevice(null);
        setFunc(null);
        setAuxLatch(null);
        setThickness(null);
        setSparNumber(null);
    };

    return (
        <div className="app-container">
            <div className="app-card">

                {/* Header */}
                <div className="header">
                    <img
                        src={images.logo}
                        alt="Sargent x McGrory Glass"
                        onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/300x80/cccccc/000000?text=Logo+Not+Found'; }}
                    />
                    <h1>SPAR# Generator</h1>
                    <p>Follow the steps to generate the correct Special Order Form number.</p>
                </div>

                {/* Step 1: Series Selection */}
                <Step number="1" title="Select Series" isVisible={isStep1Visible}>
                    <div className="radio-group">
                        <RadioCard name="series" value="80" label="80 Series" checked={series === '80'} onChange={(e) => setSeries(e.target.value)} />
                        <RadioCard name="series" value="PE80" label="PE80 Series (Protective Edge)" checked={series === 'PE80'} onChange={(e) => setSeries(e.target.value)} />
                    </div>
                </Step>

                {/* Step 2: Device Selection - Enhanced labels and images */}
                <Step ref={step2Ref} number="2" title="Select Device Type" isVisible={isStep2Visible}>
                    <div className="radio-group">
                        <RadioCard
                            name="device"
                            value="8400"
                            label="8400/PE8400"
                            sublabel="Concealed Vertical Rod (CVR)"
                            checked={device === '8400'}
                            onChange={(e) => { setDevice(e.target.value); setFunc(null); setAuxLatch(null); }}
                            imageUrl={series === 'PE80' ? images.PE80_CVR : images.CVR}
                        />
                        <RadioCard
                            name="device"
                            value="8500"
                            label="8500/PE8500"
                            sublabel="Narrow Stile Rim Exit Device (RIM)"
                            checked={device === '8500'}
                            // Removed setFunc('all_other') to allow function selection
                            onChange={(e) => { setDevice(e.target.value); setFunc(null); setAuxLatch(null); }}
                            imageUrl={series === 'PE80' ? images.PE80_RIM : images.RIM}
                        />
                    </div>
                </Step>

                {/* Step 3: Function Selection - Now conditional on device */}
                <Step ref={step3Ref} number="3" title="Select Function" isVisible={isStep3Visible}>
                    {device === '8400' && (
                        <div className="radio-group">
                            <RadioCard
                                name="func"
                                value="exit_only"
                                label="10 - Exit Only"
                                sublabel={`(No trim on exterior, e.g., ${series === 'PE80' ? 'PE' : ''}8410)`}
                                checked={func === 'exit_only'}
                                onChange={(e) => setFunc(e.target.value)}
                            />
                            <RadioCard
                                name="func"
                                value="all_other"
                                label="All Other Functions"
                                sublabel="(Keyed/Trim on exterior, e.g., 8435, 8488, etc.)"
                                checked={func === 'all_other'}
                                onChange={(e) => setFunc(e.target.value)}
                            />
                        </div>
                    )}
                    {device === '8500' && (
                        <div className="radio-group">
                            <RadioCard
                                name="func"
                                value="exit_only"
                                label="10 - Exit Only"
                                sublabel={`(No trim on exterior, e.g., ${series === 'PE80' ? 'PE' : ''}8510)`}
                                checked={func === 'exit_only'}
                                onChange={(e) => setFunc(e.target.value)}
                            />
                            <RadioCard
                                name="func"
                                value="night_latch"
                                label="04 - Night Latch"
                                sublabel="(Rim cylinder only)"
                                checked={func === 'night_latch'}
                                onChange={(e) => setFunc(e.target.value)}
                            />
                            <RadioCard
                                name="func"
                                value="trim_lockable"
                                label="Trim/Lockable Functions"
                                sublabel="(06, 13, 15, 43, 46, 73, 74 functions)"
                                checked={func === 'trim_lockable'}
                                onChange={(e) => setFunc(e.target.value)}
                            />
                        </div>
                    )}
                </Step>

                {/* Step 4: Auxiliary control (Cylinder + Thumbturn) (Conditional) */}
                <Step ref={step4Ref} number="4" title="Auxiliary Control (Cylinder + Thumbturn)" isVisible={isStep4Visible}>
                    <div className="radio-group">
                        <RadioCard name="auxLatch" value="yes" label="Yes, with Auxiliary Control" sublabel="Requires cylinder and/or thumbturn" checked={auxLatch === 'yes'} onChange={(e) => setAuxLatch(e.target.value)} />
                        <RadioCard name="auxLatch" value="no" label="No Auxiliary Control" sublabel="Exit only function or no key/thumbturn access" checked={auxLatch === 'no'} onChange={(e) => setAuxLatch(e.target.value)} />
                    </div>
                </Step>

                {/* Step 5: Door Thickness - Dynamic step number based on device */}
                <Step ref={step5Ref} number={step5Number} title="Select Door Thickness" isVisible={isStep5Visible}>
                    <div className="radio-group">
                        <RadioCard name="thickness" value="2" label='2" Door Thickness' checked={thickness === '2'} onChange={(e) => setThickness(e.target.value)} />
                        <RadioCard name="thickness" value="2-9/16" label='2-9/16" Door Thickness' checked={thickness === '2-9/16'} onChange={(e) => setThickness(e.target.value)} />
                    </div>
                </Step>

                {/* Result Display */}
                {sparNumber && (
                    <div ref={resultRef} className="result-display">
                        <h3>Generated SPAR#</h3>
                        <p>{sparNumber}</p>
                    </div>
                )}

                {/* Reset Button */}
                {(series || sparNumber) && (
                    <div className="reset-button-container">
                        <button
                            onClick={handleReset}
                            className="reset-button"
                        >
                            Start Over
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}