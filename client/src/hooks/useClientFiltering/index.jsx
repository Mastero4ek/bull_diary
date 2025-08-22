import { useMemo } from 'react'

export const useClientFiltering = (data, filters, searchFields = []) => {
	const { search, sort, page, limit } = filters

	const { filteredData, totalPages } = useMemo(() => {
		if (!data || data.length === 0) {
			return { filteredData: [], totalPages: 0 }
		}

		let filtered = data
		if (search && search.trim() !== '') {
			const searchLower = search.toLowerCase().trim()
			filtered = data.filter(item => {
				if (searchFields.length > 0) {
					return searchFields.some(field => {
						const value = item[field]
						return value && String(value).toLowerCase().includes(searchLower)
					})
				}

				return Object.values(item).some(value => {
					if (typeof value === 'string') {
						return value.toLowerCase().includes(searchLower)
					}
					return false
				})
			})
		}

		if (sort && sort.type) {
			filtered = [...filtered].sort((a, b) => {
				const aVal = a[sort.type]
				const bVal = b[sort.type]

				if (typeof aVal === 'number' && typeof bVal === 'number') {
					return sort.value === 'asc' ? aVal - bVal : bVal - aVal
				}

				const aStr = String(aVal || '').toLowerCase()
				const bStr = String(bVal || '').toLowerCase()

				if (sort.value === 'asc') {
					return aStr.localeCompare(bStr)
				} else {
					return bStr.localeCompare(aStr)
				}
			})
		}

		const totalPages = Math.ceil(filtered.length / limit) || 1

		const startIndex = (page - 1) * limit
		const endIndex = startIndex + limit
		const paginated = filtered.slice(startIndex, endIndex)

		return {
			filteredData: paginated,
			totalPages,
		}
	}, [data, search, sort, page, limit, searchFields])

	return { filteredData, totalPages }
}
