{{- define "p2pBootstrapPeers" }}
{{- $p2pPeers := list }}
{{- $oracles := index . 0 }}
{{- $currentPeerId := index . 1 }}
{{- range $key, $value := $oracles }}
    {{- if ne $value.p2p.peerId $currentPeerId }}
        {{- $p2pPeers = printf "/ip4/0.0.0.0/tcp/%s/p2p/%s" $value.p2p.listenPort $value.p2p.peerId | append $p2pPeers -}}
    {{- end }}
{{- end }}
{{- join " " $p2pPeers }}
{{- end }}