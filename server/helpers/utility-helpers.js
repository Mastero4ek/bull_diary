class HelpersUtility {
	/**
	 * Создает задержку для API запросов
	 * @param {number} ms - Время задержки в миллисекундах
	 * @returns {Promise<void>}
	 */
	async delayApi(ms = 100) {
		return new Promise(resolve => setTimeout(resolve, ms))
	}

	/**
	 * Преобразует первую букву строки в заглавную
	 * @param {string} str - Строка для преобразования
	 * @returns {string} - Преобразованная строка
	 */
	capitalize = str => {
		if (!str) return ''

		return str.charAt(0).toUpperCase() + str.slice(1)
	}

	/**
	 * TODO: использовать пагинацию api
	 * Пагинация массива
	 * @param {Array} array - Массив для пагинации
	 * @param {number} page - Номер страницы
	 * @param {number} limit - Количество элементов на странице
	 * @param {Object} sort - Сортировка
	 * @param {string} search - Поиск
	 * @param {Array} searchFields - Поля для поиска
	 * @returns {Object} - Объект с пагинированными данными
	 */
	async paginate(
		array,
		page = 1,
		limit = 5,
		sort = { type: 'closed_time', value: 'desc' },
		search = '',
		searchFields = null
	) {
		if (!Array.isArray(array)) {
			throw new Error('Pagination error: array is not an array!')
		}

		const validPage = page && page >= 1 ? page : 1
		const validLimit = limit && limit > 0 ? limit : 5
		let filteredArray = [...array]

		if (search && search.trim() !== '') {
			const searchLower = search.toLowerCase().trim()

			if (searchFields && Array.isArray(searchFields)) {
				filteredArray = filteredArray.filter(item => {
					return searchFields.some(field => {
						const value = item[field]
						return (
							value &&
							typeof value === 'string' &&
							value.toLowerCase().includes(searchLower)
						)
					})
				})
			} else {
				filteredArray = filteredArray.filter(item => {
					return Object.values(item).some(
						value =>
							typeof value === 'string' &&
							value.toLowerCase().includes(searchLower)
					)
				})
			}
		}

		if (sort && sort.type) {
			filteredArray.sort((a, b) => {
				const aValue = a[sort.type]
				const bValue = b[sort.type]

				if (
					sort.type === 'closed_time' ||
					sort.type === 'date' ||
					sort.type === 'transactionTime' ||
					sort.type === 'open_time'
				) {
					const aNum =
						typeof aValue === 'number' ? aValue : new Date(aValue).getTime()
					const bNum =
						typeof bValue === 'number' ? bValue : new Date(bValue).getTime()
					return sort.value === 'asc' ? aNum - bNum : bNum - aNum
				}

				if (typeof aValue === 'number' && typeof bValue === 'number') {
					return sort.value === 'asc' ? aValue - bValue : bValue - aValue
				}

				if (typeof aValue === 'string' && typeof bValue === 'string') {
					return sort.value === 'asc'
						? aValue.localeCompare(bValue)
						: bValue.localeCompare(aValue)
				}

				const aStr = String(aValue || '')
				const bStr = String(bValue || '')

				return sort.value === 'asc'
					? aStr.localeCompare(bStr)
					: bStr.localeCompare(aStr)
			})
		}

		const totalItems = filteredArray.length
		const totalPages = Math.ceil(totalItems / validLimit)
		const startIndex = (validPage - 1) * validLimit
		const endIndex = Math.min(startIndex + validLimit, totalItems)
		const itemsOnPage = filteredArray.slice(startIndex, endIndex)

		return {
			items: itemsOnPage,
			total: totalItems,
			totalPages,
		}
	}
}

module.exports = new HelpersUtility()
