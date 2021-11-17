import { useEffect, useState, useCallback, useReducer } from 'react';
import { Button } from 'reactstrap';
import { GenericModal, LoadingSpinner, Icon } from 'tapis-ui/_common';
import { SubmitWrapper } from 'tapis-ui/_wrappers';
import { ToolbarModalProps } from '../Toolbar';
import { useUpload } from 'tapis-hooks/files';
import { focusManager } from 'react-query';
import { useDropzone } from 'react-dropzone';
import styles from './UploadModal.module.scss';
import { FileListingTable } from 'tapis-ui/components/files/FileListing';
import { Files } from '@tapis/tapis-typescript';
import { Column } from 'react-table';
import sizeFormat from 'utils/sizeFormat';
import { useFileOperations } from '../_hooks';
import { InsertHookParams } from 'tapis-hooks/files/useUpload';
import Progress from 'tapis-ui/_common/Progress';

export enum FileOpEventStatus {
  loading = 'loading',
  progress = 'progress',
  error = 'error',
  success = 'success',
  none = 'none',
}

export type FileProgressState = {
  [name: string]: number;
};

type UploadModalProps = ToolbarModalProps & {
  maxFileSizeBytes?: number;
};

const UploadModal: React.FC<UploadModalProps> = ({
  toggle,
  path,
  systemId,
  maxFileSizeBytes = 524288000,
}) => {
  const [files, setFiles] = useState<Array<File>>([]);

  const reducer = (
    state: FileProgressState,
    action: { name: string; progress: number }
  ) => {
    const { name, progress } = action;
    return {
      ...state,
      [name]: progress,
    }
  };

  const [fileProgressState, dispatch] = useReducer(reducer, {} as FileProgressState);

  const onProgress = (uploadProgress: number, file: File) => {
    dispatch({
      name: file.name,
      progress: uploadProgress,
    });
  };

  const onDrop = useCallback(
    (selectedFiles: Array<File>) => {
      // Create an array of files unique File objects. This prevents
      // a user from trying to upload 2 or more of the same file.
      const uniqueFiles = selectedFiles.filter(
        (selectedFile) =>
          // The some function contains the selection logic for
          // the filter function. All files that have the same name
          // as any file in the uniqueFiles array or exceeds the max
          // file size will not be added to the final array.
          !files.some(
            (existingFile) =>
              existingFile.name === selectedFile.name ||
              selectedFile.size > maxFileSizeBytes
          )
      );

      setFiles([...files, ...uniqueFiles]);
    },
    [files, setFiles, maxFileSizeBytes]
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
  });

  const removeFile = useCallback(
    (file: Files.FileInfo) => {
      setFiles([...files.filter((checkFile) => file.name !== checkFile.name)]);
    },
    [files, setFiles]
  );

  const { uploadAsync, reset } = useUpload();

  const key = (params: InsertHookParams) => params.file.name;
  const onComplete = useCallback(
    () => {
      focusManager.setFocused(true);
    },
    []
  )

  const { state, run, isRunning, isSuccess, error } = useFileOperations<InsertHookParams, Files.FileStringResponse>({
    fn: uploadAsync,
    key,
    onComplete
  });


  useEffect(() => {
    reset();
  }, [reset, path]);

  const onSubmit = useCallback(() => {
    const operations: Array<InsertHookParams> = files.map((file) => ({
      systemId: systemId!,
      path: path!,
      file,
      progressCallback: onProgress,
    }));
    run(operations);
  }, [files, run, systemId, path]);

  const filesToFileInfo = (filesArr: Array<File>): Array<Files.FileInfo> => {
    return filesArr.map((file) => {
      return { name: file.name, size: file.size, type: 'file' };
    });
  };

  const statusColumn: Array<Column> = [
    {
      Header: '',
      id: 'deleteStatus',
      Cell: (el) => {
        const file = (el.row.original as Files.FileInfo);
        const status = state[file.name!]?.status;
        switch (status) {
          case 'loading':
            return (
              fileProgressState[file.name!] !== undefined
                ? (
                  <div className={styles['progress-bar-container']}>
                    <Progress value={fileProgressState[file.name!]} />
                  </div>
                )
                : (
                  <LoadingSpinner placement="inline" />
                )
            )
          case 'success':
            return <Icon name="approved-reverse" className="success" />;
          case 'error':
            return <Icon name="alert" />;
          case undefined:
            return (
              <span
                className={styles['remove-file']}
                onClick={() => {
                  removeFile(filesToFileInfo(files)[el.row.index]);
                }}
              >
                &#x2715;
              </span>
            );
        }
      },
    },
  ];

  return (
    <GenericModal
      toggle={toggle}
      title={`Upload files`}
      body={
        <div>
          {!(isRunning || isSuccess) && (
            <div
              aria-label="Dropzone"
              className={styles['file-dropzone']}
              {...getRootProps()}
            >
              <input aria-label="File Input" {...getInputProps()} />
              <Button aria-label="File Select">Select files</Button>
              <div>
                <p>or drag and drop</p>
                <b>Max file size: {sizeFormat(maxFileSizeBytes)}</b>
              </div>
            </div>
          )}
          <h3 className={styles['files-list-header']}>
            Uploading to {systemId}/{path}
          </h3>
          {error && <p className={styles['upload-error']}>{error.message}</p>}
          <div className={styles['files-list-container']}>
            <FileListingTable
              files={filesToFileInfo(files)}
              fields={['size']}
              appendColumns={statusColumn}
              className={styles['file-list-table']}
            />
          </div>
        </div>
      }
      footer={
        <SubmitWrapper
          isLoading={isRunning}
          error={error}
          success={isSuccess ? `Successfully uploaded files` : ''}
          reverse={true}
        >
          <Button
            color="primary"
            disabled={isRunning || isSuccess || !!error || files.length === 0}
            aria-label="Submit"
            onClick={onSubmit}
          >
            Upload
          </Button>
        </SubmitWrapper>
      }
    />
  );
};

export default UploadModal;