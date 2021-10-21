import { Files } from '@tapis/tapis-typescript';
import React, { useState } from 'react';
import { Button } from 'reactstrap';

import { Icon } from 'tapis-ui/_common';
import styles from './Toolbar.module.scss';
import CreateDirModal from './CreateDirModal';

type ToolbarButtonProps = {
  text: string;
  icon: string;
  onClick: () => void;
  disabled: boolean;
};

export type ToolbarModalProps = {
  isOpen: boolean;
  toggle: () => void;
};

export const ToolbarButton: React.FC<ToolbarButtonProps> = ({
  text,
  icon,
  onClick,
  disabled = true,
}) => {
  return (
    <div>
      <Button
        disabled={disabled}
        onClick={onClick}
        className={styles['toolbar-btn']}
      >
        <Icon name={icon}></Icon>
        <span> {text}</span>
      </Button>
    </div>
  );
};

const Toolbar: React.FC<{ selectedFiles: Array<Files.FileInfo> }> = ({
  selectedFiles,
}) => {
  const [modal, setModal] = useState<string | undefined>(undefined);
  return (
    <div className={styles['toolbar-wrapper']}>
      <ToolbarButton
        text="Rename"
        icon="rename"
        disabled={selectedFiles.length !== 1}
        onClick={() => {}}
      />
      <ToolbarButton
        text="Move"
        icon="move"
        disabled={selectedFiles.length === 0}
        onClick={() => {
          console.log('Toolbar button');
        }}
      />
      <ToolbarButton
        text="Copy"
        icon="copy"
        disabled={selectedFiles.length === 0}
        onClick={() => {
          console.log('Toolbar button');
        }}
      />
      <ToolbarButton
        text="Download"
        icon="download"
        disabled={
          selectedFiles.length !== 1 ||
          (selectedFiles.length === 1 && selectedFiles[0].type !== 'file')
        }
        onClick={() => {
          console.log('Toolbar button');
        }}
      />
      <ToolbarButton
        text="Upload"
        icon="upload"
        disabled={true}
        onClick={() => {
          console.log('Toolbar button');
        }}
      />
      <ToolbarButton
        text="Folder"
        icon="add"
        disabled={!(selectedFiles.length === 0)}
        onClick={() => {
          setModal('createdir');
        }}
      />
      <ToolbarButton
        text="Trash"
        icon="trash"
        disabled={selectedFiles.length === 0}
        onClick={() => {
          console.log('Toolbar button');
        }}
      />
      <CreateDirModal
        isOpen={modal === 'createdir'}
        toggle={() => {
          modal === 'createdir' ? setModal(undefined) : setModal('newmodal');
        }}
      />
    </div>
  );
};

export default Toolbar;
