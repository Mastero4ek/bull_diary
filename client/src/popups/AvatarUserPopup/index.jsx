import React, { useCallback } from 'react'

import { useTranslation } from 'react-i18next'

import { PopupDescLayout } from '@/components/layouts/PopupLayout/PopupDescLayout'
import { usePopup } from '@/components/layouts/PopupLayout/PopupProvider'
import { DropZone } from '@/components/ui/general/DropZone'

export const AvatarUserPopup = React.memo(({ setPhotoFile }) => {
	const { closePopup } = usePopup()
	const { t } = useTranslation()

	const uploadFile = useCallback(
		file => {
			if (file) {
				setPhotoFile(file)
				closePopup()
			}
		},
		[closePopup, setPhotoFile]
	)

	return (
		<>
			<PopupDescLayout
				title={
					<span
						style={{ display: 'block', textAlign: 'center' }}
						dangerouslySetInnerHTML={{ __html: t('popup.avatar_user.title') }}
					></span>
				}
				text={
					<span
						dangerouslySetInnerHTML={{
							__html: t('popup.avatar_user.subtitle'),
						}}
					></span>
				}
			/>

			<DropZone
				maxFiles={1}
				accept={{ 'image/*': ['.png', '.jpg'] }}
				onUpload={uploadFile}
				size={50000000} //5mb
				type={'jpg, png'}
			/>
		</>
	)
})
