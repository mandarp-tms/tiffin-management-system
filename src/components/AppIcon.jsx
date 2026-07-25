// FontAwesome Solid
import {
    FaHome, FaPlus, FaCheck, FaReceipt, FaChartBar,
    FaUsers, FaTags, FaSignOutAlt, FaBars, FaTimes,
    FaRupeeSign, FaClock, FaShoppingBag, FaInfoCircle,
    FaSave, FaCheckSquare, FaBell
} from 'react-icons/fa'

// Map name → component
const ICONS = {
    home: FaHome,
    plus: FaPlus,
    check: FaCheck,
    receipt: FaReceipt,
    chart: FaChartBar,
    users: FaUsers,
    tag: FaTags,
    logout: FaSignOutAlt,
    menu: FaBars,
    close: FaTimes,
    rupee: FaRupeeSign,
    clock: FaClock,
    bag: FaShoppingBag,
    info: FaInfoCircle,
    save: FaSave,
    approvals: FaCheckSquare,
    bell: FaBell,
}

const AppIcon = ({ name, size = 16, color, style = {} }) => {
    const Icon = ICONS[name]
    if (!Icon) return null
    return <Icon size={size} color={color} style={{ flexShrink: 0, ...style }} />
}

export default AppIcon