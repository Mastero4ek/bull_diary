import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  useDispatch,
  useSelector,
} from 'react-redux';

import { RootDesc } from '@/components/ui/descriptions/RootDesc';
import { Icon } from '@/components/ui/general/Icon';
import { Input } from '@/components/ui/inputs/Input';
import {
  getBybitTickers,
  setSearch,
} from '@/redux/slices/filtersSlice';

import styles from './styles.module.scss';

export const Search = React.memo(({ inputSearch, setInputSearch }) => {
	const [open, setOpen] = useState(false)
	const { tickers } = useSelector(state => state.filters)
	const { exchange } = useSelector(state => state.filters)
	const searchRef = useRef()
	const dispatch = useDispatch()

	const onClickSearch = useCallback(() => {
		setOpen(prev => !prev)
	}, [])

	const onChangeTicker = useCallback(e => {
		setInputSearch(e.target.value.toLowerCase())

		if (e.target.value.toLowerCase() === '') {
			dispatch(setSearch(''))
			setOpen(false)
		}
	}, [])

	const onClickTicker = useCallback(ticker => {
		dispatch(setSearch(ticker.symbol))
		setInputSearch(ticker.symbol)
		setOpen(false)
	}, [])

	const handleClickOutside = useCallback(e => {
		if (searchRef.current && !searchRef.current.contains(e.target)) {
			setOpen(false)
		}
	}, [])

	useEffect(() => {
		document.body.addEventListener('click', handleClickOutside)

		return () => {
			document.body.removeEventListener('click', handleClickOutside)
		}
	}, [handleClickOutside])

	useEffect(() => {
		dispatch(getBybitTickers({ exchange: exchange.name }))
	}, [])

	const filteredTickers = tickers.filter(ticker =>
		ticker.symbol.toLowerCase().includes(inputSearch)
	)

	return (
		<div
			ref={searchRef}
			className={styles.search}
			onClick={filteredTickers.length <= 0 ? undefined : onClickSearch}
		>
			<Input
				type='text'
				id='search-input'
				placeholder='All USDT-PERP'
				value={inputSearch}
				onChange={filteredTickers.length <= 0 ? undefined : onChangeTicker}
				disabled={filteredTickers.length <= 0}
			>
				<Icon id='search' />
			</Input>

			<ul
				className={`${styles.search_list} ${
					open ? styles.search_list_active : ''
				}`}
			>
				{filteredTickers.length > 0 ? (
					filteredTickers.map((ticker, i) => (
						<li onClick={() => onClickTicker(ticker)} key={i}>
							<RootDesc>
								<span>{ticker.symbol}</span>
							</RootDesc>
						</li>
					))
				) : (
					<li>
						<RootDesc>
							<span>{inputSearch ? 'No results found' : 'Error'}</span>
						</RootDesc>
					</li>
				)}
			</ul>
		</div>
	)
})
