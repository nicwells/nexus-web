import { ActionCreator, Dispatch } from 'redux';
import { Organization, Project } from '@bbp/nexus-sdk';
import { ThunkAction } from '../..';
import { FetchAction, FetchFulfilledAciton, FetchFailedAction } from '../utils';

enum OrgActionTypes {
  FETCHING = '@@nexus/ORG_FETCHING',
  FULFILLED = '@@nexus/ORG_FETCHING_FULFILLED',
  FAILED = '@@nexus/ORG_FETCHING_FAILED',
}

export const actionTypes = {
  FETCHING: OrgActionTypes.FETCHING,
  FULFILLED: OrgActionTypes.FULFILLED,
  FAILED: OrgActionTypes.FAILED,
};

const fetchOrgAction: ActionCreator<
  FetchAction<OrgActionTypes.FETCHING>
> = () => ({
  type: OrgActionTypes.FETCHING,
});

const fetchOrgFulfilledAction: ActionCreator<
  FetchFulfilledAciton<
    OrgActionTypes.FULFILLED,
    { org: Organization; projects: Project[] }
  >
> = (org: Organization, projects: Project[]) => ({
  type: OrgActionTypes.FULFILLED,
  payload: { org, projects },
});

const fetchOrgFailedAction: ActionCreator<
  FetchFailedAction<OrgActionTypes.FAILED>
> = (error: Error) => ({
  error,
  type: OrgActionTypes.FAILED,
});

export const fetchOrg: ActionCreator<ThunkAction> = orgName => {
  return async (
    dispatch: Dispatch<any>,
    getState,
    { nexus }
  ): Promise<
    | FetchFulfilledAciton<
        OrgActionTypes.FULFILLED,
        { org: Organization; projects: Project[] }
      >
    | FetchFailedAction<OrgActionTypes.FAILED>
  > => {
    dispatch(fetchOrgAction());
    try {
      const org: Organization = await nexus.getOrganization(orgName);
      const projects: Project[] = await org.listProjects();
      return dispatch(fetchOrgFulfilledAction(org, projects));
    } catch (e) {
      return dispatch(fetchOrgFailedAction(e));
    }
  };
};
