// ... Keep your existing imports ...
import { LexicalComposer } from '@lexical/react/LexicalComposer'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin'
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin'
import { ListPlugin } from '@lexical/react/LexicalListPlugin'
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin'
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin'
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary'

// ... Keep your Node imports ...
import { AutoLinkNode, LinkNode } from '@lexical/link'
import { ListItemNode, ListNode } from '@lexical/list'
import { TableCellNode, TableNode, TableRowNode } from '@lexical/table'
import { CodeNode } from '@lexical/code'
import { HeadingNode, QuoteNode } from '@lexical/rich-text'
import { HorizontalRuleNode } from '@lexical/react/LexicalHorizontalRuleNode'

// === IMPORT THE NEW PLUGIN ===
import FloatingToolbarPlugin from './FloatingToolbarPlugin'
import type { EditorState, LexicalEditor } from 'lexical'

// ... Keep your theme and onError ...

function onError(error) {
  console.error(error)
}

// function UpdateStatePlugin({ value }: { value?: string }) {
//   const [editor] = useLexicalComposerContext()

//   const currentValue: string | null = (() => {
//     try {
//       return value && JSON.parse(value) && value
//     } catch (error) {
//       return null
//     }
//   })()

//   useEffect(() => {
//     if (currentValue) {
//       const currentState = JSON.stringify(editor.getEditorState().toJSON())
//       if (currentValue !== currentState) {
//         const editorState = editor.parseEditorState(currentValue)
//         editor.setEditorState(editorState, { tag: 'programmatic-update' })
//       }
//     }
//   }, [value, editor])

//   return null
// }

function RichEditor({
  onChange,
  value,
  onBlur,
  name,
  id,
  readOnly,
}: {
  onChange?: (
    editorState: EditorState,

    editor: LexicalEditor,

    tags: Set<string>,
  ) => void

  onBlur?: React.FocusEventHandler<HTMLDivElement> | undefined

  id?: string

  name?: string

  value?: string // should be a valid editor state

  readOnly?: boolean
}) {
  const initialConfig = {
    namespace: 'MyEditor',
    // ... your config
    nodes: [
      // ... your nodes
      LinkNode,
      AutoLinkNode,
      ListNode,
      ListItemNode,
      TableNode,
      TableCellNode,
      TableRowNode,
      HorizontalRuleNode,
      CodeNode,
      HeadingNode,
      QuoteNode,
    ],
    onError,
  }

  const currentValue: string | null = (() => {
    try {
      return value && JSON.parse(value) && value
    } catch (error) {
      return null
    }
  })()

  return (
    <LexicalComposer
      initialConfig={{
        ...initialConfig,
        editorState: currentValue ? currentValue : undefined,
        // editorState: (editor) => {
        //   const state = editor.getEditorState()
        //   if (state.isEmpty()) {
        //     return null
        //   }

        //   editor.update(() => {
        //     if (currentValue) {
        //       const editorState = editor.parseEditorState(currentValue)
        //       editor.setEditorState(editorState)
        //     }
        //   })
        // },

        editable: !readOnly,
      }}
    >
      <RichTextPlugin
        contentEditable={
          <ContentEditable
            onBlur={onBlur}
            id={id}
            name={name}
            style={{ outline: 'none' }}
            className="w-100 h-100 m-0 p-0 border-0"
            aria-placeholder={'Enter some text...'}
            placeholder={<div>Enter some text...</div>}
          />
        }
        ErrorBoundary={LexicalErrorBoundary}
      />

      <HistoryPlugin />
      {/* <AutoFocusPlugin /> */}
      <LinkPlugin />
      <MarkdownShortcutPlugin />
      <ListPlugin />
      {/* <UpdateStatePlugin value={value} /> */}
      {/* === ADD THE FLOATING TOOLBAR HERE === */}
      <FloatingToolbarPlugin />

      {/* this is being called on load!! */}
      {onChange && <OnChangePlugin onChange={onChange} />}
    </LexicalComposer>
  )
}

export default RichEditor
