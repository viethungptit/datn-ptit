import React from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    className?: string;
}

export const Textarea: React.FC<TextareaProps> = ({ className = '', ...props }) => {
    return (
        <textarea
            className={`block w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500 ${className}`}
            {...props}
        />
    );
};

export default Textarea;
