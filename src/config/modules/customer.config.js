export const customerConfig = {

    // ── Module meta ───────────────────────────────────────
    id: 'customer',
    label: 'Customers',
    endpoint: '/users',
    listPath: '/users',

    // ── List / table config ───────────────────────────────
    list: {
        params: { role: 'user' },   // always filter by role on GET /users
        columns: [
            { key: 'name', label: 'Name', sortable: true },
            { key: 'username', label: 'Username' },
            { key: 'phone', label: 'Phone' },
            {
                key: 'centerId', label: 'Center',
                // resolved display value from a joined field
                displayFrom: 'center.name',
            },
            { key: 'isActive', label: 'Status', type: 'badge' },
        ],
        emptyMessage: 'No customers found.',
    },

    // ── Add form ──────────────────────────────────────────
    add: {
        title: 'Add Customer',
        subtitle: 'Customer will be added to your tiffin center',
        submitLabel: 'Add Customer',
        injectCenterId: true,      // ← centerId from currentUser, not in form
        injectRole: 'user',    // ← role always 'user' for customers
        endpoint: { method: 'POST', url: '/users' },

        fields: [
            {
                key: 'name',
                label: 'Full name',
                type: 'input',
                inputType: 'text',
                placeholder: 'e.g. Rahul Shah',
                required: true,
                validation: { minLength: 2, maxLength: 100 },
                /* dummy backend value: "Rahul Shah" */
            },
            {
                key: 'username',
                label: 'Username',
                type: 'input',
                inputType: 'text',
                placeholder: 'e.g. rahul',
                required: true,
                validation: {
                    minLength: 3,
                    maxLength: 50,
                    pattern: /^[a-z0-9_]+$/,
                    patternMessage: 'Only lowercase letters, numbers, underscores',
                },
                /* dummy backend value: "rahul" */
            },
            {
                key: 'password',
                label: 'Password',
                type: 'input',
                inputType: 'password',
                placeholder: 'Minimum 6 characters',
                required: true,
                validation: { minLength: 6 },
                /* dummy backend value: hashed — never shown in response */
            },
            {
                key: 'phone',
                label: 'Phone number',
                type: 'input',
                inputType: 'tel',
                placeholder: '+91 90000 00001',
                required: false,
                /* dummy backend value: "+91 90000 00001" */
            },
            {
                key: 'centerId',
                label: 'Tiffin center',
                type: 'dropdown',
                placeholder: 'Select center',
                required: true,
                // Always from API — never hardcoded
                optionsFrom: 'api',
                apiSource: '/tiffin-centers',
                apiLabelKey: 'name',
                apiValueKey: 'id',
                /*
                  dummy API response:
                  [
                    { id: 1, name: "Tiffin Center" },
                    { id: 2, name: "Green Tiffin Co" }
                  ]
                */
            },
        ],
    },

    // ── Edit form ─────────────────────────────────────────
    edit: {
        title: 'Edit Customer',
        submitLabel: 'Save changes',
        endpoint: { method: 'PATCH', url: '/users/:id' },

        // Only these fields are editable
        fields: [
            {
                key: 'name',
                label: 'Full name',
                type: 'input',
                inputType: 'text',
                required: true,
                validation: { minLength: 2 },
                /* dummy backend value: "Rahul Shah" */
            },
            {
                key: 'phone',
                label: 'Phone number',
                type: 'input',
                inputType: 'tel',
                required: false,
                /* dummy backend value: "+91 90000 00001" */
            },
            {
                key: 'isActive',
                label: 'Account status',
                type: 'radio',
                required: true,
                defaultValue: true,
                // Always from API or constants — never hardcoded
                optionsFrom: 'api',
                apiSource: '/constants/account-status',
                apiLabelKey: 'label',
                apiValueKey: 'value',
                /*
                  dummy API response:
                  [
                    { label: "Active",   value: true  },
                    { label: "Inactive", value: false }
                  ]
                */
            },
        ],

        // Which field to use as URL param (:id)
        idKey: 'id',
    },

    // ── Delete config ─────────────────────────────────────
    delete: {
        endpoint: { method: 'DELETE', url: '/users/:id' },
        confirmMessage: (row) => `Delete customer "${row.name}"? This cannot be undone.`,
        successMessage: 'Customer deleted successfully',
        idKey: 'id',
    },
}