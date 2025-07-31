"use client";
import React from 'react';
import BlogPreview from '@/components/page/Blog/components/Preview';

export default function BlogSlugPage({ params }: { params: Promise<{ slug: string }> }) {
    const resolvedParams = React.use(params);
    
    return (
        <div className="min-h-screen bg-gray-50">
            <BlogPreview blogSlug={resolvedParams.slug} />
        </div>
    );
}
