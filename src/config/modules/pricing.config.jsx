import { FaTag } from 'react-icons/fa'

const DAYS = [
    { label: 'Sun', value: '0' },
    { label: 'Mon', value: '1' },
    { label: 'Tue', value: '2' },
    { label: 'Wed', value: '3' },
    { label: 'Thu', value: '4' },
    { label: 'Fri', value: '5' },
    { label: 'Sat', value: '6' },
]

export const pricingConfig = {
    id: 'pricing',
    label: 'Pricing',
    icon: FaTag,
    apiEndpoint: '/pricing',
    listPath: '/pricing',
    roles: ['center'], // Usually managed by center
    list: {
        title: 'Tiffin Pricing',
        subtitle: 'Manage prices for all your available tiffin types',
        columns: [
            { header: 'Tiffin Type', field: 'tiffinType', body: row => row.tiffinType.charAt(0).toUpperCase() + row.tiffinType.slice(1) },
            { header: 'Base Price', field: 'basePrice', body: row => `₹${row.basePrice}` },
            {
                header: 'Available Days',
                body: row => {
                    const days = row.availableDays || {}
                    return DAYS.filter(d => days[d.value]).map(d => d.label).join(', ') || 'None'
                }
            },
        ],
        filters: [], // No standard filters needed for now
        defaultSort: 'tiffinType',
    },
    add: {
        title: 'Add Pricing',
        fields: [
            {
                key: 'tiffinType',
                label: 'Tiffin Name (e.g. Special Thali)',
                type: 'input',
                inputType: 'text',
                required: true,
                placeholder: 'Enter tiffin name',
            },
            {
                key: 'basePrice',
                label: 'Base Price (₹)',
                type: 'input',
                inputType: 'number',
                required: true,
                min: 0,
            },
            {
                key: 'isFixedPrice',
                label: 'Fixed Price (No Chapati / Bhakari Variations)',
                type: 'radio',
                options: [{ label: 'Yes', value: true }, { label: 'No', value: false }],
                defaultValue: false,
            },
            {
                key: 'defaultChapati',
                label: 'Default Chapati / Bhakari Count',
                type: 'input',
                inputType: 'number',
                min: 0,
                defaultValue: 0,
                // condition: Hide if isFixedPrice is true
                showIf: (values) => !values.isFixedPrice,
            },
            {
                key: 'pricePerChapati',
                label: 'Price Per Chapati / Bhakari (₹)',
                type: 'input',
                inputType: 'number',
                min: 0,
                defaultValue: 0,
                // condition: Hide if isFixedPrice is true
                showIf: (values) => !values.isFixedPrice,
            },
            {
                key: 'availableDays',
                label: 'Available Days',
                type: 'checkbox-group',
                options: DAYS,
                defaultValue: { '0': true, '1': true, '2': true, '3': true, '4': true, '5': true, '6': true },
            }
        ]
    },
    edit: {
        title: 'Edit Pricing',
        fields: [ // Same as add
            {
                key: 'tiffinType',
                label: 'Tiffin Name (e.g. Special Thali)',
                type: 'input',
                inputType: 'text',
                required: true,
                placeholder: 'Enter tiffin name',
            },
            {
                key: 'basePrice',
                label: 'Base Price (₹)',
                type: 'input',
                inputType: 'number',
                required: true,
                min: 0,
            },
            {
                key: 'isFixedPrice',
                label: 'Fixed Price (No Chapati / Bhakari Variations)',
                type: 'radio',
                options: [{ label: 'Yes', value: true }, { label: 'No', value: false }],
            },
            {
                key: 'defaultChapati',
                label: 'Default Chapati / Bhakari Count',
                type: 'input',
                inputType: 'number',
                min: 0,
                showIf: (values) => !values.isFixedPrice,
            },
            {
                key: 'pricePerChapati',
                label: 'Price Per Chapati / Bhakari (₹)',
                type: 'input',
                inputType: 'number',
                min: 0,
                showIf: (values) => !values.isFixedPrice,
            },
            {
                key: 'availableDays',
                label: 'Available Days',
                type: 'checkbox-group',
                options: DAYS,
            }
        ]
    }
}
