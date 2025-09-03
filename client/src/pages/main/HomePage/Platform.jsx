import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import './platform_slider.scss';

import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import {
  Autoplay,
  Pagination,
} from 'swiper/modules';
import {
  Swiper,
  SwiperSlide,
} from 'swiper/react';

import blobDark from '@/assets/images/home/blob-4-dark.png';
import blobLight from '@/assets/images/home/blob-4-light.png';
import platformSlide1 from '@/assets/images/home/platform-slide-1.png';
import platformSlide2 from '@/assets/images/home/platform-slide-2.png';
import platformSlide3 from '@/assets/images/home/platform-slide-3.png';
import platformSlide4 from '@/assets/images/home/platform-slide-4.png';
import { AnimatedButton } from '@/components/animations/AnimatedButton';
import { AnimatedShowBlock } from '@/components/animations/AnimatedShowBlock';
import {
  usePopup,
} from '@/components/layouts/popups/PopupLayout/PopupProvider';
import { RootButton } from '@/components/ui/buttons/RootButton';
import { DotList } from '@/components/ui/data/DotList';
import { H1 } from '@/components/ui/typography/titles/H1';
import { SignUpPopup } from '@/popups/auth/SignUpPopup';

import styles from './styles.module.scss';

export const Platform = () => {
  const { t } = useTranslation();

  const { theme } = useSelector((state) => state.settings);

  const platformList = [
    {
      id: 0,
      text: t('page.home.platform.list_1.title'),
    },
    {
      id: 1,
      text: t('page.home.platform.list_2.title'),
    },
    {
      id: 2,
      text: t('page.home.platform.list_3.title'),
    },
    {
      id: 3,
      text: t('page.home.platform.list_4.title'),
    },
    {
      id: 4,
      text: t('page.home.platform.list_5.title'),
    },
    {
      id: 5,
      text: t('page.home.platform.list_6.title'),
    },
    {
      id: 6,
      text: t('page.home.platform.list_7.title'),
    },
  ];

  const { openPopup } = usePopup();

  const handleClickSignup = () => {
    openPopup(<SignUpPopup />);
  };

  return (
    <section id="platform" className={styles.benefits}>
      <div className={styles.container_wrapper}>
        <div className={styles.benefits_wrapper}>
          <div className={styles.benefits_blob}>
            <img src={theme ? blobDark : blobLight} alt="blob-image" />
          </div>

          <div className={styles.benefits_content}>
            <AnimatedShowBlock>
              <H1>
                <span
                  dangerouslySetInnerHTML={{
                    __html: t('page.home.platform.title'),
                  }}
                />
              </H1>
            </AnimatedShowBlock>

            <DotList listArr={platformList} />

            <AnimatedButton>
              <RootButton
                onClickBtn={handleClickSignup}
                text={t('button.sign_up')}
                icon="sign-up"
              />
            </AnimatedButton>
          </div>

          <div className={styles.benefits_slider}>
            <Swiper
              slidesPerView={1}
              spaceBetween={20}
              loop={true}
              pagination={{ clickable: true }}
              autoplay={{ delay: 2500, disableOnInteraction: false }}
              modules={[Pagination, Autoplay]}
              className="benefits_slider"
            >
              <SwiperSlide>
                <img src={platformSlide1} alt="platform-slide-1" />
              </SwiperSlide>

              <SwiperSlide>
                <img src={platformSlide2} alt="platform-slide-2" />
              </SwiperSlide>

              <SwiperSlide>
                <img src={platformSlide3} alt="platform-slide-3" />
              </SwiperSlide>

              <SwiperSlide>
                <img src={platformSlide4} alt="platform-slide-4" />
              </SwiperSlide>
            </Swiper>
          </div>
        </div>
      </div>
    </section>
  );
};
