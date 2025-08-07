import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import Cookies from 'js-cookie';
import {
  useDispatch,
  useSelector,
} from 'react-redux';

import { ControlButton } from '@/components/ui/buttons/ControlButton';
import { RootDesc } from '@/components/ui/descriptions/RootDesc';
import { InnerBlock } from '@/components/ui/general/InnerBlock';
import { OuterBlock } from '@/components/ui/general/OuterBlock';
import { CheckboxSwitch } from '@/components/ui/inputs/CheckboxSwitch';
import { H2 } from '@/components/ui/titles/H2';
import i18n from '@/i18n';
import {
  setAmount,
  setColor,
  setIsLoadingLanguage,
  setIsLoadingTheme,
  setLanguage,
  setMark,
  setSideBar,
  setTheme,
} from '@/redux/slices/settingsSlice';

import styles from './styles.module.scss';

export const Tuning = React.memo(({ handleClickRadio }) => {
	const dispatch = useDispatch()
	const sidebarItemRef = useRef()
	const [open, setOpen] = useState(false)
	const { language, theme, mark, amount, color, sideBar } = useSelector(
		state => state.settings
	)

	const ItemBlock = open ? InnerBlock : OuterBlock
	const languageList = ['ru', 'en']

	const sideBarOptions = useMemo(
		() => [
			{
				id: 0,
				name: 'open',
				value: 'open',
			},
			{
				id: 1,
				name: 'close',
				value: 'close',
			},
			{
				id: 2,
				name: 'unblock',
				value: 'unblock',
			},
		],
		[]
	)

	const tuningList = useMemo(
		() => [
			{
				id: 0,
				title: 'Language',
				value: 'language',
				checked: language,
			},
			{
				id: 1,
				title: 'Dark mode',
				value: 'dark_theme',
				checked: theme,
			},
			{
				id: 2,
				title: 'Show shootouts',
				value: 'mark',
				checked: mark,
			},
			{
				id: 3,
				title: 'Hide amounts',
				value: 'amount',
				checked: amount,
			},
			{
				id: 4,
				title: 'Highlight text',
				value: 'color',
				checked: color,
			},
			{
				id: 5,
				title: 'Side bar',
				value: 'sidebar',
				checked: sideBar.open,
			},
		],
		[language, theme, mark, amount, color, sideBar]
	)

	const switchCheckbox = useCallback(
		item => {
			const currentValue = item?.checked === true ? false : true

			switch (item?.value) {
				case 'dark_theme':
					Cookies.set('dark_theme', currentValue)

					dispatch(setIsLoadingTheme(true))
					dispatch(setTheme(currentValue))

					setTimeout(() => {
						dispatch(setIsLoadingTheme(false))
					}, 2000)
					break

				case 'mark':
					Cookies.set('mark', currentValue)
					dispatch(setMark(currentValue))
					break

				case 'amount':
					Cookies.set('amount', currentValue)
					dispatch(setAmount(currentValue))
					break

				case 'color':
					Cookies.set('color', currentValue)
					dispatch(setColor(currentValue))
					break

				default:
					break
			}
		},
		[dispatch]
	)

	const changeLanguage = useCallback(
		value => {
			dispatch(setIsLoadingLanguage(true))

			document.documentElement.setAttribute('lang', value)
			Cookies.set('language', value)
			i18n.changeLanguage(value)

			dispatch(setLanguage(value))

			setTimeout(() => {
				dispatch(setIsLoadingLanguage(false))
			}, 2000)
		},
		[dispatch, language]
	)

	const toggleSidebar = () => setOpen(prev => !prev)

	const handleListItemClick = useCallback(
		item => {
			Cookies.set('sidebar', item.value)

			dispatch(
				setSideBar({
					...sideBar,
					blocked_name: item.name,
					blocked_value: item.value,
				})
			)
			setOpen(false)
		},
		[dispatch, sideBar]
	)

	const handleClickOutside = useCallback(e => {
		const path = e.composedPath ? e.composedPath() : e.path

		if (!path.includes(sidebarItemRef.current)) {
			setOpen(false)
		}
	}, [])

	useEffect(() => {
		document.body.addEventListener('click', handleClickOutside)

		return () => document.body.removeEventListener('click', handleClickOutside)
	}, [handleClickOutside])

	return (
		<OuterBlock>
			<div className={styles.tuning_wrapper}>
				<input
					defaultChecked={true}
					type='radio'
					name='accordion'
					id='tuning_accordion'
					className={styles.tuning_radio}
					onChange={handleClickRadio}
				/>

				<label htmlFor='tuning_accordion' className={styles.tuning_header}>
					<H2>
						<span>Your settings</span>
					</H2>

					<ControlButton text={<i></i>} onClickBtn={() => console.log('')} />
				</label>

				<ul className={styles.tuning_list}>
					{tuningList &&
						tuningList.length > 0 &&
						tuningList.map(item => (
							<li key={item?.id}>
								<RootDesc>
									<span>{item?.title}</span>
								</RootDesc>

								{item?.value === 'language' ? (
									<ul className={styles.tuning_language_item}>
										{languageList &&
											languageList.length > 0 &&
											languageList.map(lang => {
												const ItemBlock =
													language === lang ? InnerBlock : OuterBlock

												return (
													<li key={lang}>
														<RootDesc>
															<ItemBlock>
																<b
																	style={
																		language === lang
																			? {
																					color: 'var(--primaryDef)',
																					pointerEvents: 'none',
																			  }
																			: {}
																	}
																	onClick={() => changeLanguage(lang)}
																>
																	{lang}
																</b>
															</ItemBlock>
														</RootDesc>
													</li>
												)
											})}
									</ul>
								) : item?.value === 'sidebar' ? (
									<div ref={sidebarItemRef} className={styles.tuning_sidebar}>
										<ItemBlock>
											<div
												onClick={toggleSidebar}
												className={styles.tuning_sidebar_head}
											>
												<RootDesc>
													<span>{sideBar.blocked_name}</span>
												</RootDesc>
											</div>
										</ItemBlock>

										<div
											className={`${styles.tuning_sidebar_list} ${
												open ? styles.tuning_sidebar_list_active : ''
											}`}
										>
											{sideBarOptions.map(item => (
												<div
													className={styles.tuning_sidebar_item}
													onClick={() => handleListItemClick(item)}
													key={item.id}
												>
													<RootDesc>
														<span>{item.name}</span>
													</RootDesc>
												</div>
											))}
										</div>
									</div>
								) : (
									<CheckboxSwitch
										name={item?.value}
										onSwitch={() => switchCheckbox(item)}
										checked={item?.checked}
									/>
								)}
							</li>
						))}
				</ul>
			</div>
		</OuterBlock>
	)
})
