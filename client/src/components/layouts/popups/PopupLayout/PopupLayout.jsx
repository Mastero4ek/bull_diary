import React from 'react';

import { AnimatePresence } from 'framer-motion';

import { AnimatedPopup } from '@/components/animations/AnimatedPopup';
import { OuterBlock } from '@/components/layouts/utils/OuterBlock';
import { Icon } from '@/components/ui/media/Icon';

import { usePopup } from './PopupProvider';
import styles from './styles.module.scss';

export const PopupLayout = React.memo(() => {
  const { popupContent, closePopup } = usePopup();
  const { shared, direction } = popupContent;

  return (
    <AnimatePresence mode="wait">
      {popupContent.isOpen && (
        <AnimatedPopup
          key="popup-overlay"
          overlayClass={styles.overlay}
          popupClass={`${styles.popup_wrapper} ${
            shared && styles.popup_shared_wrapper
          } ${direction === 'reverse' && styles.popup_reverse_wrapper}`}
        >
          <OuterBlock>
            <div onClick={closePopup} className={styles.popup_close}>
              <OuterBlock>
                <Icon id="remove" />
              </OuterBlock>
            </div>

            {popupContent.content}
          </OuterBlock>
        </AnimatedPopup>
      )}
    </AnimatePresence>
  );
});
