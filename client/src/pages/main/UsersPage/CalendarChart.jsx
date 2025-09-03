import React, {
  useCallback,
  useMemo,
} from 'react';

import moment from 'moment/min/moment-with-locales';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

import {
  AnimatedChartTooltip,
} from '@/components/animations/AnimatedChartTooltip';
import {
  usePopup,
} from '@/components/layouts/popups/PopupLayout/PopupProvider';
import { RootButton } from '@/components/ui/buttons/RootButton';
import { RootDesc } from '@/components/ui/typography/descriptions/RootDesc';
import { NewUserPopup } from '@/popups/user/NewUserPopup';
import { ResponsiveCalendar } from '@nivo/calendar';

import styles from './styles.module.scss';

const CustomTooltip = React.memo(({ day, value, t }) => {
  if (!day || value === undefined) return null;

  const date = moment(day).format('DD.MM.YYYY');

  return (
    <AnimatedChartTooltip className={styles.calendar_chart_tooltip}>
      <RootDesc>
        <label>{date}</label>
      </RootDesc>

      <RootDesc>
        <div>
          <b>{t('page.users.activity')}</b> {value}
        </div>
      </RootDesc>
    </AnimatedChartTooltip>
  );
});

const CustomLegend = React.memo(({ chartStyles, t }) => {
  return (
    <div className={styles.calendar_chart_legend}>
      <div className={styles.calendar_chart_legend_item}>
        <RootDesc>
          <span>{t('page.users.activity_users')}</span>
        </RootDesc>

        <div className={styles.calendar_chart_legend_colors}>
          <label
            style={{
              backgroundColor: chartStyles.color_extra_low,
            }}
          />

          <label
            style={{
              backgroundColor: chartStyles.color_low,
            }}
          />

          <label
            style={{
              backgroundColor: chartStyles.color_medium,
            }}
          />

          <label
            style={{
              backgroundColor: chartStyles.color_high,
            }}
          />

          <label
            style={{
              backgroundColor: chartStyles.color_extra_high,
            }}
          />
        </div>
      </div>
    </div>
  );
});

export const CalendarChart = () => {
  const { openPopup } = usePopup();
  const { t } = useTranslation();
  const { usersCalendarData } = useSelector((state) => state.users);
  const { user } = useSelector((state) => state.candidate);
  const { theme, width, isTablet, isMobile } = useSelector(
    (state) => state.settings
  );

  const currentUsersCalendarData = useMemo(() => {
    return usersCalendarData.map((item) => ({
      ...item,
      day: moment(item.day).format('YYYY-MM-DD'),
    }));
  }, [usersCalendarData]);

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
      text: theme ? 'rgba(185, 200, 215, 0.5)' : 'rgba(79, 104, 137, 0.5)',
      font: "'IBM Plex Sans', sans-serif",
      calendarColor: theme ? '#24eaa4' : '#c270f8',
      emptyColor: theme ? 'rgba(128, 128, 128, 1)' : 'rgba(60, 70, 78, 0.5)',
      borderColor: theme ? '#ffffff' : '#ffffff',
      gridColor: theme ? 'rgba(128, 128, 128, 0.2)' : 'rgba(60, 70, 78, 0.2)',

      color_extra_high: theme ? '#24EAA4' : '#B551F6',
      color_high: theme ? '#49EEB3' : '#C270F8',
      color_medium: theme ? '#74F2C5' : '#CF8FFA',
      color_low: theme ? '#A5F7D9' : '#DEB1FC',
      color_extra_low: theme ? '#DEFCF1' : '#EED6FD',
    }),
    [width, isTablet, isMobile, theme]
  );

  const handleClickAddUser = useCallback(() => {
    openPopup(<NewUserPopup />);
  }, [openPopup]);

  return (
    <>
      <div className={styles.calendar_chart_wrapper}>
        <CustomLegend chartStyles={chartStyles} t={t} />

        <div className={styles.calendar_chart}>
          <ResponsiveCalendar
            {...(isTablet ? { width: 750 } : {})}
            data={currentUsersCalendarData}
            from={moment().startOf('year')}
            to={moment().endOf('year')}
            animate={true}
            motionConfig="wobbly"
            motionStiffness={90}
            motionDamping={15}
            margin={{
              top: 0,
              right: 0,
              bottom: chartStyles.paddingSmall,
              left: 0,
            }}
            yearSpacing={0}
            yearLegendOffset={chartStyles.margin}
            monthLegend={(year, month) => {
              const monthDate = moment().year(year).month(month);

              return monthDate.format('MMM');
            }}
            monthSpacing={0}
            monthBorderWidth={0}
            monthLegendPosition={'after'}
            monthLegendOffset={chartStyles.paddingSmall}
            dayBorderColor={chartStyles.gridColor}
            emptyColor={'transparent'}
            colors={[
              chartStyles.color_extra_low,
              chartStyles.color_low,
              chartStyles.color_medium,
              chartStyles.color_high,
              chartStyles.color_extra_high,
            ]}
            legends={[]}
            tooltip={({ day, value }) => (
              <CustomTooltip day={day} value={value} t={t} />
            )}
            theme={{
              text: {
                fontFamily: chartStyles.font,
                fontSize: chartStyles.fontSize,
                fill: chartStyles.text,
              },
            }}
          />
        </div>

        {user && user?.role === 'admin' && (
          <div className={styles.calendar_chart_button}>
            <RootButton
              icon={'sign-up'}
              text={t('button.create_user')}
              onClickBtn={() => handleClickAddUser()}
            />
          </div>
        )}
      </div>
    </>
  );
};
