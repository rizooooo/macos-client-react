import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_LOW,
  FORMAT_TEXT_COMMAND,
  SELECTION_CHANGE_COMMAND,
} from 'lexical'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { mergeRegister } from '@lexical/utils'

// 1. Import icons from lucide-react
import {
  Bold,
  Code,
  Italic,
  Link as LinkIcon,
  Strikethrough,
  Underline,
} from 'lucide-react'

function FloatingToolbar({ editor }: { editor: any }) {
  const popupCharStylesEditorRef = useRef<HTMLDivElement>(null)
  const [coords, setCoords] = useState<
    { left: number; top: number } | undefined
  >(undefined)

  // State to track active formats
  const [isBold, setIsBold] = useState(false)
  const [isItalic, setIsItalic] = useState(false)
  const [isUnderline, setIsUnderline] = useState(false)
  const [isStrikethrough, setIsStrikethrough] = useState(false)
  const [isCode, setIsCode] = useState(false)

  const updateToolbar = useCallback(() => {
    const selection = $getSelection()
    if ($isRangeSelection(selection)) {
      setIsBold(selection.hasFormat('bold'))
      setIsItalic(selection.hasFormat('italic'))
      setIsUnderline(selection.hasFormat('underline'))
      setIsStrikethrough(selection.hasFormat('strikethrough'))
      setIsCode(selection.hasFormat('code'))
    }
  }, [])

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }: { editorState: any }) => {
        editorState.read(() => {
          updateToolbar()
        })
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        (_payload: any) => {
          updateToolbar()
          return false
        },
        COMMAND_PRIORITY_LOW,
      ),
    )
  }, [editor, updateToolbar])

  useEffect(() => {
    const checkSelection = () => {
      const selection = window.getSelection()
      const rootElement = editor.getRootElement()

      if (
        !selection ||
        selection.isCollapsed ||
        !rootElement ||
        !rootElement.contains(selection.anchorNode)
      ) {
        setCoords(undefined)
        return
      }

      const domRange = selection.getRangeAt(0)
      const rect = domRange.getBoundingClientRect()

      setCoords({
        left: rect.left + window.pageXOffset + rect.width / 2,
        top: rect.top + window.pageYOffset - 10,
      })
    }

    document.addEventListener('selectionchange', checkSelection)
    // Also check on scroll/resize so the bar moves with the text
    window.addEventListener('resize', checkSelection)
    window.addEventListener('scroll', checkSelection, true)

    return () => {
      document.removeEventListener('selectionchange', checkSelection)
      window.removeEventListener('resize', checkSelection)
      window.removeEventListener('scroll', checkSelection, true)
    }
  }, [editor])

  if (!coords) return null

  const buttonStyle = (isActive: boolean) => ({
    padding: '8px',
    border: 'none',
    background: isActive ? '#e0efff' : 'transparent', // Light blue bg when active
    color: isActive ? '#1d4ed8' : '#374151', // Dark blue text active, gray inactive
    borderRadius: '4px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    transition: 'background-color 0.2s',
  })

  const iconSize = 18

  return createPortal(
    <div
      ref={popupCharStylesEditorRef}
      style={{
        display: 'flex',
        position: 'absolute',
        top: coords.top,
        left: coords.left,
        transform: 'translate(-50%, -100%)',
        zIndex: 50,
        backgroundColor: '#fff',
        borderRadius: '8px',
        boxShadow:
          '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        padding: '4px',
        gap: '2px',
        marginBottom: '8px',
        border: '1px solid #e5e7eb',
      }}
      className="floating-toolbar"
    >
      <button
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')}
        style={buttonStyle(isBold)}
        aria-label="Bold"
      >
        <Bold size={iconSize} />
      </button>

      <button
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')}
        style={buttonStyle(isItalic)}
        aria-label="Italic"
      >
        <Italic size={iconSize} />
      </button>

      <button
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline')}
        style={buttonStyle(isUnderline)}
        aria-label="Underline"
      >
        <Underline size={iconSize} />
      </button>

      <button
        onClick={() =>
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough')
        }
        style={buttonStyle(isStrikethrough)}
        aria-label="Strikethrough"
      >
        <Strikethrough size={iconSize} />
      </button>

      <button
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'code')}
        style={buttonStyle(isCode)}
        aria-label="Code"
      >
        <Code size={iconSize} />
      </button>

      {/* Example Link button (functionality requires additional command) */}
      <button
        onClick={() => {
          /* logic to open link modal would go here */
        }}
        style={buttonStyle(false)}
        aria-label="Link"
      >
        <LinkIcon size={iconSize} />
      </button>
    </div>,
    document.body,
  )
}

export default function FloatingToolbarPlugin({
  anchorElem = document.body,
}: {
  anchorElem?: HTMLElement
}) {
  const [editor] = useLexicalComposerContext()
  return <FloatingToolbar editor={editor} />
}
