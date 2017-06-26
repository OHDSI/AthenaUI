import * as React from 'react';
import BEMHelper from 'services/BemHelper';
import {
  Button,
  Table,
  TableCellText,
  Link,
} from 'arachne-components';
import { License, Vocabulary } from 'modules/Admin/components/Licenses/types';

require('./style.scss');

function CellRemove(props: any) {
  const { remove } = props;
  return <Button onClick={remove}>Remove</Button>;
}

function CellVocabs(props: any) {
  const { value, openEditModal } = props;
  return <Link onClick={openEditModal}>{`${value.length} vocabularies`}</Link>;
}

interface IListProps {
  licenses: Array<License>;
  openEditModal: Function;
  removeAll: Function;
};

function Results(props: IListProps) {
  const {
    licenses,
    openEditModal,
    removeAll,
  } = props;
  const classes = BEMHelper('licenses-list');

  return (
    <div {...classes()}>
      <Table
        data={licenses}
        mods={['padded']}
      >
        <TableCellText
          {...classes('name')}
          header='User'
          field='user.name'
        />
        <CellVocabs
          {...classes('voc')}
          header='Vocabularies'
          field='vocabularies'
          props={(entity: License) => ({
            value: entity.vocabularies,
            openEditModal: () => openEditModal(entity),
          })}
        />
        <CellRemove
          props={(entity: License) => ({
            remove: () => removeAll(entity),
          })}
        />
      </Table>
     </div>
  );
}

export default Results;
