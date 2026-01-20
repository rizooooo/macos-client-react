import React from 'react'
import { Search, SquarePen, TrashIcon } from 'lucide-react'
import { Button, Form, InputGroup } from 'react-bootstrap'
import { useMutation } from '@tanstack/react-query'
import { useNavigate, useParams } from '@tanstack/react-router'
import type { CreateUpdateNoteDto, Note } from 'api'
import useApi from '@/hooks/useApi'

// Define the 3 possible views for mobile
export type MobilePane = 'sidebar' | 'list' | 'detail'

interface LayoutProps {
  children?: React.ReactNode // The Note Content (Pane 3)
  sidebar?: React.ReactNode // The Sidebar Component (Pane 1)
  // activePane: MobilePane // Which pane is visible on mobile?
  // onNavigate: (pane: MobilePane) => void // Function to change views
}

export default function Layout({
  children,
  sidebar,
  //   activePane,
  //   onNavigate,
}: LayoutProps) {
  const { noteApi } = useApi()
  const navigate = useNavigate()
  const { folderId } = useParams({
    from: '/folder/$folderId',
  })

  const params = useParams({
    from: '/folder/$folderId/note/$noteId',
    shouldThrow: false,
  })

  const mutationNew = useMutation<Note, Error, Partial<CreateUpdateNoteDto>>({
    mutationFn: async () => {
      return await noteApi.createNote({
        createUpdateNoteDto: {
          folderId,
          title: 'New note title',
          content: 'new content',
        },
      })
    },
    onSuccess: (_data, vars, _onMutateResult, context) => {
      context.client.setQueryData<Array<Note>>(
        [`Notes`, { folderId }],
        (items) => [{ id: _data.id, ...vars }, ...items],
      )

      navigate({
        to: '/folder/$folderId/note/$noteId',
        params: { folderId, noteId: _data.id! },
      })
    },
  })
  const activePane: MobilePane = 'detail'
  // Helper to determine visibility classes
  // If it's the active pane: 'd-flex' (Visible)
  // If not: 'd-none' (Hidden)
  // ALWAYS: 'd-md-flex' (Visible on Desktop)
  const getVisibilityClass = (paneName: MobilePane) => {
    return activePane === paneName ? 'd-flex' : 'd-none d-md-flex'
  }

  return (
    <div className="container-fluid vh-100 overflow-hidden bg-white p-0">
      <div className="row h-100 g-0">
        {/* ============================================= */}
        {/* PANE 1: SIDEBAR (Folders)                     */}
        {/* ============================================= */}
        <div
          className={`col-12 col-md-2 bg-primary border-end border-dark flex-column h-100 ${getVisibilityClass('sidebar')}`}
        >
          {sidebar}
        </div>
        {/* {children} */}
        <div className="d-flex flex-column col-md-10 h-100">
          <nav className="border-bottom bg-primary container-fluid m-0">
            <div className="row">
              {/* <div className="col-3 d-flex justify-content-end  h-100 border-end p-0"> */}
              <div className="col-3 border-end">
                <div className="d-flex justify-content-end py-2 px-1 align-items-center h-100">
                  <Button
                    size="sm"
                    variant="danger"
                    disabled={!params?.noteId}
                    onClick={() => {
                      navigate({
                        to: '/folder/$folderId/note/$noteId/delete',
                        params: { folderId, noteId: params?.noteId as string },
                      })
                    }}
                  >
                    <TrashIcon size={18} />
                  </Button>
                </div>
              </div>
              <div className="col-9">
                <div className="d-flex justify-content-between py-2 px-1 align-items-center">
                  <Button size="sm" variant="light">
                    <SquarePen
                      size={18}
                      style={{ cursor: 'pointer' }}
                      onClick={() => {
                        mutationNew.mutate({})
                      }}
                    />
                  </Button>

                  <InputGroup className="w-25" size="sm">
                    <InputGroup.Text id="basic-addon1">
                      <Search size={15} />
                    </InputGroup.Text>
                    <Form.Control
                      size="sm"
                      placeholder="Search"
                      aria-label="Username"
                      aria-describedby="basic-addon1"
                    />
                  </InputGroup>
                </div>
              </div>
            </div>
          </nav>
          <div className="container h-100">
            <div className="row h-100">{children}</div>
          </div>
        </div>

        {/* ============================================= */}
        {/* PANE 2: NOTE LIST                             */}
        {/* ============================================= */}

        {/* <div
          className={`col-12 col-md bg-white flex-column h-100 ${getVisibilityClass('detail')}`}
        >
          <div className="d-flex align-items-center p-2 border-bottom border-dark d-md-none bg-light">
            <button
              className="btn btn-link text-dark text-decoration-none fw-bold d-flex align-items-center"
              onClick={() => {}}
            >
              <ChevronLeft size={20} className="me-1" />
              Back to Notes
            </button>
          </div>

          <div className="flex-grow-1 overflow-auto">{children}</div>
        </div> */}
      </div>
    </div>
  )
}
