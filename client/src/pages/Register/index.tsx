import { registerUser } from '@/services/authStorage';
import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthShowcase } from '@/components/auth/AuthShowcase';
import { routes }from '@/constants/routes';

type RegistrationValues = {
    name: string;
    email: string;
    phone: string;
    address: string;
    password: string;
    confirmPassword: string;
};

type RegistrationErrors = Partial<Record<keyof RegistrationValues | 'terms', string>>;

const initialValues: RegistrationValues = {
    name: '',
    email: '',
    phone: '',
    address: '',
    password: '',
    confirmPassword: '',
};

function validate(values: RegistrationValues, acceptedTerms: boolean): RegistrationErrors {
    const errors: RegistrationErrors = {};

    if (!values.name.trim()) {
        errors.name = 'Please enter your name.';
    }

    if (!values.email.trim()) {
        errors.email = 'Please enter your email address.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
        errors.email = 'Please enter a valid email address.';
    }

    if(!values.phone.trim()) {
        errors.phone = 'Please enter your phone number.';
    } else if (!/^\+?[0-9]{10,15}$/.test(values.phone.trim())) {
        errors.phone = 'Please enter a valid phone number.';
    }

    if (!values.address.trim()) {
        errors.address = 'Please enter your address.';
    }


    if (values.password.length < 8) {
        errors.password = 'Password must be at least 8 characters.';
    }

    if (values.confirmPassword !== values.password) {
        errors.confirmPassword = 'Passwords do not match.';
    }

    if (!acceptedTerms) {
        errors.terms = 'Please accept the terms to continue.';
    }

    return errors;
}

export default function RegisterPage() {
    const [values, setValues] = useState(initialValues);
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [errors, setErrors] = useState<RegistrationErrors>({});
    const navigate = useNavigate();

    function handleChange({
        target,
    }: ChangeEvent<HTMLInputElement>) {
        const { name, value } = target;
        setValues((currentValues) => ({
            ...currentValues,
            [name]: value,
        }));
        setErrors((currentErrors) => ({
            ...currentErrors,
            [name]: undefined,
        }));
    }

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const validationErrors = validate(values, acceptedTerms);
        
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }
        
        const saveResult = registerUser({ name: values.name.trim(), email: values.email, phone: values.phone, address: values.address, password: values.password });
        if (!saveResult.ok) {
            setErrors({ email: saveResult.message });
            return;
        }
        setErrors({});
        navigate(routes.login);
    }

    return (
        <section className="auth-page" aria-labelledby="register-title">
            <AuthShowcase
                eyebrow="Create your account"
                title="Join the table."
                description="Register once to save your delivery details and make every future order a little faster."
            />

            <div className="auth-form-panel">
                <div className="auth-card auth-card-wide">
                    <p className="auth-kicker">Create your account</p>
                    <h1 id="register-title" className="auth-title">Join SwiftBite</h1>
                    <p className="auth-subtitle">Register to save your details and order your food.</p>

                    <form className="auth-form auth-form-grid" onSubmit={handleSubmit} noValidate>
                        <div className="auth-field">
                            <label className="auth-label" htmlFor="register-name">Full name</label>
                            <input
                                className="auth-input"
                                id="register-name"
                                name="name"
                                type="text"
                                autoComplete="name"
                                value={values.name}
                                onChange={handleChange}
                                aria-invalid={Boolean(errors.name)}
                                aria-describedby={errors.name ? 'register-name-error' : undefined}
                            />
                            {errors.name ? <p className="auth-error" id="register-name-error" role="alert">{errors.name}</p> : null}
                        </div>

                        <div className="auth-field">
                            <label className="auth-label" htmlFor="register-email">Email address</label>
                            <input
                                className="auth-input"
                                id="register-email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                value={values.email}
                                onChange={handleChange}
                                aria-invalid={Boolean(errors.email)}
                                aria-describedby={errors.email ? 'register-email-error' : undefined}
                            />
                            {errors.email ? <p className="auth-error" id="register-email-error" role="alert">{errors.email}</p> : null}
                        </div>

                        <div className="auth-field">
                            <label className="auth-label" htmlFor="register-phone">Phone number</label>
                            <input
                                className="auth-input"
                                id="register-phone"
                                name="phone"
                                type="tel"
                                autoComplete="tel"
                                value={values.phone}
                                onChange={handleChange}
                                aria-invalid={Boolean(errors.phone)}
                                aria-describedby={errors.phone ? 'register-phone-error' : undefined}
                            />
                            {errors.phone ? <p className="auth-error" id="register-phone-error" role="alert">{errors.phone}</p> : null}
                        </div>

                        <div className="auth-field">
                            <label className="auth-label" htmlFor="register-address">Address</label>
                            <input
                                className="auth-input"
                                id="register-address"
                                name="address"
                                type="text"
                                autoComplete="address"
                                value={values.address}
                                onChange={handleChange}
                                aria-invalid={Boolean(errors.address)}
                                aria-describedby={errors.address ? 'register-address-error' : undefined}
                            />
                            {errors.address ? <p className="auth-error" id="register-address-error" role="alert">{errors.address}</p> : null}
                        </div>

                        <div className="auth-field">
                            <label className="auth-label" htmlFor="register-password">Password</label>
                            <input
                                className="auth-input"
                                id="register-password"
                                name="password"
                                type="password"
                                autoComplete="new-password"
                                value={values.password}
                                onChange={handleChange}
                                aria-invalid={Boolean(errors.password)}
                                aria-describedby={errors.password ? 'register-password-error' : undefined}
                            />
                            {errors.password ? <p className="auth-error" id="register-password-error" role="alert">{errors.password}</p> : null}
                        </div>

                        <div className="auth-field">
                            <label className="auth-label" htmlFor="register-confirm-password">Confirm password</label>
                            <input
                                className="auth-input"
                                id="register-confirm-password"
                                name="confirmPassword"
                                type="password"
                                autoComplete="new-password"
                                value={values.confirmPassword}
                                onChange={handleChange}
                                aria-invalid={Boolean(errors.confirmPassword)}
                                aria-describedby={errors.confirmPassword ? 'register-confirm-password-error' : undefined}
                            />
                            {errors.confirmPassword ? (
                                <p className="auth-error" id="register-confirm-password-error" role="alert">{errors.confirmPassword}</p>
                            ) : null}
                        </div>

                        <div className="auth-field auth-field-full">
                            <label className="auth-terms">
                                <input
                                    className="auth-checkbox"
                                    name="terms"
                                    type="checkbox"
                                    checked={acceptedTerms}
                                    onChange={(event) => {
                                        setAcceptedTerms(event.target.checked);
                                        setErrors((currentErrors) => ({ ...currentErrors, terms: undefined }));
                                    }}
                                    aria-invalid={Boolean(errors.terms)}
                                    aria-describedby={errors.terms ? 'register-terms-error' : undefined}
                                />
                                I agree to the terms and privacy policy.
                            </label>
                            {errors.terms ? <p className="auth-error" id="register-terms-error" role="alert">{errors.terms}</p> : null}
                        </div>

                        <button className="auth-submit auth-field-full" type="submit">Create account</button>
                    </form>

                    <p className="auth-switch">
                        Already have an account? <Link className="auth-link" to={routes.login}>Log in</Link>
                    </p>
                </div>
            </div>
        </section>
    );
}
