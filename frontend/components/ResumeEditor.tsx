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
  "p-2 rounded-xl transition-all disabled:opacity-50 disabled:pointer-events-none hover:bg-[#7C9ADD]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7C9ADD] text-[#4A5568]";

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

  const activeClass = "bg-[#7C9ADD]/10 text-[#7C9ADD] shadow-sm";
  const idleClass = "text-[#718096]";

  return (
    <div className="flex flex-wrap items-center gap-1.5 p-3 sticky top-0 z-10 border-b border-white/60 bg-white/60 backdrop-blur-xl">
      <div className="flex items-center gap-1 pr-2 mr-1 border-r border-[#7C9ADD]/10">
        <button
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().chain().focus().undo().run()}
          className={`${toolbarBtn} ${idleClass}`}
          title="Undo"
          aria-label="Undo"
        >
          <Undo className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().chain().focus().redo().run()}
          className={`${toolbarBtn} ${idleClass}`}
          title="Redo"
          aria-label="Redo"
        >
          <Redo className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-center gap-1.5 pr-2 mr-1 border-r border-[#7C9ADD]/10">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editor.can().chain().focus().toggleBold().run()}
          className={`${toolbarBtn} ${editor.isActive("bold") ? activeClass : idleClass}`}
          title="Bold"
          aria-label="Bold"
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
          className={`${toolbarBtn} ${editor.isActive("italic") ? activeClass : idleClass}`}
          title="Italic"
          aria-label="Italic"
        >
          <Italic className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          disabled={!editor.can().chain().focus().toggleUnderline().run()}
          className={`${toolbarBtn} ${editor.isActive("underline") ? activeClass : idleClass}`}
          title="Underline"
          aria-label="Underline"
        >
          <UnderlineIcon className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-center gap-1.5 pr-2 mr-1 border-r border-[#7C9ADD]/10">
        <button
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          className={`${toolbarBtn} ${editor.isActive("heading", { level: 1 }) ? activeClass : idleClass}`}
          title="Heading 1"
          aria-label="Heading 1"
        >
          <Heading1 className="w-4 h-4" />
        </button>
        <button
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          className={`${toolbarBtn} ${editor.isActive("heading", { level: 2 }) ? activeClass : idleClass}`}
          title="Heading 2"
          aria-label="Heading 2"
        >
          <Heading2 className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-center gap-1.5 pr-2 mr-1 border-r border-[#7C9ADD]/10">
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`${toolbarBtn} ${editor.isActive("bulletList") ? activeClass : idleClass}`}
          title="Bullet List"
          aria-label="Bullet List"
        >
          <List className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`${toolbarBtn} ${editor.isActive("orderedList") ? activeClass : idleClass}`}
          title="Numbered List"
          aria-label="Numbered List"
        >
          <ListOrdered className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-center gap-1.5 pr-2 mr-1 border-r border-[#7C9ADD]/10">
        <button
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          className={`${toolbarBtn} ${editor.isActive({ textAlign: "left" }) ? activeClass : idleClass}`}
          title="Align Left"
          aria-label="Align Left"
        >
          <AlignLeft className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          className={`${toolbarBtn} ${editor.isActive({ textAlign: "center" }) ? activeClass : idleClass}`}
          title="Align Center"
          aria-label="Align Center"
        >
          <AlignCenter className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          className={`${toolbarBtn} ${editor.isActive({ textAlign: "right" }) ? activeClass : idleClass}`}
          title="Align Right"
          aria-label="Align Right"
        >
          <AlignRight className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign("justify").run()}
          className={`${toolbarBtn} ${editor.isActive({ textAlign: "justify" }) ? activeClass : idleClass}`}
          title="Justify"
          aria-label="Justify"
        >
          <AlignJustify className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-center gap-1.5">
        <button
          onClick={setLink}
          className={`${toolbarBtn} ${editor.isActive("link") ? activeClass : idleClass}`}
          title="Add Link"
          aria-label="Add Link"
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
          style: "color: #7C9ADD",
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
          "prose prose-sm sm:prose-base max-w-none focus:outline-none min-h-[800px] p-12 font-sans",
      },
    },
  });

  return (
    <div className="flex flex-col h-full bg-white/40 border border-white/60 rounded-[32px] shadow-glass backdrop-blur-sm overflow-hidden">
      <div className="print:hidden">
        <MenuBar editor={editor} />
      </div>
      <div className="flex-1 overflow-y-auto p-12 sm:p-20 print:p-0 bg-transparent flex justify-center">
        <div className="bg-white text-[#2D3748] w-full max-w-[210mm] min-h-[297mm] print:ring-0 print:m-0 shrink-0 border border-white/60 shadow-glass rounded-xl overflow-hidden ring-1 ring-black/5">
          <EditorContent editor={editor} />
        </div>
      </div>
    </div>
  );
}
