import { MODULE_REGISTRY } from './config'

// ─────────────────────────────────────────────────────────────────────────────
// PATH CONSTANTS
// Use these everywhere instead of raw strings so a path change is one edit.
// ─────────────────────────────────────────────────────────────────────────────
export const PATHS = {
    LOGIN: '/login',
    DASHBOARD: '/dashboard',
    ADD_TIFFIN: '/module/tiffinEntry/add',
    MY_TIFFINS: '/my-tiffins',
    APPROVALS: '/approvals',
    REPORTS: '/reports',
    PRICING: '/pricing',
    // MY_BILL: '/my-bill',
    MY_PAYMENTS: '/my-payments',
    USERS: '/users',
    TIFFIN_CENTERS: '/tiffin-centers',

    // Dynamic module routes — call as a function to build a real URL
    moduleAdd: (moduleId) => `/module/${moduleId}/add`,
    moduleEdit: (moduleId, id) => `/module/${moduleId}/edit/${id}`,

    // React Router pattern strings (used in <Route path=...>)
    MODULE_ADD_PATTERN: '/module/:moduleId/add',
    MODULE_EDIT_PATTERN: '/module/:moduleId/edit/:id',
}

// ─────────────────────────────────────────────────────────────────────────────
// ROUTE DEFINITIONS
// Each entry describes one route.  Fields:
//   path        — React Router path string (supports :param)
//   label       — display name used in sidebar and breadcrumb
//   icon        — AppIcon name, only needed for sidebar items
//   roles       — which roles see this item in the sidebar nav
//   parent      — path of the parent route for breadcrumb trail (null = top level)
//   showInNav   — whether this route appears in the sidebar
//   isDynamic   — true when label/parent depend on URL params (module routes)
//   getLabel    — (params) => string, only for dynamic routes
//   getParent   — (params) => path string, only for dynamic routes
// ─────────────────────────────────────────────────────────────────────────────
export const ROUTES = [
    {
        path: PATHS.DASHBOARD,
        label: 'Dashboard',
        icon: 'home',
        roles: ['admin', 'center', 'user'],
        parent: null,
        showInNav: true,
    },
    {
        path: PATHS.ADD_TIFFIN,
        label: 'Add Tiffin',
        icon: 'plus',
        roles: ['center', 'user'],
        parent: PATHS.DASHBOARD,
        showInNav: true,
    },
    {
        path: PATHS.MY_TIFFINS,
        label: 'My Tiffins',
        icon: 'list', // Re-using an existing icon like 'approvals' or standard 'list' if it exists. Actually 'approvals' looks like a list.
        roles: ['admin', 'center', 'user'],
        parent: PATHS.DASHBOARD,
        showInNav: true,
    },
    {
        path: PATHS.APPROVALS,
        label: 'Approvals',
        icon: 'approvals',
        roles: ['center'],
        parent: PATHS.DASHBOARD,
        showInNav: true,
    },
    // {
    //     path: PATHS.MY_BILL,
    //     label: 'My Bill',
    //     icon: 'receipt',
    //     roles: ['user'],
    //     parent: PATHS.DASHBOARD,
    //     showInNav: true,
    // },
    {
        path: PATHS.MY_PAYMENTS,
        label: 'Transactions',
        icon: 'transaction',
        roles: ['user'],
        parent: PATHS.DASHBOARD,
        showInNav: true,
    },
    {
        path: PATHS.REPORTS,
        label: 'Reports',
        icon: 'chart',
        roles: ['admin', 'center'],
        parent: PATHS.DASHBOARD,
        showInNav: true,
    },
    {
        path: PATHS.TIFFIN_CENTERS,
        label: 'Tiffin Centers',
        icon: 'users',
        roles: ['admin'],
        parent: PATHS.DASHBOARD,
        showInNav: true,
    },
    {
        path: PATHS.USERS,
        label: 'Customers',
        icon: 'users',
        roles: ['center'],
        parent: PATHS.DASHBOARD,
        showInNav: true,
    },
    {
        path: PATHS.PRICING,
        label: 'Pricing',
        icon: 'tag',
        roles: ['center'],
        parent: PATHS.DASHBOARD,
        showInNav: true,
    },

    // ── Dynamic module routes ────────────────────────────────────────────────
    // Label and parent are derived at runtime from MODULE_REGISTRY + URL params.
    {
        path: PATHS.MODULE_ADD_PATTERN,
        isDynamic: true,
        showInNav: false,
        getLabel: ({ moduleId }) => {
            const cfg = MODULE_REGISTRY[moduleId]
            return cfg?.add?.title || `Add ${cfg?.label?.slice(0, -1) || 'Item'}`
        },
        getParent: ({ moduleId }) => {
            const cfg = MODULE_REGISTRY[moduleId]
            return cfg?.listPath || PATHS.DASHBOARD
        },
    },
    {
        path: PATHS.MODULE_EDIT_PATTERN,
        isDynamic: true,
        showInNav: false,
        getLabel: ({ moduleId }) => {
            const cfg = MODULE_REGISTRY[moduleId]
            const title = cfg?.edit?.title
            return title || `Edit ${cfg?.label?.slice(0, -1) || 'Item'}`
        },
        getParent: ({ moduleId }) => {
            const cfg = MODULE_REGISTRY[moduleId]
            return cfg?.listPath || PATHS.DASHBOARD
        },
    },
]

