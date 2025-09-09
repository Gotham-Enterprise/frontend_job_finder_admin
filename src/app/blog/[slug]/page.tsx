"use client";
import React from 'react';
import BlogPreview from '@/components/page/Blog/components/Preview';
import BlogHeader from '@/components/page/Blog/components/Preview/BlogHeader';

export default function BlogSlugPage({ params }: { params: Promise<{ slug: string }> }) {
    const resolvedParams = React.use(params);
    
    return (
        <div className="min-h-screen" style={{ backgroundColor: '#fafafa' }}>
            <BlogHeader />
            <BlogPreview blogSlug={resolvedParams.slug} />
        </div>
    );
}
