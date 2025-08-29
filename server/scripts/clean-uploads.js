const fs = require('fs')
const path = require('path')

const { logInfo, logWarn } = require('../configs/logger-config')

async function cleanAllUploads() {
	const uploadsPath = path.join(__dirname, '../uploads')

	if (fs.existsSync(uploadsPath)) {
		const files = fs.readdirSync(uploadsPath)

		for (const file of files) {
			if (file === '.gitkeep') continue
			const filePath = path.join(uploadsPath, file)

			if (fs.lstatSync(filePath).isFile()) {
				fs.unlinkSync(filePath)
			}
		}

		logInfo('All files in uploads/ (except .gitkeep) have been deleted!')
	} else {
		logWarn('uploads/ directory does not exist.')
	}
}

module.exports = { cleanAllUploads }

if (require.main === module) {
	cleanAllUploads()
}
