import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  async beforeLoad(ctx) {
    const api = ctx.context.api.folder!

    const response = await api.getFolders()

    const firstFolderId = response.folders[0].id

    throw redirect({
      to: '/folder/$folderId',
      params: { folderId: firstFolderId },
    })
  },
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/"!</div>
}
