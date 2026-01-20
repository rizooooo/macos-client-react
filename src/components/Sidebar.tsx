import React, { useEffect, useState } from 'react'
import {
  ChevronDown,
  ChevronRight,
  EllipsisVertical,
  FolderIcon,
  FolderOpen,
  FolderPen,
  FolderPlus,
  Trash,
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate, useParams } from '@tanstack/react-router'
import classNames from 'classnames'
import { Button, Dropdown } from 'react-bootstrap'
import FolderModal from './FolderModal'
import type { FolderDto } from 'api'
import useApi from '@/hooks/useApi'

// --- Types ---
interface FolderItemProps {
  folder: FolderDto
  level: number
  // Updated signature to accept mode
  onSetCurrentFolder: (
    folder: FolderDto | null | undefined,
    mode: 'create' | 'rename',
  ) => void
  currentFolderAncestry?: Array<string>
}

// --- Custom Toggle Component ---
const CustomToggle = React.forwardRef<
  HTMLDivElement,
  { onClick: (e: React.MouseEvent) => void }
>(({ onClick }, ref) => (
  <div
    ref={ref}
    onClick={(e) => {
      e.preventDefault()
      e.stopPropagation()
      onClick(e)
    }}
    className="p-1 ms-2 text-dark opacity-50 hover-opacity-100 d-flex align-items-center justify-content-center rounded-circle"
    style={{ cursor: 'pointer', width: '24px', height: '24px' }}
  >
    <EllipsisVertical size={16} />
  </div>
))
CustomToggle.displayName = 'CustomToggle'

// --- Folder Item Component ---
const FolderItem = ({
  folder,
  level,
  onSetCurrentFolder,
  currentFolderAncestry,
}: FolderItemProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const params = useParams({ shouldThrow: false, strict: false })
  const navigate = useNavigate()

  const isExpanded = currentFolderAncestry?.includes(folder.id)
  const isActive = params?.folderId === folder.id
  const paddingLeft = level * 16 + 12

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsOpen(!isOpen)
  }

  useEffect(() => {
    if (isExpanded) {
      setIsOpen(true) // Changed to explicit true to avoid toggling off if re-rendered
    }
  }, [isExpanded])

  return (
    <>
      <li
        className={classNames(
          'list-group-item list-group-item-action border-0 rounded-3 my-1 py-1 small d-flex align-items-center position-relative folder-row',
          {
            'bg-white shadow-sm fw-bold text-dark': isActive,
            'bg-transparent text-dark opacity-75': !isActive,
          },
        )}
        style={{ cursor: 'pointer', paddingLeft: `${paddingLeft}px` }}
        onClick={() =>
          navigate({
            to: '/folder/$folderId',
            params: { folderId: folder.id! },
          })
        }
      >
        <span
          onClick={handleToggle}
          className="me-1 opacity-50 d-flex align-items-center justify-content-center"
          style={{ width: '16px', height: '16px' }}
        >
          {folder.hasChildren &&
            (isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />)}
        </span>

        <span className="me-2 d-flex align-items-center">
          {isActive ? <FolderOpen size={16} /> : <FolderIcon size={16} />}
        </span>

        <span className="text-truncate flex-grow-1">{folder.name}</span>

        {isActive && (
          <Dropdown
            drop="down-centered"
            align="end"
            onClick={(e) => e.stopPropagation()}
            autoClose="outside"
          >
            <Dropdown.Toggle as={CustomToggle} id={`dropdown-${folder.id}`} />

            <Dropdown.Menu style={{ minWidth: '160px' }}>
              <Dropdown.Item
                onClick={(e) => {
                  e.stopPropagation()
                  // Create: The current folder becomes the PARENT
                  onSetCurrentFolder(folder, 'create')
                }}
                className="d-flex align-items-center gap-1"
              >
                <FolderPlus size={14} />
                <span>New Folder</span>
              </Dropdown.Item>

              <Dropdown.Item
                className="d-flex align-items-center gap-1"
                onClick={(e) => {
                  e.stopPropagation()
                  // Rename: The current folder is the TARGET
                  onSetCurrentFolder(folder, 'rename')
                }}
              >
                <FolderPen size={14} />
                <span>Rename</span>
              </Dropdown.Item>

              <Dropdown.Divider className="my-1" />

              <Dropdown.Item
                className="d-flex align-items-center gap-1 text-danger"
                onClick={(e) => {
                  e.stopPropagation()
                  console.log('Delete', folder.id)
                }}
              >
                <Trash size={14} />
                <span>Delete</span>
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        )}
      </li>

      {isOpen && folder.hasChildren && (
        <FolderCollapse
          id={folder.id}
          level={level + 1}
          currentFolderAncestry={currentFolderAncestry}
          onSetCurrentFolder={onSetCurrentFolder}
        />
      )}
    </>
  )
}

