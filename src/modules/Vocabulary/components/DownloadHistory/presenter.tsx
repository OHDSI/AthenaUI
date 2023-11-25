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
import { Button, LoadingPanel, Toolbar, Table, TableCellText, Link } from "arachne-ui-components";
import BEMHelper from "services/BemHelper";
import { paths, bundleStatuses } from "modules/Vocabulary/const";
import * as moment from "moment";
import { Accordion, AccordionItem } from "react-sanfona";
import { fullDateFormat } from "const/formats";
import ModalEditNotifications from "./components/ModalEditNotifications";
import ModalRequestLicenses from "./components/ModalRequestLicenses";
import ModalShare from "./components/ModalShare";
// import { HISTORY } from "./const";
import { licenseStatuses } from "const/vocabulary";
import { Vocabulary } from "../List/components/Results/selectors";
import ModalRequestLicense from "../List/components/ModalRequestLicense";

require("./style.scss");

interface IVocabulary {
  id: number;
  code: string;
  name: string;
  cdmVersion: string;
  expiredDate?: string;
}

interface IDownloadRequest {
  id: number;
  date: number;
  link: string;
  vocabularies: Array<IVocabulary>;
  cdmVersion: number;
  name: string;
  status: string;
}

interface IHistoryItem extends IVocabulary {
  date?: string;
  link?: string;
  tableRowClass: string;
}

interface IDownloadHistoryStateProps {
  isLoading: boolean;
  history: Array<IDownloadRequest>;
  currentUser: string;
}

interface IDownloadHistoryDispatchProps {
  load: () => (dispatch: Function) => any;
  remove: (id: number) => Promise<void>;
  restore: (id: number) => Promise<void>;
  share: (id: number) => Promise<void>;
  showNotifications: Function;
  checkAvailability: Function;
  showRequestModal: Function;
  showShareModal: Function;
  openRequestModal: Function;
}

interface IDownloadHistoryProps extends IDownloadHistoryStateProps, IDownloadHistoryDispatchProps {
  removeBundle: (id: number) => any;
  restoreBundle: (id: number) => any;
  download: (bundle: IDownloadRequest) => any;
}

interface IDownloadHistoryStatefulProps {
  toggle: (id: number) => any;
  expandedBundleId: number;
}

function CellLicense(props: any) {
  const { className, value, openRequestModal, isPending, isCheckable, notAvailable } = props;
  const classes = BEMHelper("cell-license");
  if (!value) {
    return null;
  }
  if (isCheckable) {
    return <span>{value}</span>;
  } else if (isPending) {
    return (
      <Link {...classes()}>
        <span {...classes({ element: "icon", extra: `${className}--disabled` })}>timer</span> {value}
      </Link>
    );
  } else {
    return (
      <Link
        {...classes({ extra: notAvailable ? "" : "ac-tooltip" })}
        aria-label="Click to request access"
        data-tootik-conf="right"
        onClick={() => {
          if (notAvailable) {
            return false;
          }
          openRequestModal();
        }}
      >
        <span {...classes({ element: "icon", extra: `${className}--disabled` })}>vpn_key</span>
        {value}
      </Link>
    );
  }
}

function BundleName({ name, date, onClick, isOpened, releaseVersion, downloadShareDTO, currentUser }) {
  const dateFormat = fullDateFormat;
  const classes = BEMHelper("bundle-caption");
  const isAlreadyShared = downloadShareDTO && downloadShareDTO.ownerUsername === currentUser;
  return (
    <div {...classes()} onClick={onClick}>
      <span {...classes({ element: "opener", modifiers: { opened: isOpened } })}>keyboard_arrow_right</span>
      <div {...classes("title-wrapper")}>
        {name}
        <span {...classes("date")}>{moment(date).format(dateFormat)}</span>
        <span {...classes("version")}>{releaseVersion}</span>
        {downloadShareDTO && !isAlreadyShared && <span {...classes("shared-by")}>Shared by {downloadShareDTO.ownerUsername}</span>}
      </div>
    </div>
  );
}

