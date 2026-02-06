import { createFileRoute, redirect } from '@tanstack/react-router';
import AuthComponent from '../components/Auth';

export const LoginRoute = createFileRoute('/login')({
    // Run before loading the route
    beforeLoad: ({ context }: { context: { user?: boolean } }) => {
        // If user is already logged in, redirect to main boards page
        if (context.user) {
            throw redirect({ to: '/' }); // or '/boards' if you have a boards root route
        }
    },
    component: AuthComponent,
});
