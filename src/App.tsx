import { RouterProvider, createRouter } from '@tanstack/react-router'
import * as TanStackQueryProvider from './integrations/tanstack-query/root-provider'
import { routeTree } from '@/routeTree.gen'
import useApi from '@/hooks/useApi'

const TanStackQueryProviderContext = TanStackQueryProvider.getContext()
const router = createRouter({
  routeTree,
  context: {
    ...TanStackQueryProviderContext,
    api: {
      note: undefined,
      folder: undefined,
    },
  },
  defaultPreload: 'intent',
  scrollRestoration: true,
  defaultStructuralSharing: true,
  defaultPreloadStaleTime: 0,
})

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

// const Route = createFileRoute('/')({
//   component: App,
// })

export default function App() {
  const { folderApi, noteApi } = useApi()
  return (
    <RouterProvider
      router={router}
      context={{
        api: {
          folder: folderApi,
          note: noteApi,
        },
      }}
    />
  )
}
