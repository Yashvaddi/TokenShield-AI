import os

TEMPLATES_DIR = "helm/tokenshield/templates"

files = {
    "postgres-statefulset.yaml": """{{- if .Values.postgres.enabled }}
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: {{ include "tokenshield.fullname" . }}-postgres
  labels:
    app.kubernetes.io/name: postgres
spec:
  serviceName: {{ include "tokenshield.fullname" . }}-postgres
  replicas: 1
  selector:
    matchLabels:
      app.kubernetes.io/name: postgres
  template:
    metadata:
      labels:
        app.kubernetes.io/name: postgres
    spec:
      containers:
        - name: postgres
          image: postgres:15
          ports:
            - containerPort: 5432
              name: postgres
          env:
            - name: POSTGRES_USER
              value: {{ .Values.postgres.user }}
            - name: POSTGRES_PASSWORD
              value: {{ .Values.postgres.password }}
            - name: POSTGRES_DB
              value: {{ .Values.postgres.database }}
{{- end }}
""",
    "postgres-service.yaml": """{{- if .Values.postgres.enabled }}
apiVersion: v1
kind: Service
metadata:
  name: {{ include "tokenshield.fullname" . }}-postgres
  labels:
    app.kubernetes.io/name: postgres
spec:
  ports:
    - port: 5432
      targetPort: postgres
      name: postgres
  selector:
    app.kubernetes.io/name: postgres
{{- end }}
""",
    "redis-deployment.yaml": """{{- if .Values.redis.enabled }}
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ include "tokenshield.fullname" . }}-redis
  labels:
    app.kubernetes.io/name: redis
spec:
  replicas: 1
  selector:
    matchLabels:
      app.kubernetes.io/name: redis
  template:
    metadata:
      labels:
        app.kubernetes.io/name: redis
    spec:
      containers:
        - name: redis
          image: redis:7-alpine
          command: ["redis-server", "--requirepass", "{{ .Values.redis.password }}"]
          ports:
            - containerPort: 6379
              name: redis
{{- end }}
""",
    "redis-service.yaml": """{{- if .Values.redis.enabled }}
apiVersion: v1
kind: Service
metadata:
  name: {{ include "tokenshield.fullname" . }}-redis
  labels:
    app.kubernetes.io/name: redis
spec:
  ports:
    - port: 6379
      targetPort: redis
      name: redis
  selector:
    app.kubernetes.io/name: redis
{{- end }}
""",
    "clickhouse-statefulset.yaml": """{{- if .Values.clickhouse.enabled }}
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: {{ include "tokenshield.fullname" . }}-clickhouse
  labels:
    app.kubernetes.io/name: clickhouse
spec:
  serviceName: {{ include "tokenshield.fullname" . }}-clickhouse
  replicas: 1
  selector:
    matchLabels:
      app.kubernetes.io/name: clickhouse
  template:
    metadata:
      labels:
        app.kubernetes.io/name: clickhouse
    spec:
      containers:
        - name: clickhouse
          image: clickhouse/clickhouse-server:23.8
          ports:
            - containerPort: 8123
              name: http
            - containerPort: 9000
              name: tcp
          env:
            - name: CLICKHOUSE_USER
              value: {{ .Values.clickhouse.user }}
            - name: CLICKHOUSE_PASSWORD
              value: {{ .Values.clickhouse.password }}
{{- end }}
""",
    "clickhouse-service.yaml": """{{- if .Values.clickhouse.enabled }}
apiVersion: v1
kind: Service
metadata:
  name: {{ include "tokenshield.fullname" . }}-clickhouse
  labels:
    app.kubernetes.io/name: clickhouse
spec:
  ports:
    - port: 8123
      targetPort: http
      name: http
    - port: 9000
      targetPort: tcp
      name: tcp
  selector:
    app.kubernetes.io/name: clickhouse
{{- end }}
"""
}

for filename, content in files.items():
    with open(os.path.join(TEMPLATES_DIR, filename), 'w') as f:
        f.write(content)

print("Generated DB templates.")
