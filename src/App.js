import React, { useState, useEffect, useRef, memo } from 'react'; // Import memo
import images from './images/images';
import { sparLookupTable, sparDatabase, labels, doorTypes, doorOrder, deviceName } from './sparData';
import { downloadImage, printImage } from './sparActions';
import FullDatabase from './FullDatabase';
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
const RadioCard = memo(({ name, value, label, sublabel, checked, onChange, disabled, imageUrl, className = '' }) => {
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
                className={`${checked ? 'checked' : ''} ${disabled ? 'disabled' : ''} ${imageUrl ? 'image-card' : ''} ${className}`}
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

// The UNICO door is only offered on the 80 Series 8400 path.
const isUnicoPath = (series, device) => series === '80' && device === '8400';

const doorCardsFor = (series, device) =>
    doorOrder
        .filter((key) => key !== '2-3/4' || isUnicoPath(series, device))
        .map((key) => ({ key, ...doorTypes[key] }));

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

    // Which top-level tab is showing: the step-by-step generator or the full DB.
    const [activeTab, setActiveTab] = useState('generator');

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

    // Drop a stale 2-3/4" selection if the user goes back and moves off the
    // 80 Series 8400 path, where it is the only place UNICO is offered.
    useEffect(() => {
        if (thickness === '2-3/4' && !isUnicoPath(series, device)) {
            setThickness(null);
        }
    }, [series, device, thickness]);

    const doorCards = doorCardsFor(series, device);

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

    // Every question answered but the lookup came back empty — that combination
    // has no SPAR# on file yet, so say so instead of showing nothing.
    const selectionComplete = Boolean(
        device === '8400'
            ? series && func && auxLatch && thickness
            : device === '8500' && series && func && thickness
    );
    const noMatch = selectionComplete && !sparNumber;

    // Get the previous visibility state to trigger scroll only when a step becomes visible
    const prevIsStep2Visible = usePrevious(isStep2Visible);
    const prevIsStep3Visible = usePrevious(isStep3Visible);
    const prevIsStep4Visible = usePrevious(isStep4Visible);
    const prevIsStep5Visible = usePrevious(isStep5Visible);
    const prevSparNumber = usePrevious(sparNumber);
    const prevNoMatch = usePrevious(noMatch);

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

    useEffect(() => {
        if (!prevNoMatch && noMatch) {
            scrollToRef(resultRef);
        }
    }, [noMatch, prevNoMatch]);

    // Function to generate the SPAR# based on selections
    // (sparLookupTable is imported from ./sparData so the generator and the
    //  Full Database tab always stay in sync.)
    const generateSpar = () => {
        let generatedSpar;

        if (device === '8400') {
            generatedSpar = sparLookupTable[series]?.[device]?.[func]?.[auxLatch]?.[thickness];
        } else {
            // Logic for the 8500 device: uses function and thickness, but no auxLatch
            generatedSpar = sparLookupTable[series]?.[device]?.[func]?.[thickness];
        }

        // Not every branch is covered — e.g. 2-3/4" only has a SPAR# on the
        // "All Other Functions / No Auxiliary Control" path.
        setSparNumber(generatedSpar || null);
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
            <div className={`app-card ${activeTab === 'fulldb' ? 'wide' : ''}`}>

                {/* Header */}
                <div className="header">
                    <img
                        src={images.logo}
                        alt="Sargent x McGrory Glass"
                        onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/300x80/cccccc/000000?text=Logo+Not+Found'; }}
                    />
                    <h1>{activeTab === 'generator' ? 'SPAR# Generator' : 'Full SPAR Database'}</h1>
                    <p>
                        {activeTab === 'generator'
                            ? 'Follow the steps to generate the correct Special Order Form number.'
                            : 'Browse every SPAR drawing and the configuration that produces it. Download or print any page.'}
                    </p>
                </div>

                {/* Tab navigation */}
                <div className="tab-bar">
                    <button
                        className={`tab-button ${activeTab === 'generator' ? 'active' : ''}`}
                        onClick={() => setActiveTab('generator')}
                    >
                        SPAR# Generator
                    </button>
                    <button
                        className={`tab-button ${activeTab === 'fulldb' ? 'active' : ''}`}
                        onClick={() => setActiveTab('fulldb')}
                    >
                        Full Database
                    </button>
                </div>

                {activeTab === 'fulldb' && (
                    <FullDatabase database={sparDatabase} labels={labels} />
                )}

                {activeTab === 'generator' && (
                  <>
                {/* Step 1: Series Selection */}
                <Step number="1" title="Select Series" isVisible={isStep1Visible}>
                    <div className="radio-group">
                        <RadioCard name="series" value="80" label="80 Series" checked={series === '80'} onChange={(e) => setSeries(e.target.value)} />
                        <RadioCard name="series" value="PE80" label="PE80 Series (New Generation)" checked={series === 'PE80'} onChange={(e) => setSeries(e.target.value)} />
                    </div>
                </Step>

                {/* Step 2: Device Selection - Enhanced labels and images */}
                <Step ref={step2Ref} number="2" title="Select Device Type" isVisible={isStep2Visible}>
                    <div className="radio-group">
                        <RadioCard
                            name="device"
                            value="8400"
                            label={deviceName(series, '8400')}
                            sublabel="Concealed Vertical Rod (CVR)"
                            checked={device === '8400'}
                            onChange={(e) => { setDevice(e.target.value); setFunc(null); setAuxLatch(null); }}
                            imageUrl={series === 'PE80' ? images.PE80_CVR : images.CVR}
                        />
                        <RadioCard
                            name="device"
                            value="8500"
                            label={deviceName(series, '8500')}
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
                                sublabel={`(Keyed/Trim on exterior, e.g., ${series === 'PE80' ? 'PE' : ''}8435, ${series === 'PE80' ? 'PE' : ''}8488, etc.)`}
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
                <Step ref={step5Ref} number={step5Number} title="Select Door" isVisible={isStep5Visible}>
                    <div className="radio-group">
                        {doorCards.map((d) => (
                            <RadioCard
                                key={d.key}
                                name="thickness"
                                value={d.key}
                                label={d.name}
                                sublabel={`${d.thickness} Door Thickness`}
                                className={`door-card ${d.slug}`}
                                checked={thickness === d.key}
                                onChange={(e) => setThickness(e.target.value)}
                            />
                        ))}
                    </div>
                </Step>

                {/* Result Display */}
                {sparNumber && (() => {
                    const entry = sparDatabase.find((e) => e.spar === sparNumber);
                    const image = entry ? entry.image : null;
                    return (
                        <div ref={resultRef} className="result-display">
                            <h3>Generated SPAR#</h3>
                            <p
                                className="result-spar"
                                title="Click to copy"
                                onClick={() => navigator.clipboard && navigator.clipboard.writeText(sparNumber)}
                            >
                                {sparNumber}
                            </p>
                            {doorTypes[thickness] && (
                                <p className={`result-door ${doorTypes[thickness].slug}`}>
                                    <span className="door-tag">{doorTypes[thickness].name}</span>
                                    <span className="result-door-meta">
                                        {doorTypes[thickness].thickness} · {deviceName(series, device)}
                                    </span>
                                </p>
                            )}
                            {image ? (
                                <div className="result-drawing">
                                    <img src={image} alt={`${sparNumber} reference drawing`} />
                                    <div className="result-actions">
                                        <button className="spar-btn download" onClick={() => downloadImage(image, sparNumber)}>Download</button>
                                        <button className="spar-btn print" onClick={() => printImage(image, sparNumber)}>Print</button>
                                    </div>
                                </div>
                            ) : (
                                <p className="result-nodrawing">Reference drawing pending for this configuration.</p>
                            )}
                        </div>
                    );
                })()}

                {/* No SPAR# exists for this combination */}
                {noMatch && (
                    <div ref={resultRef} className="result-display">
                        <h3>No SPAR# On File</h3>
                        <p className="result-nodrawing">
                            {thickness === '2-3/4'
                                ? 'The UNICO door is currently covered only on the 80 Series 8400, All Other Functions, No Auxiliary Control path (SPAR11987).'
                                : 'This combination does not have a SPAR# on file yet. Please contact McGrory Glass.'}
                        </p>
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
                  </>
                )}
            </div>
        </div>
    );
}