import * as React from 'react';
import BEMHelper from 'services/BemHelper';
import {
    Modal,
    Button,
    Form,
    FormError
} from 'arachne-ui-components';
import { FieldArray, Field } from 'redux-form';
import EmailListInput from 'components/EmailListInput';

require('./style.scss');

interface IModalStateProps {
    bundle: any;
    initialValues: any;
    isOpened: boolean;
};

interface IModalDispatchProps {
    share: Function;
    handleSubmit: Function;
    shareBundle: Function;
    reset: Function;
    close: Function;
};

interface IModalProps extends IModalStateProps, IModalDispatchProps {
  modal: string;
  error?: string;
};

function ModalShare(props: IModalProps) {
  const {
    modal,
    share,
    handleSubmit,
    reset,
  } = props;
  const classes = BEMHelper('modal-share');

  return (
    <div {...classes()}>
      <Modal modal={modal} title='Share vocabulary' >
      <form
          {...classes('share-form')}
          onSubmit={handleSubmit(share)}
        >
        {props.error && <div role="alert"><FormError error={props.error} /></div>}
        <FieldArray name="emailList" component={EmailListInput} />
        </form>
      </Modal>
    </div>);
}

export default ModalShare;
export {
  IModalProps,
  IModalStateProps,
  IModalDispatchProps,
};
