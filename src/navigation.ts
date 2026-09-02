import { getPermalink } from './utils/permalinks';
import { BOOKING_URL } from './site';

export const headerData = {
  links: [
    { text: 'Home', href: getPermalink('/') },
    { text: 'How it works', href: getPermalink('/how-it-works') },
    { text: 'Demo', href: getPermalink('/demo') },
    { text: 'Pricing', href: getPermalink('/pricing') },
    {
      text: 'Resources',
      links: [
        { text: 'Cost calculator', href: getPermalink('/cost-calculator') },
        { text: 'Free duty roster template', href: getPermalink('/resources/nurse-duty-roster-template') },
      ],
    },
  ],
  actions: [{ text: 'Book a demo', href: BOOKING_URL, variant: 'primary' as const }],
};

export const footerData = {
  links: [
    {
      title: 'Product',
      links: [
        { text: 'How it works', href: getPermalink('/how-it-works') },
        { text: 'Interactive demo', href: getPermalink('/demo') },
        { text: 'Pricing', href: getPermalink('/pricing') },
      ],
    },
    {
      title: 'Resources',
      links: [
        { text: 'Cost calculator', href: getPermalink('/cost-calculator') },
        { text: 'Free duty roster template', href: getPermalink('/resources/nurse-duty-roster-template') },
      ],
    },
    {
      title: 'Company',
      links: [
        { text: 'Contact', href: getPermalink('/contact') },
        { text: 'Privacy', href: getPermalink('/privacy') },
        { text: 'Terms', href: getPermalink('/terms') },
      ],
    },
  ],
  secondaryLinks: [],
  socialLinks: [],
  footNote: 'Built for Indian hospitals.',
};
