// Roles and certifications for the Experience section.
// One line per role — the résumé PDF holds the detail, this is the skim
// version. Add `kind: 'education'` to an entry to keep it out of the
// "N roles" counter.

export type Role = {
  period: string;
  title: string;
  org: string;
  note: string;
  kind?: 'work' | 'education';
};

export const roles: Role[] = [
  {
    period: 'Mar 2026 - Present · 6 mos',
    title: 'DevOps Engineer',
    org: 'Aerin IT Services Pvt Ltd',
    note: 'Designed and maintained Grafana dashboards for real-time monitoring of application and infrastructure health.',
  },
  {
    period: 'Apr 2025 - Sept 2025 · 6 mos',
    title: 'DevOps Intern',
    org: 'StarAgile',
    note: 'Worked on real-world lab environments to implement end-to-end DevOps pipelines.',
  },
 
];

export const roleCount = roles.filter((r) => r.kind !== 'education').length;

export type Cert = {
  name: string;
  issuer: string;
  status: 'earned' | 'in-progress';
  year?: string;
};

export const certs: Cert[] = [
  {
    name: 'Solutions Architect — Associate',
    issuer: 'Amazon Web Services',
    status: 'in-progress',
    year: 'SAA-C03',
  },
  {
    name: 'DevOps Engineering',
    issuer: 'StarAgile',
    status: 'earned',
    year: '2025',
  },
];
