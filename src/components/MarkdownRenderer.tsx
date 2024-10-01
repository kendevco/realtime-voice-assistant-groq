import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: ({ ...props }) => <h1 className="text-2xl font-bold mt-4 mb-2" {...props} />,
        h2: ({ ...props }) => <h2 className="text-xl font-bold mt-3 mb-2" {...props} />,
        p: ({ ...props }) => <p className="mb-2" {...props} />,
        ul: ({ ...props }) => <ul className="list-disc pl-5 mb-2" {...props} />,
        ol: ({ ...props }) => <ol className="list-decimal pl-5 mb-2" {...props} />,
        li: ({ ...props }) => <li className="mb-1" {...props} />,
        strong: ({ ...props }) => <strong className="font-bold" {...props} />,
        em: ({ ...props }) => <em className="italic" {...props} />,
      }}
    >
      {content}
    </ReactMarkdown>
  );
}