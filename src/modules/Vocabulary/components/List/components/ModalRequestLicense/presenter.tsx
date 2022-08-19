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

import * as React from "react";
import BEMHelper from "services/BemHelper";
import { Modal, Button, LoadingPanel } from "arachne-ui-components";
import { Vocabulary } from "../Results/selectors";
import { commonDateFormat } from "const/formats";
import { Field } from "redux-form";
import { paths, TYPE_MODAL } from "modules/Vocabulary/const";
import DatePanel from "components/DatePanel";

require("./style.scss");

interface IModalStateProps {
  vocab: Vocabulary;
  isLoading: boolean;
  expiredDate: any;
  initialValues: {
    expiredDate: string;
  };
}

interface IModalDispatchProps {
  close: () => null;
  requestLicense: (id: number, expiredDate: any) => Promise<any>;
  openConfirmModal: Function;
  loadList: Function;
  loadHistory: Function;
}

interface IModalProps extends IModalStateProps, IModalDispatchProps {
  modal: string;
  request: Function;
  vocab: Vocabulary;
  isLoading: boolean;
}

// interface IReduxFieldProps {
//   options: any;
//   input: any;
// }

function DatepickerControler({ options, input, titleDisplay }) {
  const classes = BEMHelper("date-picker");

  return (
    <DatePanel
      {...classes()}
      title={titleDisplay}
      selected={input.value}
      dateFormat={commonDateFormat}
      isEditable={true}
      onChange={input.onChange}
    />
  );
}

function ModalConfirmDownload(props: IModalProps) {
  const { modal, request, vocab, isLoading, expiredDate } = props;
  const classes = BEMHelper("request-license");
  const getContextModal = () => {
    switch (vocab.typeModal) {
      case TYPE_MODAL.UPDATE_LICENSE:
        return {
          modalTitle: "Extend License",
          buttonLabel: "Request Extension",
          titleDatePicker: "New expiration date",
          modalMessage: "",
        };
      case TYPE_MODAL.REQUEST_LICENSE:
      default:
        return {
          modalTitle: "Request access",
          buttonLabel: "Request",
          titleDatePicker: "License Expiration Date",
          modalMessage: (
            <div>
              {`Vocabulary '${vocab.name}' requires a license`} <br />
              <br />
            </div>
          ),
        };
    }
  };
  const { modalTitle, buttonLabel, titleDatePicker, modalMessage } = getContextModal();

  const isHistoryScreen = window.location.pathname === paths.history();

  return (
    <Modal modal={modal} title={modalTitle}>
      <div {...classes()}>
        {modalMessage}
        {/* Vocabulary '{vocab.name}' requires a license <br /> <br /> */}
        <div {...classes("request-date")}>
          <Field
            component={(props: any) => <DatepickerControler {...props} titleDisplay={titleDatePicker} />}
            name="expiredDate"
          />
        </div>
        <Button
          {...classes("request-button")}
          onClick={() => request(expiredDate, isHistoryScreen)}
          mods={["submit", "rounded"]}
        >
          {buttonLabel}
        </Button>
      </div>
      <LoadingPanel active={isLoading} />
    </Modal>
  );
}

export default ModalConfirmDownload;
export { IModalProps, IModalStateProps, IModalDispatchProps };
