'use client';

import { useEffect, useRef, useState } from 'react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  height?: string;
}

export default function RichTextEditor({ 
  value, 
  onChange, 
  placeholder = 'Enter content...',
  height = '300px'
}: RichTextEditorProps) {
  const [mounted, setMounted] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const quillInstanceRef = useRef<any>(null);
  const onChangeRef = useRef(onChange);
  
  // Keep onChange ref up to date
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    setMounted(true);
    
    // Dynamically import CSS only on client side
    if (typeof window !== 'undefined') {
      // Load Quill CSS dynamically
      const linkId = 'quill-snow-css';
      if (!document.getElementById(linkId)) {
        const link = document.createElement('link');
        link.id = linkId;
        link.rel = 'stylesheet';
        link.href = 'https://cdn.quilljs.com/1.3.6/quill.snow.css';
        document.head.appendChild(link);
      }
    }
  }, []);

  useEffect(() => {
    if (!mounted || !editorRef.current || quillInstanceRef.current) return;

    // Dynamically import Quill
    import('quill').then((QuillModule) => {
      const Quill = QuillModule.default;
      
      if (!editorRef.current || quillInstanceRef.current) return;

      // Initialize Quill editor
      const toolbarOptions = [
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        [{ 'font': [] }],
        [{ 'size': [] }],
        ['bold', 'italic', 'underline', 'strike', 'blockquote'],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }, { 'indent': '-1'}, { 'indent': '+1' }],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'align': [] }],
        ['link', 'image'],
        ['clean']
      ];

      const quill = new Quill(editorRef.current, {
        theme: 'snow',
        placeholder: placeholder,
        modules: {
          toolbar: toolbarOptions
        },
        formats: [
          'header', 'font', 'size',
          'bold', 'italic', 'underline', 'strike', 'blockquote',
          'list', 'bullet', 'indent',
          'color', 'background',
          'align',
          'link', 'image'
        ]
      });

      // Set initial content
      if (value) {
        quill.root.innerHTML = value;
      }

      // Handle text changes
      quill.on('text-change', () => {
        const content = quill.root.innerHTML;
        onChangeRef.current(content);
      });

      quillInstanceRef.current = quill;
    });

    return () => {
      if (quillInstanceRef.current) {
        quillInstanceRef.current = null;
      }
    };
  }, [mounted, placeholder]);

  // Update editor content when value prop changes (but not from user input)
  useEffect(() => {
    if (quillInstanceRef.current && value !== quillInstanceRef.current.root.innerHTML) {
      const selection = quillInstanceRef.current.getSelection();
      quillInstanceRef.current.root.innerHTML = value || '';
      if (selection) {
        quillInstanceRef.current.setSelection(selection);
      }
    }
  }, [value]);

  if (!mounted) {
    return (
      <div style={{ height, border: '1px solid #ddd', borderRadius: '4px', padding: '10px', backgroundColor: '#f9f9f9' }}>
        <div style={{ color: '#666', fontSize: '14px' }}>Loading editor...</div>
      </div>
    );
  }

  return (
    <div style={{ height }}>
      <div ref={editorRef} style={{ height: `calc(${height} - 42px)` }} />
    </div>
  );
}
