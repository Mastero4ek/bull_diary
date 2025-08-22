import { useTranslation } from 'react-i18next';

export const useNavList = () => {
	const { t } = useTranslation()

	const NAVLIST = [
		{
			id: 1,
			name: t('nav.manual'),
			anchor: 'manual',
		},
		{
			id: 2,
			name: t('nav.advantages'),
			anchor: 'advantages',
		},
		{
			id: 3,
			name: t('nav.platform'),
			anchor: 'platform',
		},
		{
			id: 4,
			name: t('nav.tournament'),
			anchor: 'tournament',
		},
		{
			id: 5,
			name: t('nav.contacts'),
			anchor: 'contacts',
		},
	]

	return { NAVLIST }
}
