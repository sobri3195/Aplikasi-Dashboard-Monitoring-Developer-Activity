import platform
import socket
import hashlib
import uuid
import psutil


class DeviceFingerprint:
    @staticmethod
    def get_mac_address():
        mac = ':'.join(['{:02x}'.format((uuid.getnode() >> elements) & 0xff)
                        for elements in range(0, 2*6, 2)][::-1])
        return mac

    @staticmethod
    def get_hostname():
        return socket.gethostname()

    @staticmethod
    def get_cpu_info():
        return f"{platform.processor()} - {psutil.cpu_count()} cores"

    @staticmethod
    def get_os_info():
        return f"{platform.system()} {platform.release()} {platform.version()}"

    @staticmethod
    def get_ip_address():
        try:
            s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
            s.connect(("8.8.8.8", 80))
            ip = s.getsockname()[0]
            s.close()
            return ip
        except Exception:
            return "127.0.0.1"

    @classmethod
    def generate_fingerprint(cls):
        mac = cls.get_mac_address()
        hostname = cls.get_hostname()
        cpu = cls.get_cpu_info()
        os_info = cls.get_os_info()

        combined = f"{mac}:{hostname}:{cpu}:{os_info}"
        fingerprint = hashlib.sha256(combined.encode()).hexdigest()

        return fingerprint

    @classmethod
    def get_device_info(cls):
        return {
            'fingerprint': cls.generate_fingerprint(),
            'hostname': cls.get_hostname(),
            'macAddress': cls.get_mac_address(),
            'cpuInfo': cls.get_cpu_info(),
            'osInfo': cls.get_os_info(),
            'ipAddress': cls.get_ip_address()
        }
