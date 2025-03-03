"use client";

import React, { useState, useEffect } from 'react';

interface MarkdownEditorProps {
  initialContent: string;
  onContentChange: (content: string) => void;
}

export default function MarkdownEditor({ initialContent, onContentChange }: MarkdownEditorProps) {
  const [content, setContent] = useState(initialContent);
  const [isEditing, setIsEditing] = useState(false);

  // Update local content when prop changes
  useEffect(() => {
    setContent(initialContent);
  }, [initialContent]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    onContentChange(newContent);
  };

  const toggleEdit = () => {
    setIsEditing(!isEditing);
  };

  return (
    <div className="border border-gray-200 rounded-md overflow-hidden">
      <div className="flex justify-between items-center bg-gray-50 p-2">
        <h3 className="text-sm font-medium">文章内容</h3>
        <button
          type="button"
          onClick={toggleEdit}
          className="text-blue-600 hover:underline text-sm"
        >
          {isEditing ? '预览' : '编辑'}
        </button>
      </div>
      
      {isEditing ? (
        <textarea
          className="w-full p-4 min-h-[500px] font-mono text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          value={content}
          onChange={handleChange}
        />
      ) : (
        <div className="prose max-w-none p-4 min-h-[500px] overflow-auto whitespace-pre-wrap">
          {content || <span className="text-gray-400">无内容</span>}
        </div>
      )}
    </div>
  );
} 