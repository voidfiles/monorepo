import asyncio
from .proxy_pool import ProxyPool

p = ProxyPool()

asyncio.run(p.update())
