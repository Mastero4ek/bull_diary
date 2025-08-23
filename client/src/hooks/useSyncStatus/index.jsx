import { useCallback, useEffect, useState } from 'react'

import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'

export const useSyncStatus = () => {
	const { t } = useTranslation()
	const [syncWarning, setSyncWarning] = useState('')
	const [isSynced, setIsSynced] = useState(false)

	const { user } = useSelector(state => state.candidate)
	const { exchange } = useSelector(state => state.filters)

	const isExchangeSynced = useCallback(() => {
		if (!user?.keys || !exchange?.name) {
			setSyncWarning(t('page.table.sync_required_error'))
			setIsSynced(false)
			return false
		}

		const exchangeKey = user.keys.find(key => key.name === exchange.name)
		const syncedStatus = exchangeKey?.sync === true

		if (!syncedStatus) {
			setSyncWarning(t('page.table.sync_required_error'))
		} else {
			setSyncWarning('')
		}

		setIsSynced(syncedStatus)
		return syncedStatus
	}, [user?.keys, exchange?.name, t])

	useEffect(() => {
		isExchangeSynced()
	}, [isExchangeSynced])

	return {
		syncWarning,
		isExchangeSynced,
		isSynced,
	}
}
