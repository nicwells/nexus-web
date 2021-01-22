import * as React from 'react';
import { Table, Tooltip, Button, Input, Select } from 'antd';
import { Resource } from '@bbp/nexus-sdk';
import { match } from 'ts-pattern';

import { ColumnsType, TablePaginationConfig } from 'antd/lib/table';
import {
  SortDirection,
  UseSearchProps,
  UseSearchResponse,
} from '../../hooks/useSearchQuery';
import TypesIconList from '../Types/TypesIcon';
import { getResourceLabel } from '../../utils';
import { convertMarkdownHandlebarStringWithData } from '../../utils/markdownTemplate';
import { parseURL } from '../../utils/nexusParse';
import { SorterResult, TableRowSelection } from 'antd/lib/table/interface';
import { ResultTableFields } from '../../types/search';
import './../../styles/result-table.less';
import { sortBy } from 'lodash';

const { Search } = Input;
const { Option } = Select;

export interface ResultsGridProps {
  rowSelection?: TableRowSelection<any>;
  pagination: TablePaginationConfig;
  searchResponse: UseSearchResponse;
  fields: ResultTableFields[];
  isStudio?: boolean;
  onClickItem: (resource: Resource) => void;
  // If onSort is present, will not use sort prop in column
  // onSort is meant to be used with an async method
  // like server-side ES Query
  onSort?: (sort?: UseSearchProps['sort']) => void;
}

export const DEFAULT_FIELDS = [
  {
    title: 'Label',
    dataIndex: 'label',
    key: 'label',
    displayIndex: 0,
  },
  {
    title: 'Project',
    dataIndex: '_project',
    sortable: true,
    key: 'project',
    displayIndex: 1,
  },
  {
    title: 'Schema',
    dataIndex: '_constrainedBy',
    sortable: true,
    key: 'schema',
    displayIndex: 2,
  },
  {
    title: 'Types',
    dataIndex: '@type',
    sortable: true,
    key: '@type',
    displayIndex: 3,
  },
];

const ElasticSearchResultsTable: React.FC<ResultsGridProps> = ({
  pagination,
  searchResponse,
  fields,
  rowSelection,
  isStudio,
  onClickItem,
  onSort,
}) => {
  const [searchValue, setSearchValue] = React.useState<string>('');

  const results = (searchResponse.data?.hits.hits || []).map(({ _source }) => {
    const { _original_source, ...everythingElse } = _source;

    const resource = {
      ...JSON.parse(_original_source),
      ...everythingElse,
    };

    return {
      ...resource,
      key: _source._self,
    };
  });

  const filteredItems = results.filter(item => {
    return (
      Object.values(item)
        .join(' ')
        .toLowerCase()
        .search((searchValue || '').toLowerCase()) >= 0
    );
  });

  const sorter = (dataIndex: string) => {
    return (
      a: {
        [key: string]: any;
      },
      b: {
        [key: string]: any;
      }
    ) => {
      const sortA = a[dataIndex];
      const sortB = b[dataIndex];
      if (sortA < sortB) {
        return -1;
      }
      if (sortA > sortB) {
        return 1;
      }
      return 0;
    };
  };

  const columns: ColumnsType<any> = fields.map(field => {
    // Enrich certain fields with custom rendering
    return match(field.key)
      .with('label', () => ({
        ...field,
        sorter: !!field.sortable && sorter('label'),
        render: (text: string, resource: Resource) => {
          return getResourceLabel(resource);
        },
      }))
      .with('description', () => ({
        ...field,
        sorter: !!field.sortable && sorter('description'),
        render: (text: string, resource: Resource) =>
          convertMarkdownHandlebarStringWithData(
            resource.description || '',
            resource
          ),
      }))
      .with('project', () => ({
        ...field,
        sorter: !!field.sortable && sorter('project'),
        render: (text: string, resource: Resource) => {
          const { org, project } = parseURL(resource._self);
          return `${org} | ${project}`;
        },
      }))
      .with('schema', () => ({
        ...field,
        sorter: !!field.sortable && sorter('schema'),
        render: (text: string, resource: Resource) => {
          return (
            <Tooltip title={resource._constrainedBy}>
              {text.split('/').reverse()[0]}
            </Tooltip>
          );
        },
      }))
      .with('@type', () => ({
        ...field,
        sorter: !!field.sortable && sorter('@type'),
        render: (text: string, resource: Resource) => {
          const typeList =
            !!resource['@type'] &&
            (Array.isArray(resource['@type']) ? (
              <TypesIconList type={resource['@type']} />
            ) : (
              <TypesIconList type={[resource['@type']]} />
            ));
          return typeList;
        },
      }))
      .otherwise(() => ({
        ...field,
        sorter: !!field.sortable && sorter(field.key),
        render: (text: string, resource: Resource) => {
          return text;
        },
      }));
  });

  const [selectedColumns, setSelectedColumns] = React.useState(columns);

  const handleColumnSelect = (value: string[]) => {
    if (value && value.length === 0) {
      setSelectedColumns(columns);
    } else {
      const selected = columns?.filter(x => value.includes(x.title as string));
      setSelectedColumns(selected);
    }
  };

  const handleClickItem = (resource: Resource) => () => {
    onClickItem(resource);
  };

  const handleTableChange = (
    pagination: TablePaginationConfig,
    filters: Record<string, React.ReactText[] | null>,
    sorter: SorterResult<any> | SorterResult<any>[]
  ) => {
    const toSortBy = Array.isArray(sorter) ? sorter : [sorter];
    if (toSortBy[0].column) {
      onSort &&
        onSort(
          toSortBy.map(sorter => ({
            key: `${sorter.column?.dataIndex}`,
            direction:
              sorter.order === 'ascend'
                ? SortDirection.ASCENDING
                : SortDirection.DESCENDING,
          }))
        );
    } else {
      onSort && onSort(undefined);
    }
  };

  const renderTitle = () => (
    <div className="header">
      <Search
        className="search"
        value={searchValue}
        onChange={(e: React.FormEvent<HTMLInputElement>) => {
          setSearchValue(e.currentTarget.value);
        }}
      />
      <Select
        allowClear
        mode="multiple"
        size={'middle'}
        placeholder="Please select columns"
        defaultValue={selectedColumns?.map(x => x.title as string)}
        value={selectedColumns?.map(x => x.title as string)}
        onChange={handleColumnSelect}
        className="select-column"
      >
        {columns?.map(x => {
          return (
            <Option key={x.title as string} value={x.title as string}>
              {x.title}
            </Option>
          );
        })}
      </Select>
      <Button
        className="reset"
        onClick={() => {
          setSelectedColumns(columns);
          setSearchValue('');
        }}
        type="primary"
      >
        {' '}
        Reset
      </Button>
    </div>
  );

  return (
    <div className="result-table">
      <Table
        onChange={handleTableChange}
        rowSelection={rowSelection}
        dataSource={filteredItems}
        columns={
          isStudio ? selectedColumns : sortBy(columns, ['displayIndex', 'key'])
        }
        pagination={pagination}
        bordered
        title={isStudio ? renderTitle : undefined}
        onRow={resource => {
          return {
            onClick: handleClickItem(resource),
          };
        }}
      />
    </div>
  );
};

export default ElasticSearchResultsTable;
