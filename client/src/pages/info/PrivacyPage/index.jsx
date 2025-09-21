import React, {
  useEffect,
  useMemo,
} from 'react';

import { useTranslation } from 'react-i18next';
import { animateScroll } from 'react-scroll';

import {
  InfoPageLayout,
} from '@/components/layouts/specialized/InfoPageLayout';
import { RootDesc } from '@/components/ui/typography/descriptions/RootDesc';
import { H2 } from '@/components/ui/typography/titles/H2';

import { InfoCard } from '../components/InfoCard';

export const PrivacyPage = React.memo(() => {
  const { t } = useTranslation();

  const privacyList = useMemo(
    () => [
      {
        id: 0,
        title: (
          <span
            dangerouslySetInnerHTML={{ __html: t('page.privacy.gdpr.title') }}
          />
        ),
        name: (
          <span
            dangerouslySetInnerHTML={{ __html: t('page.privacy.gdpr.title') }}
          />
        ),
        anchor: 'gdpr',
        content: (
          <RootDesc>
            <span
              dangerouslySetInnerHTML={{
                __html: t('page.privacy.gdpr.content'),
              }}
            />
          </RootDesc>
        ),
      },
      {
        id: 1,
        title: (
          <span
            dangerouslySetInnerHTML={{
              __html: t('page.privacy.general.title'),
            }}
          />
        ),
        name: (
          <span
            dangerouslySetInnerHTML={{
              __html: t('page.privacy.general.title'),
            }}
          />
        ),
        anchor: 'general',
        content: (
          <>
            <div>
              <H2>
                <span
                  dangerouslySetInnerHTML={{
                    __html: t('page.privacy.general.content.part_1.title'),
                  }}
                />
              </H2>

              <RootDesc>
                <span
                  dangerouslySetInnerHTML={{
                    __html: t('page.privacy.general.content.part_1.content'),
                  }}
                />
              </RootDesc>
            </div>
          </>
        ),
      },
      {
        id: 2,
        title: (
          <span
            dangerouslySetInnerHTML={{
              __html: t('page.privacy.termini.title'),
            }}
          />
        ),
        name: (
          <span
            dangerouslySetInnerHTML={{
              __html: t('page.privacy.termini.title'),
            }}
          />
        ),
        anchor: 'termini',
        content: (
          <div>
            <H2>
              <span
                dangerouslySetInnerHTML={{
                  __html: t('page.privacy.termini.content.part_1.title'),
                }}
              />
            </H2>

            <RootDesc>
              <span
                dangerouslySetInnerHTML={{
                  __html: t('page.privacy.termini.content.part_1.content'),
                }}
              />
            </RootDesc>
          </div>
        ),
      },
      {
        id: 3,
        title: (
          <span
            dangerouslySetInnerHTML={{
              __html: t('page.privacy.data_collection.title'),
            }}
          />
        ),
        name: (
          <span
            dangerouslySetInnerHTML={{
              __html: t('page.privacy.data_collection.title'),
            }}
          />
        ),
        anchor: 'data_collection',
        content: (
          <>
            <div>
              <H2>
                <span
                  dangerouslySetInnerHTML={{
                    __html: t(
                      'page.privacy.data_collection.content.part_1.title'
                    ),
                  }}
                />
              </H2>

              <RootDesc>
                <span
                  dangerouslySetInnerHTML={{
                    __html: t(
                      'page.privacy.data_collection.content.part_1.content'
                    ),
                  }}
                />
              </RootDesc>
            </div>

            <div>
              <H2>
                <span
                  dangerouslySetInnerHTML={{
                    __html: t(
                      'page.privacy.data_collection.content.part_2.title'
                    ),
                  }}
                />
              </H2>

              <RootDesc>
                <span
                  dangerouslySetInnerHTML={{
                    __html: t(
                      'page.privacy.data_collection.content.part_2.content'
                    ),
                  }}
                />
              </RootDesc>
            </div>

            <div>
              <H2>
                <span
                  dangerouslySetInnerHTML={{
                    __html: t(
                      'page.privacy.data_collection.content.part_3.title'
                    ),
                  }}
                />
              </H2>

              <RootDesc>
                <span
                  dangerouslySetInnerHTML={{
                    __html: t(
                      'page.privacy.data_collection.content.part_3.content'
                    ),
                  }}
                />
              </RootDesc>
            </div>

            <div>
              <H2>
                <span
                  dangerouslySetInnerHTML={{
                    __html: t(
                      'page.privacy.data_collection.content.part_4.title'
                    ),
                  }}
                />
              </H2>

              <RootDesc>
                <span
                  dangerouslySetInnerHTML={{
                    __html: t(
                      'page.privacy.data_collection.content.part_4.content'
                    ),
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
              __html: t('page.privacy.purposes.title'),
            }}
          />
        ),
        name: (
          <span
            dangerouslySetInnerHTML={{
              __html: t('page.privacy.purposes.title'),
            }}
          />
        ),
        anchor: 'purposes',
        content: (
          <>
            <div>
              <H2>
                <span
                  dangerouslySetInnerHTML={{
                    __html: t('page.privacy.purposes.content.part_1.title'),
                  }}
                />
              </H2>

              <RootDesc>
                <span
                  dangerouslySetInnerHTML={{
                    __html: t('page.privacy.purposes.content.part_1.content'),
                  }}
                />
              </RootDesc>
            </div>

            <div>
              <H2>
                <span
                  dangerouslySetInnerHTML={{
                    __html: t('page.privacy.purposes.content.part_2.title'),
                  }}
                />
              </H2>

              <RootDesc>
                <span
                  dangerouslySetInnerHTML={{
                    __html: t('page.privacy.purposes.content.part_2.content'),
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
            dangerouslySetInnerHTML={{ __html: t('page.privacy.legal.title') }}
          />
        ),
        name: (
          <span
            dangerouslySetInnerHTML={{ __html: t('page.privacy.legal.title') }}
          />
        ),
        anchor: 'legal',
        content: (
          <>
            <div>
              <H2>
                <span
                  dangerouslySetInnerHTML={{
                    __html: t('page.privacy.legal.content.part_1.title'),
                  }}
                />
              </H2>

              <RootDesc>
                <span
                  dangerouslySetInnerHTML={{
                    __html: t('page.privacy.legal.content.part_1.content'),
                  }}
                />
              </RootDesc>
            </div>

            <div>
              <H2>
                <span
                  dangerouslySetInnerHTML={{
                    __html: t('page.privacy.legal.content.part_2.title'),
                  }}
                />
              </H2>

              <RootDesc>
                <span
                  dangerouslySetInnerHTML={{
                    __html: t('page.privacy.legal.content.part_2.content'),
                  }}
                />
              </RootDesc>
            </div>

            <div>
              <H2>
                <span
                  dangerouslySetInnerHTML={{
                    __html: t('page.privacy.legal.content.part_3.title'),
                  }}
                />
              </H2>

              <RootDesc>
                <span
                  dangerouslySetInnerHTML={{
                    __html: t('page.privacy.legal.content.part_3.content'),
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
              __html: t('page.privacy.security.title'),
            }}
          />
        ),
        name: (
          <span
            dangerouslySetInnerHTML={{
              __html: t('page.privacy.security.title'),
            }}
          />
        ),
        anchor: 'security',
        content: (
          <>
            <div>
              <H2>
                <span
                  dangerouslySetInnerHTML={{
                    __html: t('page.privacy.security.content.part_1.title'),
                  }}
                />
              </H2>

              <RootDesc>
                <span
                  dangerouslySetInnerHTML={{
                    __html: t('page.privacy.security.content.part_1.content'),
                  }}
                />
              </RootDesc>
            </div>

            <div>
              <H2>
                <span
                  dangerouslySetInnerHTML={{
                    __html: t('page.privacy.security.content.part_2.title'),
                  }}
                />
              </H2>

              <RootDesc>
                <span
                  dangerouslySetInnerHTML={{
                    __html: t('page.privacy.security.content.part_2.content'),
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
              __html: t('page.privacy.transfer.title'),
            }}
          />
        ),
        name: (
          <span
            dangerouslySetInnerHTML={{
              __html: t('page.privacy.transfer.title'),
            }}
          />
        ),
        anchor: 'transfer',
        content: (
          <>
            <div>
              <H2>
                <span
                  dangerouslySetInnerHTML={{
                    __html: t('page.privacy.transfer.content.part_1.title'),
                  }}
                />
              </H2>

              <InfoCard type="warning">
                <RootDesc>
                  <span
                    dangerouslySetInnerHTML={{
                      __html: t('page.privacy.transfer.content.part_1.content'),
                    }}
                  />
                </RootDesc>
              </InfoCard>
            </div>

            <div>
              <H2>
                <span
                  dangerouslySetInnerHTML={{
                    __html: t('page.privacy.transfer.content.part_2.title'),
                  }}
                />
              </H2>

              <RootDesc>
                <span
                  dangerouslySetInnerHTML={{
                    __html: t('page.privacy.transfer.content.part_2.content'),
                  }}
                />
              </RootDesc>
            </div>

            <div>
              <H2>
                <span
                  dangerouslySetInnerHTML={{
                    __html: t('page.privacy.transfer.content.part_3.title'),
                  }}
                />
              </H2>

              <RootDesc>
                <span
                  dangerouslySetInnerHTML={{
                    __html: t('page.privacy.transfer.content.part_3.content'),
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
            dangerouslySetInnerHTML={{ __html: t('page.privacy.rights.title') }}
          />
        ),
        name: (
          <span
            dangerouslySetInnerHTML={{ __html: t('page.privacy.rights.title') }}
          />
        ),
        anchor: 'rights',
        content: (
          <>
            <div>
              <H2>
                <span
                  dangerouslySetInnerHTML={{
                    __html: t('page.privacy.rights.content.part_1.title'),
                  }}
                />
              </H2>

              <RootDesc>
                <span
                  dangerouslySetInnerHTML={{
                    __html: t('page.privacy.rights.content.part_1.content'),
                  }}
                />
              </RootDesc>
            </div>

            <div>
              <H2>
                <span
                  dangerouslySetInnerHTML={{
                    __html: t('page.privacy.rights.content.part_2.title'),
                  }}
                />
              </H2>

              <RootDesc>
                <span
                  dangerouslySetInnerHTML={{
                    __html: t('page.privacy.rights.content.part_2.content'),
                  }}
                />
              </RootDesc>
            </div>

            <div>
              <H2>
                <span
                  dangerouslySetInnerHTML={{
                    __html: t('page.privacy.rights.content.part_3.title'),
                  }}
                />
              </H2>

              <RootDesc>
                <span
                  dangerouslySetInnerHTML={{
                    __html: t('page.privacy.rights.content.part_3.content'),
                  }}
                />
              </RootDesc>
            </div>

            <div>
              <H2>
                <span
                  dangerouslySetInnerHTML={{
                    __html: t('page.privacy.rights.content.part_4.title'),
                  }}
                />
              </H2>

              <RootDesc>
                <span
                  dangerouslySetInnerHTML={{
                    __html: t('page.privacy.rights.content.part_4.content'),
                  }}
                />
              </RootDesc>
            </div>

            <div>
              <H2>
                <span
                  dangerouslySetInnerHTML={{
                    __html: t('page.privacy.rights.content.part_5.title'),
                  }}
                />
              </H2>

              <RootDesc>
                <span
                  dangerouslySetInnerHTML={{
                    __html: t('page.privacy.rights.content.part_5.content'),
                  }}
                />
              </RootDesc>
            </div>

            <div>
              <H2>
                <span
                  dangerouslySetInnerHTML={{
                    __html: t('page.privacy.rights.content.part_6.title'),
                  }}
                />
              </H2>

              <RootDesc>
                <span
                  dangerouslySetInnerHTML={{
                    __html: t('page.privacy.rights.content.part_6.content'),
                  }}
                />
              </RootDesc>
            </div>

            <div>
              <H2>
                <span
                  dangerouslySetInnerHTML={{
                    __html: t('page.privacy.rights.content.part_7.title'),
                  }}
                />
              </H2>

              <RootDesc>
                <span
                  dangerouslySetInnerHTML={{
                    __html: t('page.privacy.rights.content.part_7.content'),
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
              __html: t('page.privacy.storage.title'),
            }}
          />
        ),
        name: (
          <span
            dangerouslySetInnerHTML={{
              __html: t('page.privacy.storage.title'),
            }}
          />
        ),
        anchor: 'storage',
        content: (
          <>
            <div>
              <H2>
                <span
                  dangerouslySetInnerHTML={{
                    __html: t('page.privacy.storage.content.part_1.title'),
                  }}
                />
              </H2>

              <RootDesc>
                <span
                  dangerouslySetInnerHTML={{
                    __html: t('page.privacy.storage.content.part_1.content'),
                  }}
                />
              </RootDesc>
            </div>

            <div>
              <H2>
                <span
                  dangerouslySetInnerHTML={{
                    __html: t('page.privacy.storage.content.part_2.title'),
                  }}
                />
              </H2>

              <RootDesc>
                <span
                  dangerouslySetInnerHTML={{
                    __html: t('page.privacy.storage.content.part_2.content'),
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
            dangerouslySetInnerHTML={{
              __html: t('page.privacy.cookies.title'),
            }}
          />
        ),
        name: (
          <span
            dangerouslySetInnerHTML={{
              __html: t('page.privacy.cookies.title'),
            }}
          />
        ),
        anchor: 'cookies',
        content: (
          <>
            <div>
              <H2>
                <span
                  dangerouslySetInnerHTML={{
                    __html: t('page.privacy.cookies.content.part_1.title'),
                  }}
                />
              </H2>

              <RootDesc>
                <span
                  dangerouslySetInnerHTML={{
                    __html: t('page.privacy.cookies.content.part_1.content'),
                  }}
                />
              </RootDesc>
            </div>

            <div>
              <H2>
                <span
                  dangerouslySetInnerHTML={{
                    __html: t('page.privacy.cookies.content.part_2.title'),
                  }}
                />
              </H2>

              <RootDesc>
                <span
                  dangerouslySetInnerHTML={{
                    __html: t('page.privacy.cookies.content.part_2.content'),
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
            dangerouslySetInnerHTML={{
              __html: t('page.privacy.children.title'),
            }}
          />
        ),
        name: (
          <span
            dangerouslySetInnerHTML={{
              __html: t('page.privacy.children.title'),
            }}
          />
        ),
        anchor: 'children',
        content: (
          <div>
            <H2>
              <span
                dangerouslySetInnerHTML={{
                  __html: t('page.privacy.children.content.part_1.title'),
                }}
              />
            </H2>

            <RootDesc>
              <span
                dangerouslySetInnerHTML={{
                  __html: t('page.privacy.children.content.part_1.content'),
                }}
              />
            </RootDesc>
          </div>
        ),
      },
      {
        id: 12,
        title: (
          <span
            dangerouslySetInnerHTML={{
              __html: t('page.privacy.automated.title'),
            }}
          />
        ),
        name: (
          <span
            dangerouslySetInnerHTML={{
              __html: t('page.privacy.automated.title'),
            }}
          />
        ),
        anchor: 'automated',
        content: (
          <>
            <div>
              <H2>
                <span
                  dangerouslySetInnerHTML={{
                    __html: t('page.privacy.automated.content.part_1.title'),
                  }}
                />
              </H2>

              <RootDesc>
                <span
                  dangerouslySetInnerHTML={{
                    __html: t('page.privacy.automated.content.part_1.content'),
                  }}
                />
              </RootDesc>
            </div>

            <div>
              <H2>
                <span
                  dangerouslySetInnerHTML={{
                    __html: t('page.privacy.automated.content.part_2.title'),
                  }}
                />
              </H2>

              <RootDesc>
                <span
                  dangerouslySetInnerHTML={{
                    __html: t('page.privacy.automated.content.part_2.content'),
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
            dangerouslySetInnerHTML={{
              __html: t('page.privacy.changes.title'),
            }}
          />
        ),
        name: (
          <span
            dangerouslySetInnerHTML={{
              __html: t('page.privacy.changes.title'),
            }}
          />
        ),
        anchor: 'changes',
        content: (
          <>
            <div>
              <H2>
                <span
                  dangerouslySetInnerHTML={{
                    __html: t('page.privacy.changes.content.part_1.title'),
                  }}
                />
              </H2>

              <RootDesc>
                <span
                  dangerouslySetInnerHTML={{
                    __html: t('page.privacy.changes.content.part_1.content'),
                  }}
                />
              </RootDesc>
            </div>

            <div>
              <H2>
                <span
                  dangerouslySetInnerHTML={{
                    __html: t('page.privacy.changes.content.part_2.title'),
                  }}
                />
              </H2>

              <RootDesc>
                <span
                  dangerouslySetInnerHTML={{
                    __html: t('page.privacy.changes.content.part_2.content'),
                  }}
                />
              </RootDesc>
            </div>
          </>
        ),
      },
      {
        id: 14,
        title: (
          <span
            dangerouslySetInnerHTML={{
              __html: t('page.privacy.contacts.title'),
            }}
          />
        ),
        name: (
          <span
            dangerouslySetInnerHTML={{
              __html: t('page.privacy.contacts.title'),
            }}
          />
        ),
        anchor: 'contacts',
        content: (
          <>
            <div>
              <H2>
                <span
                  dangerouslySetInnerHTML={{
                    __html: t('page.privacy.contacts.content.part_1.title'),
                  }}
                />
              </H2>

              <RootDesc>
                <span
                  dangerouslySetInnerHTML={{
                    __html: t('page.privacy.contacts.content.part_1.content'),
                  }}
                />
              </RootDesc>
            </div>

            <div>
              <H2>
                <span
                  dangerouslySetInnerHTML={{
                    __html: t('page.privacy.contacts.content.part_2.title'),
                  }}
                />
              </H2>

              <RootDesc>
                <span
                  dangerouslySetInnerHTML={{
                    __html: t('page.privacy.contacts.content.part_2.content'),
                  }}
                />
              </RootDesc>
            </div>
          </>
        ),
      },
      {
        id: 15,
        title: (
          <span
            dangerouslySetInnerHTML={{ __html: t('page.privacy.final.title') }}
          />
        ),
        name: (
          <span
            dangerouslySetInnerHTML={{ __html: t('page.privacy.final.title') }}
          />
        ),
        anchor: 'final',
        content: (
          <>
            <div>
              <H2>
                <span
                  dangerouslySetInnerHTML={{
                    __html: t('page.privacy.final.content.part_1.title'),
                  }}
                />
              </H2>

              <RootDesc>
                <span
                  dangerouslySetInnerHTML={{
                    __html: t('page.privacy.final.content.part_1.content'),
                  }}
                />
              </RootDesc>
            </div>

            <div>
              <H2>
                <span
                  dangerouslySetInnerHTML={{
                    __html: t('page.privacy.final.content.part_2.title'),
                  }}
                />
              </H2>

              <RootDesc>
                <span
                  dangerouslySetInnerHTML={{
                    __html: t('page.privacy.final.content.part_2.content'),
                  }}
                />
              </RootDesc>
            </div>

            <div>
              <H2>
                <span
                  dangerouslySetInnerHTML={{
                    __html: t('page.privacy.final.content.part_3.title'),
                  }}
                />
              </H2>

              <RootDesc>
                <span
                  dangerouslySetInnerHTML={{
                    __html: t('page.privacy.final.content.part_3.content'),
                  }}
                />
              </RootDesc>
            </div>
          </>
        ),
      },
      {
        id: 16,
        title: undefined,
        name: undefined,
        anchor: undefined,
        content: (
          <div>
            <RootDesc>
              <span
                dangerouslySetInnerHTML={{
                  __html: t('page.privacy.effective_date.content'),
                }}
              />
            </RootDesc>
          </div>
        ),
      },
      {
        id: 17,
        title: undefined,
        name: undefined,
        anchor: undefined,
        content: (
          <InfoCard type="info">
            <RootDesc>
              <i
                dangerouslySetInnerHTML={{
                  __html: t('page.privacy.agreement_part.content'),
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
    <InfoPageLayout
      lastUpdate={t('page.privacy.last_update')}
      termsList={privacyList}
      title={t('page.privacy.title')}
      iconTitle="diary"
    />
  );
});
