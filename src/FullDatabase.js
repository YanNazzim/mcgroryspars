import React, { useState, useMemo, memo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { downloadImage, printImage } from './sparActions';

// Build the list of "config to get there" rows for one SPAR entry.
function buildConfigRows(entry, labels) {
    const rows = [];
    rows.push({ key: 'Series', value: entry.series.map((s) => labels.series[s]).join('  &  ') });
    rows.push({ key: 'Device', value: entry.devices.map((d) => labels.device[d]).join(' / ') });
    rows.push({ key: 'Function', value: entry.funcs.map((f) => labels.func[f]).join('   •   ') });
    if (entry.auxes.length > 0) {
        rows.push({ key: 'Aux Control', value: entry.auxes.map((a) => labels.aux[a]).join(' / ') });
    }
    rows.push({ key: 'Door Thickness', value: entry.thicknesses.map((t) => labels.thickness[t]).join(' / ') });
    return rows;
}

const SparCard = memo(({ entry, labels, onView }) => {
    const rows = buildConfigRows(entry, labels);
    return (
        <div className="spar-card">
            <div className="spar-card-image">
                {entry.image ? (
                    <img
                        src={entry.image}
                        alt={`${entry.spar} reference drawing`}
                        loading="lazy"
                        onClick={() => onView(entry)}
                    />
                ) : (
                    <div className="spar-no-image">Drawing pending</div>
                )}
            </div>

            <div className="spar-card-body">
                <h3 className="spar-card-title">{entry.spar}</h3>

                <dl className="spar-config">
                    {rows.map((r) => (
                        <div className="spar-config-row" key={r.key}>
                            <dt>{r.key}</dt>
                            <dd>{r.value}</dd>
                        </div>
                    ))}
                </dl>

                {entry.note && <p className="spar-note">⚠ {entry.note}</p>}

                <div className="spar-card-actions">
                    <button
                        className="spar-btn view"
                        onClick={() => onView(entry)}
                        disabled={!entry.image}
                    >
                        View
                    </button>
                    <button
                        className="spar-btn download"
                        onClick={() => downloadImage(entry.image, entry.spar)}
                        disabled={!entry.image}
                    >
                        Download
                    </button>
                    <button
                        className="spar-btn print"
                        onClick={() => printImage(entry.image, entry.spar)}
                        disabled={!entry.image}
                    >
                        Print
                    </button>
                </div>
            </div>
        </div>
    );
});

export default function FullDatabase({ database, labels }) {
    const [search, setSearch] = useState('');
    const [seriesFilter, setSeriesFilter] = useState('all');
    const [deviceFilter, setDeviceFilter] = useState('all');
    const [modalEntry, setModalEntry] = useState(null);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        return database.filter((entry) => {
            if (seriesFilter !== 'all' && !entry.series.includes(seriesFilter)) return false;
            if (deviceFilter !== 'all' && !entry.devices.includes(deviceFilter)) return false;
            if (q) {
                const haystack = [
                    entry.spar,
                    ...entry.series.map((s) => labels.series[s]),
                    ...entry.devices.map((d) => labels.device[d]),
                    ...entry.funcs.map((f) => labels.func[f]),
                    ...entry.thicknesses,
                ].join(' ').toLowerCase();
                if (!haystack.includes(q)) return false;
            }
            return true;
        });
    }, [database, labels, search, seriesFilter, deviceFilter]);

    const FilterGroup = ({ label, value, onChange, options }) => (
        <div className="filter-group">
            <span className="filter-label">{label}</span>
            <div className="filter-buttons">
                {options.map((opt) => (
                    <button
                        key={opt.value}
                        className={`filter-chip ${value === opt.value ? 'active' : ''}`}
                        onClick={() => onChange(opt.value)}
                    >
                        {opt.label}
                    </button>
                ))}
            </div>
        </div>
    );

    return (
        <div className="full-db">
            <div className="db-controls">
                <input
                    type="text"
                    className="db-search"
                    placeholder="Search SPAR# or configuration…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <div className="db-filters">
                    <FilterGroup
                        label="Series"
                        value={seriesFilter}
                        onChange={setSeriesFilter}
                        options={[
                            { value: 'all', label: 'All' },
                            { value: '80', label: '80' },
                            { value: 'PE80', label: 'PE80' },
                        ]}
                    />
                    <FilterGroup
                        label="Device"
                        value={deviceFilter}
                        onChange={setDeviceFilter}
                        options={[
                            { value: 'all', label: 'All' },
                            { value: '8400', label: '8400 (CVR)' },
                            { value: '8500', label: '8500 (RIM)' },
                        ]}
                    />
                </div>
            </div>

            <p className="db-count">
                Showing {filtered.length} of {database.length} SPARs
            </p>

            <div className="spar-grid">
                {filtered.map((entry) => (
                    <SparCard key={entry.spar} entry={entry} labels={labels} onView={setModalEntry} />
                ))}
            </div>

            {filtered.length === 0 && (
                <p className="db-empty">No SPARs match your filters.</p>
            )}

            {/* Lightbox modal — rendered via a portal to document.body so it
                escapes the card's backdrop-filter/overflow containing block. */}
            <SparModal entry={modalEntry} onClose={() => setModalEntry(null)} />
        </div>
    );
}

function SparModal({ entry, onClose }) {
    // Close on Escape and lock background scroll while open.
    useEffect(() => {
        if (!entry) return undefined;
        const onKey = (e) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', onKey);
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            window.removeEventListener('keydown', onKey);
            document.body.style.overflow = prevOverflow;
        };
    }, [entry, onClose]);

    if (!entry || !entry.image) return null;

    return createPortal(
        <div className="spar-modal" onClick={onClose}>
            <div className="spar-modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="spar-modal-close" onClick={onClose} aria-label="Close">×</button>
                <h3>{entry.spar}</h3>
                <img src={entry.image} alt={`${entry.spar} reference drawing`} />
                <div className="spar-card-actions">
                    <button className="spar-btn download" onClick={() => downloadImage(entry.image, entry.spar)}>Download</button>
                    <button className="spar-btn print" onClick={() => printImage(entry.image, entry.spar)}>Print</button>
                </div>
            </div>
        </div>,
        document.body
    );
}
