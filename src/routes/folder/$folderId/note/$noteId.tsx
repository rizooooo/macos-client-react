import { useMutation } from '@tanstack/react-query'

import { useForm } from '@tanstack/react-form'

import { Outlet, createFileRoute } from '@tanstack/react-router'

import { ChevronLeft } from 'lucide-react'

import type { Note, UpdateNoteDto } from 'api'

import useApi from '@/hooks/useApi'

import RichEditor from '@/components/RichEditor'

export const Route = createFileRoute('/folder/$folderId/note/$noteId')({
  component: RouteComponent,

  loader: async ({ context, params }) => {
    const noteApi = context.api.note!

    const response = await noteApi.getNoteById({ id: params.noteId })

    return response
  },
})

function RouteComponent() {
  const { noteId, folderId } = Route.useParams()

  const note = Route.useLoaderData()

  // const queryNoteDetail = useQuery({

  // queryKey: [`QueryNote`, { noteId, folderId }],

  // staleTime: 0,

  // queryFn: async () => {

  // const response = await noteApi.getNoteById({ id: noteId })

  // return response

  // },

  // })

  return (
    <>
      <div
        className={`col-md-9 bg-white flex-column h-100 p-0`}
        key={`folderid_${folderId}_noteid_${noteId}`}
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

        <div className="flex-grow-1 overflow-auto h-100">
          <div className="p-3 h-100">
            <NoteEditor note={note} key={noteId} />
          </div>
        </div>
      </div>

      <Outlet />
    </>
  )
}

function NoteEditor({ note }: { note: Note }) {
  const { id: noteId, folderId } = note

  const { noteApi } = useApi()

  const mutationUpdate = useMutation<void, Error, UpdateNoteDto>({
    mutationFn: async (params) => {
      await noteApi.updateNote({
        id: noteId!,

        updateNoteDto: params,
      })
    },

    async onMutate(variables, context) {
      await context.client.cancelQueries({ queryKey: [`Notes`, { folderId }] })

      // Snapshot the previous value

      const previousNotes = context.client.getQueryData([`Notes`, { folderId }])

      context.client.setQueryData<Array<Note>>(
        [`Notes`, { folderId }],

        (old) => {
          return old?.map((item) => {
            if (item.id === noteId) {
              return {
                ...item,

                title: variables.title!,

                content: variables.content!,
              }
            }

            return item
          })
        },
      )

      return { previousNotes }
    },

    onSuccess: () => {
      // queryClient.invalidateQueries({
      // queryKey: [`QueryNote`, { noteId, folderId }],
      // })
      // queryClient.setQueryData<Note[]>([`Notes`, { folderId }], items => {
      // if (items as Note) {
      // items.[0].
      // }
      // })
    },
  })

  const form = useForm({
    defaultValues: {
      title: note.title,

      content: note.content,
    },

    onSubmit: ({ value }) => {
      // Do something with form data

      mutationUpdate.mutate({
        title: value.title || '',

        content: value.content || '',

        folderId: folderId,
      })
    },

    listeners: {
      onChange: ({ formApi }) => {
        console.log({ formApi: formApi.state })

        formApi._handleSubmit()
      },

      onChangeDebounceMs: 1000,
    },
  })

  return (
    <form
      className="h-100"
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        form.handleSubmit()
      }}
    >
      <form.Field
        name="title"
        children={(field) => (
          <textarea
            autoFocus
            id={field.name}
            name={field.name}
            value={field.state.value}
            onBlur={field.handleBlur}
            onChange={(e) => field.handleChange(e.target.value)}
            style={{ resize: 'none' }}
            rows={1}
            className="w-100 border-0 display-6 fw-bold pl-0"
          />
        )}
      />

      {/* <h1 className="display-6 fw-bold">{queryNoteDetail.data?.title}</h1> */}
      <p className="text-muted">Tuesday, Jan 13, 2026</p>
      <hr className="border-dark" />
      {/* <p>{queryNoteDetail.data?.content}</p> */}

      {/* <form.Field
        name="content"
        children={(field) => (
          <textarea
            id={field.name}
            name={field.name}
            value={field.state.value}
            onBlur={field.handleBlur}
            onChange={(e) => field.handleChange(e.target.value)}
            className="w-100 border-0 h-100"
            style={{ resize: 'none' }}
          />
        )}
      /> */}

      <form.Field
        name="content"
        children={(field) => (
          <RichEditor
            onBlur={field.handleBlur}
            id={field.name}
            name={field.name}
            value={field.state.value}
            onChange={(e) => field.handleChange(JSON.stringify(e))}
          />
        )}
      />
    </form>
  )
}