function BundleTitle({ bundle, removeBundle, toggle, isExpanded, restore, download, share, showShareModal, currentUser }) {
  const classes = BEMHelper("download-history");
  const isAlreadyShared = bundle.downloadShareDTO && bundle.downloadShareDTO.ownerUsername === currentUser;
  const isShareable = isAlreadyShared || !bundle.downloadShareDTO;
  const shareBtnTitle = isAlreadyShared ? "Edit share" : !bundle.downloadShareDTO ? "Share" : "";
  return (
    <Toolbar caption={<BundleName {...bundle} onClick={() => toggle(bundle.id)} isOpened={isExpanded} currentUser={currentUser} />}>
      {[bundleStatuses.READY].includes(bundle.status) ? (
        <div>
          <Button {...classes("download-button")} onClick={() => download(bundle)} mods={["rounded"]}>
            Download
          </Button>
          {isShareable && (
            <Button {...classes("share-button")} onClick={() => showShareModal(bundle)} mods={["rounded"]}>
              {shareBtnTitle}
            </Button>
          )}

          {isShareable && (
            <Button {...classes("remove-button")} onClick={() => removeBundle(bundle.id)}>
              Archive
            </Button>
          )}
        </div>
      ) : (
        <div>
          <span {...classes("status")}>{bundle.status}</span>
          {bundle.status === bundleStatuses.ARCHIVED && isShareable && (
            <Button {...classes("restore-button")} mods={["success", "rounded"]} onClick={() => restore(bundle.id)}>
              Restore
            </Button>
          )}
        </div>
      )}
    </Toolbar>
  );
}

function VocabsList(props: IDownloadHistoryProps & IDownloadHistoryStatefulProps) {
  const {
    load,
    isLoading,
    history,
    removeBundle,
    toggle,
    expandedBundleId,
    restoreBundle,
    share,
    showNotifications,
    showShareModal,
    download,
    currentUser,
    openRequestModal = () => {},
  } = props;
  const classes = BEMHelper("download-history");
  // const history: IDownloadRequest[] = HISTORY;
  return (
    <div {...classes()}>
      <Toolbar caption="Download history" backUrl={paths.vocabsList()}>
        <Button {...classes("download-button")} onClick={load}>
          Refresh
        </Button>
        <Button onClick={showNotifications} mods={["submit", "rounded"]}>
          Notifications
        </Button>
      </Toolbar>
      <Accordion activeItems={[expandedBundleId]}>
        {history &&
          history.map((bundle: IDownloadRequest, index: number) => (
            <AccordionItem
              title={
                <BundleTitle
                  bundle={bundle}
                  removeBundle={removeBundle}
                  toggle={toggle}
                  isExpanded={bundle.id === expandedBundleId}
                  restore={restoreBundle}
                  download={download}
                  share={share}
                  showShareModal={showShareModal}
                  currentUser={currentUser}
                />
              }
              {...classes("bundle-caption")}
              key={`caption${index}`}
              slug={bundle.id}
            >
              <Table {...classes("table")} data={bundle.vocabularies} mods={["hover", "padded", "selectable"]}>
                <TableCellText {...classes("id")} header="ID" field="id" />
                <TableCellText {...classes("cdm")} header="CDM" field="cdmVersion" />
                <TableCellText {...classes("code")} header="Code (cdm v5)" field="code" />
                <TableCellText {...classes("name")} header="Name" field="name" />
                <CellLicense
                  {...classes("required")}
                  header="Required"
                  field="required"
                  props={(vocab: Vocabulary) => ({
                    className: classes({
                      element: "cell",
                      modifiers: {
                        selected: vocab.isChecked,
                      },
                    }).className,
                    isPending: vocab.status === licenseStatuses.PENDING,
                    openRequestModal: () => openRequestModal(vocab),
                    isCheckable: vocab.isCheckable,
                    notAvailable: vocab.required === "Currently not available",
                  })}
                />
                <TableCellText {...classes("expiredDate")} header="Expired Date" field="expiredDate" />
              </Table>
            </AccordionItem>
          ))}
      </Accordion>
      <LoadingPanel active={isLoading} />
      <ModalEditNotifications />
      <ModalRequestLicenses />
      <ModalRequestLicense />
      <ModalShare />
    </div>
  );
}

export default VocabsList;
export { IDownloadHistoryStateProps, IDownloadHistoryDispatchProps, IDownloadHistoryProps, IHistoryItem, IDownloadRequest, IVocabulary };
