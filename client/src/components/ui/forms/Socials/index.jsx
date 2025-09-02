import React from 'react';

import { Icon } from '@/components/ui/media/Icon';

import styles from './styles.module.scss';

const socialList = [
  {
    id: 0,
    href: 'https://vk.com/mstrok',
    iconId: 'vk',
  },
  {
    id: 1,
    href: 'https://t.me/mstr4k',
    iconId: 'telegram',
  },
  {
    id: 2,
    href: 'https://api.whatsapp.com/send?phone=79789334170',
    iconId: 'whatsapp',
  },
  {
    id: 3,
    href: 'https://discordapp.com/users/762958946825928744',
    iconId: 'discord',
  },
  {
    id: 4,
    href: 'https://github.com/Mastero4ek',
    iconId: 'github',
  },
];

export const Socials = React.memo(() => {
  return (
    <ul className={styles.socials_wrapper}>
      {socialList.map(({ id, href, iconId }) => (
        <li key={id}>
          <a href={href} target="_blank" rel="noreferrer">
            <Icon id={iconId} />
          </a>
        </li>
      ))}
    </ul>
  );
});
