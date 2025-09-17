import React, {
  useEffect,
  useMemo,
} from 'react';

import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { animateScroll } from 'react-scroll';

import { AnimatedButton } from '@/components/animations/AnimatedButton';
import { AnimatedShowBlock } from '@/components/animations/AnimatedShowBlock';
import { OuterBlock } from '@/components/layouts/utils/OuterBlock';
import { RootButton } from '@/components/ui/buttons/RootButton';
import { Icon } from '@/components/ui/media/Icon';
import { RootDesc } from '@/components/ui/typography/descriptions/RootDesc';
import { SmallDesc } from '@/components/ui/typography/descriptions/SmallDesc';
import { H1 } from '@/components/ui/typography/titles/H1';
import { H2 } from '@/components/ui/typography/titles/H2';
import { H4 } from '@/components/ui/typography/titles/H4';
import { ResponsiveBar } from '@nivo/bar';
import { ResponsiveLine } from '@nivo/line';

import styles from './styles.module.scss';

export const NotFoundPage = React.memo(() => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { width, isTablet, isMobile, theme } = useSelector(
    (state) => state.settings
  );

  const chartStyles = useMemo(
    () => ({
      paddingSmall:
        width >= 1920
          ? 20
          : isTablet
            ? 15
            : isMobile
              ? 10
              : (width * 1.5) / 100,
      paddingBig:
        width >= 1920
          ? 40
          : isTablet
            ? 30
            : isMobile
              ? 20
              : (width * 2.5) / 100,
      margin:
        width >= 1920 ? 10 : isTablet ? 8 : isMobile ? 6 : (width * 0.5) / 100,
      fontSize:
        width >= 1920 || isTablet ? 16 : isMobile ? 14 : (width * 0.9) / 100,
      font: "'IBM Plex Sans', sans-serif",
      lineColor: theme ? '#24eaa4' : '#c270f8',
      barColor: theme ? 'rgba(128, 128, 128, 1)' : 'rgba(60, 70, 78, 0.5)',
      gridColor: theme ? 'rgba(128, 128, 128, 0.2)' : 'rgba(60, 70, 78, 0.2)',
      text: theme ? 'rgba(185, 200, 215, 0.5)' : 'rgba(79, 104, 137, 0.5)',
    }),
    [width, isTablet, isMobile, theme]
  );

  const barData = useMemo(() => {
    return [
      {
        id: 0,
        value: 40,
      },
      {
        id: 1,
        value: 90,
      },
      {
        id: 2,
        value: 127,
      },
      {
        id: 3,
        value: 79,
      },
      {
        id: 4,
        value: 120,
      },
      {
        id: 5,
        value: 198,
      },
      {
        id: 6,
        value: 76,
      },
      {
        id: 7,
        value: 175,
      },
      {
        id: 8,
        value: 38,
      },
      {
        id: 9,
        value: 8,
      },
      {
        id: 10,
        value: 23,
      },
      {
        id: 11,
        value: 38,
      },
    ];
  }, []);

  const lineData = useMemo(() => {
    return [
      {
        id: 'line',
        color: chartStyles.lineColor,
        data: [
          {
            x: 0,
            y: 221,
          },
          {
            x: 1,
            y: 95,
          },
          {
            x: 2,
            y: 128,
          },
          {
            x: 3,
            y: 74,
          },
          {
            x: 4,
            y: 60,
          },
          {
            x: 5,
            y: 260,
          },
          {
            x: 6,
            y: 78,
          },
          {
            x: 7,
            y: 235,
          },
          {
            x: 8,
            y: 230,
          },
          {
            x: 9,
            y: 287,
          },
          {
            x: 10,
            y: 127,
          },
          {
            x: 11,
            y: 89,
          },
        ],
      },
    ];
  }, [chartStyles.lineColor]);

  useEffect(() => {
    animateScroll.scrollTo(0, {
      duration: 500,
      smooth: 'easeInOutQuad',
    });
  }, []);

  return (
    <div className={styles.not_found_wrapper}>
      <H1>
        <span>
          <motion.b
            style={{ display: 'inline-block' }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            animate={{
              scale: [0.85, 1, 0.85],
              opacity: [0.5, 1, 0.5],
            }}
          >
            4
          </motion.b>
          <motion.b
            style={{ color: 'var(--primaryHov)', display: 'inline-block' }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 1, 0.5],
            }}
          >
            0
          </motion.b>
          <motion.b
            style={{ display: 'inline-block' }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            animate={{
              scale: [0.85, 1, 0.85],
              opacity: [0.5, 1, 0.5],
            }}
          >
            4
          </motion.b>
        </span>
      </H1>

      <div className={styles.not_found_wrap}>
        <AnimatedShowBlock>
          <div
            className={`${styles.not_found_card} ${styles.not_found_card_reverse}`}
          >
            <H2>
              <b
                dangerouslySetInnerHTML={{ __html: t('page.not_found.title') }}
              />
            </H2>

            <RootDesc>
              <span
                dangerouslySetInnerHTML={{
                  __html: t('page.not_found.description'),
                }}
              />
            </RootDesc>
          </div>
        </AnimatedShowBlock>

        <AnimatedShowBlock direction="right">
          <OuterBlock>
            <div className={styles.not_found_card}>
              <div className={styles.not_found_card_head}>
                <Icon id="warning-icon" />

                <H4>
                  <span
                    dangerouslySetInnerHTML={{
                      __html: t('page.not_found.card.title'),
                    }}
                  />
                </H4>
              </div>

              <SmallDesc>
                <span
                  dangerouslySetInnerHTML={{
                    __html: t('page.not_found.card.description'),
                  }}
                />
              </SmallDesc>
            </div>
          </OuterBlock>
        </AnimatedShowBlock>
      </div>

      <div className={styles.not_found_buttons}>
        <AnimatedButton>
          <RootButton
            onClickBtn={() => navigate(-1)}
            text={t('page.not_found.button')}
            icon="back-arrow"
          />
        </AnimatedButton>
      </div>

      <div className={styles.not_found_chart}>
        <div className={styles.not_found_chart_bar}>
          <ResponsiveBar
            data={barData}
            indexBy="id"
            keys={['value']}
            borderRadius={chartStyles.margin}
            indexScale={{ type: 'band', round: true, nice: true }}
            padding={0.4}
            enableGridX={false}
            enableGridY={true}
            enableLabel={false}
            animate={true}
            motionConfig="wobbly"
            motionStiffness={90}
            motionDamping={15}
            tooltip={false}
            colors={chartStyles.barColor}
            axisTop={null}
            axisRight={null}
            axisBottom={null}
            axisLeft={null}
            theme={{
              grid: {
                line: {
                  stroke: chartStyles.gridColor,
                  strokeWidth: 1,
                },
              },
            }}
          />
        </div>

        <div className={styles.not_found_chart_line}>
          <ResponsiveLine
            data={lineData}
            colors={chartStyles.lineColor}
            curve="monotoneX"
            axisTop={null}
            axisRight={null}
            axisBottom={null}
            axisLeft={null}
            enableGridX={false}
            enableGridY={false}
            enablePoints={false}
            useMesh={true}
            tooltip={false}
            legends={[]}
            yScale={{
              type: 'linear',
              min: 0,
              max: 'auto',
              stacked: false,
              reverse: false,
              nice: true,
            }}
            margin={{
              top: chartStyles.paddingBig,
              bottom: chartStyles.paddingBig,
              left: chartStyles.paddingBig,
              right: chartStyles.paddingBig,
            }}
          />
        </div>
      </div>
    </div>
  );
});
