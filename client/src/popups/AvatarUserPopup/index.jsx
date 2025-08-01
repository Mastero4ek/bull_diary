import React, { useCallback } from 'react';

import {
  PopupDescLayout,
} from '@/components/layouts/PopupLayout/PopupDescLayout';
import { usePopup } from '@/components/layouts/PopupLayout/PopupProvider';
import { DropZone } from '@/components/ui/general/DropZone';

export const AvatarUserPopup = React.memo(({ setPhotoFile }) => {
	const { closePopup } = usePopup()

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
				title={'Upload an image!'}
				text={'Please select and upload an image to be used on your profile.'}
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
