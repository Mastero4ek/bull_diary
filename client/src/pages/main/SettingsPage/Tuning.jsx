import React, {
  useCallback,
  useMemo,
} from 'react';

import Cookies from 'js-cookie';
import { useTranslation } from 'react-i18next';
import {
  useDispatch,
  useSelector,
} from 'react-redux';

import {
  AnimatedDropdownList,
} from '@/components/animations/AnimatedDropdownList';
import { InnerBlock } from '@/components/layouts/utils/InnerBlock';
import { OuterBlock } from '@/components/layouts/utils/OuterBlock';
import { ControlButton } from '@/components/ui/buttons/ControlButton';
import { CheckboxSwitch } from '@/components/ui/inputs/CheckboxSwitch';
import { RootSelect } from '@/components/ui/inputs/RootSelect';
import { RootDesc } from '@/components/ui/typography/descriptions/RootDesc';
import { H2 } from '@/components/ui/typography/titles/H2';
import i18n from '@/i18n';
import {
  setAmount,
  setColor,
  setHelp,
  setIsLoadingLanguage,
  setIsLoadingTheme,
  setLanguage,
  setMark,
  setSideBar,
  setTheme,
} from '@/redux/slices/settingsSlice';

import styles from './styles.module.scss';

export const Tuning = React.memo(
  ({ handleClickRadio, isOpen, onHeaderClick }) => {
    const dispatch = useDispatch();
    const {
      language,
      theme,
      mark,
      amount,
      color,
      help,
      sideBar,
      isMobile,
      isTablet,
    } = useSelector((state) => state.settings);
    const { t } = useTranslation();
    const languageList = ['ru', 'en'];

    const sideBarOptions = useMemo(
      () => [
        {
          id: 0,
          name: t('page.settings.tuning_sidebar_open'),
          value: 'open',
        },
        {
          id: 1,
          name: t('page.settings.tuning_sidebar_close'),
          value: 'close',
        },
        {
          id: 2,
          name: t('page.settings.tuning_sidebar_unblock'),
          value: 'unblock',
        },
      ],
      [t]
    );

    const tuningList = useMemo(
      () => [
        {
          id: 0,
          title: t('page.settings.tuning_language'),
          value: 'language',
          checked: language,
        },
        {
          id: 1,
          title: t('page.settings.tuning_theme'),
          value: 'dark_theme',
          checked: theme,
        },
        {
          id: 2,
          title: t('page.settings.tuning_shootouts'),
          value: 'mark',
          checked: mark,
        },
        {
          id: 3,
          title: t('page.settings.tuning_amounts'),
          value: 'amount',
          checked: amount,
        },
        {
          id: 4,
          title: t('page.settings.tuning_color'),
          value: 'color',
          checked: color,
        },
        {
          id: 5,
          title: t('page.settings.tuning_help'),
          value: 'help',
          checked: help,
        },
        {
          id: 6,
          title: t('page.settings.tuning_sidebar'),
          value: 'sidebar',
          checked: sideBar.open,
        },
      ],
      [language, theme, mark, amount, color, help, sideBar, t]
    );

    const switchCheckbox = useCallback(
      (item) => {
        const currentValue = item?.checked === true ? false : true;

        switch (item?.value) {
          case 'dark_theme':
            Cookies.set('dark_theme', currentValue);

            dispatch(setIsLoadingTheme(true));
            dispatch(setTheme(currentValue));

            setTimeout(() => {
              dispatch(setIsLoadingTheme(false));
            }, 2000);
            break;

          case 'mark':
            Cookies.set('mark', currentValue);
            dispatch(setMark(currentValue));
            break;

          case 'amount':
            Cookies.set('amount', currentValue);
            dispatch(setAmount(currentValue));
            break;

          case 'color':
            Cookies.set('color', currentValue);
            dispatch(setColor(currentValue));
            break;

          case 'help':
            Cookies.set('help', currentValue);
            dispatch(setHelp(currentValue));
            break;

          default:
            break;
        }
      },
      [dispatch]
    );

    const changeLanguage = useCallback(
      (value) => {
        dispatch(setIsLoadingLanguage(true));

        document.documentElement.setAttribute('lang', value);
        Cookies.set('language', value);
        i18n.changeLanguage(value);

        dispatch(setLanguage(value));

        setTimeout(() => {
          dispatch(setIsLoadingLanguage(false));
        }, 2000);
      },
      [dispatch]
    );

    const handleListItemClick = useCallback(
      (item) => {
        Cookies.set('sidebar', item);

        dispatch(
          setSideBar({
            ...sideBar,
            blocked_name: item.name,
            blocked_value: item,
          })
        );
      },
      [dispatch, sideBar]
    );

    return (
      <OuterBlock>
        <div
          className={styles.tuning_wrapper}
          style={{ gap: isOpen ? '50rem' : '0' }}
        >
          <input
            type="radio"
            name="accordion"
            id="settings-tuning"
            className={styles.tuning_radio}
            onChange={() => {
              handleClickRadio();
              onHeaderClick?.();
            }}
            checked={!!isOpen}
            readOnly
          />

          <label
            htmlFor="settings-tuning"
            className={styles.tuning_header}
            onClick={onHeaderClick}
          >
            <H2>
              <span>{t('page.settings.tuning_accordion_title')}</span>
            </H2>

            <ControlButton text={<i></i>} />
          </label>

          <AnimatedDropdownList
            isOpen={isOpen}
            className={styles.tuning_list}
            isScrollable={false}
          >
            {tuningList &&
              tuningList.length > 0 &&
              tuningList.map((item) => (
                <li key={item?.id}>
                  {item?.value === 'sidebar' ? (
                    !isMobile &&
                    !isTablet && (
                      <RootDesc>
                        <span>{item?.title}</span>
                      </RootDesc>
                    )
                  ) : (
                    <RootDesc>
                      <span>{item?.title}</span>
                    </RootDesc>
                  )}

                  {item?.value === 'language' ? (
                    <ul className={styles.tuning_language_item}>
                      {languageList &&
                        languageList.length > 0 &&
                        languageList.map((lang) => {
                          const ItemBlock =
                            language === lang ? InnerBlock : OuterBlock;

                          return (
                            <li key={lang}>
                              <RootDesc>
                                <ItemBlock>
                                  <b
                                    style={
                                      language === lang
                                        ? {
                                            color: 'var(--primaryDef)',
                                            pointerEvents: 'none',
                                          }
                                        : {}
                                    }
                                    onClick={() => changeLanguage(lang)}
                                  >
                                    {lang}
                                  </b>
                                </ItemBlock>
                              </RootDesc>
                            </li>
                          );
                        })}
                    </ul>
                  ) : item?.value === 'sidebar' ? (
                    !isMobile &&
                    !isTablet && (
                      <RootSelect
                        arrow={true}
                        className={styles.tuning_sidebar}
                        options={sideBarOptions}
                        value={sideBar.blocked_value}
                        onChange={(val) => {
                          handleListItemClick(val);
                        }}
                        getLabel={(item) => item.name}
                        getValue={(item) => item.value}
                      />
                    )
                  ) : (
                    <CheckboxSwitch
                      name={item?.value}
                      onSwitch={() => switchCheckbox(item)}
                      checked={item?.checked}
                    />
                  )}
                </li>
              ))}
          </AnimatedDropdownList>
        </div>
      </OuterBlock>
    );
  }
);
