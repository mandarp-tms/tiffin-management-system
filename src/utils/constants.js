export const ROLES = {
    ADMIN: 'admin',
    CENTER: 'center',
    USER: 'user',
}

export const TIFFIN_TYPES = [
    { label: 'Full', value: 'full' },
    { label: 'Half', value: 'half' },
    { label: 'Only Chapati', value: 'chapati' },
    { label: 'Bhakari', value: 'bhakari' },
    { label: 'Dal Rice', value: 'dalrice' },
]

export const CHAPATI_OPTIONS = {
    full: [{ label: '3 chapati (default)', value: 3 }, { label: '2 chapati', value: 2 }, { label: '1 chapati', value: 1 }],
    half: [{ label: '2 chapati (default)', value: 2 }, { label: '1 chapati', value: 1 }],
    chapati: [{ label: '2 (default)', value: 2 }, { label: '1', value: 1 }],
    bhakari: [{ label: '2 (default)', value: 2 }, { label: '1', value: 1 }],
    dalrice: [],
}

export const SHIFTS = [
    { label: '🌅 Morning', value: 'morning' },
    { label: '🌙 Night', value: 'night' },
]

export const STATUS = {
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected',
}

export const TYPE_LABELS = {
    full: 'Full',
    half: 'Half',
    chapati: 'Only Chapati',
    bhakari: 'Bhakari',
    dalrice: 'Dal Rice',
    none: 'No Tiffin',
}

export const SHIFT_LABELS = {
    morning: '🌅 Morning',
    night: '🌙 Night',
}