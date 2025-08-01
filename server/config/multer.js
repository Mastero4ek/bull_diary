const multer = require('multer')
const path = require('path')
const fs = require('fs')

const uploadsPath = path.join(__dirname, '../uploads')

if (!fs.existsSync(uploadsPath)) {
	fs.mkdirSync(uploadsPath, { recursive: true })
}

const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, uploadsPath)
	},
	filename: (req, file, cb) => {
		const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
		const ext = path.extname(file.originalname)

		cb(null, uniqueSuffix + ext)
	},
})

const fileFilter = (req, file, cb) => {
	if (file.mimetype.startsWith('image/')) {
		cb(null, true)
	} else {
		cb(new Error('Only image files are allowed!'), false)
	}
}

const upload = multer({
	storage: storage,
	fileFilter: fileFilter,
	limits: {
		fileSize: parseInt(process.env.UPLOAD_MAX_SIZE) || 5 * 1024 * 1024,
		files: 1,
	},
})

module.exports = upload
