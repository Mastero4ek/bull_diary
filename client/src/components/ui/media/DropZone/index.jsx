import React, {
  useCallback,
  useState,
} from 'react';

import Dropzone from 'react-dropzone';
import { useTranslation } from 'react-i18next';

import { OuterBlock } from '@/components/layouts/utils/OuterBlock';
import { RootButton } from '@/components/ui/buttons/RootButton';
import { Icon } from '@/components/ui/media/Icon';
import { RootDesc } from '@/components/ui/typography/descriptions/RootDesc';
import { SmallDesc } from '@/components/ui/typography/descriptions/SmallDesc';

import styles from './styles.module.scss';

export const DropZone = React.memo((props) => {
  const { maxFiles, accept, onUpload, size, type } = props;
  const { t } = useTranslation();

  const [fileInfo, setFileInfo] = useState({
    files: [],
    error: false,
    loading: false,
    progress: 0,
  });

  const onDrop = useCallback((acceptedFiles) => {
    setFileInfo((prev) => ({ ...prev, loading: true }));
  }, []);

  const handleDropAccept = useCallback(
    (dropped) => {
      setFileInfo((prev) => ({ ...prev, loading: false }));

      const file = dropped[0];

      if (file) {
        setFileInfo({
          files: [{ name: file.name, size: file.size }],
          error: false,
          progress: 0,
        });

        onUpload(file);
      }
    },
    [onUpload]
  );

  const handleDropReject = useCallback(() => {
    setFileInfo({ ...fileInfo, error: true });
  }, [fileInfo]);

  return (
    <>
      <Dropzone
        maxFiles={maxFiles || 0}
        multiple={false}
        accept={accept}
        maxSize={size}
        onDrop={onDrop}
        onDropAccepted={handleDropAccept}
        onDropRejected={handleDropReject}
      >
        {({ getRootProps, getInputProps }) => (
          <div {...getRootProps()} className={styles.dropzone_wrapper}>
            <input {...getInputProps()} />

            <OuterBlock>
              <div
                className={styles.dropzone}
                style={{
                  border: fileInfo.error
                    ? '1rem dashed var(--red)'
                    : '1rem dashed var(--text)',
                }}
              >
                <div className={styles.dropzone_head}>
                  <RootDesc>
                    <b>{t('dropzone.title')}</b>
                  </RootDesc>

                  <Icon id={'upload'} />

                  <RootDesc>
                    <span>{t('dropzone.or')}</span>
                  </RootDesc>
                </div>

                <RootButton text={t('button.browse_file')} />

                <SmallDesc>
                  <span>
                    {t('dropzone.max_size')} <b>5MB</b>
                    <br />
                    {t('dropzone.support')} <b>{type}</b>
                  </span>
                </SmallDesc>
              </div>
            </OuterBlock>

            {fileInfo.error && (
              <SmallDesc>
                <span style={{ color: 'var(--red)' }}>
                  {t('dropzone.error')}
                </span>
              </SmallDesc>
            )}
          </div>
        )}
      </Dropzone>
    </>
  );
});
