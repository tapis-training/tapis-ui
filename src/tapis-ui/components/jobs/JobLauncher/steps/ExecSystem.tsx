import { useCallback, useEffect, useState } from 'react';
import { Jobs, Systems } from '@tapis/tapis-typescript';
import { v4 as uuidv4 } from 'uuid';
import { useJobLauncher, StepSummaryField } from '../components';
import { FormikJobStepWrapper } from '../components';
import { FormikSelect } from 'tapis-ui/_common/FieldWrapperFormik';
import { useFormikContext } from 'formik';
import * as Yup from 'yup';

const findLogicalQueues = (
  systems: Array<Systems.TapisSystem>,
  systemId: string
) => systems.find((system) => system.id === systemId)?.batchLogicalQueues ?? [];

const SystemSelector: React.FC = () => {
  const { setFieldValue } = useFormikContext();
  const { job, add, app, systems } = useJobLauncher();
  const [selectedSystem, setSelectedSystem] = useState(
    job.execSystemId ?? app.jobAttributes?.execSystemId ?? ''
  );
  const [queues, setQueues] = useState<Array<Systems.LogicalQueue>>(
    findLogicalQueues(systems, selectedSystem)
  );

  useEffect(
    () => {
      const batchDefaultLogicalQueue = systems.find(
        (system) => system.id === selectedSystem
      )?.batchDefaultLogicalQueue;

      if (!!batchDefaultLogicalQueue) {
        add({
          execSystemLogicalQueue: batchDefaultLogicalQueue
        });
        setFieldValue('execSystemLogicalQueue', batchDefaultLogicalQueue);
      }
    },
    [ systems, selectedSystem, setFieldValue ]
  );

  const setSystem = useCallback(
    (systemId: string) => {
      setSelectedSystem(systemId);
      add({ execSystemId: systemId });
      const systemDetail = systems.find((system) => system.id === systemId)!;
      const queues = systemDetail.batchLogicalQueues ?? [];
      setQueues(queues);
      const selectedSystemHasJobQueue = queues.some(
        (queue) => queue.name === app.jobAttributes?.execSystemLogicalQueue
      );
      if (selectedSystemHasJobQueue) {
        add({
          execSystemLogicalQueue: app.jobAttributes?.execSystemLogicalQueue,
        });
        setFieldValue('execSystemLogicalQueue', app.jobAttributes?.execSystemLogicalQueue);
      } else {
        add({ execSystemLogicalQueue: systemDetail.batchDefaultLogicalQueue });
        setFieldValue('execSystemLogicalQueue', systemDetail.batchDefaultLogicalQueue);
      }
    },
    [setSelectedSystem, setQueues, systems, add, app]
  );
  return (
    <>
      <FormikSelect
        name="execSystemId"
        description="The execution system for this job"
        label="Execution System"
        required={true}
        onChange={(event) => setSystem(event.target.value)}
        value={selectedSystem}
      >
        {systems.map((system) => (
          <option value={system.id} key={uuidv4()}>
            {system.id}
          </option>
        ))}
      </FormikSelect>

      {selectedSystem && (
        <FormikSelect
          name="execSystemLogicalQueue"
          description="The batch queue on this execution system"
          label="Batch Logical Queue"
          required={false}
        >
          {queues.map((queue) => (
            <option value={queue.name} key={uuidv4()}>
              {queue.name}
            </option>
          ))}
        </FormikSelect>
      )}
    </>
  )
}

export const ExecSystem: React.FC = () => {
 
  const validationSchema = Yup.object({
    execSystemId: Yup.string().required(),
    execSystemLogicalQueue: Yup.string()
  });

  const { job, add, app, systems } = useJobLauncher();

  const initialValues: Partial<Jobs.ReqSubmitJob> = {
    execSystemId: job.execSystemId,
    execSystemLogicalQueue: job.execSystemLogicalQueue
  };

  return (
    <FormikJobStepWrapper validationSchema={validationSchema} initialValues={initialValues}>
      <SystemSelector />
    </FormikJobStepWrapper>
  );
};

export const ExecSystemSummary: React.FC = () => {
  const { job } = useJobLauncher();
  const { execSystemId, execSystemLogicalQueue } = job;
  const summary = execSystemId
    ? `${execSystemId} ${
        execSystemLogicalQueue ? '(' + execSystemLogicalQueue + ')' : ''
      }`
    : undefined;
  return (
    <div>
      <StepSummaryField
        field={summary}
        error="An execution system is required"
      />
    </div>
  );
};
