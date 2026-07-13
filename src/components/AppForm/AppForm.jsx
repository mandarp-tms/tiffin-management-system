import AppInput from '../AppInput'
import AppDropdown from '../AppDropdown'
import AppDatePicker from '../AppDatePicker'
import AppRadio from '../AppRadio'
import AppButton from '../AppButton'
import styles from './AppForm.module.css'
import { useFormState } from '../../hooks/useFormState'

const AppForm = ({
    schema,
    initialValues = {},
    onSubmit,
    onCancel,
    loading = false,
    submitLabel,
    cancelLabel,
    // Optional: override for fields that have dynamic constraints
    // e.g. AddTiffinPage passes minDate / maxDate per-field
    fieldProps = {},
}) => {
    const {
        values, errors, touched,
        setValue, validate, reset,
        getFieldOptions, isFieldVisible,
    } = useFormState(schema, initialValues)

    const handleSubmit = async () => {
        if (!validate()) return
        await onSubmit?.(values)
    }

    const handleCancel = () => {
        reset()
        onCancel?.()
    }

    const renderField = (field) => {
        if (!isFieldVisible(field)) return null

        const error = touched[field.key] ? errors[field.key] : null
        const extra = fieldProps[field.key] || {}

        switch (field.type) {
            case 'input':
                return (
                    <AppInput
                        key={field.key}
                        label={field.label}
                        type={field.inputType || 'text'}
                        value={values[field.key]}
                        onChange={e => setValue(field.key, e.value)}
                        placeholder={field.placeholder}
                        error={error}
                        {...extra}
                    />
                )

            case 'dropdown':
                return (
                    <AppDropdown
                        key={field.key}
                        label={field.label}
                        value={values[field.key]}
                        options={getFieldOptions(field)}
                        onChange={e => setValue(field.key, e.value)}
                        placeholder={field.placeholder || `Select ${field.label.toLowerCase()}`}
                        {...extra}
                    />
                )

            case 'date':
                return (
                    <AppDatePicker
                        key={field.key}
                        label={field.label}
                        value={values[field.key]}
                        onChange={e => setValue(field.key, e.value)}
                        {...extra}
                    />
                )

            case 'radio':
                return (
                    <AppRadio
                        key={field.key}
                        label={field.label}
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
        </div>
    )
}

export default AppForm