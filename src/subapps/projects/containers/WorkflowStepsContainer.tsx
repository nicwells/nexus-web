import * as React from 'react';
import { useNexusContext } from '@bbp/react-nexus';
import { NexusClient } from '@bbp/nexus-sdk';
import SingleStepContainer from './SingleStepContainer';
import StepsBoard from '../components/WorkflowSteps/StepsBoard';
import { displayError } from '../components/Notifications';
import { StepResource } from '../views/WorkflowStepView';
import ProjectPanel from '../components/ProjectPanel';
import { fetchTopLevelSteps } from '../utils';

import AddComponentButton from '../components/AddComponentButton';

const WorkflowStepContainer: React.FC<{
  orgLabel: string;
  projectLabel: string;
}> = ({ orgLabel, projectLabel }) => {
  const nexus = useNexusContext();
  const [steps, setSteps] = React.useState<StepResource[]>([]);
  // switch to trigger step list update
  const [refreshSteps, setRefreshSteps] = React.useState<boolean>(false);

  const waitAntReloadSteps = () =>
    setTimeout(() => setRefreshSteps(!refreshSteps), 3500);

  React.useEffect(() => {
    fetchAllSteps(nexus, orgLabel, projectLabel);
  }, [refreshSteps]);

  const fetchAllSteps = async (
    nexus: NexusClient,
    orgLabel: string,
    projectLabel: string
  ) => {
    try {
      const allSteps = (await fetchTopLevelSteps(
        nexus,
        orgLabel,
        projectLabel
      )) as StepResource[];
      setSteps(allSteps);
    } catch (e) {
      displayError(e, 'Failed to fetch workflow steps');
    }
  };

  const topLevelSteps: StepResource[] = steps.filter(step => !step.hasParent);

  const children: StepResource[] = steps.filter(step => !!step.hasParent);

  const stepsWithChildren = topLevelSteps.map(step => {
    const substeps = children.filter(
      substep => substep.hasParent && substep.hasParent['@id'] === step['@id']
    );

    return {
      ...step,
      substeps,
    };
  });

  const siblings = topLevelSteps.map(sibling => ({
    name: sibling.name,
    '@id': sibling._self,
  }));

  return (
    <>
      <ProjectPanel
        orgLabel={orgLabel}
        projectLabel={projectLabel}
        onUpdate={waitAntReloadSteps}
        siblings={siblings}
      />
      <AddComponentButton />
      <StepsBoard>
        {steps &&
          stepsWithChildren.map(step => (
            <SingleStepContainer
              step={step}
              key={step['@id']}
              projectLabel={projectLabel}
              orgLabel={orgLabel}
              onUpdate={waitAntReloadSteps}
            />
          ))}
      </StepsBoard>
    </>
  );
};

export default WorkflowStepContainer;
