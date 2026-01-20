import { Outlet, createRootRouteWithContext } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'

import TanStackQueryDevtools from '../integrations/tanstack-query/devtools'

import type { QueryClient } from '@tanstack/react-query'
import type { FolderApi, NoteApi } from 'api'
import Layout from '@/layout/main-layout'
import SidebarPane from '@/components/Sidebar'

interface MyRouterContext {
  queryClient: QueryClient
  api: {
    note?: NoteApi
    folder?: FolderApi
  }
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: () => (
    <>
      <Layout
        // activePane={mobilePane}
        // onNavigate={setMobilePane} // Pass the setter to handle back buttons
        sidebar={
          <SidebarPane
            // When a user selects a folder, automatically go to the 'list' view
            onSelectFolder={(id) => {
              console.log('Folder selected:', id)
              //   setMobilePane('list')
            }}
          />
        }
      >
        <Outlet />
        {/* EDITOR CONTENT */}
        {/* <div className="p-4">
          <h1 className="display-6 fw-bold">Meeting Notes</h1>
          <p className="text-muted">Tuesday, Jan 13, 2026</p>
          <hr className="border-dark" />
          <p>Content goes here...</p>
        </div> */}
      </Layout>
      <TanStackDevtools
        config={{
          position: 'bottom-right',
        }}
        plugins={[
          {
            name: 'Tanstack Router',
            render: <TanStackRouterDevtoolsPanel />,
          },
          TanStackQueryDevtools,
        ]}
      />
    </>
  ),
})
