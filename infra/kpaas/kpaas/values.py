import subprocess


def resolve_secret(uri: str) -> str:
    out = subprocess.run(["op", "read", "--format=json", uri], capture_output=True)
    out.check_returncode()

    return str(out.stdout, "utf-8").rstrip("\n")


def process_values(values: dict[str, str]) -> dict[str, str]:
    out = {}
    for k, v in values.items():
        if v.startswith("op://"):
            v = resolve_secret(v)

        out[k] = v

    return out
