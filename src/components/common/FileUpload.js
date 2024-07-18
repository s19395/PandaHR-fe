import React, { useState } from 'react';
import { FilePond, registerPlugin } from 'react-filepond';
import 'filepond/dist/filepond.min.css';
import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type';

registerPlugin(FilePondPluginFileValidateType);

const FileUpload = () => {
  const [files, setFiles] = useState([]);

  return (
    <FilePond
      files={files}
      onupdatefiles={setFiles}
      allowMultiple={true}
      maxFiles={null}
      acceptedFileTypes={['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']}
      fileValidateTypeLabelExpectedTypes="Tylko pliku excel w formacie .xlsx są akceptowane"
      labelFileTypeNotAllowed="Zły format pliku"
      labelFileLoading="Wczytywanie"
      labelFileProcessing="Przetwarzanie"
      labelFileProcessingComplete="Przetwarzanie zakończone"
      labelTapToUndo="Kliknij, aby cofnąć"
      labelTapToCancel="Kliknij, aby anulować"
      server={{
        url: process.env.REACT_APP_ENDPOINT,
        process: {
          url: '/timesheet/upload',
          method: 'POST'
        },
        revert: (uniqueFileId, load, error) => {
          try {
            const i = this.attachments.findIndex((a) => a.name === uniqueFileId);
            if (i > -1) {
              this.attachments.splice(i, 1);
            }
          } catch (e) {
            error(e);
          }
        }
      }}
      labelIdle='Przeciągnij i upuść lub <span class="filepond--label-action">przeglądaj</span>'
    />
  );
};

export default FileUpload;
