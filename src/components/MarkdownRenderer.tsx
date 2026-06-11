'use client';

import React from 'react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  className = '',
}) => {
  const parseMarkdown = (text: string) => {
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    let listItems: string[] = [];
    let inCodeBlock = false;
    let codeContent = '';

    const flushListItems = () => {
      if (listItems.length > 0) {
        elements.push(
          <ul key={`list-${elements.length}`} className="list-disc list-inside mb-4 ml-2 space-y-1">
            {listItems.map((item, idx) => (
              <li key={idx} className="text-slate-900 dark:text-slate-200">
                {item.replace(/^[-*+]\s*/, '')}
              </li>
            ))}
          </ul>
        );
        listItems = [];
      }
    };

    lines.forEach((line, idx) => {
      const trimmed = line.trim();

      // Manejo de bloques de código
      if (trimmed.startsWith('```')) {
        if (inCodeBlock) {
          elements.push(
            <pre
              key={`code-${elements.length}`}
              className="bg-gray-900 text-gray-100 p-4 rounded-lg mb-4 overflow-x-auto text-sm"
            >
              <code>{codeContent}</code>
            </pre>
          );
          codeContent = '';
          inCodeBlock = false;
        } else {
          inCodeBlock = true;
        }
        return;
      }

      if (inCodeBlock) {
        codeContent += line + '\n';
        return;
      }

      // Encabezados
      if (trimmed.startsWith('#')) {
        flushListItems();
        const level = trimmed.match(/^#+/)?.[0].length || 1;
        const text = trimmed.replace(/^#+\s*/, '');
        const headingClasses = {
          1: 'text-3xl font-bold mt-6 mb-4',
          2: 'text-2xl font-bold mt-5 mb-3',
          3: 'text-xl font-bold mt-4 mb-2',
          4: 'text-lg font-semibold mt-3 mb-2',
          5: 'text-base font-semibold mt-2 mb-1',
          6: 'text-sm font-semibold mt-2 mb-1',
        };
        const className =
          headingClasses[Math.min(level, 6) as keyof typeof headingClasses];
        elements.push(
          <div
            key={`heading-${idx}`}
            className={`${className} text-blue-900 dark:text-blue-300`}
          >
            {text}
          </div>
        );
        return;
      }

      // Separadores
      if (trimmed === '---' || trimmed === '***' || trimmed === '___') {
        flushListItems();
        elements.push(
          <hr key={`hr-${idx}`} className="my-6 border-t-2 border-gray-300 dark:border-gray-600" />
        );
        return;
      }

      // Listas no ordenadas
      if (/^[-*+]\s+/.test(trimmed)) {
        listItems.push(trimmed);
        return;
      }

      // Listas ordenadas
      if (/^\d+\.\s+/.test(trimmed)) {
        flushListItems();
        const num = trimmed.match(/^\d+/)?.[0] || '';
        const text = trimmed.replace(/^\d+\.\s*/, '');
        const listIndex = elements.filter((el) => el && typeof el === 'object' && 'key' in el)
          .length;
        elements.push(
          <ol key={`ordered-list-${idx}`} className="list-decimal list-inside mb-4 ml-2 space-y-1">
            <li className="text-slate-900 dark:text-slate-200">{text}</li>
          </ol>
        );
        return;
      }

      // Párrafos vacíos
      if (trimmed === '') {
        if (elements.length > 0 && !trimmed.startsWith('-')) {
          // Evitar espacios excesivos
        }
        return;
      }

      // Párrafos normales
      flushListItems();
      const paragraph = parseInlineMarkdown(trimmed);
      elements.push(
        <p key={`para-${idx}`} className="mb-4 text-slate-900 dark:text-slate-200 leading-relaxed">
          {paragraph}
        </p>
      );
    });

    flushListItems();
    return elements;
  };

  const parseInlineMarkdown = (text: string): React.ReactNode => {
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;

    // Regex para encontrar formatos inline
    const regex = /\*\*(.+?)\*\*|__(.+?)__|_(.+?)_|\*(.+?)\*|`(.+?)`|\[(.+?)\]\((.+?)\)/g;
    let match;

    while ((match = regex.exec(text)) !== null) {
      // Texto antes del match
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }

      // Procesar el match
      if (match[1]) {
        // **bold**
        parts.push(
          <strong key={`bold-${parts.length}`} className="font-bold text-gray-900 dark:text-white">
            {match[1]}
          </strong>
        );
      } else if (match[2] || match[3]) {
        // __bold__ o _italic_
        const text = match[2] || match[3];
        parts.push(
          <em key={`italic-${parts.length}`} className="italic text-gray-700 dark:text-gray-300">
            {text}
          </em>
        );
      } else if (match[4]) {
        // *italic*
        parts.push(
          <em key={`italic2-${parts.length}`} className="italic text-gray-700 dark:text-gray-300">
            {match[4]}
          </em>
        );
      } else if (match[5]) {
        // `code`
        parts.push(
          <code
            key={`code-inline-${parts.length}`}
            className="bg-gray-200 dark:bg-gray-800 px-2 py-1 rounded text-sm font-mono text-red-600 dark:text-red-400"
          >
            {match[5]}
          </code>
        );
      } else if (match[6] && match[7]) {
        // [link](url)
        parts.push(
          <a
            key={`link-${parts.length}`}
            href={match[7]}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 underline hover:text-blue-800 dark:hover:text-blue-300"
          >
            {match[6]}
          </a>
        );
      }

      lastIndex = regex.lastIndex;
    }

    // Texto restante
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return parts.length > 0 ? parts : text;
  };

  const parsedContent = parseMarkdown(content);

  return (
    <div
      className={`prose dark:prose-invert max-w-none ${className}`}
      style={{
        wordWrap: 'break-word',
        overflowWrap: 'break-word',
      }}
    >
      {parsedContent}
    </div>
  );
};

export default MarkdownRenderer;
