// Featured projects. Real pipelines, not tutorials.
//
// `repo: null` hides the "View code" link on that card rather than pointing
// at a dead "#". Fill in a GitHub URL and the link appears automatically.

export type Project = {
  slug: string;
  title: string;
  blurb: string;
  tags: string[];
  repo: string | null;
  demo?: string | null;
};

export const projects: Project[] = [
  {
    slug: 's3-log-observability/',
    title: 'Automated S3 Log Sync & Observability Pipeline',
    blurb:
      'Scheduled Bash jobs sync application logs out of S3, Promtail labels and ships them into Loki, and Grafana dashboards plus alert rules surface errors and DOWN/IDLE service states in near real time.',
    tags: ['Bash', 'Promtail', 'Loki', 'Grafana', 'AWS S3'],
    repo: null,
  },
  {
    slug: 'grafana-jira-bridge/',
    title: 'Grafana → Jira Alerting Bridge',
    blurb:
      'A Flask webhook service that turns Grafana alerts into Jira tickets automatically — opening on fire, resolving on recovery, and tracking per-service availability so every incident leaves a paper trail.',
    tags: ['Python', 'Flask', 'Grafana Alerting', 'Jira API', 'Webhooks'],
    repo: null,
  },
  {
    slug: 'windows-fleet-vector/',
    title: 'Windows Fleet Log Agent Re-architecture',
    blurb:
      'Migrated log collection for 16 production Windows EC2 services to an S3 → Vector → Loki pipeline, significantly cutting agent CPU consumption while keeping labels, dashboards, and alerts intact.',
    tags: ['Vector', 'Loki', 'Windows EC2', 'NSSM', 'Grafana'],
    repo: null,
  },
];
