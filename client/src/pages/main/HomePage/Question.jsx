import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

import questionsImageDark from '@/assets/images/home/questions-bg-dark.png';
import questionsImageLight from '@/assets/images/home/questions-bg-light.png';
import { AnimatedButton } from '@/components/animations/AnimatedButton';
import { AnimatedShowBlock } from '@/components/animations/AnimatedShowBlock';
import { InnerBlock } from '@/components/layouts/utils/InnerBlock';
import { ContactForm } from '@/components/ui/forms/ContactForm';
import { RootDesc } from '@/components/ui/typography/descriptions/RootDesc';
import { H1 } from '@/components/ui/typography/titles/H1';

import styles from './styles.module.scss';

export const Question = () => {
  const { t } = useTranslation();
  const { isTablet, isMobile, theme } = useSelector((state) => state.settings);

  return (
    <section id="contacts" className={styles.question}>
      <div className={styles.container_wrapper}>
        <div className={styles.question_wrap}>
          {!isTablet && !isMobile && (
            <div className={styles.question_image}>
              <img
                src={theme ? questionsImageDark : questionsImageLight}
                alt="Questions-background-image"
              />
            </div>
          )}

          <div className={styles.question_content}>
            <AnimatedShowBlock>
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
            </AnimatedShowBlock>

            <AnimatedButton>
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
            </AnimatedButton>
          </div>

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
