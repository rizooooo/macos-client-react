import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/folder/')({
  component: RouteComponent,
  beforeLoad(ctx) {
    throw redirect({
      to: '/',
    })
  },
})

function RouteComponent() {
  return <div>Hello "/folder/"!</div>
}
