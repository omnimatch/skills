const criterion = (id, label, question, weight, levels, required = false) => ({
  id,
  label,
  question,
  weight,
  levels,
  required,
});
const fit = ['Poor fit', 'Partial fit', 'Good fit', 'Strong fit'];
export const variants = [
  {
    slug: 'job-scout',
    name: 'Job Scout',
    env: 'JOB_SCOUT',
    title: 'A clearer route to your next role',
    description:
      'Find worthwhile jobs, relevant recruiters and credible routes into employers. Compare evidence against the candidate’s own goals, then keep applications organised locally.',
    shortDescription: 'Find jobs and credible routes into them',
    brief:
      'Fictional demonstration for a candidate with evidenced operations and delivery experience seeking UK operations roles. Keep responsibilities, location, working pattern and salary evidence distinct. No applications or messages are sent.',
    offer:
      'Candidate goals and confirmed experience: operations improvement, delivery projects and stakeholder coordination; hybrid work in the United Kingdom.',
    territory: 'United Kingdom',
    exclusions: ['Confirmed closed vacancies for this current search'],
    collections: [
      {
        id: 'jobs',
        kind: 'jobs',
        title: 'Jobs',
        unit: 'vacancy pages',
        criteria: [
          criterion(
            'contribution',
            'Contribution',
            'How well do the advertised responsibilities match the candidate’s confirmed operations improvement and delivery experience?',
            3,
            fit,
          ),
          criterion(
            'scope',
            'Scope',
            'How well does the advertised level and responsibility match an experienced individual contributor or team lead seeking hands-on delivery?',
            2,
            fit,
          ),
          criterion(
            'working_pattern',
            'Working pattern',
            'Does the stated working pattern suit hybrid work? Assess advertised facts; missing terms are unknown.',
            1,
            [
              'Fully on-site',
              'Some flexibility',
              'Hybrid with explicit terms',
              'Hybrid terms clearly match',
            ],
          ),
          criterion(
            'location',
            'Location',
            'Does the advertised work location fit the candidate’s stated UK search?',
            1,
            ['Outside territory', 'Inside stated territory'],
            true,
          ),
        ],
        searches: [
          {
            query:
              'operations improvement delivery lead hybrid UK careers vacancy',
            numResults: 25,
          },
          {
            query:
              'continuous improvement operations project manager United Kingdom hiring',
            numResults: 25,
          },
        ],
      },
      {
        id: 'recruiters',
        kind: 'people',
        title: 'Recruiters',
        unit: 'public recruiter profiles',
        criteria: [
          criterion(
            'specialism',
            'Specialism',
            'Does their public work cover operations, delivery or continuous improvement recruitment?',
            3,
            fit,
          ),
          criterion(
            'market',
            'Market',
            'Does their public professional coverage include the candidate’s UK market?',
            1,
            fit,
          ),
          criterion(
            'route',
            'Useful route',
            'Does the profile state a relevant recruiting remit or public professional application route? Do not infer a relationship.',
            1,
            fit,
          ),
        ],
        searches: [
          {
            query:
              'UK specialist recruiter operations continuous improvement delivery roles',
            numResults: 25,
          },
        ],
      },
      {
        id: 'events',
        kind: 'events',
        title: 'Communities & events',
        unit: 'community or event listing pages',
        criteria: [
          criterion(
            'topic',
            'Topic',
            'How relevant is the listed community or event to operations improvement and delivery?',
            3,
            fit,
          ),
          criterion(
            'access',
            'Access',
            'Does the source describe a practical public participation route?',
            1,
            fit,
          ),
          criterion(
            'location',
            'Location',
            'How practical is the stated location or online format for the candidate’s UK search?',
            1,
            fit,
          ),
        ],
        searches: [
          {
            query:
              'UK operations improvement professional community events careers networking',
            numResults: 20,
          },
        ],
      },
    ],
    demos: [
      [
        'Operations Improvement Lead · Northline',
        'Delivery Manager · Fieldwork',
        'Continuous Improvement Partner · Alder',
        'Operations Project Lead · Meridian',
        'Service Delivery Lead · Common Ground',
        'Programme Coordinator · Oakwell',
      ],
      [
        'Alex Morgan · Operations recruiter',
        'Robin Taylor · Delivery recruitment',
        'Casey Ellis · Manufacturing search',
      ],
      [
        'Operations Community · Open evening',
        'Delivery Practice Forum · Online',
        'Improvement Exchange · Local chapter',
      ],
    ],
    demoEvidence: [
      'Fictional vacancy. The illustrative advert describes hands-on improvement projects, coordination across operations teams and a UK office with a stated hybrid pattern. Salary and application deadline are not supplied; leave those facts unknown. This is not a real opening.',
      'Fictional recruiter profile. The example describes public professional recruitment work in UK operations and delivery. It does not establish a personal connection, an active mandate or willingness to represent this candidate.',
      'Fictional community listing. The example describes public events for operations and delivery professionals. No current occurrence, attendance or booking availability is verified.',
    ],
  },
  {
    slug: 'recruiter',
    name: 'Recruiter',
    env: 'RECRUITER',
    title: 'Find the experience your role needs',
    description:
      'Turn an employer’s hiring brief into consistent, evidence-based research on public professional profiles for human review. Preserve gaps and avoid protected traits or inferred availability.',
    shortDescription: 'Research candidates against job requirements',
    brief:
      'Fictional demonstration for an employer hiring an operations improvement lead. Evaluate public professional experience against the work: process improvement, delivery ownership and stakeholder coordination. Use the same job-related rubric for every profile. Do not assess protected traits, personality or presumed availability.',
    offer:
      'Role brief: lead practical operations improvement, own delivery projects and coordinate stakeholders in a UK manufacturing context.',
    territory: 'United Kingdom',
    exclusions: [],
    collections: [
      {
        id: 'candidates',
        kind: 'people',
        title: 'Candidate research',
        unit: 'public professional profile pages',
        criteria: [
          criterion(
            'improvement',
            'Improvement work',
            'What professional evidence supports practical process improvement relevant to this role?',
            3,
            fit,
          ),
          criterion(
            'delivery',
            'Delivery ownership',
            'What professional evidence supports owning projects through implementation rather than only advising?',
            3,
            fit,
          ),
          criterion(
            'stakeholders',
            'Stakeholders',
            'What professional evidence supports coordination across operational teams and senior stakeholders?',
            2,
            fit,
          ),
          criterion(
            'sector',
            'Sector context',
            'How relevant is the stated manufacturing or comparable operational experience to this brief?',
            1,
            fit,
          ),
        ],
        searches: [
          {
            query:
              'operations improvement lead manufacturing UK process improvement delivery professional profile',
            numResults: 25,
          },
          {
            query:
              'continuous improvement implementation programme lead United Kingdom professional profile',
            numResults: 25,
          },
        ],
      },
      {
        id: 'market',
        kind: 'news',
        title: 'Market context',
        unit: 'public talent-market source pages',
        criteria: [
          criterion(
            'role',
            'Role relevance',
            'Does this source address comparable operations improvement work?',
            3,
            fit,
          ),
          criterion(
            'geography',
            'Geography',
            'Does the source explicitly cover the requested UK employment market?',
            1,
            fit,
          ),
          criterion(
            'method',
            'Evidence quality',
            'Is the source’s stated basis, date and sample sufficient to use as contextual evidence?',
            2,
            fit,
          ),
        ],
        searches: [
          {
            query:
              'UK operations continuous improvement manager salary survey methodology 2026',
            numResults: 20,
          },
        ],
      },
    ],
    demos: [
      [
        'Alex Morgan · Improvement lead',
        'Robin Taylor · Operations manager',
        'Casey Ellis · Delivery lead',
        'Jordan Reed · Process improvement',
        'Sam Patel · Programme delivery',
        'Taylor Brooks · Operational excellence',
      ],
      [
        'Illustrative operations pay survey',
        'Illustrative hiring-market review',
        'Illustrative role specification',
      ],
    ],
    demoEvidence: [
      'Fictional professional profile. The example describes process improvement programmes, implementation ownership and coordination with operations teams in manufacturing. It supplies no protected personal traits. Current availability, interest, compensation expectations and work authorisation are unknown; no hiring decision is made.',
      'Fictional market-context source. The example is an illustration of evidence to inspect, not a real salary benchmark. Real comparisons require source year, geography, occupation, sample and pay basis. An employee pay survey does not establish a candidate’s expectations or a contractor’s rate.',
    ],
  },
  {
    slug: 'day-tripper',
    name: 'Day Tripper',
    env: 'DAY_TRIPPER',
    title: 'A day worth heading out for',
    description:
      'Find a few worthwhile ideas, choose an anchor and build a realistic dated day plan. Compare venues and event sources, check practical details and show an itinerary with a route sketch when coordinates are evidenced.',
    shortDescription: 'Find ideas and plan a practical day out',
    brief:
      'Fictional demonstration for two adults looking for an easy day of art, independent food and a short waterside walk in an illustrative UK town. Budget and travel details are examples only. Real plans must verify the exact date, opening hours, prices, tickets, weather and transport from current sources.',
    offer:
      'Day preferences: art, independent food, short walkable legs, four stops at most and an indoor swap.',
    territory: 'Illustrative UK town',
    exclusions: [],
    collections: [
      {
        id: 'ideas',
        kind: 'places',
        title: 'Places & ideas',
        unit: 'venue or activity source pages',
        criteria: [
          criterion(
            'interests',
            'Interests',
            'How well does the evidenced activity suit art, independent food or a pleasant short walk?',
            3,
            fit,
          ),
          criterion(
            'pace',
            'Pace',
            'Does the source support an unhurried visit suitable for the stated party?',
            1,
            fit,
          ),
          criterion(
            'practicality',
            'Practicality',
            'How well do the evidenced costs, access and booking arrangements fit the brief? Unknown practical facts remain unknown.',
            2,
            fit,
          ),
          criterion(
            'weather',
            'Weather option',
            'Does the source support a useful indoor activity or an outdoor activity suited to the brief?',
            1,
            fit,
          ),
        ],
        searches: [
          {
            query:
              'independent gallery museum lunch riverside walk day out UK town visitor information',
            numResults: 25,
          },
        ],
      },
      {
        id: 'events',
        kind: 'events',
        title: 'What’s on sources',
        unit: 'event listing pages',
        criteria: [
          criterion(
            'interest',
            'Interest',
            'How well do the listed activities match art, food and an easy day out?',
            3,
            fit,
          ),
          criterion(
            'dates',
            'Date evidence',
            'How direct and specific is the source’s event-date information for the brief? A recurring name alone is insufficient.',
            2,
            fit,
          ),
          criterion(
            'access',
            'Practical access',
            'Does the listing supply useful location, ticket or access information for a two-person visit?',
            1,
            fit,
          ),
        ],
        searches: [
          {
            query:
              'UK town arts exhibitions markets events visitor listings October 2026',
            numResults: 20,
          },
        ],
      },
    ],
    demos: [
      [
        'Harbour Gallery',
        'The Courtyard Kitchen',
        'Riverside Gardens',
        'Little Lantern Cinema',
        'Old Mill Museum',
        'Station Coffee',
      ],
      [
        'Town Arts Weekend · Listing',
        'Makers Market · Listing',
        'Gallery Late Opening · Listing',
      ],
    ],
    demoEvidence: [
      'Fictional venue. This example describes a pleasant short visit near the other demonstration stops. Opening hours, admission, bookings and walking times are sample planning material, not verified real-world claims. Any coordinates below are synthetic illustration points only.',
      'Fictional event listing. This is a source-page example, not proof of a real occurrence. Real plans require a matching venue, exact date, time, price and booking conditions from current organiser information.',
    ],
  },
];
