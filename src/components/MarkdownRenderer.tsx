import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { Components } from 'react-markdown';
import { SyntaxHighlighterProps } from 'react-syntax-highlighter';

interface MarkdownRendererProps {
  content: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  const components: Components = {
    code: ({ className, children, ...props }) => {
      const match = /language-(\w+)/.exec(className || '');
      return match ? (
        <SyntaxHighlighter
          style={vscDarkPlus}
          language={match[1]}
          PreTag="div"
          {...props as SyntaxHighlighterProps}
        >
          {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
      ) : (
        <code className={className} {...props}>
          {children}
        </code>
      );
    },
  };

  return (
    <div className="markdown-renderer">
      <ReactMarkdown components={components}>
        {content}
      </ReactMarkdown>
      <style jsx global>{`
        .markdown-renderer {
          width: 100%;
          overflow-wrap: break-word;
          word-wrap: break-word;
          word-break: break-word;
        }
        .markdown-renderer p,
        .markdown-renderer li {
          white-space: pre-wrap;
        }
        .markdown-renderer pre {
          white-space: pre-wrap;
          word-break: break-all;
        }
      `}</style>
    </div>
  );
};