import ReactPaginate from 'react-paginate'
import { useSelector } from 'react-redux'

import styles from './styles.module.scss'

export const Paginate = ({ page, totalPages, toPage }) => {
	const { isTablet } = useSelector(state => state.settings)

	return (
		<ReactPaginate
			containerClassName={styles.table_controls}
			pageLinkClassName={styles.page_link}
			activeClassName={styles.active_page}
			previousClassName={styles.previous_page}
			nextClassName={styles.next_page}
			disabledClassName={styles.disabled_button}
			renderOnZeroPageCount={null}
			forcePage={page - 1}
			pageRangeDisplayed={isTablet ? 1 : 3}
			marginPagesDisplayed={isTablet ? 1 : 3}
			pageCount={totalPages}
			onPageChange={item => toPage(item?.selected)}
			breakLabel='...'
			nextLabel={
				<button>
					<i></i>
				</button>
			}
			previousLabel={
				<button>
					<i></i>
				</button>
			}
		/>
	)
}
