import { tiffins as mockTiffins } from '../mock/tiffins'

// local copy so we can mutate (add, approve, reject) during the session
let data = [...mockTiffins]

export const getAllTiffins = () => [...data]

export const getMyTiffins = (userId) =>
    data.filter(t => t.userId === userId)

export const getPendingTiffins = () =>
    data.filter(t => t.status === 'pending')

export const addTiffin = (entry) => {
    const newEntry = {
        ...entry,
        id: data.length + 1,
        status: entry.addedBy === 'center' ? 'approved' : 'pending',
    }
    data.push(newEntry)
    return newEntry
}

export const markNoTiffin = (userId, userName, date) => {
    const entry = {
        id: data.length + 1,
        userId,
        userName,
        date,
        type: 'none',
        chapatiCount: 0,
        amount: 0,
        status: 'approved',
        note: 'No tiffin',
    }
    data.push(entry)
    return entry
}

export const approveTiffin = (id) => {
    const t = data.find(t => t.id === id)
    if (t) t.status = 'approved'
    return t
}

export const rejectTiffin = (id) => {
    const t = data.find(t => t.id === id)
    if (t) t.status = 'rejected'
    return t
}