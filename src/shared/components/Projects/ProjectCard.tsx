import * as React from 'react';
import { Button, Card, Tag } from 'antd';

import './Projects.less';

export interface ProjectCardProps {
  label: string;
  deprecated?: boolean;
  description?: string;
  resourceNumber?: number;
  logo?: string;
  onClick?(): void;
  onEdit?(): void;
}

const ProjectCard: React.FunctionComponent<ProjectCardProps> = ({
  label,
  resourceNumber = 0,
  description = '',
  onEdit,
  deprecated = false,
  onClick = () => {},
}) => {
  return (
    <Card className={`ProjectCard ${label}`} tabIndex={1} onClick={onClick}>
      <div className="content">
        <p className="project-name">{label}</p>
        {deprecated && <Tag color="red">deprecated</Tag>}
        <p className="project-number">
          <span className="number">{resourceNumber}</span> resource
          {resourceNumber > 1 && 's'}
        </p>
        {!deprecated && onEdit && (
          <Button
            className="edit-button"
            type="primary"
            tabIndex={1}
            onClick={(e: React.SyntheticEvent) => {
              e.stopPropagation();
              onEdit();
            }}
          >
            Edit
          </Button>
        )}
      </div>
      {description && (
        <p className="project-description">
          {description}
        </p>
      )}
    </Card>
  );
};

export default ProjectCard;
