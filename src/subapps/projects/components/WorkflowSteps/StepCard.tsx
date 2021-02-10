import * as React from 'react';
import { Link } from 'react-router-dom';
import { Tooltip, Dropdown, Button, Menu } from 'antd';
import { DownOutlined } from '@ant-design/icons';

import SubStepItem from './SubStepItem';
import { StepResource } from '../../views/WorkflowStepView';
import { Status } from '../StatusIcon';

import './StepCard.less';

const settingIcon = require('../../../../shared/images/settingIcon.svg');

const MAX_TITLE_LENGTH = 57;
const MAX_DESCRIPTION_LENGTH = 100;

const StepCard: React.FC<{
  step: StepResource;
  projectLabel: string;
  orgLabel: string;
  substeps: StepResource[];
  onStatusChange: (stepId: string, rev: number, status: string) => void;
}> = ({ step, projectLabel, orgLabel, substeps, onStatusChange }) => {
  const [stepStatus, setStepStatus] = React.useState<string>(step.status);
  const { name, description } = step;
  const stepId = step['@id'];

  React.useEffect(() => {
    if (step.wasInformedBy) {
      const line = document.getElementById(`was-informed-link-${stepId}`);
      const div1 = document.getElementById(`card-${stepId}`);
      const div2 = document.getElementById(`card-${step.wasInformedBy['@id']}`);

      if (div1 && div2) {
        const x1 = div1.offsetLeft + div1.getBoundingClientRect().width;
        const y1 = div1.offsetTop + div1.getBoundingClientRect().height / 2;
        const x2 = div2.offsetLeft + div2.getBoundingClientRect().width / 2;
        const y2 = div2.offsetTop + div2.getBoundingClientRect().height / 2;

        console.log(x1, x2, y1, y2);

        if (line) {
          line.setAttribute('x1', x1.toString());
          line.setAttribute('y1', y1.toString());
          line.setAttribute('x2', x2.toString());
          line.setAttribute('y2', y2.toString());
        }
      }
    }
  }, []);

  const handleMenuClick = (option: any) => {
    setStepStatus(option.key);
    onStatusChange(stepId, step._rev, option.key);
  };

  const menu = (
    <Menu onClick={handleMenuClick}>
      {Object.values(Status).map(status => (
        <Menu.Item key={status}>
          <span className="step-card__status-item">{status}</span>
        </Menu.Item>
      ))}
    </Menu>
  );

  return (
    <>
      <div
        id={`card-${stepId}`}
        className={`step-card step-card--${status && status.replace(' ', '-')}`}
      >
        <div
          className={`step-card__status step-card__status--${stepStatus &&
            stepStatus.replace(' ', '-')}`}
        >
          <Dropdown overlay={menu}>
            <Button type="text">
              <span className="step-card__status-button">{stepStatus}</span>
              <DownOutlined />
            </Button>
          </Dropdown>
        </div>
        <div className="step-card__main">
          <div className="step-card__title">
            <Link to={`/workflow/${orgLabel}/${projectLabel}/${stepId}`}>
              {name.length > MAX_TITLE_LENGTH ? (
                <Tooltip placement="topRight" title={name}>
                  <h3 className="step-card__name">
                    {`${name.slice(0, MAX_TITLE_LENGTH)}...`}
                  </h3>
                </Tooltip>
              ) : (
                <h3 className="step-card__name">{name}</h3>
              )}
            </Link>
          </div>
          <div className="step-card__info">
            {description && description.length > MAX_DESCRIPTION_LENGTH ? (
              <Tooltip placement="topRight" title={description}>
                <span>
                  {`${description.slice(0, MAX_DESCRIPTION_LENGTH)}...`}
                </span>
              </Tooltip>
            ) : (
              <span>{description || '-'}</span>
            )}
          </div>
          <div className="step-card__subactivities">
            <div className="step-card__substeps-total">
              <img src={settingIcon} className="step-card__info-icon" />
              <span>
                {(substeps && substeps.length) || 'No'}{' '}
                {substeps && substeps.length === 1 ? 'sub-step' : 'sub-steps'}
              </span>
            </div>
            <div className="step-card__list-container">
              {substeps &&
                substeps.length > 0 &&
                substeps.map(substep => (
                  <SubStepItem
                    substep={substep}
                    key={substep['@id']}
                    orgLabel={orgLabel}
                    projectLabel={projectLabel}
                  />
                ))}
            </div>
          </div>
        </div>
      </div>
      {step.wasInformedBy && (
        <svg id="svg">
          <line className="link-line" id={`was-informed-link-${stepId}`} />
        </svg>
      )}
    </>
  );
};

export default StepCard;
