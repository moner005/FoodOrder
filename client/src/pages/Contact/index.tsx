import { useState } from 'react'
import type { FormEvent } from 'react'
import styles from './Contact.module.css'

interface ContactValues {
  name: string
  email: string
  subject: string
  message: string
}

type ContactErrors = Partial<Record<keyof ContactValues, string>>

const fields = [
  { name: 'name', label: 'Name', type: 'text', autoComplete: 'name', maxLength: 100 },
  { name: 'email', label: 'Email', type: 'email', autoComplete: 'email', maxLength: 254 },
  { name: 'subject', label: 'Subject', type: 'text', autoComplete: 'off', maxLength: 150 },
] as const

function validate(values: ContactValues): ContactErrors {
  const errors: ContactErrors = {}
  if (!values.name.trim()) errors.name = 'Please enter your name.'
  if (!values.email.trim()) errors.email = 'Please enter your email address.'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
    errors.email = 'Enter an email address such as name@example.com.'
  }
  if (!values.subject.trim()) errors.subject = 'Please enter a subject.'
  if (!values.message.trim()) errors.message = 'Please write your message.'
  return errors
}

export default function ContactPage() {
  const [values, setValues] = useState<ContactValues>({ name: '', email: '', subject: '', message: '' })
  const [errors, setErrors] = useState<ContactErrors>({})

  function updateField(name: keyof ContactValues, value: string) {
    setValues((previous) => ({ ...previous, [name]: value }))
    setErrors((previous) => ({ ...previous, [name]: undefined }))
  }

  function validateField(name: keyof ContactValues) {
    setErrors((previous) => ({ ...previous, [name]: validate(values)[name] }))
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    // Block implicit submission as well as the disabled button until a real
    // service is integrated. Only confirmed delivery may clear the draft.
    event.preventDefault()
  }

  return (
    <section className={styles.page} aria-labelledby="contact-title">
      <div className={`hero ${styles.composition}`}>
        <div className={`hero-copy ${styles.details}`}>
          <p className="eyebrow">Contact FoodOrder</p>
          <h1 id="contact-title">Let’s talk<br />food.</h1>
          <p>A question, a suggestion, or something you’d like us to know? Good conversations start here.</p>
          <div className={styles.signature} aria-hidden="true">
            <span className="brand-mark">f</span>
            <span>Good food, made nearby.</span>
          </div>
        </div>

        <section className={styles.formCard} aria-labelledby="contact-form-title">
          <p className="eyebrow">Your message</p>
          <h2 id="contact-form-title">What’s on your mind?</h2>
          <p className={styles.description}>All fields are required.</p>

          <form className={styles.form} onSubmit={handleSubmit} noValidate>
            {fields.map((field) => (
              <div key={field.name} className={`${styles.field} ${field.name === 'subject' ? styles.fullWidth : ''}`}>
                <label htmlFor={`contact-${field.name}`}>{field.label}</label>
                <input
                  id={`contact-${field.name}`}
                  name={field.name}
                  type={field.type}
                  autoComplete={field.autoComplete}
                  maxLength={field.maxLength}
                  required
                  value={values[field.name]}
                  onChange={(event) => updateField(field.name, event.target.value)}
                  onBlur={() => validateField(field.name)}
                  aria-invalid={Boolean(errors[field.name])}
                  aria-describedby={errors[field.name] ? `contact-${field.name}-error` : undefined}
                />
                {errors[field.name] && <p className={styles.error} id={`contact-${field.name}-error`} role="alert">{errors[field.name]}</p>}
              </div>
            ))}
            <div className={`${styles.field} ${styles.fullWidth}`}>
              <label htmlFor="contact-message">Message</label>
              <textarea
                id="contact-message"
                name="message"
                rows={5}
                maxLength={3000}
                required
                value={values.message}
                onChange={(event) => updateField('message', event.target.value)}
                onBlur={() => validateField('message')}
                aria-invalid={Boolean(errors.message)}
                aria-describedby={`contact-message-hint${errors.message ? ' contact-message-error' : ''}`}
              />
              <p id="contact-message-hint" className={styles.hint}>Up to 3,000 characters. Please don’t include payment details or sensitive information.</p>
              {errors.message && <p className={styles.error} id="contact-message-error" role="alert">{errors.message}</p>}
            </div>
            <div className={`${styles.actions} ${styles.fullWidth}`}>
              <button type="submit" className={`button primary ${styles.submitButton}`} disabled>Send message <span aria-hidden="true">→</span></button>
            </div>
          </form>
        </section>
      </div>
    </section>
  )
}
