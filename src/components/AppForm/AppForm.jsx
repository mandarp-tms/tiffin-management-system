import AppInput from '../AppInput'
import AppDropdown from '../AppDropdown'
import AppDatePicker from '../AppDatePicker'
import AppRadio from '../AppRadio'
import AppButton from '../AppButton'
import styles from './AppForm.module.css'
import { useFormState } from '../../hooks/useFormState'
import { useEffect, useRef } from 'react'

const AppForm = ({
    schema,
    initialValues = {},
    onSubmit,
    onCancel,
    loading = false,
    submitLabel,
    cancelLabel,
    onValuesChange,
    renderFooter,
    // Optional: override for fields that have dynamic constraints
    // e.g. AddTiffinPage passes minDate / maxDate per-field
    fieldProps = {},
}) => {
    const {
        values, errors, touched,
        setValue, validate, reset,
        getFieldOptions, isFieldVisible,
    } = useFormState(schema, initialValues, fieldProps)

    const prevValuesRef = useRef(values)
    useEffect(() => {
        if (prevValuesRef.current !== values) {
            onValuesChange?.(values, prevValuesRef.current, { setValue })
            prevValuesRef.current = values
        }
    }, [values, onValuesChange])

    const handleSubmit = async () => {
        if (!validate()) return
        await onSubmit?.(values)
    }

    const handleCancel = () => {
        reset()
        onCancel?.()
    }

    const renderField = (field) => {
        const extra = fieldProps[field.key] || {}
        if (!isFieldVisible(field) || extra.hidden) return null

        const error = touched[field.key] ? errors[field.key] : null
        const effectiveType = extra.componentType || extra.type || field.type
        const effectiveLabel = extra.label || field.label
        const effectivePlaceholder = extra.placeholder || field.placeholder

        switch (effectiveType) {
            case 'input':
                return (
                    <AppInput
                        key={field.key}
                        label={effectiveLabel}
                        type={field.inputType || 'text'}
                        value={values[field.key]}
                        onChange={e => setValue(field.key, e.value)}
                        placeholder={effectivePlaceholder}
                        error={error}
                        autoComplete={field.autoComplete}
                        {...extra}
                    />
                )

            case 'dropdown':
                return (
                    <AppDropdown
                        key={field.key}
                        label={effectiveLabel}
                        value={values[field.key]}
                        options={getFieldOptions(field)}
                        onChange={e => setValue(field.key, e.value)}
                        placeholder={effectivePlaceholder || `Select ${effectiveLabel.toLowerCase()}`}
                        error={error}
                        {...extra}
                    />
                )

            case 'date':
                return (
                    <AppDatePicker
                        key={field.key}
                        label={effectiveLabel}
                        value={values[field.key]}
                        onChange={e => setValue(field.key, e.value)}
                        {...extra}
                    />
                )

            case 'radio':
                return (
                    <AppRadio
                        key={field.key}
                        label={effectiveLabel}
                        value={values[field.key]}
                        options={field.options || []}
                        onChange={e => setValue(field.key, e.value)}
                        error={error}
                        inline
                        {...extra}
                    />
                )

            default:
                return null
        }
    }

    return (
        <div className={styles.form}>
            {schema.fields.map(field => (
                <div key={field.key} className={styles.fieldWrap}>
                    {renderField(field)}
                </div>
            ))}

            {renderFooter ? (
                renderFooter({ values, handleSubmit, handleCancel, loading })
            ) : (
                <div className={styles.actions}>
                    {onCancel && (
                        <AppButton
                            label={cancelLabel || schema.cancelLabel || 'Cancel'}
                            variant='secondary'
                            onClick={handleCancel}
                            disabled={loading}
                        />
                    )}
                    <AppButton
                        label={submitLabel || schema.submitLabel || 'Submit'}
                        variant='primary'
                        loading={loading}
                        onClick={handleSubmit}
                    />
                </div>
            )}
        </div>
    )
}

export default AppForm