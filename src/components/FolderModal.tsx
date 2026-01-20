import { useForm } from '@tanstack/react-form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Button, Form, Modal } from 'react-bootstrap'
import type { Folder, FolderDto, FoldersReturnResponse } from 'api'
import useApi from '@/hooks/useApi'

interface FolderModalProps {
  onHide: () => void
  currentFolder?: FolderDto | null
  mode?: 'create' | 'rename'
}

export default function FolderModal({
  onHide,
  currentFolder = null,
  mode = 'create',
}: FolderModalProps) {
  const queryClient = useQueryClient()
  const { folderApi } = useApi()

  // --- Existing Create Mutation ---
  const mutationNewFolder = useMutation<
    Folder,
    Error,
    { name: string },
    {
      previousFolders: Array<FolderDto>
      previousFoldersParent: FoldersReturnResponse
    }
  >({
    mutationFn: async (params) => {
      const response = await folderApi.createFolder({
        createFolderDto: {
          name: params.name,
          parentId: currentFolder?.id,
        },
      })
      return response
    },
    onMutate: async (variables) => {
      const parentId = currentFolder?.id

      await queryClient.cancelQueries({
        queryKey: ['ChildrenFolders', { id: parentId }],
      })

      await queryClient.cancelQueries({
        queryKey: ['Folders'],
      })

      const previousFolders =
        queryClient.getQueryData<Array<FolderDto>>([
          'ChildrenFolders',
          { id: parentId },
        ]) || []

      const previousFoldersParent =
        queryClient.getQueryData<FoldersReturnResponse>(['Folders'])!

      queryClient.setQueryData<FoldersReturnResponse>(['Folders'], (old) => {
        if (old && old.folders && old.folders.length > 0) {
          return {
            ...old,
            folders: [
              ...old.folders.map((item) => {
                if (item.id === parentId && !item.hasChildren) {
                  return { ...item, hasChildren: true }
                }
                return item
              }),
            ],
          }
        }
        return old
      })

      queryClient.setQueryData<Array<FolderDto>>(
        ['ChildrenFolders', { id: parentId }],
        (old) => {
          if (old && old.length > 0) {
            return [
              ...old.map((item) => {
                if (item.id === parentId) {
                  return { ...item, hasChildren: true }
                }
                return item
              }),
              { id: 'temp-id', name: variables.name } as FolderDto,
            ]
          }
          return old
        },
      )

      onHide()
      return { previousFolders, previousFoldersParent }
    },
    onError: (_err, _newTodo, context) => {
      queryClient.setQueryData(
        ['ChildrenFolders', { id: currentFolder?.id }],
        context?.previousFolders || [],
      )
      queryClient.setQueryData(
        ['Folders'],
        context?.previousFoldersParent || [],
      )
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['ChildrenFolders', { id: currentFolder?.id }],
      })
    },
  })

  // --- Rename Mutation with Optimistic UI ---
  const mutationRenameFolder = useMutation<
    any,
    Error,
    { name: string },
    {
      previousFolders: Array<FolderDto> | undefined
      previousFoldersParent?: FoldersReturnResponse
    }
  >({
    mutationFn: async (params) => {
      if (!currentFolder?.id) throw new Error('No folder selected')

      return await folderApi.updateFolder({
        id: currentFolder.id,
        updateFolderDto: {
          name: params.name,
        },
      })
    },
    onMutate: async (variables) => {
      // 1. Cancel related queries
      await queryClient.cancelQueries({
        queryKey: ['ChildrenFolders', { id: currentFolder?.parentId }],
      })

      await queryClient.cancelQueries({
        queryKey: ['Folders'],
      })

      // 2. Snapshot previous value
      const previousFolders = queryClient.getQueryData<Array<FolderDto>>([
        'ChildrenFolders',
        { id: currentFolder?.parentId },
      ])

      const previousFoldersMain =
        queryClient.getQueryData<FoldersReturnResponse>(['Folders'])

      // 3. Optimistically update

      queryClient.setQueryData<FoldersReturnResponse>(['Folders'], (old) => {
        if (old && old.folders && old.folders.length > 0) {
          return {
            ...old,
            folders: [
              ...old.folders.map((item) => {
                if (item.id === currentFolder?.id) {
                  return { ...item, name: variables.name }
                }
                return item
              }),
            ],
          }
        }
        return old
      })

      queryClient.setQueryData<Array<FolderDto>>(
        ['ChildrenFolders', { id: currentFolder?.parentId }],
        (old) => {
          if (old) {
            return old.map((folder) => {
              if (folder.id === currentFolder?.id) {
                return { ...folder, name: variables.name }
              }
              return folder
            })
          }
          return old
        },
      )

      // Close modal immediately for a snappy feel
      onHide()

      return { previousFolders, previousFoldersParent: previousFoldersMain }
    },
    onError: (_err, _variables, context) => {
      if (context?.previousFolders) {
        queryClient.setQueryData(
          ['ChildrenFolders', { id: currentFolder?.parentId }],
          context.previousFolders,
        )
      }

      if (context?.previousFoldersParent) {
        queryClient.setQueryData(['Folders'], context.previousFoldersParent)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['ChildrenFolders', { id: currentFolder?.parentId }],
      })

      queryClient.invalidateQueries({
        queryKey: ['Folders'],
      })
    },
  })

  const isPending =
    mutationNewFolder.isPending || mutationRenameFolder.isPending

  const form = useForm({
    defaultValues: {
      name: mode === 'rename' && currentFolder ? currentFolder.name : '',
    },
    onSubmit: ({ value }) => {
      if (mode === 'rename') {
        mutationRenameFolder.mutate({ name: value.name })
      } else {
        mutationNewFolder.mutate({ name: value.name })
      }
    },
  })

  const titleText = mode === 'rename' ? 'Rename folder' : 'Create folder'
  const buttonText = mode === 'rename' ? 'Save changes' : 'Create folder'
  const loadingText = mode === 'rename' ? 'Saving...' : 'Creating folder'

  return (
    <Modal show size="sm">
      <Modal.Header onHide={onHide} closeButton>
        <Modal.Title>{titleText}</Modal.Title>
      </Modal.Header>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          e.stopPropagation()
          form.handleSubmit()
        }}
      >
        <Modal.Body className="p-4">
          <form.Field
            name="name"
            children={(field) => (
              <>
                <Form.Label htmlFor={field.name}>Name</Form.Label>
                <Form.Control
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  type="text"
                  autoFocus
                />
              </>
            )}
          />
        </Modal.Body>

        <Modal.Footer className="bg-light border-top border-2 border-dark">
          <Button
            onClick={onHide}
            variant="white"
            className="border border-2 border-dark fw-bold shadow-sm"
          >
            Cancel
          </Button>
          <Button
            disabled={isPending}
            type="submit"
            variant="success"
            className="border border-2 border-dark fw-bold shadow-sm"
          >
            {isPending ? loadingText : buttonText}
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  )
}
