// Stack cards. Four groups, each an icon + a row of pill tags.
// Rule: only list what you'd be happy to be questioned on in an interview.
//
// Previous version archived at ./archive/skills.v1.ts

export type SkillGroup = {
  tab: string;
  /** SVG path `d` — drawn stroked at 24×24 in Skills.astro. */
  icon: string;
  items: { label: string; title: string }[];
};

const ICON = {
  cloud:
    'M17.5 19a4.5 4.5 0 1 0-.42-8.98A6 6 0 0 0 5.2 11.3 3.5 3.5 0 0 0 6 18.5h11.5',
  cycle: 'M4 8a8 8 0 0 1 13.7-2.8M20 3v4h-4M20 16a8 8 0 0 1-13.7 2.8M4 21v-4h4',
  pulse: 'M3 12h4l2.5-6.5L14 18l2.5-6H21',
  terminal: 'm5 7 5 5-5 5M13 17h6',
} as const;

export const skillGroups: SkillGroup[] = [
  {
    tab: 'Cloud & Infrastructure',
    icon: ICON.cloud,
    items: [
      { label: 'AWS EC2', title: 'Elastic Compute Cloud' },
      { label: 'S3', title: 'Simple Storage Service' },
      { label: 'IAM', title: 'Identity and Access Management' },
      { label: 'CloudWatch', title: 'Amazon CloudWatch' },
      { label: 'Linux', title: 'Linux' },
      { label: 'Windows Server', title: 'Windows Server' },
      { label: 'Docker', title: 'Docker' },
    ],
  },
  {
    tab: 'CI/CD & Automation',
    icon: ICON.cycle,
    items: [
      { label: 'Git', title: 'Git' },
      { label: 'GitHub Actions', title: 'GitHub Actions' },
      { label: 'Bash automation', title: 'Bash automation' },
      { label: 'systemd / NSSM', title: 'systemd and NSSM service management' },
      { label: 'Webhooks', title: 'Webhooks' },
      { label: 'REST APIs', title: 'REST APIs' },
    ],
  },
  {
    tab: 'Monitoring & Observability',
    icon: ICON.pulse,
    items: [
      { label: 'Prometheus', title: 'Prometheus' },
      { label: 'Grafana', title: 'Grafana' },
      { label: 'Loki', title: 'Grafana Loki' },
      { label: 'Zabbix', title: 'Zabbix' },
      { label: 'Vector', title: 'Vector' },
      { label: 'Promtail', title: 'Promtail' },
      { label: 'Grafana Alloy', title: 'Grafana Alloy' },
    ],
  },
  {
    tab: 'Scripting & Languages',
    icon: ICON.terminal,
    items: [
      { label: 'Python', title: 'Python' },
      { label: 'Bash', title: 'Bash' },
      { label: 'PowerShell', title: 'PowerShell' },
      { label: 'SQL', title: 'SQL' },
      { label: 'YAML / TOML', title: 'YAML and TOML' },
    ],
  },
];

export const totalSkills = skillGroups.reduce(
  (n, g) => n + g.items.length,
  0,
);
