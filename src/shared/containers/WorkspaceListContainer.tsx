import * as React from 'react';
import { Resource } from '@bbp/nexus-sdk';
import { useNexusContext } from '@bbp/react-nexus';

import TabList from '../components/Tabs/TabList';
import AddWorkspaceContainer from './AddWorkspaceContainer';
import WorkspaceForm from './WorkspaceFormContainer';
import { Dashboard } from './DashboardListContainer';
import useQueryString from '../hooks/useQueryString';

type StudioResource = Resource<{
  label: string;
  description?: string;
  workspaces?: [string];
}>;

type WorkspaceListProps = {
  workspaceIds: string[];
  orgLabel: string;
  projectLabel: string;
  studioResource: StudioResource;
  onListUpdate?(): void;
  dashboardListComponent(dashboardListComponentProps: {
    dashboards: Dashboard[]; // TODO add Dashboard type
    workspaceId: string;
  }): React.ReactElement;
};

const WorkspaceList: React.FunctionComponent<WorkspaceListProps> = ({
  workspaceIds = [],
  orgLabel,
  projectLabel,
  studioResource,
  onListUpdate,
  dashboardListComponent,
}) => {
  const [queryParams, setQueryString] = useQueryString();
  const { workspaceId } = queryParams;
  const [workspaces, setWorkspaces] = React.useState<Resource[]>([]);
  const [selectedWorkspace, setSelectedWorkspace] = React.useState<Resource>();
  const [showEdit, setShowEdit] = React.useState<boolean>(false);
  const [workspaceToEdit, setWorkSpaceToEdit] = React.useState<string>();
  const nexus = useNexusContext();
  const dashboards =
    selectedWorkspace && selectedWorkspace['dashboards']
      ? selectedWorkspace['dashboards']
      : [];
  const selectWorkspace = (id: string, values: Resource[]) => {
    const w = values.find(w => w['@id'] === id);
    setSelectedWorkspace(w);
    setQueryString({
      ...queryParams,
      workspaceId: id,
    });
  };

  React.useEffect(() => {
    Promise.all(
      workspaceIds.map(workspaceId => {
        return nexus.Resource.get(
          orgLabel,
          projectLabel,
          encodeURIComponent(workspaceId)
        );
      })
    )
      .then(values => {
        setWorkspaces(values);
        let w;
        w = values[0];
        if (workspaceId !== undefined) {
          const id = decodeURIComponent(workspaceId);
          w = values.find(w => w['@id'] === id);
        }
        if (w) {
          setSelectedWorkspace(w);
        }
      })
      .catch(e => {
        // TODO: show a meaningful error to the user.
      });
  }, [workspaceIds, workspaceId]);

  return (
    <>
      <TabList
        onEditClick={workspaceId => {
          setWorkSpaceToEdit(workspaceId);
          setShowEdit(true);
        }}
        items={workspaces.map(w => ({
          label: w.label,
          description: w.description,
          id: w['@id'],
        }))}
        onSelected={(id: string) => {
          selectWorkspace(id, workspaces);
        }}
        activeKey={
          workspaces.length
            ? workspaceId
              ? decodeURIComponent(workspaceId)
              : workspaces[0]['@id']
            : undefined
        }
        position="top"
        tabAction={
          <AddWorkspaceContainer
            orgLabel={orgLabel}
            projectLabel={projectLabel}
            studio={studioResource}
            onAddWorkspace={onListUpdate}
          />
        }
      >
        {selectedWorkspace ? (
          <div className="workspace">
            {dashboardListComponent({
              dashboards,
              workspaceId: workspaceId
                ? workspaceId
                : encodeURIComponent(selectedWorkspace['@id']),
            })}{' '}
          </div>
        ) : null}
      </TabList>
      {showEdit && !!workspaceToEdit ? (
        <WorkspaceForm
          orgLabel={orgLabel}
          projectLabel={projectLabel}
          workspaceId={workspaceToEdit}
          onCancel={() => setShowEdit(false)}
          onSuccess={onListUpdate}
        />
      ) : null}
    </>
  );
};

export default WorkspaceList;
