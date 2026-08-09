import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import Youtube from "@tiptap/extension-youtube";
import { Table, TableRow, TableCell, TableHeader } from "@tiptap/extension-table";
import { useEffect } from "react";
import {
  Bold, Italic, Strikethrough, UnderlineIcon, Heading2, Heading3, Heading4,
  List, ListOrdered, Quote, Code, Minus, Link2, Link2Off, ImagePlus,
  Undo2, Redo2, AlignLeft, AlignCenter, AlignRight, Highlighter,
  Table as TableIcon, Rows3, Columns3, Trash2, Youtube as YoutubeIcon,
  Subscript as SubIcon, Superscript as SupIcon, Eraser,
} from "lucide-react";

interface Props {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

/** Turn a YouTube or Vimeo URL into an embeddable iframe src. */
function toEmbedSrc(url: string): string | null {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");
    if (host === "youtu.be") return `https://www.youtube.com/embed/${u.pathname.slice(1)}`;
    if (host.endsWith("youtube.com")) {
      const id = u.searchParams.get("v") ?? u.pathname.split("/").pop();
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    if (host.endsWith("vimeo.com")) {
      const id = u.pathname.split("/").filter(Boolean).pop();
      return id ? `https://player.vimeo.com/video/${id}` : null;
    }
  } catch {
    return null;
  }
  return null;
}

export function RichTextEditor({ value, onChange, placeholder }: Props) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
        link: false,
        underline: false,
      } as never),
      Underline,
      Link.configure({ openOnClick: false, autolink: true, HTMLAttributes: { rel: "noopener" } }),
      Image.configure({ HTMLAttributes: { class: "rounded-[20px]" } }),
      Highlight.configure({ multicolor: false }),
      Subscript,
      Superscript,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Table.configure({ resizable: true, allowTableNodeSelection: true }),
      TableRow,
      TableHeader,
      TableCell,
      Youtube.configure({ controls: true, nocookie: true, modestBranding: true, width: 840, height: 472 }),
      Placeholder.configure({ placeholder: placeholder ?? "Write your story…" }),
    ],
    content: value || "",
    onUpdate: ({ editor: ed }) => onChange(ed.getHTML()),
    editorProps: {
      attributes: {
        class: "prose-blog max-w-none min-h-[420px] px-5 py-4 focus:outline-none",
      },
    },
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || "", { emitUpdate: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, value]);

  if (!editor) {
    return <div className="min-h-[480px] rounded-[20px] border border-border bg-card" />;
  }

  const Btn = ({
    on, active, title, children,
  }: { on: () => void; active?: boolean; title: string; children: React.ReactNode }) => (
    <button
      type="button"
      title={title}
      aria-label={title}
      onClick={on}
      className={`grid h-8 w-8 place-items-center rounded-[10px] transition ${
        active ? "bg-navy text-champagne" : "text-muted-foreground hover:bg-muted hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );

  const Sep = () => <span className="mx-1 h-5 w-px bg-border" />;

  const setLink = () => {
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link URL (use /article/slug for internal links)", prev ?? "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const addImage = () => {
    const url = window.prompt("Image URL");
    if (!url) return;
    const alt = window.prompt("Alt text (important for SEO)") ?? "";
    editor.chain().focus().setImage({ src: url, alt }).run();
  };

  const addVideo = () => {
    const url = window.prompt("YouTube or Vimeo URL");
    if (!url) return;
    if (/youtu/.test(url)) {
      editor.commands.setYoutubeVideo({ src: url, width: 840, height: 472 });
      return;
    }
    const src = toEmbedSrc(url);
    if (!src) {
      window.alert("Unsupported video URL. Paste a YouTube or Vimeo link.");
      return;
    }
    editor
      .chain()
      .focus()
      .insertContent(
        `<div class="video-embed"><iframe src="${src}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowfullscreen loading="lazy" title="Embedded video"></iframe></div><p></p>`,
      )
      .run();
  };

  return (
    <div className="rounded-[20px] border border-border bg-card">
      <div className="sticky top-0 z-30 flex flex-wrap items-center gap-1 rounded-t-[20px] border-b border-border bg-muted px-2 py-1.5 backdrop-blur supports-[backdrop-filter]:bg-muted/95">
        <Btn on={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} title="Bold"><Bold className="h-4 w-4" /></Btn>
        <Btn on={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} title="Italic"><Italic className="h-4 w-4" /></Btn>
        <Btn on={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")} title="Underline"><UnderlineIcon className="h-4 w-4" /></Btn>
        <Btn on={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")} title="Strikethrough"><Strikethrough className="h-4 w-4" /></Btn>
        <Btn on={() => editor.chain().focus().toggleHighlight().run()} active={editor.isActive("highlight")} title="Highlight"><Highlighter className="h-4 w-4" /></Btn>
        <Btn on={() => editor.chain().focus().toggleSubscript().run()} active={editor.isActive("subscript")} title="Subscript"><SubIcon className="h-4 w-4" /></Btn>
        <Btn on={() => editor.chain().focus().toggleSuperscript().run()} active={editor.isActive("superscript")} title="Superscript"><SupIcon className="h-4 w-4" /></Btn>
        <Sep />
        <Btn on={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })} title="Heading 2"><Heading2 className="h-4 w-4" /></Btn>
        <Btn on={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive("heading", { level: 3 })} title="Heading 3"><Heading3 className="h-4 w-4" /></Btn>
        <Btn on={() => editor.chain().focus().toggleHeading({ level: 4 }).run()} active={editor.isActive("heading", { level: 4 })} title="Heading 4"><Heading4 className="h-4 w-4" /></Btn>
        <Sep />
        <Btn on={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} title="Bullet list"><List className="h-4 w-4" /></Btn>
        <Btn on={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} title="Numbered list"><ListOrdered className="h-4 w-4" /></Btn>
        <Btn on={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")} title="Quote"><Quote className="h-4 w-4" /></Btn>
        <Btn on={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive("codeBlock")} title="Code block"><Code className="h-4 w-4" /></Btn>
        <Btn on={() => editor.chain().focus().setHorizontalRule().run()} title="Divider"><Minus className="h-4 w-4" /></Btn>
        <Sep />
        <Btn on={() => editor.chain().focus().setTextAlign("left").run()} active={editor.isActive({ textAlign: "left" })} title="Align left"><AlignLeft className="h-4 w-4" /></Btn>
        <Btn on={() => editor.chain().focus().setTextAlign("center").run()} active={editor.isActive({ textAlign: "center" })} title="Align center"><AlignCenter className="h-4 w-4" /></Btn>
        <Btn on={() => editor.chain().focus().setTextAlign("right").run()} active={editor.isActive({ textAlign: "right" })} title="Align right"><AlignRight className="h-4 w-4" /></Btn>
        <Sep />
        <Btn on={setLink} active={editor.isActive("link")} title="Add link"><Link2 className="h-4 w-4" /></Btn>
        <Btn on={() => editor.chain().focus().unsetLink().run()} title="Remove link"><Link2Off className="h-4 w-4" /></Btn>
        <Btn on={addImage} title="Insert image"><ImagePlus className="h-4 w-4" /></Btn>
        <Btn on={addVideo} title="Insert video (YouTube / Vimeo)"><YoutubeIcon className="h-4 w-4" /></Btn>
        <Sep />
        <Btn on={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} active={editor.isActive("table")} title="Insert table"><TableIcon className="h-4 w-4" /></Btn>
        <Btn on={() => editor.chain().focus().addRowAfter().run()} title="Add row"><Rows3 className="h-4 w-4" /></Btn>
        <Btn on={() => editor.chain().focus().addColumnAfter().run()} title="Add column"><Columns3 className="h-4 w-4" /></Btn>
        <Btn on={() => editor.chain().focus().deleteTable().run()} title="Delete table"><Trash2 className="h-4 w-4" /></Btn>
        <Sep />
        <Btn on={() => editor.chain().focus().clearNodes().unsetAllMarks().run()} title="Clear formatting"><Eraser className="h-4 w-4" /></Btn>
        <span className="ml-auto flex gap-1">
          <Btn on={() => editor.chain().focus().undo().run()} title="Undo"><Undo2 className="h-4 w-4" /></Btn>
          <Btn on={() => editor.chain().focus().redo().run()} title="Redo"><Redo2 className="h-4 w-4" /></Btn>
        </span>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
