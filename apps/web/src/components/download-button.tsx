import React from 'react';

interface DownloadButtonProps {
  fileUrl: string;
  fileName: string;
}

export const DownloadButton: React.FC<DownloadButtonProps> = ({ fileUrl, fileName }) => {
  return (
    <a
      href={fileUrl}
      download={fileName}
      className="bg-yellow-500 text-white font-bold py-2 px-6 rounded-full hover:bg-yellow-600 transition duration-300"
      style={{ backgroundColor: '#D4AF37' }}
    >
      Download
    </a>
  );
};