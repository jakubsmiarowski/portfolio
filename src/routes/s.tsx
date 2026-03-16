import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/s')({
  loader: () => {
    throw redirect({
      to: '/',
      replace: true,
    })
  },
  component: () => null,
})
