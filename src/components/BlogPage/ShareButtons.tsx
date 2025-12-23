'use client';

import React, { useState } from 'react';

interface ShareButtonsProps {
    title: string;
    url: string;
}

const ShareButtons = ({ title, url }: ShareButtonsProps) => {
    const [copied, setCopied] = useState(false);

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: title,
                    url: url
                });
            } catch (err) {
                console.log('Share cancelled');
            }
        }
    };

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy');
        }
    };

    return (
        <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-slate-600 mr-2">Share:</p>
            <button
                onClick={handleShare}
                className="flex items-center justify-center size-10 rounded-full bg-white border border-slate-200 hover:bg-slate-100 transition-colors"
                title="Share"
            >
                <span className="material-symbols-outlined text-slate-900" style={{ fontSize: '20px' }}>
                    share
                </span>
            </button>
            <button
                onClick={handleCopyLink}
                className="flex items-center justify-center size-10 rounded-full bg-white border border-slate-200 hover:bg-slate-100 transition-colors relative"
                title={copied ? 'Copied!' : 'Copy link'}
            >
                <span className="material-symbols-outlined text-slate-900" style={{ fontSize: '20px' }}>
                    {copied ? 'check' : 'link'}
                </span>
            </button>
        </div>
    );
};

export default ShareButtons;
