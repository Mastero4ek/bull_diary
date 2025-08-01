import React, {
  useCallback,
  useState,
} from 'react';

import Dropzone from 'react-dropzone';

import { RootButton } from '@/components/ui/buttons/RootButton';
import { RootDesc } from '@/components/ui/descriptions/RootDesc';
import { SmallDesc } from '@/components/ui/descriptions/SmallDesc';
import { Icon } from '@/components/ui/general/Icon';
import { OuterBlock } from '@/components/ui/general/OuterBlock';

import styles from './styles.module.scss';

export const DropZone = React.memo(props => {
	const { maxFiles, accept, onUpload, size, type } = props

	const [fileInfo, setFileInfo] = useState({
		files: [],
		error: false,
		loading: false,
		progress: 0,
	})

	const onDrop = useCallback(acceptedFiles => {
		setFileInfo(prev => ({ ...prev, loading: true }))
	}, [])

	const handleDropAccept = useCallback(dropped => {
		setFileInfo(prev => ({ ...prev, loading: false }))

		const file = dropped[0]

		if (file) {
			setFileInfo({
				files: [{ name: file.name, size: file.size }],
				error: false,
				progress: 0,
			})

			onUpload(file)
		}
	}, [])

	const handleDropReject = useCallback(() => {
		setFileInfo({ ...fileInfo, error: true })
	}, [])

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
										<b>Drag file to upload</b>
									</RootDesc>

									<Icon id={'upload'} />

									<RootDesc>
										<span>or</span>
									</RootDesc>
								</div>

								<RootButton onClickBtn={() => {}} text={'Browse Files'} />

								<SmallDesc>
									<span>
										Max. file size: <b>5MB</b>
										<br />
										Supported file types: <b>{type}</b>
									</span>
								</SmallDesc>
							</div>
						</OuterBlock>

						{fileInfo.error && (
							<SmallDesc>
								<span style={{ color: 'var(--red)' }}>
									File size exceeds the limit!
								</span>
							</SmallDesc>
						)}
					</div>
				)}
			</Dropzone>
		</>
	)
})
