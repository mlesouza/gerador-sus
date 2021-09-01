import React from 'react';
import { UploadContent, UploadLayout } from './styled';

interface IUploadTemplate {
  children: React.ReactNode;
}
const UploadTemplate: React.FC<IUploadTemplate> = ({ children }) => {
  return (
    <UploadLayout>
      <UploadContent className="content">{children}</UploadContent>
    </UploadLayout>
  );
};

export default UploadTemplate;
