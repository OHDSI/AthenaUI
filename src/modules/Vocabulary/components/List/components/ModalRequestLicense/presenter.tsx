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
import { Modal, Button, LoadingPanel, FormDatepicker, Form } from "arachne-ui-components";
import { Vocabulary } from "../Results/selectors";
import { commonDateFormat } from "const/formats";
import { Field } from "redux-form";
import { paths } from "modules/Vocabulary/const";

require("./style.scss");

interface IModalStateProps {
  vocab: Vocabulary;
  isLoading: boolean;
  expiredDate: any;
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

interface IReduxFieldProps {
  options: any;
  input: any;
}

function ModalConfirmDownload(props: IModalProps) {
  const { modal, request, vocab, isLoading, expiredDate } = props;
  console.log("props", props);
  const classes = BEMHelper("request-license");
  console.log("request", request);
  const fields = [
    {
      name: "expiredDate",
      InputComponent: {
        component: FormDatepicker,
        props: {
          className: "abc",
          title: "Expired Date",
          type: "text",
          options: {
            selected: expiredDate,
            dateFormat: commonDateFormat,
          },
        },
      },
    },
  ];
  const isHistoryScreen = window.location.pathname === paths.history()

  return (
    <Modal modal={modal} title="Request access">
      <div {...classes()}>
        Vocabulary '{vocab.name}' requires a license <br /> <br />
        <div>
          <Form {...props} fields={fields} />
        </div>
        <Button {...classes("request-button")} onClick={() => request(expiredDate, isHistoryScreen)} mods={["submit", "rounded"]}>
          Request
        </Button>
      </div>
      <LoadingPanel active={isLoading} />
    </Modal>
  );
}

export default ModalConfirmDownload;
export { IModalProps, IModalStateProps, IModalDispatchProps };
