import {
  siNginx,
  siRocketdotchat,
  siConfluence,
  siJira,
  siPrometheus,
  siGrafana,
  siGitlab,
  siKeycloak,
  siNextcloud,
  siKibana,
  siJupyter,
  siMetabase,
} from 'simple-icons';

// Only Nginx is actually wired to a real image -- everything else here is
// deliberately decorative (disabled), per what was asked: "I don't want
// other icons to work, I just want them there."
export const APP_CATALOG = [
  { key: 'nginx', title: 'Nginx', icon: siNginx, image: 'nginx:latest', enabled: true },
  { key: 'rocketchat', title: 'Rocket.Chat', icon: siRocketdotchat, enabled: false },
  { key: 'confluence', title: 'Confluence', icon: siConfluence, enabled: false },
  { key: 'jira', title: 'Jira', icon: siJira, enabled: false },
  { key: 'prometheus', title: 'Prometheus', icon: siPrometheus, enabled: false },
  { key: 'grafana', title: 'Grafana', icon: siGrafana, enabled: false },
  { key: 'gitlab-runner', title: 'GitLab Runner', icon: siGitlab, enabled: false },
  { key: 'keycloak', title: 'Keycloak', icon: siKeycloak, enabled: false },
  { key: 'nextcloud', title: 'Nextcloud', icon: siNextcloud, enabled: false },
  { key: 'kibana', title: 'Kibana', icon: siKibana, enabled: false },
  { key: 'jupyter', title: 'Jupyter Notebook', icon: siJupyter, enabled: false },
  { key: 'metabase', title: 'Metabase', icon: siMetabase, enabled: false },
  { key: 'pyroscope', title: 'Pyroscope', icon: null, enabled: false },
];
