import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Button, Modal } from 'react-bootstrap'
import type { Note } from 'api'
import useApi from '@/hooks/useApi'

export const Route = createFileRoute('/folder/$folderId/note/$noteId/delete/')({
  component: RouteComponent,
  loader: () => {
    return
  },
})

function RouteComponent() {
  const { noteApi } = useApi()
  const { folderId, noteId } = Route.useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const notesData = queryClient.getQueryData<Note>([
    `QueryNote`,
    { noteId, folderId },
  ])

  // const currentNote = notesData && notesData.find((item) => item.id === noteId)

  // console.log({ currentNote })

  const mutationDelete = useMutation({
    mutationFn: async () => {
      return await noteApi.deleteNote({ id: noteId })
    },
    onSuccess(_data, _variables, _onMutateResult, context) {
      let latestNoteId: string | null | undefined = null
      context.client.setQueryData<Array<Note>>(
        [`Notes`, { folderId }],
        (items) => {
          const updatedList = items?.filter((item) => item.id !== noteId)
          latestNoteId = updatedList?.[0].id
          return updatedList
        },
      )

      navigate({
        to: '/folder/$folderId/note/$noteId',
        params: { folderId, noteId: latestNoteId! },
      })
    },
  })

  return (
    <Modal show>
      {/* Wrapper for the thick border look */}

      <Modal.Header
        onHide={() => {
          navigate({
            to: '/folder/$folderId/note/$noteId',
            params: { noteId, folderId },
          })
        }}
        closeButton
        className="border-bottom border-2 border-dark"
      >
        <Modal.Title className="text-danger fw-bold">Delete Note?</Modal.Title>
      </Modal.Header>

      <Modal.Body className="p-4">
        <p className="fs-5 mb-2">
          Are you sure you want to delete <strong>{notesData?.title}</strong>?
        </p>
        <p className="text-muted mb-0 small">
          This action cannot be undone and will permanently remove this note
          from your dashboard.
        </p>
      </Modal.Body>

      <Modal.Footer className="bg-light border-top border-2 border-dark">
        <Button
          onClick={() => {
            navigate({
              to: '/folder/$folderId/note/$noteId',
              params: { noteId, folderId },
            })
          }}
          variant="white"
          className="border border-2 border-dark fw-bold shadow-sm"
        >
          Cancel
        </Button>
        <Button
          onClick={() => {
            mutationDelete.mutate()
          }}
          variant="danger"
          className="border border-2 border-dark fw-bold shadow-sm"
        >
          Delete Permanently
        </Button>
      </Modal.Footer>
    </Modal>
  )
}
