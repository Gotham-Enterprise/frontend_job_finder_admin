"use client";
import React from "react";
import Button from "@/components/ui/button/Button";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";
import DatePicker from "@/components/form/date-picker";
import Radio from "@/components/form/input/Radio";
import Input from "@/components/form/input/InputField";
import { EyeIcon } from "@/icons";

const getStatusOptions = () => [
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
];

interface BlogPublishSettingsProps {
  status: 'draft' | 'published' | 'pending' | 'private';
  visibility: 'public' | 'private' | 'password';
  password?: string;
  publishDate: string;  onStatusChange: (status: string) => void;
  onVisibilityChange: (visibility: string) => void;
  onPasswordChange: (password: string) => void;
  onPublishDateChange: (date: string) => void;
  onPreview: () => void;
  onSaveDraft: () => void;
  onPublish: () => void;
}

const BlogPublishSettings: React.FC<BlogPublishSettingsProps> = ({
  status,
  visibility,
  password,
  publishDate,
  onStatusChange,
  onVisibilityChange,
  onPasswordChange,
  onPublishDateChange,
  onPreview,
  onSaveDraft,
  onPublish
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-medium text-gray-900 dark:text-white">Publish</h3>        
        <Button
          variant="ghost"
          onClick={onPreview}
          size="lg"
          className="text-blue-500"
        >
          <EyeIcon />
          Preview
        </Button>
      </div>
      
      <div className="space-y-4">        
        <div>
          <Label className="text-sm">Status</Label>
          <Select
            options={getStatusOptions()}
            defaultValue={status}
            onChange={onStatusChange}
          />
        </div>

        <div>
          <Label className="text-sm">Visibility</Label>
          <div className="space-y-2 mt-2">            
            <Radio
              id="public"
              name="visibility"
              value="public"
              checked={visibility === 'public'}
              onChange={(value: string) => onVisibilityChange(value)}
              label="Public"
            />
            <Radio
              id="private"
              name="visibility"
              value="private"
              checked={visibility === 'private'}
              onChange={(value: string) => onVisibilityChange(value)}
              label="Private"
            />
          
          </div>
            {visibility === 'password' && (
            <div className="mt-2">
              <Input
                type="text"
                placeholder="Enter password"
                defaultValue={password || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => onPasswordChange(e.target.value)}
              />
            </div>
          )}
        </div>        <div>
          <DatePicker
            id="publish-date"
            label="Publish Date"
            defaultDate={publishDate}
            onChange={(dates: any, dateString: string) => {
              if (dateString) {
                onPublishDateChange(dateString);
              }
            }}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2 mt-6">
        <Button
          variant="default"
          onClick={onPublish}
          className="w-full"
        >
          Publish
        </Button>
        <Button
          variant="outline"
          onClick={onSaveDraft}
          className="w-full dark:text-white"
        >
          Save Draft
        </Button>
      </div>
    </div>
  );
};

export default BlogPublishSettings;
