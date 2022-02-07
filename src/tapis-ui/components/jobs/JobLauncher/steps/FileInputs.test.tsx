import '@testing-library/jest-dom/extend-expect';
import renderComponent from 'utils/testing';
import { tapisApp } from 'fixtures/apps.fixtures';
import useJobLauncher from 'tapis-ui/components/jobs/JobLauncher/components/useJobLauncher';
import { FileInputsSummary } from './FileInputs';
import { Apps } from '@tapis/tapis-typescript';

jest.mock('tapis-ui/components/jobs/JobLauncher/components/useJobLauncher');

describe('FileInputsSummary step', () => {
  it('Shows fileInputs', () => {
    (useJobLauncher as jest.Mock).mockReturnValue({
      job: {
        fileInputs: [
          {
            name: 'Data file',
          },
        ],
      },
      app: tapisApp
    });
    const { getAllByText } = renderComponent(
      <FileInputsSummary />
    );
    expect(getAllByText(/Data file/).length).toEqual(1);
  });
  it('Shows fileInputs that are incomplete', () => {
    const incompleteApp: Apps.TapisApp = JSON.parse(JSON.stringify(tapisApp));
    incompleteApp.jobAttributes!.fileInputs![0].sourceUrl = undefined;
    (useJobLauncher as jest.Mock).mockReturnValue({
      job: {
        fileInputs: [
          {
            name: 'Data file',
          },
          {
            sourceUrl: 'userspecified',
          },
        ],
      },
      app: incompleteApp
    });

    const { getAllByText } = renderComponent(
      <FileInputsSummary />
    );
    expect(
      getAllByText(/Data file is missing required information/).length
    ).toEqual(1);
    expect(
      getAllByText(/userspecified is missing required information/).length
    ).toEqual(1);
  });
  it('Shows fileInputs that are included by default', () => {
    (useJobLauncher as jest.Mock).mockReturnValue({
      job: {
        fileInputs: [],
      },
      app: tapisApp
    });
    const { getAllByText } = renderComponent(
      <FileInputsSummary />
    );
    expect(getAllByText(/Data file included by default/).length).toEqual(1);
  });
  it('Shows fileInputs that do not include underspecified required app inputs', () => {
    const incompleteApp: Apps.TapisApp = JSON.parse(JSON.stringify(tapisApp));
    incompleteApp.jobAttributes!.fileInputs![0].sourceUrl = undefined;
    (useJobLauncher as jest.Mock).mockReturnValue({
      job: {
        fileInputs: [],
      },
      app: incompleteApp
    });
    const { getAllByText } = renderComponent(
      <FileInputsSummary />
    );
    expect(getAllByText(/Data file is required/).length).toEqual(1);
  });
});
