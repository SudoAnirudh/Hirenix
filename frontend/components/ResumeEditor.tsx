"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Link from "@tiptap/extension-link";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Undo,
  Redo,
  Link as LinkIcon,
} from "lucide-react";

const toolbarBtn =
  "p-1.5 rounded transition-colors disabled:opacity-50 disabled:pointer-events-none";

const MenuBar = ({
  editor,
}: {
  editor: import("@tiptap/react").Editor | null;
}) => {
  if (!editor) {
    return null;
  }

  const setLink = () => {
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("URL", previousUrl);

    if (url === null) {
      return;
    }

    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const activeClass = "bg-[rgba(11,124,118,0.14)] text-[color:var(--indigo)]";
  const idleClass =
    "text-[color:var(--text-secondary)] hover:bg-[rgba(11,124,118,0.08)]";

  return (
    <div
      className="flex flex-wrap items-center gap-1 p-2 rounded-t-lg sticky top-0 z-10"
      style={{
        borderBottom: "1px solid var(--border)",
        background: "var(--bg-elevated)",
      }}
    >
      <div
        className="flex items-center space-x-1 pr-2 mr-1"
        style={{ borderRight: "1px solid var(--border)" }}
      >
        <button
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().chain().focus().undo().run()}
          className={`${toolbarBtn} ${idleClass}`}
          title="Undo"
        >
          <Undo className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().chain().focus().redo().run()}
          className={`${toolbarBtn} ${idleClass}`}
          title="Redo"
        >
          <Redo className="w-4 h-4" />
        </button>
      </div>

      <div
        className="flex items-center space-x-1 pr-2 mr-1"
        style={{ borderRight: "1px solid var(--border)" }}
      >
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editor.can().chain().focus().toggleBold().run()}
          className={`${toolbarBtn} ${editor.isActive("bold") ? activeClass : idleClass}`}
          title="Bold"
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
          className={`${toolbarBtn} ${editor.isActive("italic") ? activeClass : idleClass}`}
          title="Italic"
        >
          <Italic className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          disabled={!editor.can().chain().focus().toggleUnderline().run()}
          className={`${toolbarBtn} ${editor.isActive("underline") ? activeClass : idleClass}`}
          title="Underline"
        >
          <UnderlineIcon className="w-4 h-4" />
        </button>
      </div>

      <div
        className="flex items-center space-x-1 pr-2 mr-1"
        style={{ borderRight: "1px solid var(--border)" }}
      >
        <button
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          className={`${toolbarBtn} ${editor.isActive("heading", { level: 1 }) ? activeClass : idleClass}`}
          title="Heading 1"
        >
          <Heading1 className="w-4 h-4" />
        </button>
        <button
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          className={`${toolbarBtn} ${editor.isActive("heading", { level: 2 }) ? activeClass : idleClass}`}
          title="Heading 2"
        >
          <Heading2 className="w-4 h-4" />
        </button>
      </div>

      <div
        className="flex items-center space-x-1 pr-2 mr-1"
        style={{ borderRight: "1px solid var(--border)" }}
      >
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`${toolbarBtn} ${editor.isActive("bulletList") ? activeClass : idleClass}`}
          title="Bullet List"
        >
          <List className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`${toolbarBtn} ${editor.isActive("orderedList") ? activeClass : idleClass}`}
          title="Numbered List"
        >
          <ListOrdered className="w-4 h-4" />
        </button>
      </div>

      <div
        className="flex items-center space-x-1 pr-2 mr-1"
        style={{ borderRight: "1px solid var(--border)" }}
      >
        <button
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          className={`${toolbarBtn} ${editor.isActive({ textAlign: "left" }) ? activeClass : idleClass}`}
          title="Align Left"
        >
          <AlignLeft className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          className={`${toolbarBtn} ${editor.isActive({ textAlign: "center" }) ? activeClass : idleClass}`}
          title="Align Center"
        >
          <AlignCenter className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          className={`${toolbarBtn} ${editor.isActive({ textAlign: "right" }) ? activeClass : idleClass}`}
          title="Align Right"
        >
          <AlignRight className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign("justify").run()}
          className={`${toolbarBtn} ${editor.isActive({ textAlign: "justify" }) ? activeClass : idleClass}`}
          title="Justify"
        >
          <AlignJustify className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-center space-x-1">
        <button
          onClick={setLink}
          className={`${toolbarBtn} ${editor.isActive("link") ? activeClass : idleClass}`}
          title="Add Link"
        >
          <LinkIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

interface ResumeEditorProps {
  content: string;
  onChange: (content: string) => void;
}

export function ResumeEditor({ content, onChange }: ResumeEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "underline cursor-pointer",
          style: "color: var(--indigo)",
        },
      }),
    ],
    content: content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose-base max-w-none focus:outline-none min-h-[800px] p-8",
      },
    },
  });

  return (
    <div
      className="rounded-lg overflow-hidden flex flex-col h-full print:border-none print:shadow-none print:bg-white"
      style={{
        border: "1px solid var(--border)",
        boxShadow: "0 10px 26px rgba(76, 58, 39, 0.12)",
        background: "var(--bg-surface)",
      }}
    >
      <div className="print:hidden">
        <MenuBar editor={editor} />
      </div>
      <div
        className="flex-1 overflow-y-auto p-4 sm:p-8 print:p-0 print:bg-white flex justify-center"
        style={{ background: "var(--bg-elevated)" }}
      >
        <div
          className="bg-white print:bg-white print:shadow-none w-full max-w-[210mm] min-h-[297mm] print:ring-0 print:m-0 shrink-0"
          style={{
            boxShadow: "0 8px 18px rgba(56, 43, 28, 0.14)",
            border: "1px solid #e8dccb",
          }}
        >
          <EditorContent editor={editor} />
        </div>
      </div>
    </div>
  );
}
