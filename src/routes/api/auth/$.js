import { createFileRoute } from '@tanstack/react-router';
import { auth } from '@/lib/auth';
import { withRobotsHeader } from '@/lib/seo';
export const Route = createFileRoute('/api/auth/$')({
    server: {
        handlers: {
            GET: async ({ request }) => withRobotsHeader(await auth.handler(request)),
            POST: async ({ request }) => withRobotsHeader(await auth.handler(request)),
        },
    },
});
