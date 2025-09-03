"use client";
import React from 'react';
import {
  FacebookShareButton,
  TwitterShareButton,
  LinkedinShareButton,
  WhatsappShareButton,
  TelegramShareButton,
  RedditShareButton,
  FacebookIcon,
  TwitterIcon,
  LinkedinIcon,
  WhatsappIcon,
  TelegramIcon,
  RedditIcon,
} from 'react-share';
import { Modal } from '../modal';
import { SITE_CONFIG } from '@/config/constants';

interface SocialShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  title: string;
  description?: string;
  image?: string;
  ogType?: string;
  ogSiteName?: string;
  author?: string;
  publishedTime?: string;
  tags?: string[];
}

const SocialShareModal: React.FC<SocialShareModalProps> = ({
  isOpen,
  onClose,
  url,
  title,
  description = '',
  image,
  ogType = 'article',
  ogSiteName = 'Gotham Enterprises',
  author,
  publishedTime,
  tags = []
}) => {
  if (!isOpen) return null;

  const shareUrl = url || window.location.href;
  const shareImage = image || SITE_CONFIG.DEFAULT_SHARE_IMAGE;

  const enhancedHashtags = [
    ...SITE_CONFIG.SOCIAL_SHARING.DEFAULT_HASHTAGS,
    ...tags.slice(0, 3) 
  ].filter((tag, index, arr) => arr.indexOf(tag) === index); 

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      alert('Link copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      isFullscreen={false}
      className="max-w-md mx-auto rounded-lg"
      showCloseButton={true}
    >
      <div className="p-6">
        {/* Header */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Share Post
          </h3>
        </div>

        {/* Title */}
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Share &quot;{title}&quot; on social media
        </p>

        {/* Preview Image */}
        {shareImage && (
          <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center gap-3">
              <img 
                src={shareImage} 
                alt="Share preview" 
                className="w-12 h-12 object-cover rounded"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Preview image</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {title}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Social Media Buttons */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="flex flex-col items-center">
            <FacebookShareButton
              url={shareUrl}
              hashtag={`#${enhancedHashtags[0] || 'blog'}`}
              className="mb-2"
            >
              <FacebookIcon size={48} round />
            </FacebookShareButton>
            <span className="text-xs text-gray-600 dark:text-gray-400">Facebook</span>
          </div>

          <div className="flex flex-col items-center">
            <TwitterShareButton
              url={shareUrl}
              title={title}
              hashtags={enhancedHashtags}
              via={SITE_CONFIG.SOCIAL_SHARING.TWITTER_HANDLE?.replace('@', '')}
              className="mb-2"
            >
              <TwitterIcon size={48} round />
            </TwitterShareButton>
            <span className="text-xs text-gray-600 dark:text-gray-400">Twitter</span>
          </div>

          <div className="flex flex-col items-center">
            <LinkedinShareButton
              url={shareUrl}
              title={title}
              summary={description}
              source={ogSiteName}
              className="mb-2"
            >
              <LinkedinIcon size={48} round />
            </LinkedinShareButton>
            <span className="text-xs text-gray-600 dark:text-gray-400">LinkedIn</span>
          </div>

          <div className="flex flex-col items-center">
            <WhatsappShareButton
              url={shareUrl}
              title={`${title}\n\n${description ? description + '\n\n' : ''}${shareUrl}`}
              className="mb-2"
            >
              <WhatsappIcon size={48} round />
            </WhatsappShareButton>
            <span className="text-xs text-gray-600 dark:text-gray-400">WhatsApp</span>
          </div>

          <div className="flex flex-col items-center">
            <TelegramShareButton
              url={shareUrl}
              title={description ? `${title}\n\n${description}` : title}
              className="mb-2"
            >
              <TelegramIcon size={48} round />
            </TelegramShareButton>
            <span className="text-xs text-gray-600 dark:text-gray-400">Telegram</span>
          </div>

          <div className="flex flex-col items-center">
            <RedditShareButton
              url={shareUrl}
              title={title}
              className="mb-2"
            >
              <RedditIcon size={48} round />
            </RedditShareButton>
            <span className="text-xs text-gray-600 dark:text-gray-400">Reddit</span>
          </div>
        </div>

        {/* Copy Link Section */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Or copy link</p>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={shareUrl}
              readOnly
              className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none"
            />
            <button
              onClick={handleCopyLink}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors"
            >
              Copy
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default SocialShareModal;
