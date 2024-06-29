from .models import Helm, ChartRelease, Repository


def apply(self):

    loop = asyncio.get_event_loop()

    loop.run_until_complete(apply(self))


def diff(self):

    loop = asyncio.get_event_loop()

    loop.run_until_complete(diff(self))


(Helm, ChartRelease, Repository)
