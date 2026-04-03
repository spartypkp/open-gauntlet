'use client';

import dynamic from 'next/dynamic';
import type { SessionSettings } from '@/hooks/useSession';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

interface EditorProps {
  code: string;
  language: string;
  readOnly: boolean;
  settings: SessionSettings;
  onChange: (value: string) => void;
}

export default function Editor({ code, language, readOnly, settings, onChange }: EditorProps) {
  const monacoLanguage = language === 'python' ? 'python' : 'javascript';

  return (
    <MonacoEditor
      height="100%"
      language={monacoLanguage}
      value={code}
      theme="vs-dark"
      onChange={(value) => onChange(value ?? '')}
      options={{
        readOnly,
        fontSize: settings.fontSize,
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        wordWrap: 'on',
        lineNumbers: 'on',
        renderLineHighlight: 'line',
        automaticLayout: true,
        quickSuggestions: settings.autocomplete,
        suggestOnTriggerCharacters: settings.autocomplete,
        acceptSuggestionOnCommitCharacter: settings.autocomplete,
        tabSize: 4,
        insertSpaces: true,
        cursorBlinking: 'smooth',
        padding: { top: 12 },
      }}
    />
  );
}
