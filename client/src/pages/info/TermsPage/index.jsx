import React, { useEffect, useMemo } from 'react';

import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { animateScroll } from 'react-scroll';

import { Icon } from '@/components/ui/media/Icon';
import { RootDesc } from '@/components/ui/typography/descriptions/RootDesc';
import { H1 } from '@/components/ui/typography/titles/H1';
import { H2 } from '@/components/ui/typography/titles/H2';

import { InfoCard } from '../components/InfoCard';
import { NavBar } from '../components/NavBar';
import { Paragraph } from '../components/Paragraph';
import styles from '../styles.module.scss';

export const TermsPage = React.memo(() => {
  const { isTablet, isMobile } = useSelector((state) => state.settings);
  const { t } = useTranslation();

  const termsList = useMemo(
    () => [
      {
        id: 0,
        title: (
          <span
            dangerouslySetInnerHTML={{ __html: t('page.terms.risk.title') }}
          />
        ),
        name: (
          <span
            dangerouslySetInnerHTML={{ __html: t('page.terms.risk.title') }}
          />
        ),
        anchor: 'risk',
        content: (
          <InfoCard type="warning">
            <RootDesc>
              <span
                dangerouslySetInnerHTML={{
                  __html: t('page.terms.risk.content'),
                }}
              />
            </RootDesc>
          </InfoCard>
        ),
      },
      {
        id: 1,
        title: (
          <span
            dangerouslySetInnerHTML={{ __html: t('page.terms.termini.title') }}
          />
        ),
        name: (
          <span
            dangerouslySetInnerHTML={{ __html: t('page.terms.termini.title') }}
          />
        ),
        anchor: 'termini',
        content: (
          <div>
            <RootDesc>
              <span
                dangerouslySetInnerHTML={{
                  __html: t('page.terms.termini.content'),
                }}
              />
            </RootDesc>
          </div>
        ),
      },
      {
        id: 2,
        title: (
          <span
            dangerouslySetInnerHTML={{ __html: t('page.terms.general.title') }}
          />
        ),
        name: (
          <span
            dangerouslySetInnerHTML={{ __html: t('page.terms.general.title') }}
          />
        ),
        anchor: 'general',
        content: (
          <>
            <div>
              <H2>
                <span
                  dangerouslySetInnerHTML={{
                    __html: t('page.terms.general.content.part_1.title'),
                  }}
                />
              </H2>

              <RootDesc>
                <span
                  dangerouslySetInnerHTML={{
                    __html: t('page.terms.general.content.part_1.content'),
                  }}
                />
              </RootDesc>
            </div>

            <div>
              <H2>
                <span
                  dangerouslySetInnerHTML={{
                    __html: t('page.terms.general.content.part_2.title'),
                  }}
                />
              </H2>

              <RootDesc>
                <span
                  dangerouslySetInnerHTML={{
                    __html: t('page.terms.general.content.part_2.content'),
                  }}
                />
              </RootDesc>
            </div>

            <div>
              <H2>
                <span
                  dangerouslySetInnerHTML={{
                    __html: t('page.terms.general.content.part_3.title'),
                  }}
                />
              </H2>

              <RootDesc>
                <span
                  dangerouslySetInnerHTML={{
                    __html: t('page.terms.general.content.part_3.content'),
                  }}
                />
              </RootDesc>
            </div>
          </>
        ),
      },
      {
        id: 3,
        title: (
          <span
            dangerouslySetInnerHTML={{
              __html: t('page.terms.description.title'),
            }}
          />
        ),
        name: (
          <span
            dangerouslySetInnerHTML={{
              __html: t('page.terms.description.title'),
            }}
          />
        ),
        anchor: 'description',
        content: (
          <>
            <div>
              <H2>
                <span
                  dangerouslySetInnerHTML={{
                    __html: t('page.terms.description.content.part_1.title'),
                  }}
                />
              </H2>

              <RootDesc>
                <span
                  dangerouslySetInnerHTML={{
                    __html: t('page.terms.description.content.part_1.content'),
                  }}
                />
              </RootDesc>
            </div>

            <div>
              <H2>
                <span
                  dangerouslySetInnerHTML={{
                    __html: t('page.terms.description.content.part_2.title'),
                  }}
                />
              </H2>

              <RootDesc>
                <span
                  dangerouslySetInnerHTML={{
                    __html: t('page.terms.description.content.part_2.content'),
                  }}
                />
              </RootDesc>
            </div>
          </>
        ),
      },
      {
        id: 4,
        title: (
          <span
            dangerouslySetInnerHTML={{
              __html: t('page.terms.connection.title'),
            }}
          />
        ),
        name: (
          <span
            dangerouslySetInnerHTML={{
              __html: t('page.terms.connection.title'),
            }}
          />
        ),
        anchor: 'connection',
        content: (
          <>
            <div>
              <H2>
                <span
                  dangerouslySetInnerHTML={{
                    __html: t('page.terms.connection.content.part_1.title'),
                  }}
                />
              </H2>

              <InfoCard type="warning">
                <RootDesc>
                  <span
                    dangerouslySetInnerHTML={{
                      __html: t('page.terms.connection.content.part_1.content'),
                    }}
                  />
                </RootDesc>
              </InfoCard>
            </div>

            <div>
              <H2>
                <span
                  dangerouslySetInnerHTML={{
                    __html: t('page.terms.connection.content.part_2.title'),
                  }}
                />
              </H2>

              <RootDesc>
                <span
                  dangerouslySetInnerHTML={{
                    __html: t('page.terms.connection.content.part_2.content'),
                  }}
                />
              </RootDesc>
            </div>

            <div>
              <H2>
                <span
                  dangerouslySetInnerHTML={{
                    __html: t('page.terms.connection.content.part_3.title'),
                  }}
                />
              </H2>

              <RootDesc>
                <span
                  dangerouslySetInnerHTML={{
                    __html: t('page.terms.connection.content.part_3.content'),
                  }}
                />
              </RootDesc>
            </div>
          </>
        ),
      },
      {
        id: 5,
        title: (
          <span
            dangerouslySetInnerHTML={{ __html: t('page.terms.rights.title') }}
          />
        ),
        name: (
          <span
            dangerouslySetInnerHTML={{ __html: t('page.terms.rights.title') }}
          />
        ),
        anchor: 'rights',
        content: (
          <>
            <div>
              <H2>
                <span
                  dangerouslySetInnerHTML={{
                    __html: t('page.terms.rights.content.part_1.title'),
                  }}
                />
              </H2>

              <RootDesc>
                <span
                  dangerouslySetInnerHTML={{
                    __html: t('page.terms.rights.content.part_1.content'),
                  }}
                />
              </RootDesc>
            </div>

            <div>
              <H2>
                <span
                  dangerouslySetInnerHTML={{
                    __html: t('page.terms.rights.content.part_2.title'),
                  }}
                />
              </H2>

              <RootDesc>
                <span
                  dangerouslySetInnerHTML={{
                    __html: t('page.terms.rights.content.part_2.content'),
                  }}
                />
              </RootDesc>
            </div>

            <div>
              <H2>
                <span
                  dangerouslySetInnerHTML={{
                    __html: t('page.terms.rights.content.part_3.title'),
                  }}
                />
              </H2>

              <RootDesc>
                <span
                  dangerouslySetInnerHTML={{
                    __html: t('page.terms.rights.content.part_3.content'),
                  }}
                />
              </RootDesc>
            </div>

            <div>
              <H2>
                <span
                  dangerouslySetInnerHTML={{
                    __html: t('page.terms.rights.content.part_4.title'),
                  }}
                />
              </H2>

              <RootDesc>
                <span
                  dangerouslySetInnerHTML={{
                    __html: t('page.terms.rights.content.part_4.content'),
                  }}
                />
              </RootDesc>
            </div>
          </>
        ),
      },
      {
        id: 6,
        title: (
          <span
            dangerouslySetInnerHTML={{
              __html: t('page.terms.responsibility.title'),
            }}
          />
        ),
        name: (
          <span
            dangerouslySetInnerHTML={{
              __html: t('page.terms.responsibility.title'),
            }}
          />
        ),
        anchor: 'responsibility',
        content: (
          <>
            <div>
              <H2>
                <span
                  dangerouslySetInnerHTML={{
                    __html: t('page.terms.responsibility.content.part_1.title'),
                  }}
                />
              </H2>

              <InfoCard type="warning">
                <RootDesc>
                  <span
                    dangerouslySetInnerHTML={{
                      __html: t(
                        'page.terms.responsibility.content.part_1.content'
                      ),
                    }}
                  />
                </RootDesc>
              </InfoCard>
            </div>

            <div>
              <H2>
                <span
                  dangerouslySetInnerHTML={{
                    __html: t('page.terms.responsibility.content.part_2.title'),
                  }}
                />
              </H2>

              <RootDesc>
                <span
                  dangerouslySetInnerHTML={{
                    __html: t(
                      'page.terms.responsibility.content.part_2.content'
                    ),
                  }}
                />
              </RootDesc>
            </div>
          </>
        ),
      },
      {
        id: 7,
        title: (
          <span
            dangerouslySetInnerHTML={{
              __html: t('page.terms.intellectual.title'),
            }}
          />
        ),
        name: (
          <span
            dangerouslySetInnerHTML={{
              __html: t('page.terms.intellectual.title'),
            }}
          />
        ),
        anchor: 'intellectual',
        content: (
          <>
            <div>
              <H2>
                <span
                  dangerouslySetInnerHTML={{
                    __html: t('page.terms.intellectual.content.part_1.title'),
                  }}
                />
              </H2>

              <RootDesc>
                <span
                  dangerouslySetInnerHTML={{
                    __html: t('page.terms.intellectual.content.part_1.content'),
                  }}
                />
              </RootDesc>
            </div>

            <div>
              <H2>
                <span
                  dangerouslySetInnerHTML={{
                    __html: t('page.terms.intellectual.content.part_2.title'),
                  }}
                />
              </H2>

              <RootDesc>
                <span
                  dangerouslySetInnerHTML={{
                    __html: t('page.terms.intellectual.content.part_2.content'),
                  }}
                />
              </RootDesc>
            </div>
          </>
        ),
      },
      {
        id: 8,
        title: (
          <span
            dangerouslySetInnerHTML={{
              __html: t('page.terms.processing.title'),
            }}
          />
        ),
        name: (
          <span
            dangerouslySetInnerHTML={{
              __html: t('page.terms.processing.title'),
            }}
          />
        ),
        anchor: 'processing',
        content: (
          <>
            <div>
              <H2>
                <span
                  dangerouslySetInnerHTML={{
                    __html: t('page.terms.processing.content.part_1.title'),
                  }}
                />
              </H2>

              <RootDesc>
                <span
                  dangerouslySetInnerHTML={{
                    __html: t('page.terms.processing.content.part_1.content'),
                  }}
                />
              </RootDesc>
            </div>

            <div>
              <H2>
                <span
                  dangerouslySetInnerHTML={{
                    __html: t('page.terms.processing.content.part_2.title'),
                  }}
                />
              </H2>

              <RootDesc>
                <span
                  dangerouslySetInnerHTML={{
                    __html: t('page.terms.processing.content.part_2.content'),
                  }}
                />
              </RootDesc>
            </div>

            <div>
              <H2>
                <span
                  dangerouslySetInnerHTML={{
                    __html: t('page.terms.processing.content.part_3.title'),
                  }}
                />
              </H2>

              <RootDesc>
                <span
                  dangerouslySetInnerHTML={{
                    __html: t('page.terms.processing.content.part_3.content'),
                  }}
                />
              </RootDesc>
            </div>
          </>
        ),
      },
      {
        id: 9,
        title: (
          <span
            dangerouslySetInnerHTML={{
              __html: t('page.terms.agreement.title'),
            }}
          />
        ),
        name: (
          <span
            dangerouslySetInnerHTML={{
              __html: t('page.terms.agreement.title'),
            }}
          />
        ),
        anchor: 'agreement',
        content: (
          <>
            <div>
              <H2>
                <span
                  dangerouslySetInnerHTML={{
                    __html: t('page.terms.agreement.content.part_1.title'),
                  }}
                />
              </H2>

              <RootDesc>
                <span
                  dangerouslySetInnerHTML={{
                    __html: t('page.terms.agreement.content.part_1.content'),
                  }}
                />
              </RootDesc>
            </div>

            <div>
              <H2>
                <span
                  dangerouslySetInnerHTML={{
                    __html: t('page.terms.agreement.content.part_2.title'),
                  }}
                />
              </H2>

              <RootDesc>
                <span
                  dangerouslySetInnerHTML={{
                    __html: t('page.terms.agreement.content.part_2.content'),
                  }}
                />
              </RootDesc>
            </div>

            <div>
              <H2>
                <span
                  dangerouslySetInnerHTML={{
                    __html: t('page.terms.agreement.content.part_3.title'),
                  }}
                />
              </H2>

              <RootDesc>
                <span
                  dangerouslySetInnerHTML={{
                    __html: t('page.terms.agreement.content.part_3.content'),
                  }}
                />
              </RootDesc>
            </div>
          </>
        ),
      },
      {
        id: 10,
        title: (
          <span
            dangerouslySetInnerHTML={{ __html: t('page.terms.dispute.title') }}
          />
        ),
        name: (
          <span
            dangerouslySetInnerHTML={{ __html: t('page.terms.dispute.title') }}
          />
        ),
        anchor: 'dispute',
        content: (
          <>
            <div>
              <H2>
                <span
                  dangerouslySetInnerHTML={{
                    __html: t('page.terms.dispute.content.part_1.title'),
                  }}
                />
              </H2>

              <RootDesc>
                <span
                  dangerouslySetInnerHTML={{
                    __html: t('page.terms.dispute.content.part_1.content'),
                  }}
                />
              </RootDesc>
            </div>

            <div>
              <H2>
                <span
                  dangerouslySetInnerHTML={{
                    __html: t('page.terms.dispute.content.part_2.title'),
                  }}
                />
              </H2>

              <RootDesc>
                <span
                  dangerouslySetInnerHTML={{
                    __html: t('page.terms.dispute.content.part_2.content'),
                  }}
                />
              </RootDesc>
            </div>
          </>
        ),
      },
      {
        id: 11,
        title: (
          <span
            dangerouslySetInnerHTML={{ __html: t('page.terms.force.title') }}
          />
        ),
        name: (
          <span
            dangerouslySetInnerHTML={{ __html: t('page.terms.force.title') }}
          />
        ),
        anchor: 'force',
        content: (
          <>
            <div>
              <H2>
                <span
                  dangerouslySetInnerHTML={{
                    __html: t('page.terms.force.content.part_1.title'),
                  }}
                />
              </H2>

              <RootDesc>
                <span
                  dangerouslySetInnerHTML={{
                    __html: t('page.terms.force.content.part_1.content'),
                  }}
                />
              </RootDesc>
            </div>

            <div>
              <H2>
                <span
                  dangerouslySetInnerHTML={{
                    __html: t('page.terms.force.content.part_2.title'),
                  }}
                />
              </H2>

              <RootDesc>
                <span
                  dangerouslySetInnerHTML={{
                    __html: t('page.terms.force.content.part_2.content'),
                  }}
                />
              </RootDesc>
            </div>
          </>
        ),
      },
      {
        id: 12,
        title: (
          <span
            dangerouslySetInnerHTML={{
              __html: t('page.terms.conclusion.title'),
            }}
          />
        ),
        name: (
          <span
            dangerouslySetInnerHTML={{
              __html: t('page.terms.conclusion.title'),
            }}
          />
        ),
        anchor: 'conclusion',
        content: (
          <>
            <div>
              <H2>
                <span
                  dangerouslySetInnerHTML={{
                    __html: t('page.terms.conclusion.content.part_1.title'),
                  }}
                />
              </H2>

              <RootDesc>
                <span
                  dangerouslySetInnerHTML={{
                    __html: t('page.terms.conclusion.content.part_1.content'),
                  }}
                />
              </RootDesc>
            </div>

            <div>
              <H2>
                <span
                  dangerouslySetInnerHTML={{
                    __html: t('page.terms.conclusion.content.part_2.title'),
                  }}
                />
              </H2>

              <RootDesc>
                <span
                  dangerouslySetInnerHTML={{
                    __html: t('page.terms.conclusion.content.part_2.content'),
                  }}
                />
              </RootDesc>
            </div>

            <div>
              <H2>
                <span
                  dangerouslySetInnerHTML={{
                    __html: t('page.terms.conclusion.content.part_3.title'),
                  }}
                />
              </H2>

              <RootDesc>
                <span
                  dangerouslySetInnerHTML={{
                    __html: t('page.terms.conclusion.content.part_3.content'),
                  }}
                />
              </RootDesc>
            </div>
          </>
        ),
      },
      {
        id: 13,
        title: (
          <span
            dangerouslySetInnerHTML={{ __html: t('page.terms.contact.title') }}
          />
        ),
        name: (
          <span
            dangerouslySetInnerHTML={{ __html: t('page.terms.contact.title') }}
          />
        ),
        anchor: 'contact',
        content: (
          <>
            <div>
              <H2>
                <span
                  dangerouslySetInnerHTML={{
                    __html: t('page.terms.contact.content.part_1.title'),
                  }}
                />
              </H2>

              <RootDesc>
                <span
                  dangerouslySetInnerHTML={{
                    __html: t('page.terms.contact.content.part_1.content'),
                  }}
                />
              </RootDesc>
            </div>

            <div>
              <H2>
                <span
                  dangerouslySetInnerHTML={{
                    __html: t('page.terms.contact.content.part_2.title'),
                  }}
                />
              </H2>

              <RootDesc>
                <span
                  dangerouslySetInnerHTML={{
                    __html: t('page.terms.contact.content.part_2.content'),
                  }}
                />
              </RootDesc>
            </div>
          </>
        ),
      },
      {
        id: 14,
        title: undefined,
        name: undefined,
        anchor: undefined,
        content: (
          <div>
            <RootDesc>
              <span
                dangerouslySetInnerHTML={{
                  __html: t('page.terms.effective_date.content'),
                }}
              />
            </RootDesc>
          </div>
        ),
      },
      {
        id: 15,
        title: undefined,
        name: undefined,
        anchor: undefined,
        content: (
          <InfoCard type="info">
            <RootDesc>
              <i
                dangerouslySetInnerHTML={{
                  __html: t('page.terms.public_offer.content'),
                }}
              />
            </RootDesc>
          </InfoCard>
        ),
      },
    ],
    [t]
  );

  useEffect(() => {
    animateScroll.scrollTo(0, {
      duration: 500,
      smooth: 'easeInOutQuad',
    });
  }, []);

  return (
    <div className={styles.info_page_wrapper}>
      {!isTablet && !isMobile && <NavBar items={termsList} />}

      <div className={styles.info_page_content}>
        <div className={styles.info_page_title}>
          <Icon id="diary" />

          <H1>
            <span dangerouslySetInnerHTML={{ __html: t('page.terms.title') }} />
          </H1>
        </div>

        <RootDesc>
          <span
            dangerouslySetInnerHTML={{ __html: t('page.terms.last_update') }}
          />
        </RootDesc>

        {termsList &&
          termsList.length > 0 &&
          termsList.map((item) => <Paragraph key={item.id} item={item} />)}
      </div>
    </div>
  );
});
