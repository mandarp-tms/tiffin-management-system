import { useState, useEffect } from 'react'
import apiClient from '../utils/apiClient'

export const useFormState = (schema, initialValues = {}, fieldProps = {}) => {
    // Build initial state from schema defaults + passed values
    const buildInitial = () => {
        const state = {}
        schema.fields.forEach(f => {
            const extra = fieldProps[f.key] || {}
            state[f.key] = initialValues[f.key] ?? extra.defaultValue ?? f.defaultValue ?? ''
        })
        return state
    }

    const [values, setValues] = useState(buildInitial)
    const [errors, setErrors] = useState({})
    const [touched, setTouched] = useState({})
    const [dynamicOptions, setDynamicOptions] = useState({})

    // Load dynamic dropdown options from API
    useEffect(() => {
        schema.fields
            .filter(f => f.apiSource)
            .filter(f => !(fieldProps[f.key] || {}).hidden)
            .forEach(async f => {
                try {
                    const res = await apiClient.get(f.apiSource)
                    const list = Array.isArray(res.data) ? res.data : []
                    setDynamicOptions(prev => ({
                        ...prev,
                        [f.key]: list.map(item => ({
                            label: item[f.apiLabelKey],
                            value: item[f.apiValueKey],
                        })),
                    }))
                } catch (err) {
                    console.error(`Failed to load options for ${f.key}`, err)
                }
            })
    }, [])

    const setValue = (key, val) => {
        setValues(prev => {
            const next = { ...prev, [key]: val }
            return next
        })
        setTouched(prev => ({ ...prev, [key]: true }))
        // Clear error when user types
        setErrors(prev => ({ ...prev, [key]: null }))
    }

    const validate = () => {
        const newErrors = {}
        schema.fields.forEach(f => {
            const val = values[f.key]
            const extra = fieldProps[f.key] || {}

            // Skip validation for hidden fields (from fieldProps)
            if (extra.hidden) return

            // Skip validation for hidden fields (dependsOn not met)
            if (f.dependsOn) {
                const depVal = values[f.dependsOn.field]
                if (f.dependsOn.values && !f.dependsOn.values.includes(depVal)) return
                if (f.dependsOn.notValues && f.dependsOn.notValues.includes(depVal)) return
            }

            if (f.required && (val === '' || val === null || val === undefined)) {
                newErrors[f.key] = `${f.label} is required`
                return
            }

            if (f.validation) {
                const v = f.validation
                if (v.minLength && String(val).length < v.minLength) {
                    newErrors[f.key] = `Minimum ${v.minLength} characters`
                }
                if (v.maxLength && String(val).length > v.maxLength) {
                    newErrors[f.key] = `Maximum ${v.maxLength} characters`
                }
                if (v.min !== undefined && Number(val) < v.min) {
                    newErrors[f.key] = `Minimum value is ${v.min}`
                }
                if (v.max !== undefined && Number(val) > v.max) {
                    newErrors[f.key] = `Maximum value is ${v.max}`
                }
                if (v.pattern && !v.pattern.test(val)) {
                    newErrors[f.key] = v.patternMessage || 'Invalid format'
                }
            }
        })
        setErrors(newErrors)
        setTouched(Object.fromEntries(schema.fields.map(f => [f.key, true])))
        return Object.keys(newErrors).length === 0
    }

    const reset = () => {
        setValues(buildInitial())
        setErrors({})
        setTouched({})
    }

    const getFieldOptions = (field) =>
        field.apiSource ? dynamicOptions[field.key] || [] : field.options || []

    const isFieldVisible = (field) => {
        if (field.showIf) return field.showIf(values)
        if (!field.dependsOn) return true
        const depVal = values[field.dependsOn.field]
        if (field.dependsOn.values) return field.dependsOn.values.includes(depVal)
        if (field.dependsOn.notValues) return !field.dependsOn.notValues.includes(depVal)
        return true
    }

    return { values, errors, touched, setValue, validate, reset, getFieldOptions, isFieldVisible }
}