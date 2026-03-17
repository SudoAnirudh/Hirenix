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
  "p-2 rounded-none transition-all disabled:opacity-50 disabled:pointer-events-none border-2 border-transparent hover:border-(--indigo) hover:bg-(--indigo)/5";

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

  const activeClass =
    "bg-(--indigo)/20 border-(--indigo) text-(--indigo) shadow-[2px_2px_0px_var(--indigo)] -translate-x-0.5 -translate-y-0.5";
  const idleClass = "text-(--text-secondary) border-transparent";

  return (
    <div className="flex flex-wrap items-center gap-2 p-3 sticky top-0 z-10 border-b-2 border-(--border) bg-(--bg-elevated)">
      <div className="flex items-center gap-1.5 pr-2 mr-1 border-r-2 border-(--border)">
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

      <div className="flex items-center gap-1.5 pr-2 mr-1 border-r-2 border-(--border)">
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

      <div className="flex items-center gap-1.5 pr-2 mr-1 border-r-2 border-(--border)">
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

      <div className="flex items-center gap-1.5 pr-2 mr-1 border-r-2 border-(--border)">
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

      <div className="flex items-center gap-1.5 pr-2 mr-1 border-r-2 border-(--border)">
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

      <div className="flex items-center gap-1.5">
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
          class: "underline cursor-pointer font-bold",
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
          "prose prose-sm sm:prose-base max-w-none focus:outline-none min-h-[800px] p-10 font-mono",
      },
    },
  });

  return (
    <div className="flex flex-col h-full bg-(--bg-surface) border-2 border-(--border) shadow-[8px_8px_0px_var(--border)] overflow-hidden">
      <div className="print:hidden">
        <MenuBar editor={editor} />
      </div>
      <div className="flex-1 overflow-y-auto p-6 sm:p-12 print:p-0 bg-(--bg-elevated) flex justify-center">
        <div className="bg-white text-black w-full max-w-[210mm] min-h-[297mm] print:ring-0 print:m-0 shrink-0 border-2 border-[#e8dccb] shadow-[12px_12px_0px_rgba(0,0,0,0.1)]">
          <EditorContent editor={editor} />
        </div>
      </div>
    </div>
  );
}
