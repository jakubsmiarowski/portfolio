import { betterAuth } from 'better-auth';
import { tanstackStartCookies } from 'better-auth/tanstack-start';

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
const betterAuthUrl =
    process.env.BETTER_AUTH_URL ||
    process.env.VITE_BETTER_AUTH_URL;

export const auth = betterAuth({
    baseURL: betterAuthUrl || undefined,
    emailAndPassword: {
        enabled: false,
    },
    socialProviders: googleClientId && googleClientSecret
        ? {
            google: {
                clientId: googleClientId,
                clientSecret: googleClientSecret,
                prompt: 'select_account',
            },
        }
        : undefined,
    plugins: [tanstackStartCookies()],
});
