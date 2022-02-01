import { act } from '@testing-library/react';
import renderComponent from 'utils/testing';
import Toolbar from './Toolbar';
import { fileInfo } from 'fixtures/files.fixtures';
import { useFilesSelect } from 'tapis-app/Files/_store';
import { useDownload } from 'tapis-hooks/files';
import RenameModal from 'tapis-app/Files/_components/Toolbar/RenameModal';

jest.mock('tapis-hooks/files');
jest.mock('tapis-app/Files/_store');
jest.mock('tapis-app/Files/_components/Toolbar/RenameModal');

describe('Toolbar', () => {
  beforeEach(() => {
    (useDownload as jest.Mock).mockReturnValue({
      downloadAsync: jest.fn(),
      download: jest.fn(),
    });
  });
  it('enables rename buttons', async () => {
    (useFilesSelect as jest.Mock).mockReturnValue({
      selected: [fileInfo],
    });

    (RenameModal as jest.Mock).mockReturnValue(<div></div>);

    const { getByLabelText } = renderComponent(<Toolbar />);

    const renameBtn = getByLabelText('Rename');
    expect(renameBtn).toBeDefined();
    expect(renameBtn.closest('button')).not.toHaveAttribute('disabled');

    // Try clicking the rename button
    await act(async () => {
      renameBtn.click();
    });
    expect(RenameModal as jest.Mock).toHaveBeenCalled();
  });

  it('enables the move, copy, download and delete buttons', async () => {
    (useFilesSelect as jest.Mock).mockReturnValue({
      selected: [fileInfo, { ...fileInfo, type: 'dir' }],
    });

    const { getByLabelText } = renderComponent(<Toolbar />);

    const moveBtn = getByLabelText('Move');
    expect(moveBtn).toBeDefined();
    expect(moveBtn.closest('button')).not.toHaveAttribute('disabled');

    const copyBtn = getByLabelText('Copy');
    expect(copyBtn).toBeDefined();
    expect(copyBtn.closest('button')).not.toHaveAttribute('disabled');

    const deleteBtn = getByLabelText('Delete');
    expect(deleteBtn).toBeDefined();
    expect(deleteBtn.closest('button')).not.toHaveAttribute('disabled');

    const downloadBtn = getByLabelText('Download');
    expect(downloadBtn).toBeDefined();
    expect(downloadBtn.closest('button')).not.toHaveAttribute('disabled');
  });
});
