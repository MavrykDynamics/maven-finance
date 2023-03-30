{{- define "p2pBootstrapPeers" }}
{{- $p2pPeers := list }}
{{- $oracles := index . 0 }}
{{- $currentPeerId := index . 1 }}
{{- range $key, $value := $oracles }}
    {{- if ne $value.p2p.peerId $currentPeerId }}
        {{- $p2pPeers = printf "/dns4/oracle-%s-0.oracle-%s.mavryk-oracles.svc.cluster.local/tcp/23456/p2p/%s" $key $key $value.p2p.peerId | append $p2pPeers -}}
    {{- end }}
{{- end }}
{{- join " " $p2pPeers }}
{{- end }}