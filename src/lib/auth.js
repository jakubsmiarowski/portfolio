import { betterAuth } from 'better-auth';
import { tanstackStartCookies } from 'better-auth/tanstack-start';

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

export const auth = betterAuth({
    emailAndPassword: {
        enabled: false,
    },
    socialProviders: googleClientId && googleClientSecret
        ? {
            google: {
                clientId: googleClientId,
                clientSecret: googleClientSecret,
            },
        }
        : undefined,
    plugins: [tanstackStartCookies()],
});
