import * as React from 'react';
import { Button, Modal } from 'arachne-ui-components';
import BEMHelper from 'services/BemHelper';

require('./style.scss');

interface IRestoreAvailability {
  originalVersionAvailable: boolean;
  originalVersion: string;
  currentVersion: string;
  delta: boolean;
}

interface IModalProps {
  modal: string;
  availability: IRestoreAvailability;
  close: () => any;
  generateCurrent: () => any;
  isSaving: boolean;
  error: string;
}

function ModalRestoreUnavailable(props: IModalProps) {
  const { modal, availability, close, generateCurrent, isSaving, error } = props;
  const classes = BEMHelper('modal-restore-unavailable');
  const originalVersion = availability.originalVersion || 'the original release';
  const currentVersion = availability.currentVersion || 'the current release';

  return (
    <div {...classes()}>
      <Modal modal={modal} title='Original release unavailable'>
        <p {...classes('message')}>
          Vocabulary release {originalVersion} is no longer retained and this package cannot be
          regenerated exactly. You can create a new package containing the same vocabularies from
          the current release, {currentVersion}.
        </p>
        {availability.delta &&
          <p {...classes('note')}>
            The archived package was a delta. The replacement will be a full current-release package.
          </p>
        }
        {error && <p {...classes('error')}>{error}</p>}
        <div {...classes('actions')}>
          <Button disabled={isSaving} onClick={close}>Cancel</Button>
          <Button disabled={isSaving} mods={['success']} onClick={generateCurrent}>
            {isSaving ? 'Generating...' : 'Generate current version'}
          </Button>
        </div>
      </Modal>
    </div>
  );
}

export default ModalRestoreUnavailable;
export { IModalProps, IRestoreAvailability };
