'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import rehypeRaw from 'rehype-raw';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import Link from 'next/link';

export default function MarkdownRenderer({ content }) {
  if (!content) return null;

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkBreaks]}
      rehypePlugins={[rehypeRaw]}
      components={{
        // 제목 스타일링
        h1: ({ children }) => (
          <h1 className="text-4xl font-bold text-slate-900 mt-8 mb-4 border-b pb-2">{children}</h1>
        ),
        h2: ({ children }) => (
          <h2 className="text-3xl font-bold text-slate-900 mt-8 mb-4">{children}</h2>
        ),
        h3: ({ children }) => (
          <h3 className="text-2xl font-bold text-slate-800 mt-6 mb-3">{children}</h3>
        ),
        h4: ({ children }) => (
          <h4 className="text-xl font-semibold text-slate-800 mt-5 mb-3">{children}</h4>
        ),
        h5: ({ children }) => (
          <h5 className="text-lg font-semibold text-slate-700 mt-4 mb-2">{children}</h5>
        ),
        h6: ({ children }) => (
          <h6 className="text-base font-semibold text-slate-700 mt-3 mb-2">{children}</h6>
        ),
        
        // 문단
        p: ({ children }) => (
          <p className="mb-4 leading-relaxed text-slate-700">{children}</p>
        ),
        
        // 강조
        strong: ({ children }) => (
          <strong className="font-semibold text-slate-900">{children}</strong>
        ),
        em: ({ children }) => (
          <em className="italic">{children}</em>
        ),
        del: ({ children }) => (
          <del className="line-through text-slate-500">{children}</del>
        ),
        
        // 목록
        ul: ({ children }) => (
          <ul className="list-disc list-inside mb-4 space-y-1 ml-4">{children}</ul>
        ),
        ol: ({ children }) => (
          <ol className="list-decimal list-inside mb-4 space-y-1 ml-4">{children}</ol>
        ),
        li: ({ children }) => (
          <li className="text-slate-700">{children}</li>
        ),
        
        // 인용문
        blockquote: ({ children }) => (
          <blockquote className="border-l-4 border-blue-500 pl-4 my-4 text-slate-600 italic bg-slate-50 py-2">
            {children}
          </blockquote>
        ),
        
        // 수평선
        hr: () => (
          <hr className="my-8 border-t border-slate-300" />
        ),
        
        // 인라인 코드
        code: ({ inline, className, children, ...props }) => {
          const match = /language-(\w+)/.exec(className || '');
          
          if (!inline && match) {
            return (
              <div className="my-4">
                <SyntaxHighlighter
                  style={oneDark}
                  language={match[1]}
                  PreTag="div"
                  className="rounded-lg text-sm"
                  showLineNumbers={true}
                  {...props}
                >
                  {String(children).replace(/\n$/, '')}
                </SyntaxHighlighter>
              </div>
            );
          }
          
          return (
            <code 
              className={inline 
                ? "px-1.5 py-0.5 bg-slate-100 text-slate-800 rounded text-sm font-mono" 
                : className
              } 
              {...props}
            >
              {children}
            </code>
          );
        },
        
        // 표
        table: ({ children }) => (
          <div className="overflow-x-auto my-4">
            <table className="min-w-full divide-y divide-slate-300 border border-slate-300">
              {children}
            </table>
          </div>
        ),
        thead: ({ children }) => (
          <thead className="bg-slate-50">{children}</thead>
        ),
        tbody: ({ children }) => (
          <tbody className="bg-white divide-y divide-slate-200">{children}</tbody>
        ),
        tr: ({ children }) => (
          <tr className="hover:bg-slate-50">{children}</tr>
        ),
        th: ({ children }) => (
          <th className="px-4 py-2 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
            {children}
          </th>
        ),
        td: ({ children }) => (
          <td className="px-4 py-2 whitespace-nowrap text-sm text-slate-700">
            {children}
          </td>
        ),
        
        // 링크
        a: ({ href, children }) => {
          // 파일 링크 처리 (📎 아이콘이 있는 경우)
          if (children && children.toString().startsWith('📎')) {
            const filename = children.toString().replace('📎 ', '');
            
            // HTML 파일은 뷰어로
            if (filename.match(/\.(html|htm)$/i)) {
              const viewerUrl = `/viewer/html?url=${encodeURIComponent(href)}&title=${encodeURIComponent(filename)}`;
              return (
                <a 
                  href={viewerUrl}
                  className="text-blue-600 hover:text-blue-800 underline inline-flex items-center gap-1"
                >
                  {children}
                </a>
              );
            }
            
            // 일반 파일
            return (
              <a 
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline inline-flex items-center gap-1"
              >
                {children}
              </a>
            );
          }
          
          // 내부 링크
          if (href && href.startsWith('/')) {
            return (
              <Link href={href} className="text-blue-600 hover:text-blue-800 underline">
                {children}
              </Link>
            );
          }
          
          // 외부 링크
          return (
            <a 
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              {children}
            </a>
          );
        },
        
        // 이미지
        img: ({ src, alt }) => (
          <div className="my-4">
            <img 
              src={src} 
              alt={alt || ''} 
              className="max-w-full rounded-lg shadow-md mx-auto"
              style={{ maxHeight: '400px', objectFit: 'contain' }}
            />
          </div>
        ),
        
        // 체크박스 (작업 목록)
        input: ({ type, checked, disabled }) => {
          if (type === 'checkbox') {
            return (
              <input
                type="checkbox"
                checked={checked}
                disabled={disabled}
                readOnly
                className="mr-2"
              />
            );
          }
          return null;
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );
}