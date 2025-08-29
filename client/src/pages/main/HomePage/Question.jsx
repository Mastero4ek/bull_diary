import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

import { InnerBlock } from '@/components/layouts/utils/InnerBlock';
import { ContactForm } from '@/components/ui/forms/ContactForm';
import { RootDesc } from '@/components/ui/typography/descriptions/RootDesc';
import { H1 } from '@/components/ui/typography/titles/H1';

import styles from './styles.module.scss';

export const Question = () => {
  const { t } = useTranslation();

  const contentVariants = {
    hidden: {
      opacity: 0,
      y: 30,
      filter: 'blur(2rem)',
    },
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0rem)',
      transition: {
        duration: 0.6,
        delay: 0.1,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  };

  return (
    <section id="contacts" className={styles.question}>
      <div className={styles.container_wrapper}>
        <div className={styles.question_wrap}>
          <motion.div
            className={styles.question_content}
            variants={contentVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
          >
            <H1>
              <b
                dangerouslySetInnerHTML={{
                  __html: t('page.home.question.title'),
                }}
              />
            </H1>

            <RootDesc>
              <span
                dangerouslySetInnerHTML={{
                  __html: t('page.home.question.subtitle'),
                }}
              />
            </RootDesc>

            <RootDesc>
              <a
                className={styles.question_link}
                href="mailto:bulldiary@gmail.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                bulldiary@gmail.com
              </a>
            </RootDesc>
          </motion.div>

          <div className={styles.question_form_wrapper}>
            <InnerBlock>
              <div className={styles.question_form}>
                <ContactForm />
              </div>
            </InnerBlock>
          </div>
        </div>
      </div>
    </section>
  );
};
