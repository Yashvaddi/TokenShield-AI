import os

TEMPLATES_DIR = "helm/tokenshield/templates"

files = {
    "frontend-deployment.yaml": """apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ include "tokenshield.fullname" . }}-frontend
  labels:
    app.kubernetes.io/name: frontend
spec:
  replicas: {{ .Values.frontend.replicaCount }}
  selector:
    matchLabels:
      app.kubernetes.io/name: frontend
  template:
    metadata:
      labels:
        app.kubernetes.io/name: frontend
    spec:
      containers:
        - name: frontend
          image: "{{ .Values.frontend.image.repository }}:{{ .Values.frontend.image.tag }}"
          imagePullPolicy: {{ .Values.frontend.image.pullPolicy }}
          ports:
            - name: http
              containerPort: 3000
              protocol: TCP
          envFrom:
            - configMapRef:
                name: {{ include "tokenshield.fullname" . }}-config
            - secretRef:
                name: {{ include "tokenshield.fullname" . }}-secrets
""",
    "frontend-service.yaml": """apiVersion: v1
kind: Service
metadata:
  name: {{ include "tokenshield.fullname" . }}-frontend
  labels:
    app.kubernetes.io/name: frontend
spec:
  type: {{ .Values.frontend.service.type }}
  ports:
    - port: {{ .Values.frontend.service.port }}
      targetPort: http
      protocol: TCP
      name: http
  selector:
    app.kubernetes.io/name: frontend
""",
    "marketing-deployment.yaml": """apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ include "tokenshield.fullname" . }}-marketing
  labels:
    app.kubernetes.io/name: marketing
spec:
  replicas: {{ .Values.marketing.replicaCount }}
  selector:
    matchLabels:
      app.kubernetes.io/name: marketing
  template:
    metadata:
      labels:
        app.kubernetes.io/name: marketing
    spec:
      containers:
        - name: marketing
          image: "{{ .Values.marketing.image.repository }}:{{ .Values.marketing.image.tag }}"
          imagePullPolicy: {{ .Values.marketing.image.pullPolicy }}
          ports:
            - name: http
              containerPort: 3000
              protocol: TCP
          envFrom:
            - configMapRef:
                name: {{ include "tokenshield.fullname" . }}-config
""",
    "marketing-service.yaml": """apiVersion: v1
kind: Service
metadata:
  name: {{ include "tokenshield.fullname" . }}-marketing
  labels:
    app.kubernetes.io/name: marketing
spec:
  type: {{ .Values.marketing.service.type }}
  ports:
    - port: {{ .Values.marketing.service.port }}
      targetPort: http
      protocol: TCP
      name: http
  selector:
    app.kubernetes.io/name: marketing
""",
    "backend-deployment.yaml": """apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ include "tokenshield.fullname" . }}-backend
  labels:
    app.kubernetes.io/name: backend
spec:
  replicas: {{ .Values.backend.replicaCount }}
  selector:
    matchLabels:
      app.kubernetes.io/name: backend
  template:
    metadata:
      labels:
        app.kubernetes.io/name: backend
    spec:
      containers:
        - name: backend
          image: "{{ .Values.backend.image.repository }}:{{ .Values.backend.image.tag }}"
          imagePullPolicy: {{ .Values.backend.image.pullPolicy }}
          ports:
            - name: http
              containerPort: 8000
              protocol: TCP
          envFrom:
            - configMapRef:
                name: {{ include "tokenshield.fullname" . }}-config
            - secretRef:
                name: {{ include "tokenshield.fullname" . }}-secrets
""",
    "backend-service.yaml": """apiVersion: v1
kind: Service
metadata:
  name: {{ include "tokenshield.fullname" . }}-backend
  labels:
    app.kubernetes.io/name: backend
spec:
  type: {{ .Values.backend.service.type }}
  ports:
    - port: {{ .Values.backend.service.port }}
      targetPort: http
      protocol: TCP
      name: http
  selector:
    app.kubernetes.io/name: backend
""",
    "worker-deployment.yaml": """apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ include "tokenshield.fullname" . }}-worker
  labels:
    app.kubernetes.io/name: worker
spec:
  replicas: {{ .Values.worker.replicaCount }}
  selector:
    matchLabels:
      app.kubernetes.io/name: worker
  template:
    metadata:
      labels:
        app.kubernetes.io/name: worker
    spec:
      containers:
        - name: worker
          image: "{{ .Values.worker.image.repository }}:{{ .Values.worker.image.tag }}"
          imagePullPolicy: {{ .Values.worker.image.pullPolicy }}
          command: ["celery", "-A", "app.worker.celery_app", "worker", "--loglevel=info"]
          envFrom:
            - configMapRef:
                name: {{ include "tokenshield.fullname" . }}-config
            - secretRef:
                name: {{ include "tokenshield.fullname" . }}-secrets
""",
    "configmap.yaml": """apiVersion: v1
kind: ConfigMap
metadata:
  name: {{ include "tokenshield.fullname" . }}-config
data:
  DATABASE_URL: "postgresql+asyncpg://{{ .Values.postgres.user }}:{{ .Values.postgres.password }}@{{ include "tokenshield.fullname" . }}-postgres/{{ .Values.postgres.database }}"
  REDIS_URL: "redis://:{{ .Values.redis.password }}@{{ include "tokenshield.fullname" . }}-redis:6379/0"
  CLICKHOUSE_URL: "clickhouse://{{ .Values.clickhouse.user }}:{{ .Values.clickhouse.password }}@{{ include "tokenshield.fullname" . }}-clickhouse:9000/default"
  AUTH0_ISSUER: "{{ .Values.auth0.issuer }}"
  NEXT_PUBLIC_API_URL: "http://api.tokenshield.local"
""",
    "secrets.yaml": """apiVersion: v1
kind: Secret
metadata:
  name: {{ include "tokenshield.fullname" . }}-secrets
type: Opaque
data:
  AUTH0_CLIENT_ID: {{ .Values.auth0.clientId | b64enc | quote }}
  AUTH0_CLIENT_SECRET: {{ .Values.auth0.clientSecret | b64enc | quote }}
""",
    "_helpers.tpl": """{{/*
Expand the name of the chart.
*/}}
{{- define "tokenshield.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
*/}}
{{- define "tokenshield.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- if contains $name .Release.Name }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
{{- end }}
""",
    "ingress.yaml": """{{- if .Values.ingress.enabled -}}
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: {{ include "tokenshield.fullname" . }}
  labels:
    app.kubernetes.io/name: ingress
  {{- with .Values.ingress.annotations }}
  annotations:
    {{- toYaml . | nindent 4 }}
  {{- end }}
spec:
  ingressClassName: {{ .Values.ingress.className }}
  rules:
    {{- range .Values.ingress.hosts }}
    - host: {{ .host | quote }}
      http:
        paths:
          {{- range .paths }}
          - path: {{ .path }}
            pathType: {{ .pathType }}
            backend:
              service:
                name: {{ include "tokenshield.fullname" $ }}-{{ .service }}
                port:
                  name: http
          {{- end }}
    {{- end }}
{{- end }}
"""
}

for filename, content in files.items():
    with open(os.path.join(TEMPLATES_DIR, filename), 'w') as f:
        f.write(content)

print("Generated templates.")
