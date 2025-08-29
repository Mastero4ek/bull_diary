import styles from './styles.module.scss'

export const InnerBlock = ({ children }) => {
	return <article className={styles.inner_block}>{children}</article>
}
