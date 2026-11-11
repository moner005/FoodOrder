import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { AuthShowcase } from '@/components/auth/AuthShowcase';
import { routes } from '@/constants/routes';
import { useAuthStore } from '@/stores/authStores';


type LoginValues = {
    email: string;
    password: string;
};

type LoginErrors = Partial<Record<keyof LoginValues, string>>;

const initialValues: LoginValues = {
    email: '',
    password: '',
};

function validate(values: LoginValues): LoginErrors {
    const errors: LoginErrors = {};

    if (!values.email.trim()) {
        errors.email = 'Please enter your email address.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
        errors.email = 'Please enter a valid email address.';
    }

    if (!values.password) {
        errors.password = 'Please enter your password.';
    }

    return errors;
}

export default function LoginPage() {
    const [values, setValues] = useState(initialValues);
    const [errors, setErrors] = useState<LoginErrors>({});
    const navigate = useNavigate();
    const login = useAuthStore((state) => state.login);

    function handleChange({ target }: ChangeEvent<HTMLInputElement>) {
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
        const validationErrors = validate(values);

        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        const isLoginSuccessful = login(values.email, values.password);
        if (!isLoginSuccessful) {
            setErrors({ password: 'Invalid email or password.' });
            return;
        }
        setErrors({});
        navigate(routes.home);
    }

    return (
        <section className="auth-page" aria-labelledby="login-title">
            <AuthShowcase
                eyebrow="Welcome back"
                title="Good food, one login away."
                description="Sign in to keep your details handy and pick up right where you left off with your next order."
            />

            <div className="auth-form-panel">
                <div className="auth-card">
                    <p className="auth-kicker">Welcome back</p>
                    <h1 id="login-title" className="auth-title">Log in to SwiftBite</h1>
                    <p className="auth-subtitle">Sign in to access your account and continue ordering.</p>

                    <form className="auth-form" onSubmit={handleSubmit} noValidate>
                        <div className="auth-field">
                            <label className="auth-label" htmlFor="login-email">Email address</label>
                            <input
                                className="auth-input"
                                id="login-email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                value={values.email}
                                onChange={handleChange}
                                aria-invalid={Boolean(errors.email)}
                                aria-describedby={errors.email ? 'login-email-error' : undefined}
                            />
                            {errors.email ? <p className="auth-error" id="login-email-error" role="alert">{errors.email}</p> : null}
                        </div>

                        <div className="auth-field">
                            <label className="auth-label" htmlFor="login-password">Password</label>
                            <input
                                className="auth-input"
                                id="login-password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                value={values.password}
                                onChange={handleChange}
                                aria-invalid={Boolean(errors.password)}
                                aria-describedby={errors.password ? 'login-password-error' : undefined}
                            />
                            {errors.password ? (
                                <p className="auth-error" id="login-password-error" role="alert">{errors.password}</p>
                            ) : null}
                        </div>

                        <button className="auth-submit" type="submit">Log in</button>
                    </form>

                    <p className="auth-switch">
                        Don&apos;t have an account?                         <Link className="auth-link" to={routes.register}>Create one</Link>
                    </p>
                </div>
            </div>
        </section>
    );
}