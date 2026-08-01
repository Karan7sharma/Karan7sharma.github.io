// ─────────────────────────────────────────────────────────────────────────
//  EDIT ME. Everything about you lives in this folder — you should never
//  need to touch a component to update the site.
// ─────────────────────────────────────────────────────────────────────────

export const site = {
  name: 'Karan Sharma',
  monogram: 'K',
  domain: 'karan.dev',
  url: 'https://karan.dev',

  // Nav + hero
  kicker: 'Cloud / DevOps Engineer',
  status: 'Open to work', // set to null to hide the pill

  // One warm line. The squiggle underlines it.
  headline: "Hey, I'm Karan.",

  // Two lede paragraphs. HTML allowed — <strong> renders in the accent
  // colour, <a class="body-link"> for inline links.
  lede: 'I\'m a <strong>Cloud and DevOps engineer</strong>, mostly working on the parts of software nobody sees until they break: pipelines, clusters, and the monitoring that makes a system legible.',

  ledeSecondary:
    "My favourite outcome is a week where none of it needed me. When I'm not doing that I follow football closely enough that I put a footy-juggle on my own homepage — and then failed to beat my own record on it. The bar is low. Go on.",

  location: 'Chandigarh, India',

  email: 'karan07sharma3800@gmail.com',
  github: 'https://github.com/Karan7sharma',
  linkedin: 'https://www.linkedin.com/in/karan-sharma7/',

  resume: '/resume.pdf',

  seo: {
    title: 'Karan Sharma — Cloud / DevOps Engineer',
    // Shows in search results and link previews, so keep it to tools you
    // actually use — this used to name Terraform and Kubernetes.
    description:
      'Cloud and DevOps engineer based in Chandigarh. AWS, Docker, and the Grafana / Loki / Prometheus observability stack that keeps production honest.',
  },
} as const;

// Lines for the hero terminal. `tag` is the source, `level` tints it.
// These are illustrative of the pipeline you actually run — the panel is
// labelled `demo` so nobody mistakes it for a live feed.
export type LogLevel = 'ok' | 'warn' | 'info';

export const logLines: { tag: string; msg: string; level?: LogLevel }[] = [
  { tag: 'vector', msg: 's3 sync complete — 128 objects forwarded' },
  { tag: 'loki', msg: 'ingest healthy · lag 0ms' },
  { tag: 'prometheus', msg: 'scrape ok — 34/34 targets up' },
  { tag: 'grafana', msg: 'alert "svc-gateway idle" firing', level: 'warn' },
  { tag: 'jira', msg: 'OPS-2481 created from alert · assigned', level: 'info' },
  { tag: 'grafana', msg: 'alert "svc-gateway idle" → resolved' },
  { tag: 'jira', msg: 'OPS-2481 auto-resolved · 4m12s to recovery' },
  { tag: 'ci', msg: 'deploy v1.4.2 → production · ok' },
  { tag: 'vector', msg: 'checkpoint saved · 16 sources healthy' },
  { tag: 'zabbix', msg: 'host availability 100% (5m window)' },
  { tag: 'loki', msg: 'compactor run finished in 3.1s' },
  { tag: 'promtail', msg: 'positions flushed · 0 dropped' },
];

// The scrolling ticker under the hero.
// Matched to the stack in your own portfolio draft — the earlier list had
// Terraform, Kubernetes, Ansible, Jenkins and Helm in it, none of which
// appear in the tools you actually listed. Add them back only if you use them.
export const marquee = [
  'AWS',
  'VECTOR',
  'LOKI',
  'GRAFANA',
  'PROMETHEUS',
  'PROMTAIL',
  'DOCKER',
  'GITHUB ACTIONS',
  'ZABBIX',
  'LINUX',
  'PYTHON',
  'BASH',
];

// The cards beside the About copy. <strong> renders in the accent green.
// Previous version archived at ./archive/about.v1.ts
export const highlights = [
  '<strong>Re-architected a production log pipeline</strong> (S3 → Vector → Loki), significantly cutting agent CPU across 16 Windows EC2 services.',
  '<strong>Automated incident workflows</strong> — Grafana alerts that open and resolve their own Jira tickets, with per-service availability tracking.',
  '<strong>Automation-first mindset</strong> — if it happens twice, it gets a script; if it matters, it gets a dashboard and an alert.',
];

// First person, HTML allowed. Here <strong> renders as brighter white rather
// than accent green — it's for naming tools mid-sentence, not for shouting.
export const about = [
  "I'm a Cloud &amp; DevOps engineer based in Chandigarh, India, working on production observability and automation. Day to day, that means designing the pipelines that move logs and metrics from AWS workloads into <strong>Grafana, Loki, and Prometheus</strong> — and the alerting that turns all that telemetry into action instead of noise.",
  "I care about infrastructure that scales gracefully and fails loudly. My favorite kind of work is replacing fragile, manual processes with boring, reliable automation — then instrumenting it so well that problems announce themselves before users do. Every incident, migration, and 3 a.m. alert is a chance to learn the next layer of the stack, and I take that seriously: I'm currently going deeper on container orchestration and MLOps infrastructure.",
];
