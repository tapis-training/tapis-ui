import { useCallback, useState } from 'react';
import { Button } from 'reactstrap';
import { GenericModal, Breadcrumbs } from 'tapis-ui/_common';
import { SubmitWrapper } from 'tapis-ui/_wrappers';
import breadcrumbsFromPathname from 'tapis-ui/_common/Breadcrumbs/breadcrumbsFromPathname';
import { FileListingTable } from 'tapis-ui/components/files/FileListing/FileListing';
import { FileExplorer, FileOperationStatus } from '../_components';
import { ToolbarModalProps } from '../Toolbar';
import { useLocation } from 'react-router';
import { focusManager } from 'react-query';
import { useCopy, useMove } from 'tapis-hooks/files';
import { MoveCopyHookParams } from 'tapis-hooks/files';
import { Files } from '@tapis/tapis-typescript';
import { Column } from 'react-table';
import styles from './MoveCopyModal.module.scss';
import { useFilesSelectActions, useFilesSelect } from 'tapis-app/Files/_store';
import { useFileOperations } from '../_hooks';

type MoveCopyModalProps = {
  operation: Files.MoveCopyRequestOperationEnum;
} & ToolbarModalProps;

const MoveCopyModal: React.FC<MoveCopyModalProps> = ({
  toggle,
  systemId = '',
  path = '/',
  operation,
}) => {
  const { pathname } = useLocation();
  const [destinationPath, setDestinationPath] = useState<string | null>(path);
  const { selected } = useFilesSelect();
  const { unselect } = useFilesSelectActions();

  const opFormatted = operation.charAt(0) + operation.toLowerCase().slice(1);

  const { copyAsync } = useCopy();
  const { moveAsync } = useMove();
  const fn =
    operation === Files.MoveCopyRequestOperationEnum.Copy
      ? copyAsync
      : moveAsync;

  const onComplete = useCallback(() => {
    // Calling the focus manager triggers react-query's
    // automatic refetch on window focus
    focusManager.setFocused(true);
  }, []);

  const onNavigate = useCallback(
    (_: string | null, path: string | null) => {
      setDestinationPath(path);
    },
    [setDestinationPath]
  );

  const removeFile = useCallback(
    (file: Files.FileInfo) => {
      unselect([file]);
      if (selected.length === 1) {
        toggle();
      }
    },
    [selected, toggle, unselect]
  );

  const { run, state, isLoading, isFinished, isSuccess, error } =
    useFileOperations<MoveCopyHookParams, Files.FileStringResponse>({
      fn,
      onComplete,
    });

  const onSubmit = useCallback(() => {
    const operations: Array<MoveCopyHookParams> = selected.map((file) => ({
      systemId,
      newPath: `${destinationPath!}/${file.name!}`,
      path: file.path!,
    }));
    run(operations);
  }, [selected, run, destinationPath, systemId]);

  const statusColumns: Array<Column> = [
    {
      Header: '',
      id: 'moveCopyStatus',
      Cell: (el) => {
        const path = (el.row.original as Files.FileInfo).path!;
        if (!state[path]) {
          return (
            <span
              className={styles['remove-file']}
              onClick={() => {
                removeFile(selected[el.row.index]);
              }}
            >
              &#x2715;
            </span>
          );
        }
        return <FileOperationStatus status={state[path].status} />;
      },
    },
  ];

  const body = (
    <div className="row h-100">
      <div className="col-md-6 d-flex flex-column">
        {/* Table of selected files */}
        <div className={`${styles['col-header']}`}>
          {`${
            operation === Files.MoveCopyRequestOperationEnum.Copy
              ? 'Copying '
              : 'Moving '
          }`}
          {selected.length} files
        </div>
        <Breadcrumbs
          breadcrumbs={[
            ...breadcrumbsFromPathname(pathname)
              .splice(1)
              .map((fragment) => ({ text: fragment.text })),
          ]}
        />
        <div className={styles['nav-list']}>
          <FileListingTable
            files={selected}
            className={`${styles['file-list-origin']} `}
            fields={['size']}
            appendColumns={statusColumns}
          />
        </div>
      </div>
      <div className="col-md-6 d-flex flex-column">
        {/* Table of selected files */}
        <div className={`${styles['col-header']}`}>Destination</div>
        <FileExplorer systemId={systemId} path={path} onNavigate={onNavigate} />
      </div>
    </div>
  );

  const footer = (
    <SubmitWrapper
      isLoading={isLoading}
      error={error}
      success={
        isSuccess
          ? 'Successfully ' +
            (operation === Files.MoveCopyRequestOperationEnum.Move
              ? 'moved'
              : 'copied') +
            ' files'
          : ''
      }
      reverse={true}
    >
      <Button
        color="primary"
        disabled={
          !destinationPath ||
          destinationPath === path ||
          isLoading ||
          (isFinished && !error)
        }
        aria-label="Submit"
        type="submit"
        onClick={onSubmit}
      >
        {opFormatted}
      </Button>
    </SubmitWrapper>
  );

  return (
    <GenericModal
      toggle={toggle}
      title={`${opFormatted} Files`}
      size="xl"
      body={body}
      footer={footer}
    />
  );
};

export default MoveCopyModal;
