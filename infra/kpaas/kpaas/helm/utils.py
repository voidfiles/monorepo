import logging
import subprocess

logger = logging.getLogger(__name__)


def run_and_stream(cmd: list[str]) -> str:

    logger.info("Running %s", " ".join(cmd))
    process = subprocess.Popen(cmd, stdout=subprocess.PIPE)
    output = []
    while process.poll() is None:
        line = process.stdout.readline()
        logger.info(line)
        output.append(str(line, "utf-8"))

    return_code = process.poll()
    if return_code != 0:
        raise Exception(process.stderr.readlines())

    return "\n".join(output)
