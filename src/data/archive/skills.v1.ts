// ARCHIVED 2026-07-31 — superseded by ../skills.ts (v2).
// Nothing imports this file; it exists purely so you can roll back.
//
// v1 shape differs from v2 in two ways:
//   · `glyph` (a text character) where v2 uses `icon` (an SVG path `d` string)
//   · a `note` line per card, which v2 dropped
// So restoring this also means reverting the matching bits of
// src/components/Skills.astro.
//
// Heads up: this list included Terraform, Kubernetes, Helm, Jenkins, Ansible,
// VPC, CloudFront and Nginx — none of which appear in the stack you wrote for
// yourself. That's why it was replaced.

export type SkillGroupV1 = {
  tab: string;
  glyph: string;
  note: string;
  items: { label: string; title: string }[];
};

export const skillGroupsV1: SkillGroupV1[] = [
  {
    tab: 'Cloud & infrastructure',
    glyph: '☁',
    note: 'Where most of my day goes. Comfortable designing a VPC from scratch and defending the choices.',
    items: [
      { label: 'AWS', title: 'Amazon Web Services' },
      { label: 'EC2', title: 'Elastic Compute Cloud' },
      { label: 'S3', title: 'Simple Storage Service' },
      { label: 'VPC', title: 'Virtual Private Cloud' },
      { label: 'IAM', title: 'Identity and Access Management' },
      { label: 'CloudFront', title: 'CloudFront CDN' },
      { label: 'Terraform', title: 'Terraform' },
      { label: 'Ansible', title: 'Ansible' },
    ],
  },
  {
    tab: 'CI/CD & automation',
    glyph: '⟳',
    note: 'Getting code from a laptop to production without anyone holding their breath.',
    items: [
      { label: 'Docker', title: 'Docker' },
      { label: 'Kubernetes', title: 'Kubernetes' },
      { label: 'Helm', title: 'Helm' },
      { label: 'GitHub Actions', title: 'GitHub Actions' },
      { label: 'Jenkins', title: 'Jenkins' },
      { label: 'Git', title: 'Git' },
    ],
  },
  {
    tab: 'Monitoring & observability',
    glyph: '⎍',
    note: 'The part I actually enjoy — making a system explain itself before it fails.',
    items: [
      { label: 'Prometheus', title: 'Prometheus' },
      { label: 'Grafana', title: 'Grafana' },
      { label: 'Linux', title: 'Linux — RHEL, Ubuntu' },
      { label: 'Nginx', title: 'Nginx' },
      { label: 'Python', title: 'Python' },
      { label: 'Bash', title: 'Bash' },
    ],
  },
];
