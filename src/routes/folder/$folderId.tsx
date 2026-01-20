import { useQuery } from '@tanstack/react-query'

import { useVirtualizer } from '@tanstack/react-virtual'

import {
  Outlet,
  createFileRoute,
  useNavigate,
  useParams,
} from '@tanstack/react-router'

import classNames from 'classnames'

import React from 'react'

import useApi from '@/hooks/useApi'

export const Route = createFileRoute('/folder/$folderId')({
  component: RouteComponent,
})

function RouteComponent() {
  const { noteApi } = useApi()

  const { folderId } = Route.useParams()

  const navigate = useNavigate()

  const params = useParams({
    strict: false,

    shouldThrow: false,
  })

  const notesQuery = useQuery({
    queryKey: [`Notes`, { folderId }],

    queryFn: async () => {
      const response = await noteApi.getNotesByFolderId({ id: folderId })

      return response
    },
  })

  const parentRef = React.useRef(null)

  const rowVirtualizer = useVirtualizer({
    count: notesQuery.data?.length || 0,

    getScrollElement: () => parentRef.current,

    estimateSize: () => 88,
  })

  const notes = notesQuery.data!

  if (notesQuery.isLoading) {
    return <h1>Loading;</h1>
  }

  return (
    <>
      <div
        className={`p-0 col-md-3 bg-white border-end border-dark flex-column h-100`}
      >
        {/* SEARCH HEADER */}

        {/* Scrollable List */}

        <div
          className="h-100"
          style={{ overflowY: 'scroll', paddingBottom: '4rem' }}
          ref={parentRef}
        >
          <div
            style={{
              height: `${rowVirtualizer.getTotalSize()}px`,

              width: '100%',

              position: 'relative',
            }}
            className="list-group list-group-flush"
          >
            {rowVirtualizer.getVirtualItems().map((virtualItem) => (
              <div
                key={virtualItem.key}
                style={{
                  position: 'absolute',

                  top: 0,

                  left: 0,

                  width: '100%',

                  height: `${virtualItem.size}px`,

                  transform: `translateY(${virtualItem.start}px)`,
                }}
                className={classNames(
                  'list-group-item list-group-item-action py-3 lh-sm border-bottom',

                  {
                    'bg-primary bg-opacity-50':
                      params?.noteId === notes[virtualItem.index].id,

                    'bg-light': params?.noteId !== notes[virtualItem.index].id,
                  },
                )}
                onClick={() => {
                  navigate({
                    to: '/folder/$folderId/note/$noteId',

                    params: {
                      folderId,

                      noteId: notes[virtualItem.index].id!,
                    },
                  })
                }}
              >
                <div className="d-flex w-100 align-items-center justify-content-between mb-1">
                  <strong className="text-dark">
                    {notes[virtualItem.index].title}
                  </strong>

                  <small className="text-dark fw-bold">10:42 AM</small>
                </div>

                {/* <div className="col-10 small text-dark text-truncate">

<RichEditor

readOnly

value={notes[virtualItem.index].content}

key={notes[virtualItem.index].content}

/>

</div> */}
              </div>
            ))}

            {/* {notesQuery.data?.map((item) => (

<Link

to="/folder/$folderId/note/$noteId"

params={{

folderId,

noteId: item.id!,

}}

preload="intent"

key={item.id}

className={classNames(

'list-group-item list-group-item-action border-bottom border-dark py-3 lh-sm',

{

'bg-primary bg-opacity-50': noteId === item.id,

'bg-light': noteId !== item.id,

},

)}

>

<div className="d-flex w-100 align-items-center justify-content-between mb-1">

<strong className="text-dark">{item.title}</strong>

<small className="text-dark fw-bold">10:42 AM</small>

</div>

<div className="col-10 small text-dark text-truncate">

<RichEditor

readOnly

value={item.content}

key={item.content}

/>

</div>

</Link>

))} */}
          </div>
        </div>
      </div>

      <Outlet />
    </>
  )
}
