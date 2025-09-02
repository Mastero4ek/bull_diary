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
        duration: 0.5,
        ease: 'easeOut',
      },
    },
    hidden: {
      opacity: 0,
      transition: {
        duration: 0.5,
        ease: 'easeIn',
      },
    },
  };

  const popupVariants = {
    visible: {
      transform: 'translateY(0)',
      transition: {
        duration: 0.35,
        ease: 'easeOut',
      },
    },
    hidden: {
      transform: 'translateY(-100vh)',
      transition: {
        duration: 0.35,
        ease: 'easeIn',
      },
    },
    exit: {
      transform: 'translateY(100vh)',
      transition: {
        duration: 0.35,
        ease: 'easeIn',
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
  }, [
    popupContent.isOpen,
    popupContent.content ? 'has-content' : 'no-content',
  ]);

  return (
    <AnimatePresence mode="wait">
      {popupContent.isOpen && (
        <motion.div
          key="popup-overlay"
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
            variants={popupVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
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
      )}
    </AnimatePresence>
  );
});
