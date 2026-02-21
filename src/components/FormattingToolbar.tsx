import { Bold, Italic, Strikethrough, List, Code } from 'lucide-react';
import { RefObject } from 'react';

// Overloaded: supports both textarea (markdown) and contentEditable (WYSIWYG) modes
interface FormattingToolbarProps {
  textareaRef?: RefObject<HTMLTextAreaElement>;
  editorRef?: RefObject<HTMLDivElement>;
  value?: string;
  onChange?: (value: string) => void;
  compact?: boolean;
}

const FormattingToolbar = ({ textareaRef, editorRef, value, onChange, compact = false }: FormattingToolbarProps) => {
  // WYSIWYG mode (contentEditable)
  const execFormat = (command: string, val?: string) => {
    editorRef?.current?.focus();
    document.execCommand(command, false, val);
  };

  // Markdown mode (textarea)
  const wrapSelection = (syntax: string) => {
    const el = textareaRef?.current;
    if (!el || value === undefined || !onChange) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = value.substring(start, end);
    const before = value.substring(0, start);
    const after = value.substring(end);

    if (selected) {
      const newValue = `${before}${syntax}${selected}${syntax}${after}`;
      onChange(newValue);
      requestAnimationFrame(() => {
        el.focus();
        el.setSelectionRange(start + syntax.length, end + syntax.length);
      });
    } else {
      const placeholder = syntax === '**' ? 'bold text' : syntax === '*' ? 'italic text' : syntax === '~~' ? 'strikethrough' : 'code';
      const newValue = `${before}${syntax}${placeholder}${syntax}${after}`;
      onChange(newValue);
      requestAnimationFrame(() => {
        el.focus();
        el.setSelectionRange(start + syntax.length, start + syntax.length + placeholder.length);
      });
    }
  };

  const insertList = () => {
    if (editorRef) {
      execFormat('insertUnorderedList');
      return;
    }
    const el = textareaRef?.current;
    if (!el || value === undefined || !onChange) return;
    const start = el.selectionStart;
    const before = value.substring(0, start);
    const after = value.substring(start);
    const needsNewline = before.length > 0 && !before.endsWith('\n');
    const insert = `${needsNewline ? '\n' : ''}- `;
    const newValue = `${before}${insert}${after}`;
    onChange(newValue);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(start + insert.length, start + insert.length);
    });
  };

  const isWysiwyg = !!editorRef;

  const buttons = [
    { icon: Bold, action: () => isWysiwyg ? execFormat('bold') : wrapSelection('**'), title: 'Bold' },
    { icon: Italic, action: () => isWysiwyg ? execFormat('italic') : wrapSelection('*'), title: 'Italic' },
    { icon: Strikethrough, action: () => isWysiwyg ? execFormat('strikeThrough') : wrapSelection('~~'), title: 'Strikethrough' },
    { icon: List, action: () => insertList(), title: 'Bulleted list' },
    { icon: Code, action: () => isWysiwyg ? execFormat('formatBlock', 'pre') : wrapSelection('`'), title: 'Inline code' },
  ];

  const visibleButtons = compact ? buttons.slice(0, 3) : buttons;

  return (
    <div className="flex items-center gap-0.5">
      {visibleButtons.map(({ icon: Icon, action, title }) => (
        <button
          key={title}
          type="button"
          onMouseDown={e => { e.preventDefault(); action(); }}
          title={title}
          className="rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        >
          <Icon size={14} />
        </button>
      ))}
    </div>
  );
};

export default FormattingToolbar;
