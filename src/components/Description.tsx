'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface DescriptionProps {
  title: string;
  markdown: string;
}

export default function Description({ title, markdown }: DescriptionProps) {
  return (
    <div className="prose-pad max-w-none">
      <h2>{title}</h2>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {markdown}
      </ReactMarkdown>
    </div>
  );
}