// ----------------------------------------------------
// MAIN COMPONENT (Parent)
// ----------------------------------------------------
export default function SidebarPane() {
  const [showFolderModal, setShowFolderModal] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'rename'>('create') // 1. Add state for mode

  const [currentFolder, setCurrentFolder] = useState<
    FolderDto | null | undefined
  >(null)

  const { folderId } = useParams({ from: '/folder/$folderId' })
  const { folderApi } = useApi()
  const query = useQuery({
    queryKey: [`Folders`],
    queryFn: async () => folderApi.getFolders({ folderId }),
  })

  // 2. Update handler to accept mode
  const onSetCurrentFolder = (
    folder: FolderDto | null | undefined,
    mode: 'create' | 'rename' = 'create',
  ) => {
    setCurrentFolder(folder)
    setModalMode(mode)
    setShowFolderModal(true)
  }

  const { folders, currentFolderAncestry } = query.data || {}

  return (
    <div className="d-flex flex-column h-100 w-100">
      <style>{`
        .hover-opacity-100:hover { opacity: 1 !important; background-color: rgba(0,0,0,0.05); }
        .folder-row .dropdown-toggle { visibility: hidden; }
        .folder-row:hover .dropdown-toggle { visibility: visible; }
        .folder-row .show.dropdown-toggle { visibility: visible; }
      `}</style>

      <div className="p-3 d-flex align-items-center justify-content-between">
        <span
          className="fw-bold text-dark small text-uppercase"
          style={{ letterSpacing: '1px' }}
        >
          DelNOTES
        </span>
        <Button
          variant="light"
          size="sm"
          className="rounded-circle p-1 border d-flex align-items-center justify-content-center"
          // Root level create
          onClick={() => onSetCurrentFolder(undefined, 'create')}
          style={{ width: '28px', height: '28px' }}
        >
          <FolderPlus size={16} />
        </Button>
      </div>

      <div className="flex-grow-1 overflow-auto px-2 pb-4">
        <ul className="list-group list-group-flush">
          {folders?.map((folder) => (
            <FolderItem
              currentFolderAncestry={currentFolderAncestry || []}
              key={folder.id}
              folder={folder}
              level={0}
              onSetCurrentFolder={onSetCurrentFolder}
            />
          ))}
        </ul>
      </div>

      {showFolderModal && (
        <FolderModal
          currentFolder={currentFolder}
          mode={modalMode} // 3. Pass the mode to the modal
          onHide={() => setShowFolderModal(false)}
        />
      )}
    </div>
  )
}

function FolderCollapse({
  id,
  level,
  onSetCurrentFolder,
  currentFolderAncestry,
}: {
  id: string
  level: number
  onSetCurrentFolder: (
    folder: FolderDto | null | undefined,
    mode: 'create' | 'rename',
  ) => void
  currentFolderAncestry?: Array<string>
}) {
  const { folderApi } = useApi()
  const { data } = useQuery({
    queryKey: ['ChildrenFolders', { id }],
    queryFn: async () => await folderApi.getFoldersById({ id }),
  })

  return (
    <ul className="list-group list-group-flush">
      {data?.map((folder) => (
        <FolderItem
          key={folder.id}
          folder={folder}
          level={level}
          onSetCurrentFolder={onSetCurrentFolder}
          currentFolderAncestry={currentFolderAncestry}
        />
      ))}
    </ul>
  )
}
