"use client";
import React from 'react';
import BlogPreview from '@/components/page/Blog/components/Preview';

export default function BlogPreviewPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = React.use(params);
    
    return (
        <div className="min-h-screen bg-gray-50">
            <BlogPreview blogId={resolvedParams.id} />
        </div>
    );
}
