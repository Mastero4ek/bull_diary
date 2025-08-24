import { useCallback, useEffect } from 'react'

import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'

import { setIsSynced, setSyncWarning } from '@/redux/slices/syncSlice'

export const useSyncStatus = () => {
	const { t } = useTranslation()
	const dispatch = useDispatch()

	const { user } = useSelector(state => state.candidate)
	const { exchange } = useSelector(state => state.filters)
	const { syncWarning, isSynced } = useSelector(state => state.sync)

	const isExchangeSynced = useCallback(() => {
		if (!user?.keys || !exchange?.name) {
			dispatch(setSyncWarning(t('page.table.sync_required_error')))
			dispatch(setIsSynced(false))
			return false
		}

		const exchangeKey = user.keys.find(key => key.name === exchange.name)
		const syncedStatus = exchangeKey?.sync === true

		if (!syncedStatus) {
			dispatch(setSyncWarning(t('page.table.sync_required_error')))
		} else {
			dispatch(setSyncWarning(''))
		}

		dispatch(setIsSynced(syncedStatus))
		return syncedStatus
	}, [user?.keys, exchange?.name, t, dispatch])

	useEffect(() => {
		isExchangeSynced()
	}, [isExchangeSynced])

	return {
		syncWarning,
		isExchangeSynced,
		isSynced,
	}
}
