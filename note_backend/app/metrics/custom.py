from typing import Callable
from prometheus_fastapi_instrumentator.metrics import Info
from prometheus_client import Counter, Gauge
import psutil


def total_users() -> Callable[[Info], None]:
    METRIC = Gauge('note_app_users', 'Total users in system')
    METRIC.set(1)

    def instrumentation(info: Info) -> None:
        if 'users' in info.request.url and info.request.url == 'GET':
            if info.response.status_code == 200:
                METRIC.inc()

    return instrumentation


def cpu_percent() -> Callable[[Info], None]:
    METRIC = Gauge('note_app_cpu_percent', 'CPU usage percentage')

    def instrumentation(info: Info) -> None:
        METRIC.set(psutil.cpu_percent())

    return instrumentation


def cpu_freq_current() -> Callable[[Info], None]:
    METRIC = Gauge('note_app_cpu_freq_current', 'CPU current frequency')

    def instrumentation(info: Info) -> None:
        METRIC.set(psutil.cpu_freq().current)

    return instrumentation


def ram_used_curr() -> Callable[[Info], None]:
    METRIC = Gauge('note_app_ram_current', 'RAM current usage')

    def instrumentation(info: Info) -> None:
        METRIC.set(psutil.virtual_memory().used)

    return instrumentation


def ram_total() -> Callable[[Info], None]:
    METRIC = Gauge('note_app_ram_available', 'RAM current available')

    def instrumentation(info: Info) -> None:
        METRIC.set(psutil.virtual_memory().available)
    return instrumentation
