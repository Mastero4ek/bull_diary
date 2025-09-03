import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import { useTranslation } from 'react-i18next';

import {
  AnimatedDropdownList,
} from '@/components/animations/AnimatedDropdownList';
import { InnerBlock } from '@/components/layouts/utils/InnerBlock';
import { OuterBlock } from '@/components/layouts/utils/OuterBlock';
import { Icon } from '@/components/ui/media/Icon';
import { RootDesc } from '@/components/ui/typography/descriptions/RootDesc';

import styles from './styles.module.scss';

export const RootSelect = React.memo(
  ({
    arrow = false,
    options = [],
    value,
    onChange,
    iconId,
    placeholder,
    getLabel = (option) => option.label ?? option,
    getValue = (option) => option.value ?? option,
    className = '',
    dropdownClassName = '',
    disabled = false,
    search = false,
    searchPlaceholder = '',
    children,
  }) => {
    const selectRef = useRef();
    const [open, setOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const { t } = useTranslation();

    const toggleOpen = () => !disabled && setOpen((prev) => !prev);

    const handleListItemClick = useCallback(
      (item) => {
        onChange(getValue(item));
        setOpen(false);
        setSearchQuery('');
      },
      [onChange, getValue]
    );

    const handleClickOutside = useCallback((e) => {
      const path = e.composedPath ? e.composedPath() : e.path;

      if (!path.includes(selectRef.current)) {
        setOpen(false);
        setSearchQuery('');
      }
    }, []);

    const handleSearchChange = useCallback((e) => {
      setSearchQuery(e.target.value);
    }, []);

    useEffect(() => {
      document.body.addEventListener('click', handleClickOutside);

      return () =>
        document.body.removeEventListener('click', handleClickOutside);
    }, [handleClickOutside]);

    const ItemBlock = open ? InnerBlock : OuterBlock;
    let selectedOption = options.find((opt) => getLabel(opt) === value);

    if (!selectedOption) {
      selectedOption = options.find((opt) => getValue(opt) === value);
    }

    const filteredOptions =
      search && searchQuery
        ? options.filter((option) =>
            getLabel(option).toLowerCase().includes(searchQuery.toLowerCase())
          )
        : options;

    return (
      <div
        ref={selectRef}
        className={`${styles.select} ${className}`.trim()}
        style={{
          opacity: disabled ? '0.5' : '1',
          cursor: disabled ? 'not-allowed' : 'pointer',
          pointerEvents: disabled ? 'none' : 'auto',
        }}
      >
        <ItemBlock>
          <div
            onClick={toggleOpen}
            className={styles.select_head}
            style={disabled ? { opacity: 0.5, pointerEvents: 'none' } : {}}
          >
            {iconId && <Icon id={iconId} />}

            <RootDesc>
              <span
                style={{
                  opacity: placeholder ? 0.5 : 1,
                  fontWeight: placeholder ? 600 : 400,
                }}
              >
                {selectedOption ? getLabel(selectedOption) : placeholder}
              </span>
            </RootDesc>

            {arrow && (
              <i style={{ transform: `rotate(${open ? 180 : 0}deg)` }}></i>
            )}
          </div>
        </ItemBlock>

        <AnimatedDropdownList
          className={`${styles.select_list} ${dropdownClassName ? dropdownClassName : ''}`}
          isOpen={open}
        >
          {search && open && (
            <li className={styles.search_item}>
              <div className={styles.search_input}>
                <Icon id="search" />

                <input
                  type="text"
                  placeholder={searchPlaceholder}
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </li>
          )}

          {filteredOptions &&
            filteredOptions.length > 0 &&
            filteredOptions.map((option) => (
              <li
                onClick={() => handleListItemClick(option)}
                key={getValue(option)}
              >
                <RootDesc>
                  <span>{getLabel(option)}</span>
                </RootDesc>
              </li>
            ))}

          {search && searchQuery && filteredOptions.length === 0 && (
            <li className={styles.no_results}>
              <RootDesc>
                <span>{t('filter.search.empty')}</span>
              </RootDesc>
            </li>
          )}
        </AnimatedDropdownList>

        {children && children}
      </div>
    );
  }
);
