import React from 'react'

import { PageLayout } from '@/components/layouts/PageLayout'
import { OuterBlock } from '@/components/ui/general/OuterBlock'
import { PositionLayout } from '@/components/layouts/PositionLayout'

export const TablePositionPage = React.memo(() => {
	return (
		<PageLayout
			chartWidth={460}
			periods={true}
			calendar={true}
			search={true}
			entries={true}
			disabled={true}
		>
			<div style={{ width: '100%' }}>
				<PositionLayout />
			</div>

			<OuterBlock></OuterBlock>
		</PageLayout>
	)
})
