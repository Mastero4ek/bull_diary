import { createFileName, useScreenshot } from 'use-react-screenshot'

import { Icon } from '@/components/ui/media/Icon'
import { RootDesc } from '@/components/ui/typography/descriptions/RootDesc'

import styles from './styles.module.scss'

export const DownloadButton = ({ selector, name, ref }) => {
	// const [{ isError, isLoading, isSuccess }, convert, ref] = useToBlob({
	// 	quality: 100,
	// 	selector: selector,
	// 	onSuccess: async data => {
	// 		try {
	// 			const resizedImageUrl = await resizeImage(data)
	// 			const link = document.createElement('a')

	// 			link.download = `${name}_${moment().format('DD_MM_YYYY')}.png`
	// 			link.href = resizedImageUrl
	// 			link.click()
	// 		} catch (error) {
	// 			console.error('Error during image download:', error)
	// 		}
	// 	},
	// })

	// const resizeImage = async data => {
	// 	try {
	// 		const buffer = await data.arrayBuffer()
	// 		const image = await Image.load(buffer)
	// 		const resizedImage = image.resize({ width: 1024 })
	// 		const blob = await resizedImage.toBlob()

	// 		return URL.createObjectURL(blob)
	// 	} catch (error) {
	// 		console.error('Error resizing image:', error)

	// 		throw error
	// 	}
	// }

	const [image, takeScreenShot] = useScreenshot({
		type: 'image/jpeg',
		quality: 1.0,
	})

	const download = (image, { name = 'img', extension = 'jpg' } = {}) => {
		const a = document.createElement('a')
		a.href = image
		a.download = createFileName(extension, name)
		a.click()
	}

	const downloadScreenshot = () => {
		if (ref && ref.current) {
			takeScreenShot(ref.current).then(download)
		} else {
			console.error('Ref is undefined')
		}
	}

	return (
		<>
			{/* {isLoading && <Loader logo={false} />} */}

			<div className={styles.download_button_wrapper}>
				<div className={styles.download_button_desc}>
					{/* {isError && (
						<SmallDesc>
							<span>Error saving image! Please try again later.</span>
						</SmallDesc>
					)}

					{isSuccess && (
						<SmallDesc>
							<b>Saving the image was successful!</b>
						</SmallDesc>
					)} */}
				</div>

				<button
					// disabled={isLoading}
					onClick={downloadScreenshot}
					type='button'
					className={styles.download_button}
				>
					<RootDesc>
						<span>Download</span>
					</RootDesc>

					<Icon id='download' />
				</button>
			</div>
		</>
	)
}
