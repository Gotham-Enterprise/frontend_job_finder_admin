import React from 'react';
import EditBlogWithLayoutBuilder from '@/components/page/Blog/components/EditBlogWithLayoutBuilder';

interface EditBlogPageProps {
  params: {
    id: string;
  };
}

export default function EditBlog({ params }: EditBlogPageProps) {
  return (
    <EditBlogWithLayoutBuilder blogId={params.id} />
  );
}
