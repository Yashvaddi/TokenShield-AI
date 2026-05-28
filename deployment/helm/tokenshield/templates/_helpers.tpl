{{/*
Expand the name of the chart.
*/}}
{{- define "tokenshield.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{- define "tokenshield.fullname" -}}
{{- .Release.Name }}-tokenshield
{{- end }}
