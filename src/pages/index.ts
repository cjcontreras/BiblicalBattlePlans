// Eagerly-loaded public pages (imported via barrel)
export { Landing } from './Landing'
export { Login } from './Login'
export { Signup } from './Signup'
export { ForgotPassword } from './ForgotPassword'
export { ResetPassword } from './ResetPassword'
export { About } from './About'

// Protected pages are lazy-loaded via React.lazy() in App.tsx.
// Do NOT re-export them here — it defeats code-splitting.
