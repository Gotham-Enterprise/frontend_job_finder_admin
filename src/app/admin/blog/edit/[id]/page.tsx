import React from 'react';
import EditBlogWithLayoutBuilder from '@/components/page/Blog/components/EditBlogWithLayoutBuilder';

interface EditBlogPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditBlog({ params }: EditBlogPageProps) {
  const { id } = await params;

  return (
    <EditBlogWithLayoutBuilder blogId={id} />
  );
}
