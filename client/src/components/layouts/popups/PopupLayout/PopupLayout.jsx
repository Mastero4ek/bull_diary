import React, { useEffect } from 'react';

import {
  AnimatePresence,
  motion,
} from 'framer-motion';

import { OuterBlock } from '@/components/layouts/utils/OuterBlock';
import { Icon } from '@/components/ui/media/Icon';

import { usePopup } from './PopupProvider';
import styles from './styles.module.scss';

export const PopupLayout = React.memo(() => {
  const { popupContent, closePopup } = usePopup();
  const { shared, direction } = popupContent;

  const overlayVariants = {
    visible: {
      opacity: 1,
      transition: {
        when: 'beforeChildren',
        duration: 0.3,
        delayChildren: 0.4,
      },
    },
    hidden: {
      opacity: 0,
      transition: {
        when: 'afterChildren',
        duration: 0.3,
        delay: 0.4,
      },
    },
  };

  useEffect(() => {
    if (popupContent.content) {
      const scrollBarWidth =
        window.innerWidth - document.documentElement.clientWidth;

      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollBarWidth}rem`;
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };
  }, [popupContent.content]);

  return (
    popupContent.isOpen && (
      <AnimatePresence>
        <motion.div
          className={styles.overlay}
          id="popup"
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={overlayVariants}
        >
          <motion.div
            className={`${styles.popup_wrapper} ${
              shared && styles.popup_shared_wrapper
            } ${direction === 'reverse' && styles.popup_reverse_wrapper}`}
            initial={{ transform: 'scale(0.5) translateY(-100vh)' }}
            animate={{ transform: 'scale(1) translateY(0)' }}
            exit={{ transform: 'scale(0.5) translateY(100vh)' }}
            transition={{ duration: 0.3 }}
          >
            <OuterBlock>
              <div onClick={closePopup} className={styles.popup_close}>
                <OuterBlock>
                  <Icon id="remove" />
                </OuterBlock>
              </div>

              {popupContent.content}
            </OuterBlock>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    )
  );
});
