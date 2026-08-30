/*
 *
 * Copyright 2018 Odysseus Data Services, inc.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 * Company: Odysseus Data Services, Inc.
 * Product Owner/Architecture: Gregory Klebanov
 * Authors: Alexandr Saltykov, Pavel Grafkin, Vitaly Koulakov, Anton Gackovka
 * Created: March 3, 2017
 *
 */

import * as React from 'react';
import BEMHelper from 'services/BemHelper';
import {
  Button,
  Table,
  Link,
} from 'arachne-ui-components';
import { License, Vocabulary } from 'modules/Admin/components/Licenses/types';
import * as moment from 'moment';
import { fullDateFormat } from 'const/formats';

require('./style.scss');

function copyUsingTextArea(value: string): Promise<void> {
  const textArea = document.createElement('textarea');
  textArea.value = value;
  textArea.setAttribute('readonly', '');
  textArea.style.position = 'fixed';
  textArea.style.opacity = '0';
  document.body.appendChild(textArea);
  textArea.select();

  let copied = false;
  try {
    copied = document.execCommand('copy');
  } finally {
    document.body.removeChild(textArea);
  }

  return copied ? Promise.resolve() : Promise.reject(new Error('Copy failed'));
}

function copyToClipboard(value: string): Promise<void> {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    return navigator.clipboard.writeText(value).catch(() => copyUsingTextArea(value));
  }
  return copyUsingTextArea(value);
}

interface ICopyButtonProps {
  value: string;
  label: string;
}

interface ICopyButtonState {
  copied: boolean;
}

class CopyButton extends React.Component<ICopyButtonProps, ICopyButtonState> {
  private resetTimer: number;

  constructor(props: ICopyButtonProps) {
    super(props);
    this.state = { copied: false };
    this.handleClick = this.handleClick.bind(this);
  }

  componentWillUnmount() {
    window.clearTimeout(this.resetTimer);
  }

  handleClick(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();

    copyToClipboard(this.props.value)
      .then(() => {
        this.setState({ copied: true });
        window.clearTimeout(this.resetTimer);
        this.resetTimer = window.setTimeout(() => this.setState({ copied: false }), 1500);
      })
      .catch(() => {});
  }

  render() {
    const classes = BEMHelper('licenses-list');
    const title = this.state.copied ? `${this.props.label} copied` : `Copy ${this.props.label}`;

    return (
      <button
        {...classes('copy-button', { copied: this.state.copied })}
        type='button'
        onClick={this.handleClick}
        title={title}
        aria-label={title}
        aria-live='polite'
        disabled={!this.props.value}
      >
        {this.state.copied ? 'check' : 'content_copy'}
      </button>
    );
  }
}

function CellRemove(props: any) {
  const { remove } = props;
  return <Button onClick={remove}>Remove</Button>;
}

function CellVocabs(props: any) {
  const { value, openEditModal, pendingOnly } = props;
  const classes = BEMHelper('licenses-list');

  const label = pendingOnly
    ? `${value.pendingCount} pending ${value.pendingCount === 1 ? 'request' : 'requests'}`
    : `${value.count} vocabularies`;
  
  return <Link onClick={openEditModal}>
    {label} {!pendingOnly && value.pendingCount > 0
      ? <span {...classes('pending')}>({value.pendingCount} pending)</span>
      : ''
    }
  </Link>;
}

function CellEmail(props: any) {
  const classes = BEMHelper('licenses-list');

  return (
    <div {...classes('copyable')}>
      <span {...classes('copy-value')}>
        <Link to={`mailto:${props.value}`}>{props.value}</Link>
      </span>
      <CopyButton value={props.value} label='email address' />
    </div>
  );
}

function CellName(props: any) {
  const classes = BEMHelper('licenses-list');

  return (
    <div {...classes('copyable')}>
      <span {...classes('copy-value')}>{props.value}</span>
      <CopyButton value={props.value} label='user name' />
    </div>
  );
}

function CellDate(props: any) {
  return <span>{props.value ? moment(props.value).format(fullDateFormat) : 'Unknown'}</span>;
}

interface IListProps {
  licenses: Array<License>;
  openEditModal: Function;
  removeAll: Function;
  pendingOnly: boolean;
};

function Results(props: IListProps) {
  const {
    licenses,
    openEditModal,
    removeAll,
    pendingOnly,
  } = props;
  const classes = BEMHelper('licenses-list');

  return (
    <div {...classes()}>
      <Table
        data={licenses}
        mods={['padded']}
      >
        <CellName
          {...classes('name')}
          header='User'
          field='user.name'
        />
        <CellEmail
          {...classes('email')}
          header='Email'
          field='user.email'
        />
        <CellDate
          {...classes('date')}
          header={pendingOnly ? 'Requested at' : 'Latest activity'}
          field='latestActivityDate'
        />
        <CellVocabs
          {...classes('voc')}
          header='Vocabularies'
          field='vocabularies'
          props={(entity: License) => ({
            value: {
              count: entity.vocabularies.length,
              pendingCount: entity.pendingCount,
            },
            openEditModal: () => openEditModal(entity),
            pendingOnly,
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
