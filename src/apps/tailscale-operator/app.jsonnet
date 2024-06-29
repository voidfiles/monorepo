local helm = (import "helm.libsonnet");
local post = (importstr "post.yaml");


helm.new(
    "tailscale/tailscale-operator",
    "tailscale-operator",
    "tailscale",
    strings={
        "oauth.clientId": "op://Infra Secrets/x3tlyv6hqx5zlucdpfp2xtpjwe/username",
        "oauth.clientSecret": "op://Infra Secrets/x3tlyv6hqx5zlucdpfp2xtpjwe/password"
    },
    repository={
        name: "tailscale",
        url: "https://pkgs.tailscale.com/helmcharts",
    }
)
