import React, { useState, useMemo, memo, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { downloadImage, printImage } from './sparActions';
import { doorTypes, doorOrder, deviceLabel, deviceShortName } from './sparData';

// Build the "config to get there" rows for one SPAR entry.
// Special/standalone SPARs supply their own rows via entry.configRows.
function buildConfigRows(entry, labels) {
    if (entry.configRows) return entry.configRows;
    const rows = [];
    rows.push({ key: 'Series', value: entry.series.map((s) => labels.series[s]).join('  &  ') });
    // Named for the series that actually uses it — 8400 under 80, PE8400 under PE80.
    rows.push({ key: 'Device', value: entry.devices.map((d) => deviceLabel(entry.series, d)).join(' / ') });
    rows.push({ key: 'Function', value: entry.funcs.map((f) => labels.func[f]).join('   •   ') });
    if (entry.auxes.length > 0) {
        rows.push({ key: 'Aux Control', value: entry.auxes.map((a) => labels.aux[a]).join(' / ') });
    }
    rows.push({ key: 'Door', value: entry.thicknesses.map((t) => labels.thickness[t]).join(' / ') });
    return rows;
}

// The at-a-glance tag strip: which doors this SPAR covers, then series/device.
function SparTags({ entry }) {
    const doors = entry.thicknesses.filter((t) => doorTypes[t]);
    if (doors.length === 0 && entry.devices.length === 0) return null;
    return (
        <div className="spar-tags">
            {doors.map((t) => (
                <span key={t} className={`door-tag ${doorTypes[t].slug}`}>
                    {doorTypes[t].name}
                </span>
            ))}
            {entry.devices.map((d) => (
                <span key={d} className="meta-tag">
                    {deviceShortName(entry.series, d)}
                </span>
            ))}
        </div>
    );
}

// Filename used when downloading/printing a single page.
const pageName = (entry, page) =>
    entry.images.length > 1 ? `${entry.spar}_${page + 1}` : entry.spar;

const SparCard = memo(({ entry, labels, onView }) => {
    const rows = buildConfigRows(entry, labels);
    const [page, setPage] = useState(0);
    const total = entry.images.length;
    const multi = total > 1;
    const current = entry.images[page] || null;

    const go = (dir) => (e) => {
        e.stopPropagation();
        setPage((p) => (p + dir + total) % total);
    };

    return (
        <div className={`spar-card ${entry.special ? 'special' : ''}`}>
            <div className={`spar-card-image ${entry.special ? 'contain' : ''}`}>
                {current ? (
                    <>
                        <img
                            src={current}
                            alt={`${entry.spar} drawing ${multi ? page + 1 : ''}`}
                            loading="lazy"
                            onClick={() => onView(entry, page)}
                        />
                        {multi && (
                            <>
                                <button className="gallery-nav prev" onClick={go(-1)} aria-label="Previous page">‹</button>
                                <button className="gallery-nav next" onClick={go(1)} aria-label="Next page">›</button>
                                <span className="gallery-badge">{page + 1} / {total}</span>
                            </>
                        )}
                    </>
                ) : (
                    <div className="spar-no-image">Drawing pending</div>
                )}
            </div>

            <div className="spar-card-body">
                <div className="spar-card-heading">
                    <h3 className="spar-card-title">{entry.spar}</h3>
                    {multi && <span className="spar-doc-tag">{total} pages</span>}
                </div>

                <SparTags entry={entry} />

                {multi && entry.captions && (
                    <p className="spar-caption">{entry.captions[page]}</p>
                )}

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
                    <button className="spar-btn view" onClick={() => onView(entry, page)} disabled={!current}>
                        {multi ? 'View / Flip' : 'View'}
                    </button>
                    <button className="spar-btn download" onClick={() => downloadImage(current, pageName(entry, page))} disabled={!current}>
                        Download
                    </button>
                    <button className="spar-btn print" onClick={() => printImage(current, pageName(entry, page))} disabled={!current}>
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
    const [doorFilter, setDoorFilter] = useState('all');
    const [modal, setModal] = useState(null); // { entry, page }

    // Only show the 7000 chip if there are special SPARs in the data.
    const hasSpecial = useMemo(() => database.some((e) => e.series.includes('7000')), [database]);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        return database.filter((entry) => {
            if (seriesFilter !== 'all' && !entry.series.includes(seriesFilter)) return false;
            // Device filter only applies to the generator series; special SPARs
            // (no device) are hidden when a specific device is selected.
            if (deviceFilter !== 'all' && !entry.devices.includes(deviceFilter)) return false;
            // Door filter, like the device filter, hides special SPARs that
            // are not tied to a door line.
            if (doorFilter !== 'all' && !entry.thicknesses.includes(doorFilter)) return false;
            if (q) {
                const haystack = [
                    entry.spar,
                    ...entry.series.map((s) => labels.series[s] || s),
                    ...entry.devices.map((d) => deviceLabel(entry.series, d)),
                    ...entry.funcs.map((f) => labels.func[f]),
                    ...entry.thicknesses,
                    // Searchable by door name: "unico", "presto", "fuego".
                    ...entry.thicknesses.map((t) => doorTypes[t]?.name || ''),
                    ...(entry.configRows ? entry.configRows.map((r) => r.value) : []),
                    entry.note || '',
                ].join(' ').toLowerCase();
                if (!haystack.includes(q)) return false;
            }
            return true;
        });
    }, [database, labels, search, seriesFilter, deviceFilter, doorFilter]);

    const hasFilters =
        search !== '' || seriesFilter !== 'all' || deviceFilter !== 'all' || doorFilter !== 'all';

    const clearFilters = () => {
        setSearch('');
        setSeriesFilter('all');
        setDeviceFilter('all');
        setDoorFilter('all');
    };

    const seriesOptions = [
        { value: 'all', label: 'All' },
        { value: '80', label: '80' },
        { value: 'PE80', label: 'PE80' },
        ...(hasSpecial ? [{ value: '7000', label: '7000' }] : []),
    ];

    const FilterGroup = ({ label, value, onChange, options }) => (
        <div className="filter-group">
            <span className="filter-label">{label}</span>
            <div className="filter-buttons">
                {options.map((opt) => (
                    <button
                        key={opt.value}
                        className={`filter-chip ${opt.slug || ''} ${value === opt.value ? 'active' : ''}`}
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
                    <FilterGroup label="Series" value={seriesFilter} onChange={setSeriesFilter} options={seriesOptions} />
                    <FilterGroup
                        label="Device"
                        value={deviceFilter}
                        onChange={setDeviceFilter}
                        options={[
                            { value: 'all', label: 'All' },
                            { value: '8400', label: 'CVR' },
                            { value: '8500', label: 'RIM' },
                        ]}
                    />
                    <FilterGroup
                        label="Door"
                        value={doorFilter}
                        onChange={setDoorFilter}
                        options={[
                            { value: 'all', label: 'All' },
                            ...doorOrder.map((key) => ({
                                value: key,
                                label: doorTypes[key].name,
                                slug: doorTypes[key].slug,
                            })),
                        ]}
                    />
                </div>
            </div>

            <div className="db-summary">
                <p className="db-count">
                    Showing {filtered.length} of {database.length} SPARs
                </p>
                {hasFilters && (
                    <button className="db-clear" onClick={clearFilters}>
                        Clear filters
                    </button>
                )}
            </div>

            <div className="spar-grid">
                {filtered.map((entry) => (
                    <SparCard
                        key={entry.spar}
                        entry={entry}
                        labels={labels}
                        onView={(e, page) => setModal({ entry: e, page })}
                    />
                ))}
            </div>

            {filtered.length === 0 && <p className="db-empty">No SPARs match your filters.</p>}

            {/* Lightbox modal — rendered via a portal to document.body so it
                escapes the card's backdrop-filter/overflow containing block. */}
            <SparModal modal={modal} onClose={() => setModal(null)} />
        </div>
    );
}

function SparModal({ modal, onClose }) {
    const entry = modal ? modal.entry : null;
    const total = entry ? entry.images.length : 0;
    const [page, setPage] = useState(0);

    // Sync to the page the user was on when they opened the modal.
    useEffect(() => {
        if (modal) setPage(modal.page || 0);
    }, [modal]);

    const step = useCallback((dir) => {
        setPage((p) => (p + dir + total) % total);
    }, [total]);

    // Escape to close, arrows to flip, and lock background scroll while open.
    useEffect(() => {
        if (!entry) return undefined;
        const onKey = (e) => {
            if (e.key === 'Escape') onClose();
            else if (e.key === 'ArrowLeft' && total > 1) step(-1);
            else if (e.key === 'ArrowRight' && total > 1) step(1);
        };
        window.addEventListener('keydown', onKey);
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            window.removeEventListener('keydown', onKey);
            document.body.style.overflow = prev;
        };
    }, [entry, total, step, onClose]);

    if (!entry || total === 0) return null;

    const multi = total > 1;
    const current = entry.images[page];
    const name = pageName(entry, page);

    return createPortal(
        <div className="spar-modal" onClick={onClose}>
            <div className="spar-modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="spar-modal-close" onClick={onClose} aria-label="Close">×</button>
                <h3>
                    {entry.spar}
                    {multi && <span className="modal-page-count"> · page {page + 1} of {total}</span>}
                </h3>

                <div className="modal-stage">
                    {multi && <button className="gallery-nav prev big" onClick={() => step(-1)} aria-label="Previous page">‹</button>}
                    <img src={current} alt={`${entry.spar} drawing ${page + 1}`} />
                    {multi && <button className="gallery-nav next big" onClick={() => step(1)} aria-label="Next page">›</button>}
                </div>

                {multi && entry.captions && <p className="modal-caption">{entry.captions[page]}</p>}

                {multi && (
                    <div className="modal-dots">
                        {entry.images.map((_, i) => (
                            <button
                                key={i}
                                className={`modal-dot ${i === page ? 'active' : ''}`}
                                onClick={() => setPage(i)}
                                aria-label={`Go to page ${i + 1}`}
                            />
                        ))}
                    </div>
                )}

                <div className="spar-card-actions">
                    <button className="spar-btn download" onClick={() => downloadImage(current, name)}>Download page</button>
                    <button className="spar-btn print" onClick={() => printImage(current, name)}>Print page</button>
                </div>
            </div>
        </div>,
        document.body
    );
}