// ─────────────────────────────────────────────────────────────────────────────
// INTERNAL HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Converts a route path pattern (e.g. '/module/:moduleId/edit/:id')
 * into a regex + the list of param names, for matching real URLs.
 */
const buildMatcher = (pathPattern) => {
    const paramNames = []
    const regexStr = pathPattern
        .split('/')
        .map(segment => {
            if (segment.startsWith(':')) {
                paramNames.push(segment.slice(1))
                return '([^/]+)'
            }
            return segment
        })
        .join('/')
    return { regex: new RegExp(`^${regexStr}$`), paramNames }
}

// Pre-built matchers (one per route) — avoids rebuilding on every call
const MATCHERS = ROUTES.map(route => ({
    route,
    ...buildMatcher(route.path),
}))

// Fast lookup map: path → static route (only non-dynamic routes)
const STATIC_ROUTE_MAP = Object.fromEntries(
    ROUTES.filter(r => !r.isDynamic).map(r => [r.path, r])
)

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Match a real pathname against the ROUTES array.
 * Returns { route, params } or null if no match.
 *
 * @param {string} pathname  e.g. '/module/customer/edit/42'
 * @returns {{ route: object, params: object } | null}
 */
export const getRouteByPath = (pathname) => {
    for (const { route, regex, paramNames } of MATCHERS) {
        const match = pathname.match(regex)
        if (match) {
            const params = {}
            paramNames.forEach((name, i) => { params[name] = match[i + 1] })
            return { route, params }
        }
    }
    return null
}

/**
 * Build the full breadcrumb trail for a given pathname.
 * Returns an array of { label, path? } objects.
 * The last item (current page) has no `path`.
 * All preceding items are clickable ancestors.
 *
 * Examples:
 *   '/users'                     → [{ label:'Dashboard', path:'/dashboard' }, { label:'Customers' }]
 *   '/module/customer/edit/42'   → [{ label:'Dashboard', path:'/dashboard' },
 *                                   { label:'Customers', path:'/users' },
 *                                   { label:'Edit Customer' }]
 *   '/dashboard'                 → [{ label:'Dashboard' }]
 *
 * @param {string} pathname
 * @returns {Array<{ label: string, path?: string }>}
 */
export const getBreadcrumbTrail = (pathname) => {
    const matched = getRouteByPath(pathname)
    if (!matched) return []

    const { route, params } = matched

    // Resolve label and parent for the current (matched) route
    const currentLabel = route.isDynamic ? route.getLabel(params) : route.label
    const currentParent = route.isDynamic ? route.getParent(params) : route.parent

    // Start trail with the current page (no path = not a link)
    const trail = [{ label: currentLabel }]

    // Walk up the parent chain, prepending each ancestor
    let parentPath = currentParent
    while (parentPath) {
        const parentRoute = STATIC_ROUTE_MAP[parentPath]
        if (!parentRoute) break
        trail.unshift({ label: parentRoute.label, path: parentPath })
        parentPath = parentRoute.parent
    }

    return trail
}
