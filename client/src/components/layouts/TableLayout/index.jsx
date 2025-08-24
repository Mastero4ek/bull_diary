import React from 'react';

import { useTranslation } from 'react-i18next';
import { useTable } from 'react-table';
import { v4 as uuidv4 } from 'uuid';

import { RootDesc } from '@/components/ui/descriptions/RootDesc';
import { ErrorTable } from '@/components/ui/general/ErrorTable';
import { OuterBlock } from '@/components/ui/general/OuterBlock';

import { Paginate } from './Paginate';
import styles from './styles.module.scss';

export const TableLayout = props => {
	const { t } = useTranslation()
	const {
		columns,
		fakeData,
		data,
		serverStatus,
		error,
		toPage,
		page,
		sortBy,
		totalPages,
		emptyWarn,
		syncWarn = '',
	} = props

	const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
		useTable({
			columns,
			data: data && data.length > 0 ? data : fakeData,
		})

	return (
		<OuterBlock>
			<div className={styles.table_wrapper}>
				{serverStatus === 'error' || error ? (
					<ErrorTable error={error} />
				) : (
					(!data || data.length === 0) &&
					fakeData && (
						<ErrorTable error={syncWarn !== '' ? syncWarn : emptyWarn} />
					)
				)}

				<table
					style={
						fakeData && (!data || data.length === 0)
							? { opacity: '0.2', pointerEvents: 'none' }
							: { opacity: '1', pointerEvents: 'all' }
					}
					className={styles.table}
					{...getTableProps()}
				>
					<thead>
						{headerGroups.map(headerGroup => (
							<tr {...headerGroup.getHeaderGroupProps()} key={uuidv4()}>
								{headerGroup.headers.map(column => (
									<th
										{...column.getHeaderProps()}
										key={column.id}
										title={`${t('table.sort_by')} ${column
											.render('Header')
											.toLowerCase()}`}
										onClick={() => {
											if (fakeData && (!data || data.length === 0)) {
												return undefined
											}
											sortBy(column)
										}}
										className={
											column.id === 'cashBalance'
												? styles.cash_balance_header
												: ''
										}
										style={
											column.id === 'cover' ||
											column.id === 'actions' ||
											column.id === 'cashBalance' ||
											column.id === 'roi'
												? { pointerEvents: 'none' }
												: {}
										}
									>
										<RootDesc>
											<b>{column.render('Header')}</b>
										</RootDesc>

										{column.id !== 'cover' &&
											column.id !== 'actions' &&
											column.id !== 'cashBalance' &&
											column.id !== 'roi' && <i></i>}
									</th>
								))}
							</tr>
						))}
					</thead>

					<tbody {...getTableBodyProps()}>
						{rows.map(row => {
							prepareRow(row)

							return (
								<tr {...row.getRowProps()} key={row.id}>
									{row.cells.map(cell => {
										const cellValue = cell.render('Cell')
										const originalValue = cell.value
										const isNumber =
											typeof originalValue === 'number' ||
											(typeof originalValue === 'string' &&
												!isNaN(parseFloat(originalValue)) &&
												isFinite(originalValue))

										return (
											<td {...cell.getCellProps()} key={cell.column.id}>
												<RootDesc
													style={
														isNumber
															? { margin: 'auto' }
															: cell.column.id === 'type'
															? { width: '100%' }
															: {}
													}
												>
													{cell.column.id === 'cover' ? (
														<>{cellValue}</>
													) : (
														<span
															style={
																cell.column.id === 'actions' ||
																cell.column.id === 'cashBalance'
																	? { width: '100%' }
																	: cell.column.id === 'type'
																	? { width: '100%', maxWidth: '95%' }
																	: {}
															}
														>
															{cellValue}
														</span>
													)}
												</RootDesc>
											</td>
										)
									})}
								</tr>
							)
						})}
					</tbody>
				</table>

				{serverStatus !== 'error' && totalPages > 1 && (
					<Paginate page={page} totalPages={totalPages} toPage={toPage} />
				)}
			</div>
		</OuterBlock>
	)
}
